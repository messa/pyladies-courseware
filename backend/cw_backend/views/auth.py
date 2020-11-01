import aiohttp
from aiohttp import web
from aiohttp_session import get_session
import asyncio
import logging
from pathlib import Path
from requests_oauthlib import OAuth2Session
from textwrap import dedent

from ..util import get_random_name
from ..model.errors import ModelError, NotFoundError, InvalidPasswordError


logger = logging.getLogger(__name__)

routes = web.RouteTableDef()


fb_authorization_base_url = 'https://www.facebook.com/dialog/oauth'
fb_token_url = 'https://graph.facebook.com/oauth/access_token'
fb_me_url = 'https://graph.facebook.com/me?fields=id,name,email'

google_authorization_base_url = "https://accounts.google.com/o/oauth2/v2/auth"
google_token_url = "https://www.googleapis.com/oauth2/v4/token"
google_user_info_url = 'https://www.googleapis.com/oauth2/v1/userinfo'


redirect_page = dedent('''
    <!DOCTYPE html>
    <html>
        <head>
            <title>Redirecting</title>
        </head>
        <body>
            <script>
                let nextUrl = null
                try {
                    nextUrl = window.localStorage.getItem('cwUrlAfterLogin')
                    window.localStorage.removeItem('cwUrlAfterLogin')
                } catch (err) {
                }
                // redirect
                window.location = nextUrl || '/'
            </script>
        </body>
    </html>
''')


def get_login_methods(conf):
    return {
        'facebook': {'url': '/auth/facebook'} if conf.fb_oauth2 else None,
        'google': {'url': '/auth/google'} if conf.google_oauth2 else None,
        'dev': {
            'student_url': '/auth/dev?role=student',
            'coach_url': '/auth/dev?role=coach',
            'admin_url': '/auth/dev?role=admin',
        } if conf.allow_dev_login else None,
    }


@routes.get('/auth/logout')
async def logout(req):
    session = await get_session(req)
    session['user'] = None
    raise  web.HTTPFound('/')


@routes.get('/auth/dev')
async def auth_dev(req):
    model = req.app['model']
    courses = req.app['courses']
    role = req.query['role']
    if role not in {'student', 'coach', 'admin'}:
        raise web.HTTPBadRequest(text=f'Unknown role: {role!r}')
    session = await get_session(req)
    name = get_random_name()
    logger.debug('Generated random name: %r', name)
    user = await model.users.create_dev_user(name)
    course_ids = [c.id for c in courses.get().list_active()]
    if role == 'student':
        await user.add_attended_courses(course_ids, author_user_id=None)
    if role == 'coach':
        await user.add_coached_courses(course_ids, author_user_id=None)
    if role == 'admin':
        await user.set_admin(True, author_user_id=None)
    session['user'] = {
        'id': user.id,
        'name': user.name,
    }
    return web.Response(text=redirect_page, content_type='text/html')


@routes.post('/auth/register')
async def register(req):
    data = await req.json()
    session = await get_session(req)
    session['user'] = None
    errors = []
    try:
        user = await req.app['model'].users.create_password_user(
            name=data['name'], email=data['email'], password=data['password'])
    except ModelError as e:
        errors.append(str(e))
    except Exception as e:
        logger.exception('create_password_user failed: %r', e)
        errors.append('Server error')
    return web.json_response({'errors': errors})


@routes.post('/auth/password-login')
async def register(req):
    data = await req.json()
    session = await get_session(req)
    session['user'] = None
    errors = []
    user = None
    try:
        user = await req.app['model'].users.login_password_user(
            email=data['email'], password=data['password'])
    except (NotFoundError, InvalidPasswordError) as e:
        errors.append('Nesprávný e-mail nebo heslo')
    except ModelError as e:
        errors.append(str(e))
    except Exception as e:
        logger.exception('login_password_user failed: %r', e)
        errors.append('Server error')
    assert user or errors
    if user:
        assert not errors
        session['user'] = {
            'id': user.id,
            'name': user.name,
            'email': user.email,
        }
    return web.json_response({'errors': errors})


def get_fb_oauth2_session(conf):
    from requests_oauthlib.compliance_fixes import facebook_compliance_fix
    if not conf.client_id:
        raise web.HTTPInternalServerError(text='credentials not configured')
    sess = OAuth2Session(client_id=conf.client_id, redirect_uri=conf.callback_url)
    sess = facebook_compliance_fix(sess)
    return sess


