from aiohttp import web
from aiohttp_session import get_session
import logging


logger = logging.getLogger(__name__)

routes = web.RouteTableDef()


@routes.get('/join-course/{course}/student')
async def assign_student_to_course(req):
    session = await get_session(req)
    if not session.get('user'):
        raise web.HTTPFound('/login')
    try:
        course = req.app['courses'].get().get_by_id(req.match_info['course'])
    except Exception:
        raise web.HTTPNotFound(text='Course not found')
    if (not 'secret' in req.query or
        req.query['secret'] != course.get_student_secret(req.app['conf'].courses_secret)):
        raise web.HTTPForbidden()
    model = req.app['model']
    user = await model.users.get_by_id(session['user']['id'])
    courses = req.app['courses']
    active_course_ids = [c.id for c in courses.get().list_active()]
    if course.id in active_course_ids and course.id not in user.attended_course_ids:
        await user.add_attended_courses([course.id], author_user_id=user.id)
    raise web.HTTPFound(f'/course?course={course.id}')

@routes.get('/join-course/{course}/coach')
async def assign_coach_to_course(req):
    session = await get_session(req)
    if not session.get('user'):
        raise web.HTTPFound('/login')
    try:
        course = req.app['courses'].get().get_by_id(req.match_info['course'])
    except Exception:
        raise web.HTTPNotFound(text='Course not found')
    if (not 'secret' in req.query or
        req.query['secret'] != course.get_coach_secret(req.app['conf'].courses_secret)):
        raise web.HTTPForbidden()
    model = req.app['model']
    user = await model.users.get_by_id(session['user']['id'])
    courses = req.app['courses']
    active_course_ids = [c.id for c in courses.get().list_active()]
    if course.id in active_course_ids and course.id not in user.coached_course_ids:
        await user.add_coached_courses([course.id], author_user_id=user.id)
    raise web.HTTPFound(f'/course?course={course.id}')
