import aiohttp
from aiohttp import web
from aiohttp_session import get_session
import asyncio
import logging
from pathlib import Path


logger = logging.getLogger(__name__)

routes = web.RouteTableDef()


@routes.get('/api/admin/course/{course_id}/reload_course')
async def reload_course(req):
    session = await get_session(req)
    model = req.app['model']
    if not session.get('user'):
        raise web.HTTPForbidden()
    user = await model.users.get_by_id(session['user']['id'])
    if not user or not user.is_admin:
        raise web.HTTPForbidden()
    course = req.app['courses'].get().get_by_id(req.match_info['course_id'])
    course.load_course()
    return web.json_response({'course': course.export(sessions=True)})
