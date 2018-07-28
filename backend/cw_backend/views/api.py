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
        if query == 'user':
            results.append({'name': 'test2'})
        elif query == 'login_methods':
            results.append(get_login_methods())
        else:
            raise Exception(f'Unknown query: {query!r}')
    assert len(results) == len(queries)
    return web.json_response(results)