@routes.get('/auth/facebook')
async def fb_redirect(req):
    session = await get_session(req)
    session['user'] = None
    conf = req.app['conf'].fb_oauth2
    oauth2_sess = get_fb_oauth2_session(conf)
    authorization_url, state = oauth2_sess.authorization_url(fb_authorization_base_url)
    logger.debug('/auth/facebook authorization_url: %r state: %r', authorization_url, state)
    session['facebook_oauth2_state'] = state
    logger.debug('Redirecting to %s', authorization_url)
    raise web.HTTPFound(authorization_url)


@routes.get('/auth/facebook/callback')
async def fb_callback(req):
    session = await get_session(req)
    if req.query['state'] != session['facebook_oauth2_state']:
        raise web.HTTPForbidden(text='state mismatch')
    del session['oauth2_state']
    conf = req.app['conf'].fb_oauth2

    def fetch():
        oauth2_sess = get_fb_oauth2_session(conf)
        token = oauth2_sess.fetch_token(
            fb_token_url, client_secret=conf.client_secret, code=req.query['code'])
        r = oauth2_sess.get(fb_me_url)
        r.raise_for_status()
        me = r.json()
        return token, me

    token, me = await asyncio.get_event_loop().run_in_executor(None, fetch)
    logger.info('FB me: %r', me)
    assert me['id']
    model = req.app['model']
    user = await model.users.login_oauth2_user(
        provider='fb',
        provider_user_id=str(me['id']),
        name=me['name'],
        email=me.get('email'))
    session['user'] = {
        'id': user.id,
        'name': user.name,
        'email': user.email,
        'fb_id': me['id'],
        'fb_token': token,
    }
    return web.Response(text=redirect_page, content_type='text/html')


def get_google_oauth2_session(conf):
    scope = [
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
        "openid"
    ]
    return OAuth2Session(conf.client_id, scope=scope, redirect_uri=conf.callback_url)


@routes.get('/auth/google')
async def google_redirect(req):
    session = await get_session(req)
    session['user'] = None
    conf = req.app['conf'].google_oauth2
    oauth2_sess = get_google_oauth2_session(conf)
    authorization_url, state = oauth2_sess.authorization_url(google_authorization_base_url)
    logger.debug('/auth/google authorization_url: %r state: %r', authorization_url, state)
    # access_type="offline", prompt="select_account")
    session['google_oauth2_state'] = state
    logger.debug('Redirecting to %s', authorization_url)
    response = web.Response(
        status=302,
        text='Redirecting to authorization page',
        headers={'Location': authorization_url})
    response.set_cookie('cw_google_oauth2_state', state, httponly=True)
    return response


@routes.get('/auth/google/callback')
async def google_callback(req):
    session = await get_session(req)
    logger.debug('/auth/google/callback session: %r', session)
    logger.debug('/auth/google/callback req.cookies: %r', req.cookies)
    expected_state = session.get('google_oauth2_state') or req.cookies.get('cw_google_oauth2_state')
    logger.debug('/auth/google/callback expected_state: %r', expected_state)
    if req.query['state'] != session['google_oauth2_state']:
        raise web.HTTPForbidden(text='state mismatch')
    try:
        del session['google_oauth2_state']
    except KeyError as e:
        logger.warning("KeyError del session['google_oauth2_state']: %r", e)
    conf = req.app['conf'].google_oauth2

    def fetch():
        oauth2_sess = get_google_oauth2_session(conf)
        token = oauth2_sess.fetch_token(google_token_url,
            client_secret=conf.client_secret, code=req.query['code'])
        r = oauth2_sess.get(google_user_info_url)
        r.raise_for_status()
        me = r.json()
        return token, me

    token, me = await asyncio.get_event_loop().run_in_executor(None, fetch)
    model = req.app['model']
    user = await model.users.login_oauth2_user(
        provider='google',
        provider_user_id=str(me['id']),
        name=me['name'],
        email=me.get('email'))
    session['user'] = {
        'id': user.id,
        'name': user.name,
        'email': user.email,
        'google_id': me['id'],
        'google_token': token,
    }
    return web.Response(text=redirect_page, content_type='text/html')
