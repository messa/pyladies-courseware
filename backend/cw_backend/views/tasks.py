import aiohttp
from aiohttp import web
from aiohttp_session import get_session
import asyncio
import logging
from pathlib import Path


logger = logging.getLogger(__name__)

routes = web.RouteTableDef()


@routes.post('/api/tasks/submit-solution')
async def submit_task_solution(req):
    session = await get_session(req)
    model = req.app['model']
    if not session.get('user'):
        raise web.HTTPForbidden()
    user = await model.users.get_by_id(session['user']['id'])
    #if user.is_admin != True:
    #    raise web.HTTPForbidden()
    data = await req.json()
    ts = await model.task_solutions.create_revision(
        user=user,
        course_id=data['course_id'],
        task_id=data['task_id'],
        code=data['code'])
    return web.json_response({
        'task_solution': await ts.export(with_code=True),
    })


@routes.get('/api/tasks/user-solution')
async def list_user_task_solutions(req):
    session = await get_session(req)
    model = req.app['model']
    if not session.get('user'):
        raise web.HTTPForbidden()
    user = await model.users.get_by_id(session['user']['id'])
    ts = await model.task_solutions.get_by_task_and_user(
        user=user,
        course_id=req.rel_url.query['course_id'],
        task_id=req.rel_url.query['task_id'])
    return web.json_response({
        'task_solution': await ts.export(with_code=True) if ts else None,
    })
