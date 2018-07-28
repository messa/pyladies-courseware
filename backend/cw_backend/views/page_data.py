from aiohttp import web
import asyncio
import logging
from pathlib import Path
import simplejson as json

from .auth import get_login_methods


logger = logging.getLogger(__name__)

routes = web.RouteTableDef()


@routes.get('/api/page-data')
def page_data(req):
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
        results.append(resolvers[q_key](req, q_params))
    assert len(results) == len(queries)
    return web.json_response(results)


resolvers = {
    'user': lambda req, params: {'name': 'test2'},
    'login_methods': lambda req, params: get_login_methods(),
    'list_courses': lambda req, params:
        {
            'active': [c.export() for c in req.app['courses'].list_active()],
        },
    'course_detail': lambda req, params:
        req.app['courses'].get_by_id(params['course_id']).export(lessons=True),
}


def resolver(f):
    resolvers[f.__name__] = f
    return f


@resolver
def lesson_detail(req, params):
    course = req.app['courses'].get_by_id(params['course_id'])
    lesson = course.get_lesson_by_slug(params['lesson_slug'])
    return {
        **lesson.export(homeworks=True),
        'course': course.export(),
    }
