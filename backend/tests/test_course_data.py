from datetime import date

from cw_backend.util import yaml_dump, yaml_load
from cw_backend.courses import load_course, parse_date


def test_parse_yaml():
    assert yaml_load('foo') == 'foo'


def test_parse_date():
    assert parse_date('2018-07-30') == date(2018, 7, 30)
    assert parse_date('30. 7. 2018') == date(2018, 7, 30)


def test_can_load_all_real_courses(real_course_file):
    course = load_course(real_course_file)
    # check that course.export_*() works
    assert course.export_summary()
    assert course.export_detail()


def test_load_sample_course(data_dir):
    course = load_course(data_dir / 'sample_course/course.yaml')
    out = yaml_dump({'course_detail': course.export_detail()})
    out_path = data_dir / 'sample_course/expected_export_detail.yaml'
    assert out == out_path.read_text()
