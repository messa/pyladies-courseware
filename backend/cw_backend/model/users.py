import asyncio
from bson import ObjectId
import logging
from pymongo import ReturnDocument
from reprlib import repr as smart_repr

from ..util import generate_random_id
from .errors import ModelError, NotFoundError, RetryNeeded, InvalidPasswordError
from .helpers import PasswordHashing


logger = logging.getLogger(__name__)


class Users:

    def __init__(self, db, dev_login_allowed, generate_id=None, password_hashing=None):
        self.c_users = db['users']
        self.dev_login_allowed = dev_login_allowed
        self.generate_id = generate_id or generate_random_id
        self.password_hashing = password_hashing or PasswordHashing()

    async def create_indexes(self):
        await self.c_users.create_index('fb_id', sparse=True, unique=True)
        await self.c_users.create_index('google_id', sparse=True, unique=True)
        await self.c_users.create_index('login', sparse=True, unique=True)
        await self.c_users.create_index('attended_course_ids', sparse=True)

    async def create_dev_user(self, name):
        if not self.dev_login_allowed:
            raise Exception('Dev login not allowed')
        user_doc = {
            '_id': self.generate_id(),
            'v': 0,
            'name': name,
            'dev_login': True,
        }
        await self.c_users.insert_one(user_doc)
        return self._build_user(user_doc)

    async def login_oauth2_user(self, provider, provider_user_id, name, email):
        assert provider in {'fb', 'google'}
        user_doc = await self.c_users.find_one({f'{provider}_id': provider_user_id})
        if not user_doc:
            user_doc = {
                '_id': self.generate_id(),
                'v': 0,
                f'{provider}_id': provider_user_id,
                'name': name,
                'email': email,
            }
            await self.c_users.insert_one(user_doc)
        return self._build_user(user_doc)

    async def create_password_user(self, email, password, name):
        assert isinstance(email, str)
        assert isinstance(password, str)
        assert isinstance(name, str)
        pw_hash = await self.password_hashing.get_hash(password)
        already_present = await self.c_users.find_one({'login': email})
        if already_present:
            logger.debug('already_present: %r', already_present)
            raise ModelError(f'User "{email}" already exists')
        user_doc = {
            '_id': self.generate_id(),
            'v': 0,
            'name': name,
            'email': email,
            'login': email,
            'password_hash': pw_hash,
        }
        await self.c_users.insert_one(user_doc)
        return self._build_user(user_doc)

    async def login_password_user(self, email, password):
        assert isinstance(email, str)
        assert isinstance(password, str)
        user_doc = await self.c_users.find_one({'login': email})
        #if not user_doc:
        #    user_doc = await self.c_users.find_one({'email': email})
        if not user_doc:
            raise NotFoundError(f'User with login or email not {email!r} found')
        if not user_doc.get('password_hash'):
            raise NotFoundError('User does not have field password_hash')
        pw_ok = await self.password_hashing.verify_hash(user_doc['password_hash'], password)
        if pw_ok is not True:
            raise InvalidPasswordError('Invalid password')
        return self._build_user(user_doc)

    async def get_by_id(self, user_id):
        assert isinstance(user_id, str)
        user_doc = await self.c_users.find_one({'_id': user_id})
        if not user_doc:
            raise NotFoundError('User not found')
        if user_doc.get('dev_login') and not self.dev_login_allowed:
            raise ModelError('Dev login not allowed')
        return self._build_user(user_doc)

    async def list_all(self):
        user_docs = await self.c_users.find({}).to_list(None)
        return [self._build_user(d) for d in user_docs]

    async def find_by_attended_course_id(self, course_id):
        q = {'attended_course_ids': course_id}
        user_docs = await self.c_users.find(q).to_list(None)
        users = [self._build_user(d) for d in user_docs]
        return sorted(users, key=lambda u: u.get_name_sort_key())

    def _build_user(self, user_doc):
        return User(self.c_users, user_doc)


