from pathlib import Path
from pytest import fixture


here = Path(__file__).resolve().parent


@fixture
def project_dir():
    return here.parent


@fixture
def data_dir():
    return here / 'data'
