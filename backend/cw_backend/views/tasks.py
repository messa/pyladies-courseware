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
    solution = await model.task_solutions.create(
        user=user,
        course_id=data['course_id'],
        lesson_slug=data['lesson_slug'],
        task_id=data['task_id'],
        code=data['code'])
    return web.json_response({
        'task_solution_id': solution.id,
    })


@routes.get('/api/tasks/user-solutions')
async def list_user_task_solutions(req):
    session = await get_session(req)
    model = req.app['model']
    if not session.get('user'):
        raise web.HTTPForbidden()
    user = await model.users.get_by_id(session['user']['id'])
    solutions = await model.task_solutions.find_by_user_task(
        user=user,
        course_id=req.rel_url.query['course_id'],
        lesson_slug=req.rel_url.query['lesson_slug'],
        task_id=req.rel_url.query['task_id'])
    return web.json_response({
        'task_solutions': [ts.export() for ts in solutions],
    })
