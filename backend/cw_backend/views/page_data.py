from aiohttp import web
from aiohttp_session import get_session
import asyncio
from datetime import datetime
import logging
from pathlib import Path
import simplejson as json

from .auth import get_login_methods


logger = logging.getLogger(__name__)

routes = web.RouteTableDef()


@routes.get('/api/page-data')
async def page_data(req):
    queries = json.loads(req.query['q'])
    assert isinstance(queries, list)
    results = []
    for query in queries:
        if isinstance(query, str):
            q_key = query
            q_params = None
        elif isinstance(query, dict):
            if len(query) != 1:
                raise Exception(f'Query must have only one key: {query!r}')
            (q_key, q_params), = query.items()
        else:
            raise Exception(f'Unexpected query type: {query!r}')
        if q_key not in resolvers:
            raise Exception(f'Unknown query: {query!r}')
        res = resolvers[q_key](req, q_params)
        if asyncio.iscoroutine(res):
            res = await res
        assert isinstance(res, (dict, list)) or res is None
        results.append(res)
    assert len(results) == len(queries)
    return web.json_response(results)


resolvers = {}


def resolver(f):
    '''
    Decorator that adds given function to resolvers
    '''
    resolvers[f.__name__] = f
    return f


@resolver
def login_methods(req, params):
    return get_login_methods(conf=req.app['conf'])


@resolver
def list_courses(req, params):
    courses = req.app['courses'].get()
    return {
        'active': [c.export() for c in courses.list_active()],
        'past': [c.export() for c in courses.list_past()],
    }


@resolver
async def user(req, params):
    session = await get_session(req)
    if not session.get('user'):
        return None
    model = req.app['model']
    user = await model.users.get_by_id(session['user']['id'])
    return user.export(details=True)


@resolver
async def course_detail(req, params):
    session = await get_session(req)
    model = req.app['model']
    course = req.app['courses'].get().get_by_course_id(params['course_id'])
    if session.get('user'):
        user = await model.users.get_by_id(session['user']['id'])
        if datetime.utcnow().strftime('%Y-%m-%d') <= '2018-10-30':
            await user.add_attended_courses([course.id], author_user_id=None)
    return course.export(sessions=True)


@resolver
def session_detail(req, params):
    course = req.app['courses'].get().get_by_course_id(params['course_id'])
    session = course.get_session_by_slug(params['session_slug'])
    return {
        **session.export(tasks=True),
        'course': course.export(),
    }


@resolver
async def review_user(req, params):
    if not params.get('user_id'):
        return None
    session = await get_session(req)
    model = req.app['model']
    if not session.get('user'):
        raise web.HTTPForbidden()
    user = await model.users.get_by_id(session['user']['id'])
    if not user.is_admin and not user.coached_course_ids:
        raise web.HTTPForbidden()
    u = await model.users.get_by_id(params['user_id'])
    return u.export()
