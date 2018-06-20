'''
This module is useful only for development mode.
In production deployment the requests for frontend should be routed by load balancer or front webserver.
'''

import aiohttp
from aiohttp import web
import asyncio
from asyncio import CancelledError
from functools import lru_cache
import logging


logger = logging.getLogger(__name__)

routes = web.RouteTableDef()


@lru_cache()
def get_favicon_bytes_sync():
    import requests
    r = requests.get('https://python.cz/static/favicon.ico') # :)
    r.raise_for_status()
    return r.content


@routes.get('/favicon.ico')
async def get_favicon(request):
    loop = asyncio.get_event_loop()
    favicon = await loop.run_in_executor(None, get_favicon_bytes_sync)
    return web.Response(body=favicon, content_type='image/x-icon')


# @routes.get('/session')
# async def debug_session(request):
#     session = await get_session(request)
#     session_data = dict(session)
#     logger.info('--')
#     logger.info('headers: %r', request.headers)
#     logger.info('Session: %r', session_data)
#     logger.info('--')
#     return web.json_response(session_data)


proxy_request_headers = '''
    Accept
    Cookie
    User-Agent
'''.split()


proxy_response_headers = '''
    Content-Length
    Content-Type
    Date
    X-Powered-By
'''.split()


@routes.get('/')
@routes.get('/{path:.*}')
async def frontend_proxy(request):
    async with aiohttp.ClientSession() as session:
        url = frontend_url + str(request.url.relative())
        request_headers = {k: request.headers[k] for k in proxy_request_headers if request.headers.get(k)}
        try:
            logger.info('Frontend proxy: %s', url)
            logger.info('Frontend proxy headers: %s', request_headers)
            async with session.get(url, headers=request_headers) as r:
                response_headers = {k: r.headers[k] for k in proxy_response_headers if r.headers.get(k)}
                logger.debug('Frontend proxy: %s -> %s', url, r.status)
                wr = web.StreamResponse(status=r.status, headers=response_headers)
                try:
                    await wr.prepare(request)
                    async for data in r.content.iter_any():
                        logger.debug('Frontend proxy: %s data: %s', url, smart_repr(data))
                        await wr.write(data)
                    await wr.write_eof()
                    logger.debug('Frontend proxy: %s done', url)
                    return wr
                except CancelledError as e:
                    logger.info('Frontend proxy CancelledError: %r', e)
                    return wr
        except Exception as e:
            logger.exception('Frontend proxy failed: %r; url: %r', e, url)
            return web.Response(status=500, text='Frontent proxy error')
