'''
This module implements reading course data YAML files.
'''

from datetime import date
from itertools import count
import logging
from reprlib import repr as smart_repr
from .util import yaml_load


logger = logging.getLogger(__name__)


def load_course(course_file):
    '''
    Load one course.yaml files.
    '''
    return Course(course_file)


def load_courses(data_dir):
    '''
    Load all files courses/*/course.yaml from a given directory.

    '''
    return Courses(data_dir)


class Courses:

    def __init__(self, data_dir):
        self.courses = [Course(p) for p in data_dir.glob('courses/*/course.yaml')]
        # TODO: sort by date

    def __iter__(self):
        return iter(self.courses)

    def list_active(self):
        # TODO: add list of inactive?
        return list(self.courses)

    def get_by_id(self, course_id):
        assert isinstance(course_id, str)
        for c in self.courses:
            if c.id == course_id:
                return c
        raise Exception(f'Course id {course_id!r} not found')


class DataProperty:
    '''
    Example:

        class C:
            def __init__(self):
                self.data = {'foo': 'bar'}
            foo = DataProperty('foo')

        # Now you can access C().data['foo'] via C().foo
        C().foo == 'bar'
        C().foo = 'baz'
    '''

    def __init__(self, key):
        self.key = key

    def __get__(self, instance, owner):
        return instance.data[self.key]

    def __set__(self, instance, value):
        instance.data[self.key] = value


class Course:

    def __init__(self, course_file):
        logger.debug('Loading course from %s', course_file)
        try:
            raw = yaml_load(course_file.read_text())
        except Exception as e:
            raise Exception(f'Failed to load course file {course_file}: {e}')
        course_dir = course_file.parent
        self.data = {
            'id': course_file.parent.name.replace('_', '-'),
            'title_html': to_html(raw['title']),
            'subtitle_html': to_html(raw['subtitle']),
            'description_html': to_html(raw['description']),

        }
        self.lessons = [Lesson(x, dir_path=course_dir) for x in raw['lessons']]
        # fix lessons where no slug was specified in course.yaml
        for n, lesson in enumerate(self.lessons, start=1):
            if not lesson.slug:
                lesson.slug = str(n)

    id = DataProperty('id')

    def __repr__(self):
        return f'<{self.__class__.__name__} id={self.id!r}>'

    def get_lesson_by_slug(self, slug):
        assert isinstance(slug, str)
        for lesson in self.lessons:
            if lesson.slug == slug:
                return lesson
        raise Exception(f'Lesson with slug {slug!r} not found in {self}')

    def export(self, lessons=False, homeworks=False):
        d = dict(self.data)
        if lessons:
            d['lessons'] = [lesson.export(homeworks=homeworks) for lesson in self.lessons]
        return d


class Lesson:

    def __init__(self, raw, dir_path):
        self.data = {
            'title_html': to_html(raw['title']),
            'date': parse_date(raw['date']),
            'slug': str(raw['slug']) if raw.get('slug') else None,
        }
        self.lesson_items = [LessonItem(x) for x in raw.get('items', [])]
        self.homework_items = []
        for raw_hw in raw.get('homeworks', []):
            if raw_hw.get('file'):
                self.homework_items.extend(load_homeworks_file(dir_path / raw_hw['file']))

    slug = DataProperty('slug')

    def export(self, homeworks=False):
        d = {
            **self.data,
            'date': self.data['date'].isoformat(),
            'lesson_items': [li.export() for li in self.lesson_items],
            'has_homeworks': bool(self.homework_items),
        }
        if homeworks:
            d['homework_items'] = [hi.export() for hi in self.homework_items]
        return d


def load_homeworks_file(file_path):
    try:
        raw = yaml_load(file_path.read_text())
    except Exception as e:
        raise Exception(f'Failed to load homeworks file {file_path}: {e}')
    homework_items = []
    counter = count()
    for raw_item in raw['homeworks']:
        if raw_item.get('section'):
            homework_items.append(HomeworkSection(raw_item['section']))
        elif raw_item.get('markdown'):
            homework_items.append(HomeworkTask(raw_item, next(counter)))
        else:
            raise Exception(f'Unknown item in homeworks file {file_path}: {smart_repr(raw_item)}')
    return homework_items


class LessonItem:

    def __init__(self, raw):
        if raw.get('lesson'):
            self.data = {
                'lesson_item_type': 'lesson',
                'title_html': to_html(raw['lesson']),
                'url': raw['url'],
            }
        elif raw.get('cheatsheet'):
            self.data = {
                'lesson_item_type': 'cheatsheet',
                'title_html': to_html(raw['cheatsheet']),
                'url': raw['url'],
            }
        elif raw.get('attachment'):
            self.data = {
                'lesson_item_type': 'attachment',
                'title_html': to_html(raw['attachment']),
                'url': raw['url'],
            }
        elif raw.get('text'):
            self.data = {
                'lesson_item_type': 'text',
                'text_html': to_html(raw['text']),
            }
        else:
            raise Exception(f'Unknown LessonItem data: {smart_repr(raw)}')

    def export(self):
        return self.data



class HomeworkSection:

    def __init__(self, raw_section):
        self.data = {
            'homework_item_type': 'section',
            'text_html': to_html(raw_section),
        }

    def export(self):
        return self.data


class HomeworkTask:

    def __init__(self, raw, default_number):
        self.data = {
            'homework_item_type': 'task',
            'number': default_number,
            'text_html': to_html(raw),
        }

    def export(self):
        return self.data


def to_html(raw):
    if isinstance(raw, str):
        return raw
    elif raw.get('markdown'):
        return markdown_to_html(raw['markdown'])
    else:
        raise Exception(f'Unknown type (to_html): {smart_repr(raw)}')


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

def markdown_to_html(src):
    from markdown import markdown
    return markdown(
        src,
        extensions=[
            'markdown.extensions.fenced_code',
            'markdown.extensions.tables',
        ],
        output_format='html5')
