import aiohttp
from aiohttp import web
from aiohttp_session import get_session
import asyncio
import json
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
async def get_task_user_solution(req):
    session = await get_session(req)
    model = req.app['model']
    if not session.get('user'):
        raise web.HTTPForbidden()
    user = await model.users.get_by_id(session['user']['id'])
    # TODO: kontrola opravneni
    ts = await model.task_solutions.get_by_task_and_user_id(
        user=user,
        course_id=req.rel_url.query['course_id'],
        task_id=req.rel_url.query['task_id'])
    return web.json_response({
        'task_solution': await ts.export(with_code=True) if ts else None,
    })


@routes.get('/api/tasks/lesson-solutions')
async def list_lesson_solutions(req):
    session = await get_session(req)
    model = req.app['model']
    if not session.get('user'):
        raise web.HTTPForbidden()
    user = await model.users.get_by_id(session['user']['id'])
    # TODO: kontrola opravneni
    solutions = await model.task_solutions.find_by_course_and_task_ids(
        course_id=req.rel_url.query['course_id'],
        task_ids=json.loads(req.rel_url.query['task_ids']))
    students = await model.users.find_by_attended_course_id(
        course_id=req.rel_url.query['course_id'])
    return web.json_response({
        'task_solutions': [await ts.export() for ts in solutions],
        'students': [u.export() for u in students]
    })
