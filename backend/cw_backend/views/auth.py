import aiohttp
from aiohttp import web
import asyncio
import logging
from pathlib import Path


logger = logging.getLogger(__name__)

routes = web.RouteTableDef()


@routes.get('/api/login-methods')
async def login_methods(request):
    return web.json_response({
        'facebook': {'url': '/auth/facebook'},
        'google': {'url': '/auth/google'},
        'dev': {
            'student_url': '/auth/dev?role=student',
            'coach_url': '/auth/dev?role=coach',
            'admin_url': '/auth/dev?role=admin',
        },
    })
