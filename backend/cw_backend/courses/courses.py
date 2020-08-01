'''
This module implements reading course data YAML files.

This is not async. Use thread executor for running with async code.
'''

from datetime import date
from functools import partial
import logging
from pathlib import Path
import requests
from reprlib import repr as smart_repr

from ..util import yaml_load

from .loaders import Loader, ReloadingContainer
from .helpers import DataProperty, parse_date, to_html
from .session import Session


logger = logging.getLogger(__name__)


def load_course(course_file):
    '''
    Load one course.yaml files.
    Returns Course object. Used in tests.
    '''
    return Course(course_file, loader=Loader())


def load_courses(courses_file):
    '''
    Load all files courses/*/course.yaml from a given directory.

    Returns Courses wrapped inside ReloadingContainer, so the actual
    courses can be retrieved like this: load_courses(courses_file).get()
    '''
    return ReloadingContainer(factory=partial(Courses, courses_file=courses_file))


class Courses:
    '''
    Top-level object for access to course data.
    '''

    def __init__(self, courses_file, loader):
        assert isinstance(courses_file, Path)
        self.courses = []
        raw = yaml_load(loader.read_text(courses_file))
        for c in raw['courses']:
            p = courses_file.parent / c['file']
            self.courses.append(Course(p, loader=loader))
        self.courses.sort(key=lambda c: c.start_date, reverse=True)

    def __iter__(self):
        return iter(self.courses)

    def __len__(self):
        return len(self.courses)

    def list_courses(self):
        return list(self.courses)

    def list_active(self):
        courses = [c for c in self.courses if c.is_active()]
        courses.sort(key=lambda c: c.start_date)
        return courses

    def list_past(self):
        courses = [c for c in self.courses if c.is_past()]
        courses.sort(key=lambda c: (c.end_date or c.start_date), reverse=True)
        return courses

    def get_by_id(self, course_id):
        raise Exception('Removed - use get_by_course_id()')

    def get_by_course_id(self, course_id):
        assert isinstance(course_id, str)
        for c in self.courses:
            if c.id == course_id:
                return c
        raise Exception(f'Course id {course_id!r} not found')


class Course:

    def __init__(self, course_file, loader):
        assert isinstance(course_file, Path)
        logger.debug('Loading course from %s', course_file)

        try:
            raw = yaml_load(loader.read_text(course_file))
        except Exception as e:
            raise Exception(f'Failed to load course file {course_file}: {e}')

        try:
            if raw.get('naucse_api_url'):
                nc = loader.get_json(raw['naucse_api_url'])['course']
            else:
                nc = {}

            course_dir = course_file.parent
            self.data = {
                'id': raw['id'],
                'title_html': to_html(raw.get('title') or nc.get('title')),
                'subtitle_html': to_html(raw.get('subtitle') or nc.get('subtitle')),
                'description_html': to_html(raw.get('description') or nc.get('description')),
                'start_date': parse_date(raw.get('start_date') or nc.get('start_date')),
                'end_date': parse_date(raw.get('end_date') or nc.get('end_date')),
            }

            local_sessions = {str(s['slug']): s for s in raw.get('sessions', [])}
            naucse_sessions = {
                # Only include sessions with a date
                str(s['slug']): s for s in nc.get('sessions', []) if 'date' in s
            }
            self.sessions = []
            for slug in local_sessions.keys() | naucse_sessions.keys():
                self.sessions.append(Session(
                    course_id=self.id,
                    slug=slug,
                    local_data=local_sessions.get(slug),
                    naucse_data=naucse_sessions.get(slug),
                    course_dir=course_dir,
                    tasks_by_lesson_slug=raw.get('tasks_by_lesson_slug') or {},
                    loader=loader))

            self.sessions.sort(key=lambda s: s.date)

            # get course start/end date from sessions if not specified in course data
            if not self.data['start_date'] and self.sessions:
                self.data['start_date'] = self.sessions[0].date
            if not self.data['end_date'] and self.sessions:
                self.data['end_date'] = self.sessions[-1].date
        except Exception as e:
            raise Exception(f'Failed to load course from {course_file}: {e}') from e

    id = DataProperty('id')
    start_date = DataProperty('start_date')
    end_date = DataProperty('end_date')
    title_html = DataProperty('title_html')
    subtitle_html = DataProperty('subtitle_html')
    description_html = DataProperty('description_html')

    def __repr__(self):
        return f'<{self.__class__.__name__} id={self.id!r}>'

    def is_active(self):
        return not self.is_past()

    def is_past(self):
        return self.data['end_date'] < date.today()

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
