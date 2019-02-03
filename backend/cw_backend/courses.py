'''
This module implements reading course data YAML files.
'''

from datetime import date
from functools import partial
from itertools import count
import logging
from pathlib import Path
import re
from reprlib import repr as smart_repr
from time import monotonic

from .util import yaml_load


logger = logging.getLogger(__name__)


def load_course(course_file):
    '''
    Load one course.yaml files.
    Returns Course object. Used in tests.
    '''
    return Course(course_file, file_loader=FileLoader())


def load_courses(courses_file):
    '''
    Load all files courses/*/course.yaml from a given directory.
    Returns Courses wrapped inside ReloadingContainer.
    '''
    return ReloadingContainer(factory=partial(Courses, courses_file=courses_file))


class FileLoader:

    def __init__(self):
        self.file_state = {} # { Path: ( mtime, size ) }

    def read_text(self, path):
        return self.read_bytes(path).decode('UTF-8')

    def read_bytes(self, path):
        path = Path(path).resolve()
        data = path.read_bytes()
        self.file_state[path] = (path.stat().st_mtime, len(data))
        return data

    def dirty(self):
        t = monotonic()
        try:
            for path, (mtime, size) in self.file_state.items():
                st = path.stat()
                if st.st_mtime != mtime or st.st_size != size:
                    return True
            return False
        finally:
            d = monotonic() - t
            if d > 0.1:
                logger.debug('Checking course data files took %.3f s', d)


class ReloadingContainer:

    def __init__(self, factory):
        self._factory = factory
        self._file_loader = FileLoader()
        self._load()

    def _load(self):
        self._obj = self._factory(file_loader=self._file_loader)

    def get(self):
        if self._file_loader.dirty():
            self._load()
        return self._obj


class Courses:

    def __init__(self, courses_file, file_loader):
        assert isinstance(courses_file, Path)
        self.courses = []
        raw = yaml_load(file_loader.read_text(courses_file))
        for c in raw['courses']:
            p = courses_file.parent / c['file']
            self.courses.append(Course(p, file_loader=file_loader))
        self.courses.sort(key=lambda c: c.start_date) # newest first
        self.courses.sort(key=lambda c: c.start_date.year, reverse=True)

    def __iter__(self):
        return iter(self.courses)

    def __len__(self):
        return len(self.courses)

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

    def __init__(self, course_file, file_loader):
        assert isinstance(course_file, Path)
        logger.debug('Loading course from %s', course_file)
        try:
            raw = yaml_load(file_loader.read_text(course_file))
        except Exception as e:
            raise Exception(f'Failed to load course file {course_file}: {e}')
        course_dir = course_file.parent
        self.data = {
            'id': course_file.parent.name.replace('_', '-'),
            'title_html': to_html(raw['title']),
            'subtitle_html': to_html(raw['subtitle']),
            'description_html': to_html(raw['description']),
            'start_date': parse_date(raw.get('start_date')),
            'end_date': parse_date(raw.get('end_date')),

        }
        self.sessions = [Session(x, dir_path=course_dir, file_loader=file_loader) for x in raw['sessions']]
        # fix sessions where no slug was specified in course.yaml
        for n, sessions in enumerate(self.sessions, start=1):
            if not sessions.slug:
                sessions.slug = str(n)
        # get course start/end date from sessions if not specified in course data
        if not self.data['start_date']:
            self.data['start_date'] = min(sessions.date for sessions in self.sessions)
        if not self.data['end_date']:
            self.data['end_date'] = min(sessions.date for sessions in self.sessions)

    id = DataProperty('id')
    start_date = DataProperty('start_date')
    end_date = DataProperty('end_date')

    def __repr__(self):
        return f'<{self.__class__.__name__} id={self.id!r}>'

    def get_session_by_slug(self, slug):
        assert isinstance(slug, str)
        for session in self.sessions:
            if session.slug == slug:
                return session
        raise Exception(f'Session with slug {slug!r} not found in {self}')

    def export(self, sessions=False, tasks=False):
        d = {
            **self.data,
            'start_date': self.data['start_date'].isoformat(),
            'end_date': self.data['end_date'].isoformat(),
        }
        if sessions:
            d['sessions'] = [lesson.export(tasks=tasks) for lesson in self.sessions]
        return d


class Session:

    def __init__(self, raw, dir_path, file_loader):
        self.data = {
            'slug': str(raw['slug']) if raw.get('slug') else None,
            'date': parse_date(raw['date']),
            'title_html': to_html(raw['title']),
        }
        self.material_items = [LessonItem(x) for x in raw.get('items', [])]
        self.task_items = []
        for raw_hw in raw.get('tasks', []):
            if raw_hw.get('file'):
                self.task_items.extend(load_tasks_file(
                    dir_path / raw_hw['file'],
                    session_slug=self.data['slug'],
                    file_loader=file_loader))

    slug = DataProperty('slug')
    date = DataProperty('date')

    def export(self, tasks=False):
        d = {
            **self.data,
            'date': self.data['date'].isoformat(),
            'material_items': [li.export() for li in self.material_items],
            'has_tasks': bool(self.task_items),
        }
        if tasks:
            d['task_items'] = [hi.export() for hi in self.task_items]
        return d


def load_tasks_file(file_path, session_slug, file_loader):
    try:
        raw = yaml_load(file_loader.read_text(file_path))
    except Exception as e:
        raise Exception(f'Failed to load tasks file {file_path}: {e}')
    task_items = []
    counter = count()
    for raw_item in raw['tasks']:
        if raw_item.get('section'):
            task_items.append(TaskSection(raw_item['section']))
        elif raw_item.get('markdown'):
            task_items.append(Task(raw_item, session_slug, next(counter)))
        else:
            raise Exception(f'Unknown item in tasks file {file_path}: {smart_repr(raw_item)}')
    return task_items


class LessonItem:

    def __init__(self, raw):
        if raw.get('lesson'):
            self.data = {
                'material_item_type': 'lesson',
                'title_html': to_html(raw['lesson']),
                'url': raw['url'],
            }
        elif raw.get('cheatsheet'):
            self.data = {
                'material_item_type': 'cheatsheet',
                'title_html': to_html(raw['cheatsheet']),
                'url': raw['url'],
            }
        elif raw.get('attachment'):
            self.data = {
                'material_item_type': 'attachment',
                'title_html': to_html(raw['attachment']),
                'url': raw['url'],
            }
        elif raw.get('text'):
            self.data = {
                'material_item_type': 'text',
                'text_html': to_html(raw['text']),
            }
        else:
            raise Exception(f'Unknown LessonItem data: {smart_repr(raw)}')

    def export(self):
        return self.data



class TaskSection:

    def __init__(self, raw_section):
        self.data = {
            'task_item_type': 'section',
            'text_html': to_html(raw_section),
        }

    def export(self):
        return self.data


class Task:

    def __init__(self, raw, session_slug, default_number):
        self.data = {
            'task_item_type': 'task',
            'id': str(raw.get('id') or f'{session_slug}-{default_number}'),
            'number': default_number,
            'text_html': to_html(raw),
            'mandatory': bool(raw.get('mandatory', False)),
            'submit': bool(raw.get('submit', True)),
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
    if not s:
        return None
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
