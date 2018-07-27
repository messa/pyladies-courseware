from datetime import date
from cw_backend.util import yaml_dump, yaml_load
from cw_backend.courses import load_course, debug_dump, parse_date


def test_parse_yaml():
    assert yaml_load('foo') == 'foo'


def test_load_course(project_dir, data_dir):
    courses_dir = project_dir.parent / 'courses'
    course_dir = courses_dir / 'pyladies_2018_praha_jaro_ntk'
    assert courses_dir.is_dir()
    course = load_course(course_dir)
    out = yaml_dump({'course_debug_dump': debug_dump(course)})
    out_path = data_dir / 'snapshots' / 'test_load_course.yaml'
    write_text_file(out_path.with_suffix('.current.yaml'), out)
    assert out == out_path.read_text()


def write_text_file(path, contents):
    try:
        current = path.read_text()
    except FileNotFoundError:
        current = None
    if current != contents:
        path.write_text(contents)


def test_parse_date():
    assert parse_date('2018-07-30') == date(2018, 7, 30)
    assert parse_date('30. 7. 2018') == date(2018, 7, 30)