class User:

    def __init__(self, c_users, user_doc):
        assert isinstance(user_doc, dict)
        self._c_users = c_users
        self._c_changelog = c_users['changelog']
        self._user_doc = user_doc
        self._view = UserView(user_doc)

    def __getattr__(self, name):
        return getattr(self._view, name)

    def __repr__(self):
        return f'<{self.__class__.__name__} id={self.id!r}>'

    async def _update(self, data, author_user_id):
        # TODO: ten changelog řešit ještě nějak obecněji
        assert isinstance(data, dict)
        changelog_entry = {
            '_id': ObjectId(),
            'author_user_id': author_user_id,
            'changes': {},
        }
        op_set = {}
        for key, new_value in sorted(data.items()):
            old_value = self._user_doc.get(key)
            if new_value == old_value:
                continue
            logger.info(
                'Updating user %s %s: %s -> %s',
                self.id, key, smart_repr(old_value), smart_repr(new_value))
            assert key not in op_set
            op_set[key] = new_value
            changelog_entry['changes'][key] = {
                'old_value': old_value,
                'new_value': new_value,
            }
        if not op_set:
            logger.info('Nothing to update (user %s)', self.id)
            return
        new_user_doc = await self._c_users.find_one_and_update(
            {
                '_id': self.id,
                'v': self._user_doc['v'],
            }, {
                '$set': op_set,
                '$push': {'changelog': changelog_entry},
                '$inc': {'v': 1},
            },
            return_document=ReturnDocument.AFTER)
        if new_user_doc is None:
            raise RetryNeeded()
        assert new_user_doc['v'] == self._user_doc['v'] + 1
        assert new_user_doc['_id'] == self.id
        self._user_doc = new_user_doc
        self._view = UserView(new_user_doc)
        await self._offload_changelog()

    async def _offload_changelog(self):
        entries = self._user_doc.get('changelog')
        if entries:
            await self._c_changelog.insert_many(entries, ordered=False)
            await self._c_users.update_one(
                {'_id': self.id, 'v': self._user_doc['v']},
                {'$unset': {'changelog': ''}})
            logger.debug('Offloaded %d changelog entries', len(entries))

    async def add_attended_courses(self, add_course_ids, author_user_id):
        new_course_ids = sorted(set(add_course_ids) | set(self.attended_course_ids))
        if new_course_ids != self.attended_course_ids:
            await self._update({'attended_course_ids': new_course_ids}, author_user_id)

    async def add_coached_courses(self, add_course_ids, author_user_id):
        new_course_ids = sorted(set(add_course_ids) | set(self.coached_course_ids))
        if new_course_ids != self.coached_course_ids:
            await self._update({'coached_course_ids': new_course_ids}, author_user_id)

    async def set_admin(self, is_admin, author_user_id):
        await self._update({'is_admin': bool(is_admin)}, author_user_id)

    async def update_user(self, data, author_user_id):
        await self._update(data, author_user_id)


class UserView:

    def __init__(self, doc):
        self.id = doc['_id']
        self.name = doc['name']
        self.email = doc.get('email')
        self.fb_id = doc.get('fb_id')
        self.google_id = doc.get('google_id')
        self.attended_course_ids = sorted(doc.get('attended_course_ids') or [])
        self.coached_course_ids = sorted(doc.get('coached_course_ids') or [])
        self.is_admin = doc.get('is_admin', False)
        self.dev_login = doc.get('dev_login', False)
        self.login = doc.get('login')

    def get_name_sort_key(self):
        name_parts = self.name.split()
        return (name_parts[-1], *name_parts[:-1])

    def can_review_course(self, course_id):
        return self.is_admin or course_id in self.coached_course_ids

    def export(self, details=False):
        data = {
            'id': self.id,
            'name': self.name,
        }
        if details:
            data.update({
                'email': self.email,
                'fb_id': self.fb_id,
                'google_id': self.google_id,
                'attended_course_ids': self.attended_course_ids,
                'coached_course_ids': self.coached_course_ids,
                'is_admin': self.is_admin,
                'dev_login': self.dev_login,
                'login': self.login,
            })
        return data
