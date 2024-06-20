from aiohttp import web
from aiohttp_session import setup as session_setup
from aiohttp_session_mongo import MongoStorage
import argparse
import logging
from motor.motor_asyncio import AsyncIOMotorClient

from .configuration import Configuration
from .courses import load_courses
from .integration.slack import Slackbot
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


def setup_event_listeners(event_listeners, conf):
    if conf.slack is not None:
        event_listeners.append(Slackbot(conf.slack.user_auth, conf.slack.bot_auth, conf.slack.web_url).handle_event)
    else:
        logger.warning("Slack tokens missing")


async def get_app(conf):
    mongo_client = AsyncIOMotorClient(conf.mongodb.connection_uri)
    mongo_db = mongo_client[conf.mongodb.db_name]
    model = Model(mongo_db, conf)
    await model.create_indexes()
    app = web.Application()

    async def close_mongo(app):
        mongo_client.close()

    app.on_cleanup.append(close_mongo)

    event_listeners = []

    async def send_event(e):
        for listener in event_listeners:
            await listener(e)

    session_setup(app, MongoStorage(mongo_db['sessions'], max_age=3600*24*365*10))

    app['conf'] = conf
    app['courses'] = load_courses(conf.courses_file)
    app['model'] = model
    app['event'] = send_event

    setup_event_listeners(event_listeners, conf)

    app.add_routes(all_routes)
    return app


def setup_logging():
    logging.basicConfig(
        format=log_format,
        level=logging.DEBUG)
    logging.getLogger('MARKDOWN').setLevel(logging.INFO)
