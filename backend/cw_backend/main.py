from aiohttp import web
from aiohttp_session import setup as session_setup
from aiohttp_session.cookie_storage import EncryptedCookieStorage
import argparse
from hashlib import sha256
import logging
from motor.motor_asyncio import AsyncIOMotorClient

from .configuration import Configuration
from .courses import load_courses
from .model import Model
from .views import all_routes


logger = logging.getLogger(__name__)

log_format = '%(asctime)s %(name)-31s %(levelname)5s: %(message)s'


def cw_backend_main():
    p = argparse.ArgumentParser()
    p.add_argument('--port', type=int, default=5000)
    args = p.parse_args()
    setup_logging()
    conf = Configuration()
    web.run_app(get_app(conf), port=args.port)


async def get_app(conf):
    mongo_client = AsyncIOMotorClient(conf.mongodb.connection_uri)
    mongo_db = mongo_client[conf.mongodb.db_name]
    model = Model(mongo_db, conf)
    await model.create_indexes()
    # We use hash function because EncryptedCookieStorage needs
    # a byte string of specific size.
    session_secret_hash = sha256(conf.session_secret.encode()).digest()
    app = web.Application()
    session_setup(app, EncryptedCookieStorage(session_secret_hash))
    app['conf'] = conf
    app['courses'] = load_courses(conf.data_dir)
    app['model'] = model
    app.add_routes(all_routes)
    return app


def setup_logging():
    logging.basicConfig(
        format=log_format,
        level=logging.DEBUG)
    logging.getLogger('MARKDOWN').setLevel(logging.INFO)
