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


resolvers = {
    'login_methods': lambda req, params: get_login_methods(conf=req.app['conf']),
    'list_courses': lambda req, params:
        {
            'active': [c.export() for c in req.app['courses'].get().list_active()],
        },
}


def resolver(f):
    resolvers[f.__name__] = f
    return f


@resolver
async def user(req, params):
    session = await get_session(req)
    if not session.get('user'):
        return None
    model = req.app['model']
    user = await model.users.get_by_id(session['user']['id'])
    return user.export()


@resolver
async def course_detail(req, params):
    session = await get_session(req)
    model = req.app['model']
    course = req.app['courses'].get().get_by_id(params['course_id'])
    if session.get('user'):
        user = await model.users.get_by_id(session['user']['id'])
        if datetime.utcnow().strftime('%Y-%m-%d') <= '2018-09-18':
            await user.add_attended_courses([course.id], author_user_id=None)
    return course.export(lessons=True)


@resolver
def lesson_detail(req, params):
    course = req.app['courses'].get().get_by_id(params['course_id'])
    lesson = course.get_lesson_by_slug(params['lesson_slug'])
    return {
        **lesson.export(homeworks=True),
        'course': course.export(),
    }
