from datetime import date

from cw_backend.util import yaml_dump, yaml_load
from cw_backend.courses import load_course, load_courses, parse_date


def test_parse_yaml():
    assert yaml_load('foo') == 'foo'


def test_parse_date():
    assert parse_date('2018-07-30') == date(2018, 7, 30)
    assert parse_date('30. 7. 2018') == date(2018, 7, 30)


def test_load_sample_course(data_dir):
    course = load_course(data_dir / 'sample_course/course.yaml')
    out = yaml_dump({'course_detail': course.export(lessons=True, homeworks=True)})
    out_path = data_dir / 'sample_course/expected_export_detail.yaml'
    assert out == out_path.read_text()


def test_all_courses_can_be_loaded_and_exported(top_dir):
    courses = load_courses(top_dir)
    assert len(courses) >= 1
    # check that course.export() works
    for course in courses:
        assert course.export()
