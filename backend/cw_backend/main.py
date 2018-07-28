from aiohttp import web
from aiohttp_session import setup as session_setup
from aiohttp_session.cookie_storage import EncryptedCookieStorage
import argparse
from base64 import urlsafe_b64decode
import logging

from .configuration import Configuration
from .courses import load_courses
from .views import all_routes


logger = logging.getLogger(__name__)

log_format = '%(asctime)s %(name)-31s %(levelname)5s: %(message)s'


def cw_backend_main():
    p = argparse.ArgumentParser()
    p.add_argument('--port', type=int, default=5000)
    args = p.parse_args()
    setup_logging()
    conf = Configuration()
    app = get_app(conf)
    web.run_app(app, port=args.port)


def get_app(conf):
    #session_secret = secrets.token_bytes(32)
    session_secret = urlsafe_b64decode(b'yMQe_BcFfRBUVX7SjYAigPm3ZyhiYu7x2_RbcUauveE=')
    # TODO: ^^^ presunout do konfigurace
    app = web.Application()
    session_setup(app, EncryptedCookieStorage(session_secret))
    app['conf'] = conf
    app['courses'] = load_courses(conf.data_dir)
    app.add_routes(all_routes)
    return app


def setup_logging():
    logging.basicConfig(
        format=log_format,
        level=logging.DEBUG)
