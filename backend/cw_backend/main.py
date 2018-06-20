from aiohttp import web
from aiohttp_session import setup as session_setup
from aiohttp_session.cookie_storage import EncryptedCookieStorage
import argparse
import logging

from .views import all_routes


logger = logging.getLogger(__name__)


def cw_backend_main():
    p = argparse.ArgumentParser()
    p.add_argument('--port', type=int, default=5000)
    args = p.parse_args()
    setup_logging()
    app = get_app()
    web.run_app(app, port=args.port)


def get_app():
    #session_secret = secrets.token_bytes(32)
    session_secret = urlsafe_b64decode(b'yMQe_BcFfRBUVX7SjYAigPm3ZyhiYu7x2_RbcUauveE=')
    # TODO: ^^^ presunout do konfigurace
    app = web.Application()
    session_setup(app,  EncryptedCookieStorage(session_secret))
    app.add_routes(all_routes)


def setup_logging():
    logging.basicConfig(
        format='%(asctime)s %(name)-15s %(levelname)5s: %(message)s',
        level=logging.DEBUG)
