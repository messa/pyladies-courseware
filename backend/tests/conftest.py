import os
from pathlib import Path
from pytest import fixture, skip

from cw_backend.model import Model


here = Path(__file__).resolve().parent


@fixture
def top_dir():
    return here.parent.parent


@fixture
def data_dir():
    return here / 'data'


@fixture
def temp_dir(tmpdir):
    # Return Path instead of py.path
    return Path(tmpdir)


mongodb_is_running = None


@fixture
async def db():
    global mongodb_is_running
    from motor.motor_asyncio import AsyncIOMotorClient
    from pymongo.errors import ServerSelectionTimeoutError
    if mongodb_is_running is False:
        skip('MongoDB tests skipped')
    try:
        client = AsyncIOMotorClient(connectTimeoutMS=250, serverSelectionTimeoutMS=250)
        pid = os.getpid()
        db = client[f'courseware_test_{pid}']
        await client.drop_database(db.name)
        mongodb_is_running = True
    except ServerSelectionTimeoutError as e:
        assert mongodb_is_running is None
        mongodb_is_running = False
        skip(f'MongoDB tests skipped because of ServerSelectionTimeoutError: {e}')
    yield db


@fixture
def conf():
    class Configuration:
        allow_dev_login = True
    return Configuration()


@fixture
def model(db, conf):
    return Model(db, conf=conf)
