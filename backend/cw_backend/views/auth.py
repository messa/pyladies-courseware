import aiohttp
from aiohttp import web
from aiohttp_session import get_session
import asyncio
import logging
from pathlib import Path

from ..util import get_random_name


logger = logging.getLogger(__name__)

routes = web.RouteTableDef()


def get_login_methods(conf):
    return {
        'facebook': {'url': '/auth/facebook'} if conf.fb_oauth2 else None,
        'google': {'url': '/auth/google'} if conf.google_oauth2 else None,
        'dev': {
            'student_url': '/auth/dev?role=student',
            'coach_url': '/auth/dev?role=coach',
            'admin_url': '/auth/dev?role=admin',
        } if conf.allow_dev_login else None,
    }


@routes.get('/auth/dev')
async def auth_dev(req):
    model = req.app['model']
    courses = req.app['courses']
    role = req.query['role']
    if role not in {'student', 'coach', 'admin'}:
        raise web.HTTPBadRequest(text=f'Unknown role: {role!r}')
    session = await get_session(req)
    name = get_random_name()
    logger.debug('Generated random name: %r', name)
    user = await model.users.create_dev_user(name)
    course_ids = [c.id for c in courses.list_active()]
    if role == 'student':
        await model.users.add_user_attended_courses(user.id, course_ids)
    if role == 'coach':
        await model.users.add_user_coached_courses(user.id, course_ids)
    if role == 'admin':
        await model.users.set_user_admin(user.id, True)
    session['user'] = {
        'id': user.id,
        'name': user.name,
    }
    return web.Response(text='asd')
