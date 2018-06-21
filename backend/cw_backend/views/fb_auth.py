import aiohttp
from aiohttp import web
import asyncio
import logging
from pathlib import Path


logger = logging.getLogger(__name__)

routes = web.RouteTableDef()


@routes.get('/auth/facebook')
async def fb_login_redirect(request):
    loop = asyncio.get_event_loop()
    redirect_url, state = await loop.run_in_executor(None, get_fb_login_redirect_url_sync)
    session = await get_session(request)
    session['fb_token'] = None
    session['user'] = None
    session['fb_login_state'] = state
    logger.info('Redirecting to FB login: %s', redirect_url)
    return web.HTTPFound(redirect_url)


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


def check_state_is_equal(query_state, session_state):
    assert isinstance(query_state, str)
    assert isinstance(session_state, str)
    from secrets import compare_digest
    if compare_digest(query_state, session_state):
        logger.info('query state == session state')
    else:
        logger.info('query state != session state')
        raise web.HTTPForbidden(reason='query state != session state')
