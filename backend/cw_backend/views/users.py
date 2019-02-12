import aiohttp
from aiohttp import web
from aiohttp_session import get_session
import asyncio
import json
import logging
from pathlib import Path


logger = logging.getLogger(__name__)

routes = web.RouteTableDef()


@routes.post('/api/users/attend-course')
async def assign_student_to_course(req):
    session = await get_session(req)
    if not session.get('user'):
        return web.json_response({
            'not_logged_in': True,
        }, status=403)
    model = req.app['model']
    user = await model.users.get_by_id(session['user']['id'])
    courses = req.app['courses']
    active_course_ids = [c.id for c in courses.get().list_active()]
    data = await req.json()
    course_id = data['course_id']
    if course_id in active_course_ids and course_id not in user.attended_course_ids:
        await user.add_attended_courses([course_id], author_user_id=user.id)
    return web.json_response({
        'attended_course_ids': user.attended_course_ids,
    })
