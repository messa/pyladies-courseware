import asyncio
import bcrypt
import logging
from uuid import uuid4

from ..util import generate_random_id


logger = logging.getLogger(__name__)


class Users:

    def __init__(self, db, dev_login_allowed, generate_id=None):
        self.c_users = db['users']
        self.dev_login_allowed = dev_login_allowed
        self.generate_id = generate_id or generate_random_id

    async def create_indexes(self):
        await self.c_users.create_index('fb_id', sparse=True, unique=True)
        await self.c_users.create_index('google_id', sparse=True, unique=True)
        await self.c_users.create_index('login', sparse=True, unique=True)

    async def create_dev_user(self, name):
        if not self.dev_login_allowed:
            raise Exception('Dev login not allowed')
        user_doc = {
            '_id': self.generate_id(),
            'name': name,
            'dev_login': True,
        }
        await self.c_users.insert_one(user_doc)
        return self._user(user_doc)

    async def create_oauth2_user(self, provider, provider_user_id, name, email):
        assert provider in {'fb', 'google'}
        user_doc = {
            '_id': self.generate_id(),
            f'{provider}_id': provider_user_id,
            'name': name,
            'email': email,
        }
        await self.c_users.insert_one(user_doc)
        return self._user(user_doc)

    async def create_password_user(self, email, password, name):
        assert isinstance(email, str)
        assert isinstance(password, str)
        assert isinstance(name, str)
        loop = asyncio.get_event_loop()
        get_hash = lambda: bcrypt.hashpw(password.encode(), bcrypt.gensalt())
        pw_hash = await loop.run_in_executor(None, get_hash)
        user_doc = {
            '_id': self.generate_id(),
            'name': name,
            'email': email,
            'login': email,
            'password_bcrypt': pw_hash,
        }
        await self.c_users.insert_one(user_doc)
        return self._user(user_doc)

    async def get_user_by_id(self, user_id):
        assert isinstance(user_id, str)
        user_doc = await self.c_users.find_one({'_id': user_id})
        if not user_doc:
            raise Exception('User not found')
        if user_doc.get('dev_login') and not self.dev_login_allowed:
            raise Exception('Dev login not allowed')
        return self._user(user_doc)

    def _user(self, user_doc):
        return User(self.c_users, user_doc)


class User:

    def __init__(self, c_users, user_doc):
        assert isinstance(user_doc, dict)
        self.id = user_doc['_id']
        self._c_users = c_users
        self._view = UserView(user_doc)

    def __getattr__(self, name):
        return getattr(self._view, name)

    def __repr__(self):
        return f'<{self.__class__.__name__} id={self.id!r}>'

    async def _update(self, ops):
        from pymongo import ReturnDocument
        user_doc = await self._c_users.find_one_and_update(
            {'_id': self.id}, ops,
            return_document=ReturnDocument.AFTER)
        self._view = UserView(user_doc)

    async def add_attended_courses(self, course_ids):
        assert isinstance(course_ids, list)
        await self._update({'$addToSet': {
            'attended_course_ids': {'$each': course_ids},
        }})

    async def add_coached_courses(self, course_ids):
        assert isinstance(course_ids, list)
        await self._update({'$addToSet': {
            'coached_course_ids': {'$each': course_ids},
        }})

    async def set_admin(self, is_admin):
        await self._update({'$set': {
            'is_admin': bool(is_admin),
        }})


class UserView:

    def __init__(self, doc):
        self.name = doc['name']
        self.attended_course_ids = doc.get('attended_course_ids') or []
        self.coached_course_ids = doc.get('coached_course_ids') or []
        self.is_admin = doc.get('is_admin', False)
