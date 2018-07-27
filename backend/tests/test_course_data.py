from datetime import date
import logging
from reprlib import repr as smart_repr
from yaml import safe_load as yaml_load
from yaml import safe_dump as yaml_dump


logger = logging.getLogger(__name__)


def test_parse_yaml():
    assert yaml_load('foo') == 'foo'


def test_load_course(project_dir, data_dir):
    courses_dir = project_dir.parent / 'courses'
    course_dir = courses_dir / 'pyladies_2018_praha_jaro_ntk'
    assert courses_dir.is_dir()
    course = load_course(course_dir)
    out = yaml_dump(debug_dump(course))
    out_path = data_dir / 'snapshots' / 'test_load_course.yaml'
    write_text(out_path.with_suffix('.current.yaml'), out)
    assert out == out_path.read_text()


def write_text(path, contents):
    try:
        current = path.read_text()
    except FileNotFoundError:
        current = None
    if current != contents:
        path.write_text(contents)


def debug_dump(obj):
    if isinstance(obj, dict):
        return {k: debug_dump(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [debug_dump(v) for v in obj]
    if isinstance(obj, Course):
        return debug_dump(obj.data)
    if isinstance(obj, Lesson):
        return debug_dump(obj.data)
    if isinstance(obj, Text):
        return debug_dump({'html': obj.html})
    if isinstance(obj, date):
        return obj.isoformat()
    if isinstance(obj, str):
        return obj
    raise TypeError(f'Cannot debug_dump: {repr(obj)[:500]}')


def load_course(course_dir):
    return Course(course_dir)


class Course:

    def __init__(self, course_dir):
        data_path = course_dir / 'course.yaml'
        logger.debug('Loading course from %s', data_path)
        try:
            raw = yaml_load(data_path.read_text())
        except Exception as e:
            raise Exception(f'Failed to load course file {data_path}: {e}')
        self.data = {
            'title': Text(raw['title']),
            'subtitle': Text(raw['subtitle']),
            'description': Text(raw['description']),
            'lessons': [Lesson(x) for x in raw['lessons']],
        }
        # fix lessons where no slug was specified in course.yaml
        for n, lesson in enumerate(self.data['lessons'], start=1):
            lesson.set_default_slug(str(n))


class Lesson:

    def __init__(self, raw):
        self.data = {
            'title': Text(raw['title']),
            'date': parse_date(raw['date']),
            'slug': str(raw['slug']) if raw.get('slug') else None,
        }

    def set_default_slug(self, default_slug):
        if not self.data['slug']:
            self.data['slug'] = default_slug


class Text:

    def __init__(self, raw):
        if isinstance(raw, str):
            self.html = raw
        elif raw.get('markdown'):
            self.html = markdown_to_html(raw['markdown'])
        else:
            raise Exception(f'Cannot load text: {smart_repr(raw)}')


def parse_date(s):
    from datetime import date
    import re
    if not isinstance(s, str):
        raise TypeError(f'parse_date argument must be str: {smart_repr(s)}')
    m = re.match(r'^([0-9]{1,2})\. *([0-9]{1,2})\. *([0-9]{4})$', s)
    if m:
        day, month, year = m.groups()
        return date(int(year), int(month), int(day))
    m = re.match(r'^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})$', s)
    if m:
        year, month, day = m.groups()
        return date(int(year), int(month), int(day))
    raise Exception(f'Invalid date format: {s!r}')


def test_parse_date():
    from datetime import date
    assert parse_date('2018-07-30') == date(2018, 7, 30)
    assert parse_date('30. 7. 2018') == date(2018, 7, 30)


def markdown_to_html(src):
    from markdown import markdown
    return markdown(src)
