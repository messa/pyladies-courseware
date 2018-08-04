from itertools import count
import os
from pathlib import Path
from pytest import fixture, skip

from cw_backend.model import Model


here = Path(__file__).resolve().parent

on_CI = not os.environ.get('CI')


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
        assert not on_CI
        skip('MongoDB is not running')
    try:
        client = AsyncIOMotorClient(connectTimeoutMS=250, serverSelectionTimeoutMS=250)
        pid = os.getpid()
        db = client[f'courseware_test_{pid}']
        await client.drop_database(db.name)
        mongodb_is_running = True
    except ServerSelectionTimeoutError as e:
        if on_CI:
            raise e
        assert mongodb_is_running is None
        mongodb_is_running = False
        skip(f'MongoDB is not running (ServerSelectionTimeoutError: {e})')
    yield db
    await client.drop_database(db.name)



@fixture
def conf():
    class Configuration:
        allow_dev_login = True
    return Configuration()


@fixture
def generate_id():
    counter = count()
    def _generate_id():
        return f'id_{next(counter)}'
    return _generate_id


@fixture
def model(db, conf, generate_id):
    return Model(db, conf=conf, generate_id=generate_id)
