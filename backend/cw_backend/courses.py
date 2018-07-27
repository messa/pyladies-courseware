from datetime import date
import logging
from reprlib import repr as smart_repr
from .util import yaml_load


logger = logging.getLogger(__name__)


def load_course(course_dir):
    return Course(course_dir)


def debug_dump(obj):
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
            'lessons': [Lesson(x, dir_path=course_dir) for x in raw['lessons']],
        }
        # fix lessons where no slug was specified in course.yaml
        for n, lesson in enumerate(self.data['lessons'], start=1):
            if not lesson.slug:
                lesson.slug = str(n)


class Lesson:

    def __init__(self, raw, dir_path):
        self.data = {
            'title': Text(raw['title']),
            'date': parse_date(raw['date']),
            'slug': str(raw['slug']) if raw.get('slug') else None,
            'lesson_items': [LessonItem(x) for x in raw.get('items', [])],
            'homework_items': [],
        }
        for raw_hw in raw.get('homeworks', []):
            if raw_hw.get('file'):
                self.data['homework_items'].extend(load_homeworks_file(dir_path / raw_hw['file']))

    slug = DataProperty('slug')


def load_homeworks_file(data_path):
    try:
        raw = yaml_load(data_path.read_text())
    except Exception as e:
        raise Exception(f'Failed to load homeworks file {data_path}: {e}')
    homework_items = []
    for raw_item in raw['homeworks']:
        if raw_item.get('section'):
            homework_items.append(HomeworkSection(raw_item['section']))
        elif raw_item.get('markdown'):
            homework_items.append(HomeworkTask(raw_item))
        else:
            raise Exception(f'Unknown item in homeworks file {data_path}: {smart_repr(raw_item)}')
    return homework_items


class LessonItem:

    def __init__(self, raw):
        if raw.get('lesson'):
            self.data = {
                'lesson_item_type': 'lesson',
                'title': Text(raw['lesson']),
                'url': raw['url'],
            }
        elif raw.get('cheatsheet'):
            self.data = {
                'lesson_item_type': 'cheatsheet',
                'title': Text(raw['cheatsheet']),
                'url': raw['url'],
            }
        elif raw.get('attachment'):
            self.data = {
                'lesson_item_type': 'attachment',
                'title': Text(raw['attachment']),
                'url': raw['url'],
            }
        elif raw.get('text'):
            self.data = {
                'lesson_item_type': 'text',
                'text': Text(raw['text']),
            }
        else:
            raise Exception(f'Unknown LessonItem data: {smart_repr(raw)}')



class HomeworkSection:

    def __init__(self, raw_section):
        self.data = {
            'homework_item_type': 'section',
            'text': Text(raw_section),
        }


class HomeworkTask:

    def __init__(self, raw):
        self.data = {
            'homework_item_type': 'task',
            'text': Text(raw),
        }


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

def markdown_to_html(src):
    from markdown import markdown
    return markdown(src)
