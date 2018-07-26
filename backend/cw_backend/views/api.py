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
    params = json.loads(req.query['p'])
    data = {
        'user': {'name': 'test2'},
    }
    if params.get('login_methods'):
        data['login_methods'] = get_login_methods()
    return web.json_response(data)
