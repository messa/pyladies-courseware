import aiohttp
from aiohttp import web
from aiohttp_session import get_session
import asyncio
import logging
from pathlib import Path



logger = logging.getLogger(__name__)

routes = web.RouteTableDef()


@routes.get('/api/admin/users')
async def list_users(req):
    session = await get_session(req)
    model = req.app['model']
    if not session.get('user'):
        raise web.HTTPForbidden()
    user = await model.users.get_by_id(session['user']['id'])
    if user.is_admin != True:
        raise web.HTTPForbidden()
    users = await model.users.list_all()
    return web.json_response({
        'paging': None,
        'items': [u.export() for u in users],
    })
