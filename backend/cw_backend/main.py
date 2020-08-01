from aiohttp import web
from aiohttp_session import setup as session_setup
from aiohttp_session_mongo import MongoStorage
import argparse
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from graphql_server.aiohttp import GraphQLView
#from graphql.execution.executors.asyncio import AsyncioExecutor as GQLAIOExecutor
#from graphql_ws.aiohttp import AiohttpSubscriptionServer

from .configuration import Configuration
from .courses import load_courses
from .model import Model
from .views import all_routes
from .graphql import Schema


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
    db = await get_db(conf)
    model = Model(db, conf)
    await model.create_indexes()

    app = web.Application()

    async def close_mongo(app):
        db.client.close()

    app.on_cleanup.append(close_mongo)

    session_setup(app, MongoStorage(db['sessions'], max_age=3600*24*365*10))

    app['conf'] = conf
    app['courses'] = load_courses(conf.courses_file)
    app['model'] = model

    app.add_routes(all_routes)

    GraphQLView.attach(
        app,
        route_path='/api/graphql',
        schema=Schema,
        graphiql=True,
        enable_async=True)
        #executor=GQLAIOExecutor())

    app.router.add_get('/api/subscriptions', subscriptions)

    return app


async def get_db(conf):
    client = AsyncIOMotorClient(conf.mongodb.connection_uri)
    db = client[conf.mongodb.db_name]
    assert db.client is client
    return db


async def subscriptions(request):
    try:
        ws = web.WebSocketResponse(protocols=('graphql-ws',))
        await ws.prepare(request)
        subscription_server = AiohttpSubscriptionServer(Schema)
        await subscription_server.handle(ws, {'request': request})
        return ws
    except Exception as e:
        logger.exception('subscriptions failed: %r', e)
        raise e


def setup_logging():
    logging.basicConfig(
        format=log_format,
        level=logging.DEBUG)
    logging.getLogger('MARKDOWN').setLevel(logging.INFO)
