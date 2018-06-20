#!/usr/bin/env python3

import aiohttp
from aiohttp import web
import asyncio
from asyncio import CancelledError
import argparse
from base64 import b64decode, urlsafe_b64decode
import logging
from pathlib import Path
from reprlib import repr as smart_repr
import requests
import yaml
from aiohttp_session import setup as session_setup, get_session
from aiohttp_session.cookie_storage import EncryptedCookieStorage
import secrets


frontend_url = 'http://127.0.0.1:3000'

logger = logging.getLogger(__name__)

routes = web.RouteTableDef()


def get_favicon_bytes():
    r = requests.get('https://python.cz/static/favicon.ico')
    r.raise_for_status()
    return r.content


favicon_bytes = get_favicon_bytes()


@routes.get('/favicon.ico')
async def get_favicon(request):
    return web.Response(body=favicon_bytes, content_type='image/x-icon')


@routes.get('/session')
async def debug_session(request):
    session = await get_session(request)
    session_data = dict(session)
    logger.info('--')
    logger.info('headers: %r', request.headers)
    logger.info('Session: %r', session_data)
    logger.info('--')
    return web.json_response(session_data)


@routes.get('/hello/')
@routes.get('/hello/{name}')
async def handle(request):
    name = request.match_info.get('name', "Anonymous")
    text = "Hello, " + name
    return web.Response(text=text)


@routes.get('/auth/facebook')
async def fb_login_redirect(request):
    loop = asyncio.get_event_loop()
    redirect_url, state = await loop.run_in_executor(None, get_fb_login_redirect_url_sync)
    session = await get_session(request)
    session['fb_token'] = None
    session['user'] = None
    session['fb_login_state'] = state
    logger.info('Redirecting to FB login: %s', redirect_url)
    return  web.HTTPFound(redirect_url)


@routes.get('/auth/facebook/callback')
async def fb_login_callback(request):
    loop = asyncio.get_event_loop()
    session = await get_session(request)
    check_state_is_equal(request.query['state'], session['fb_login_state'])
    token, user_info = await loop.run_in_executor(None, process_fb_login_callback_sync, request.query['code'])
    session['fb_token'] = token
    session['user'] = user_info
    del session['fb_login_state']
    redirect_url = '/dashboard'
    logger.info('FB login callback OK, redirecting to %s', redirect_url)
    return web.HTTPFound(redirect_url)


def check_state_is_equal(query_state, session_state):
    assert isinstance(query_state, str)
    assert isinstance(session_state, str)
    from secrets import compare_digest
    if compare_digest(query_state, session_state):
        logger.info('query state == session state')
    else:
        logger.info('query state != session state')
        raise web.HTTPForbidden(reason='query state != session state')


def load_fb_login_configuration():
    conf_path = Path('~/Dropbox/dev/pyladies-courseware.yaml').expanduser()
    conf = yaml.safe_load(conf_path.read_text())
    return conf['facebook_login']


def get_fb_login_redirect_url_sync():
    conf = load_fb_login_configuration()
    fb_app_id = conf['app_id']
    fb_app_secret = conf['app_secret']
    callback_url = conf['callback_url']
    logger.debug('Facebook login callback URL: %s', callback_url)
    authorization_base_url = 'https://www.facebook.com/dialog/oauth'
    from requests_oauthlib import OAuth2Session
    from requests_oauthlib.compliance_fixes import facebook_compliance_fix
    facebook = OAuth2Session(fb_app_id, redirect_uri=callback_url, scope='email')
    facebook = facebook_compliance_fix(facebook)
    authorization_url, state = facebook.authorization_url(authorization_base_url)
    return authorization_url, state


def process_fb_login_callback_sync(code):
    conf = load_fb_login_configuration()
    fb_app_id = conf['app_id']
    fb_app_secret = conf['app_secret']
    callback_url = conf['callback_url']
    token_url = 'https://graph.facebook.com/oauth/access_token'
    from requests_oauthlib import OAuth2Session
    from requests_oauthlib.compliance_fixes import facebook_compliance_fix
    facebook = OAuth2Session(fb_app_id, redirect_uri=callback_url)
    facebook = facebook_compliance_fix(facebook)
    token = facebook.fetch_token(token_url, client_secret=fb_app_secret, code=code)
    r = facebook.get('https://graph.facebook.com/me')
    logger.debug('facebook /me without fields: %s', r.content)
    r = facebook.get('https://graph.facebook.com/me?fields=id,name,email')
    logger.debug('facebook /me with fields: %s', r.content)
    # response:{"id":"102...61723","name":"Pe...er","email":"pe...com"}
    me = r.json()
    user_info = {
        'fb_id': me['id'],
        'name': me['name'],
        'email': me['email'],
    }
    return token, user_info



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


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--port', type=int, default=5000)
    args = p.parse_args()
    logging.basicConfig(
        format='%(asctime)s %(name)-15s %(levelname)5s: %(message)s',
        level=logging.DEBUG)
    #session_secret = secrets.token_bytes(32)
    session_secret = urlsafe_b64decode(b'yMQe_BcFfRBUVX7SjYAigPm3ZyhiYu7x2_RbcUauveE=')
    app = web.Application()
    session_setup(app,  EncryptedCookieStorage(session_secret))
    app.add_routes(routes)
    web.run_app(app, port=args.port)


if __name__ == '__main__':
    main()
