from datetime import date

from cw_backend.util import yaml_dump, yaml_load
from cw_backend.courses import load_course, parse_date


def test_parse_yaml():
    assert yaml_load('foo') == 'foo'


def test_parse_date():
    assert parse_date('2018-07-30') == date(2018, 7, 30)
    assert parse_date('30. 7. 2018') == date(2018, 7, 30)


def test_can_load_all_real_courses(real_course_file):
    assert load_course(real_course_file)


def test_load_sample_course(data_dir):
    course = load_course(data_dir / 'sample_course/course.yaml')
    out = yaml_dump({'course_debug_dump': debug_dump(course)})
    out_path = data_dir / 'sample_course/expected_dump_output.yaml'
    assert out == out_path.read_text()


def debug_dump(obj):
    from cw_backend.courses import Course, Lesson, LessonItem, Text
    from cw_backend.courses import HomeworkTask, HomeworkSection
    if isinstance(obj, dict):
        return {k: debug_dump(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [debug_dump(v) for v in obj]
    if isinstance(obj, (Course, Lesson, LessonItem, HomeworkTask, HomeworkSection)):
        return {obj.__class__.__name__: debug_dump(obj.data)}
    if isinstance(obj, Text):
        return debug_dump({'html': obj.html})
    if isinstance(obj, date):
        return obj.isoformat()
    if isinstance(obj, str):
        return obj
    raise TypeError(f'Cannot debug_dump: {repr(obj)[:500]}')
