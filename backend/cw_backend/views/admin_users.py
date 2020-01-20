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
    if not user or not user.is_admin:
        raise web.HTTPForbidden()
    users = await model.users.list_all()
    return web.json_response({
        'items': [u.export(details=True) for u in users],
    })


@routes.get('/api/admin/user/{user_id}')
async def get_user_detail(req):
    session = await get_session(req)
    model = req.app['model']
    if not session.get('user'):
        raise web.HTTPForbidden()
    user = await model.users.get_by_id(session['user']['id'])
    if not user or not user.is_admin:
        raise web.HTTPForbidden()
    u = await model.users.get_by_id(req.match_info['user_id'])
    return web.json_response({
        'user': u.export(details=True),
    })

@routes.post('/api/admin/user/{user_id}')
async def post_user_detail(req):
    session = await get_session(req)
    model = req.app['model']
    errors = []
    if not session.get('user'):
        errors.append('Nenalezena session uživatele')
    user = await model.users.get_by_id(session['user']['id'])
    if not user or not user.is_admin:
        errors.append('Nejste oprávněn provést akci')
    if not errors:
        u = await model.users.get_by_id(req.match_info['user_id'])
        data = await req.json()
        await u.update_user(data, session['user']['id'])
    return web.json_response({'errors': errors})
