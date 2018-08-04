import asyncio
import bcrypt
import logging
from uuid import uuid4

from ..util import generate_random_id


logger = logging.getLogger(__name__)


class Users:

    def __init__(self, db, dev_login_allowed, generate_id=None):
        self.c_users = db['users']  # note: c_ for collection
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
        return User(user_doc)

    async def create_oauth2_user(self, provider, provider_user_id, name, email):
        assert provider in {'fb', 'google'}
        user_doc = {
            '_id': self.generate_id(),
            f'{provider}_id': provider_user_id,
            'name': name,
            'email': email,
        }
        await self.c_users.insert_one(user_doc)
        return User(user_doc)

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
        return User(user_doc)

    async def get_user_by_id(self, user_id):
        assert isinstance(user_id, str)
        user_doc = await self.c_users.find_one({'_id': user_id})
        if not user_doc:
            raise Exception('User not found')
        if user_doc.get('dev_login') and not self.dev_login_allowed:
            raise Exception('Dev login not allowed')
        return User(user_doc)

    async def add_user_attended_courses(self, user_id, course_ids):
        while True:
            user_doc = await self.c_users.find_one({'_id': user_id})
            if not user_doc:
                raise Exception('User not found')
            new_course_ids = user_doc.get('attended_course_ids') or []
            new_course_ids += course_ids
            new_course_ids = sorted(set(new_course_ids))
            r = await self.c_users.update_one(
                {'_id': user_id, 'attended_course_ids': user_doc.get('attended_course_ids')},
                {'$set': {'attended_course_ids': new_course_ids}})
            if r.matched_count:
                break

    async def add_user_coached_courses(self, user_id, course_ids):
        while True:
            user_doc = await self.c_users.find_one({'_id': user_id})
            if not user_doc:
                raise Exception('User not found')
            new_course_ids = user_doc.get('coached_course_ids') or []
            new_course_ids += course_ids
            new_course_ids = sorted(set(new_course_ids))
            r = await self.c_users.update_one(
                {'_id': user_id, 'coached_course_ids': user_doc.get('coached_course_ids')},
                {'$set': {'coached_course_ids': new_course_ids}})
            if r.matched_count:
                break

    async def set_user_admin(self, user_id, is_admin):
        r = await self.c_users.update_one(
            {'_id': user_id},
            {'$set': {'is_admin': is_admin}})
        if not r.matched_count:
            raise Exception('User not found')


class User:

    def __init__(self, doc):
        self.id = doc['_id']
        self.name = doc['name']
        self.attended_course_ids = doc.get('attended_course_ids') or []
        self.coached_course_ids = doc.get('coached_course_ids') or []
        self.is_admin = doc.get('is_admin', False)

    def __repr__(self):
        return f'<{self.__class__.__name__} id={self.id!r} name={self.name!r}>'
