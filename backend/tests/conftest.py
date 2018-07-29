from pathlib import Path
from pytest import fixture


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
