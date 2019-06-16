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
    await ts.set_last_action('student', user)
    return web.json_response({
        'task_solution': await ts.export(with_code=True),
    })


@routes.get('/api/tasks/user-solution')
@routes.get('/api/tasks/solution')
async def get_task_user_solution(req):
    session = await get_session(req)
    model = req.app['model']
    if not session.get('user'):
        raise web.HTTPForbidden()
    user = await model.users.get_by_id(session['user']['id'])
    show_user_id = req.query.get('user_id') or user.id
    if show_user_id != user.id:
        if not user.can_review_course(course_id=req.query['course_id']):
            raise web.HTTPForbidden()
    ts = await model.task_solutions.get_by_task_and_user_id(
        user_id=show_user_id,
        course_id=req.rel_url.query['course_id'],
        task_id=req.rel_url.query['task_id'])
    if ts:
        task_comments = await model.task_solution_comments.find_by_task_solution_id(ts.id)
        return web.json_response({
            'task_solution': await ts.export(with_code=True),
            'comments': [c.export() for c in task_comments],
        })
    else:
        return web.json_response({
            'task_solution': None,
            'comments': [],
        })


@routes.get('/api/tasks/lesson-solutions')
async def list_lesson_solutions(req):
    model = req.app['model']
    session = await get_session(req)
    if not session.get('user'):
        raise web.HTTPForbidden()
    user = await model.users.get_by_id(session['user']['id'])
    if not user.can_review_course(course_id=req.query['course_id']):
        raise web.HTTPForbidden()
    if 'task_ids' in req.rel_url.query:
        solutions = await model.task_solutions.find_by_course_and_task_ids(
            course_id=req.rel_url.query['course_id'],
            task_ids=json.loads(req.rel_url.query['task_ids']))
    else:
        solutions = await model.task_solutions.find_by_course_id(
            course_id=req.rel_url.query['course_id'])
    students = await model.users.find_by_attended_course_id(
        course_id=req.rel_url.query['course_id'])
    return web.json_response({
        'task_solutions': [await ts.export() for ts in solutions],
        'students': [u.export() for u in students]
    })


@routes.get('/api/tasks/my-lesson-solutions')
async def list_my_lesson_solutions(req):
    model = req.app['model']
    session = await get_session(req)
    if not session.get('user'):
        raise web.HTTPForbidden()
    user = await model.users.get_by_id(session['user']['id'])
    solutions = await model.task_solutions.find_by_user_and_course_and_task_ids(
        user=user,
        course_id=req.rel_url.query['course_id'],
        task_ids=json.loads(req.rel_url.query['task_ids']))
    return web.json_response({
        'task_solutions': [await ts.export() for ts in solutions],
    })


@routes.post('/api/tasks/mark-solution-solved')
async def mark_solution_solved(req):
    data = await req.json()
    logger.debug('POST data: %r', data)
    model = req.app['model']
    session = await get_session(req)
    if not session.get('user'):
        raise web.HTTPForbidden()
    user = await model.users.get_by_id(session['user']['id'])
    solution = await model.task_solutions.get_by_id(data['task_solution_id'])
    if not user.can_review_course(course_id=solution.course_id):
        raise web.HTTPForbidden()
    await solution.set_marked_as_solved(data['solved'], user)
    await solution.set_last_action('coach', user)
    return web.json_response({
        'task_solution': await solution.export(with_code=True),
    })


@routes.post('/api/tasks/add-solution-comment')
async def add_solution_comment(req):
    data = await req.json()
    logger.debug('POST data: %r', data)
    model = req.app['model']
    session = await get_session(req)
    if not session.get('user'):
        raise web.HTTPForbidden()
    user = await model.users.get_by_id(session['user']['id'])
    solution = await model.task_solutions.get_by_id(data['task_solution_id'])
    if not (user.id == solution.user_id or user.can_review_course(course_id=solution.course_id)):
        raise web.HTTPForbidden()
    new_comment = await model.task_solution_comments.create(
        task_solution=solution,
        reply_to_comment_id=data['reply_to_comment_id'],
        author_user=user,
        body=data['body'])
    if user.id == solution.user_id:
        await solution.set_last_action('student', user)
    elif user.can_review_course(course_id=solution.course_id):
        await solution.set_last_action('coach', user)
    task_comments = await model.task_solution_comments.find_by_task_solution_id(solution.id)
    return web.json_response({
        'task_solution': await solution.export(with_code=True),
        'comments': [c.export() for c in task_comments],
    })
