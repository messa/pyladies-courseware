import aiohttp
from aiohttp import web
import asyncio
import logging
from pathlib import Path


logger = logging.getLogger(__name__)

routes = web.RouteTableDef()


@routes.get('/api/login-capabilities')
async def login_link(request):
    return web.json_response({
        'facebook': {'endpoint': '/auth/facebook'},
        'dev': {'endpoint': '/auth/dev'},
    })
