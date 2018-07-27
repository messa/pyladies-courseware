from pathlib import Path
from pytest import fixture


here = Path(__file__).resolve().parent
top_dir = here.parent.parent


@fixture
def project_dir():
    return here.parent


@fixture
def data_dir():
    return here / 'data'


@fixture
def temp_dir(tmpdir):
    # Return Path instead of py.path
    return Path(tmpdir)


@fixture(
    params=list(top_dir.glob('courses/*/course.yaml')),
    ids=lambda p: str(p.relative_to(top_dir)))
def real_course_file(request):
    return request.param
