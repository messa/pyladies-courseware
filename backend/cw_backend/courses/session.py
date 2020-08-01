from itertools import count
import logging

from ..util import smart_repr, yaml_load

from .helpers import DataProperty, parse_date, to_html


logger = logging.getLogger(__name__)


class Session:

    def __init__(self, course_id, slug, local_data, naucse_data, course_dir, tasks_by_lesson_slug, loader):
        self._course_dir = course_dir
        self._loader = loader
        self.course_id = course_id
        self.slug = slug

        def get(key, default=None):
            for src in local_data, naucse_data:
                if src and key in src:
                    return src[key]
            return default

        self.date = parse_date(get('date'))
        self.title_html = to_html(get('title'))

        self.material_items = []

        if local_data and 'materials' in local_data:
            for m in local_data['materials']:
                self.material_items.append(MaterialItem(m))

        elif naucse_data:
            for m in naucse_data['materials']:
                if m['type'] == 'homework':
                    continue
                self.material_items.append(NaucseMaterialItem(m))

        self.task_items = []

        if local_data and local_data.get('tasks'):
            if not isinstance(local_data['tasks'], list):
                raise Exception(f"Must be a list: {local_data['tasks']!r}")
            for t in local_data['tasks']:
                self._load_tasks(t)

        if naucse_data and tasks_by_lesson_slug:
            for m in naucse_data.get('materials', []):
                if m.get('lesson_slug'):
                    if m['lesson_slug'] not in tasks_by_lesson_slug:
                        logger.info(
                            'Course %s: lesson slug %r not present in tasks_by_lesson_slug',
                            course_id, m['lesson_slug'])
                    else:
                        lesson_tasks = tasks_by_lesson_slug[m['lesson_slug']]
                        if not isinstance(lesson_tasks, list):
                            raise Exception(f'Must be a list: {lesson_tasks!r}')
                        for t in lesson_tasks:
                            self._load_tasks(t)
        self.task_items.sort(key=lambda item: not item.first)
        counter = count()
        for task in self.task_items:
            task.set_number(counter)

    def _load_tasks(self, task_data):
        if not isinstance(task_data, dict):
            raise Exception(f'Must be a dict: {task_data!r}')
        if task_data.get('file'):
            load_tasks_file(
                self.task_items,
                self._course_dir / task_data['file'],
                course_id=self.course_id,
                session_slug=self.slug,
                loader=self._loader)

    def export(self, tasks=False):
        d = {
            'slug': self.slug,
            'date': self.date.isoformat(),
            'title_html': self.title_html,
            'material_items': [mi.export() for mi in self.material_items],
            'has_tasks': bool(self.task_items),
        }
        if tasks:
            d['task_items'] = [ti.export() for ti in self.task_items]
        return d


def load_tasks_file(task_items, file_path, course_id, session_slug, loader):
    try:
        raw = yaml_load(loader.read_text(file_path))
    except Exception as e:
        raise Exception(f'Failed to load tasks file {file_path}: {e}')
    for raw_item in raw['tasks']:
        if raw_item.get('section'):
            task_items.append(TaskSection(raw_item))
        elif raw_item.get('markdown'):
            task_items.append(Task(raw_item, course_id, session_slug))
        else:
            raise Exception(f'Unknown item in tasks file {file_path}: {smart_repr(raw_item)}')


class MaterialItem:

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
            raise Exception(f'Unknown MaterialItem data: {smart_repr(raw)}')

    material_item_type = DataProperty('material_item_type')
    title_html = DataProperty('title_html')
    text_html = DataProperty('text_html')
    url = DataProperty('url')

    def export(self):
        return self.data


class NaucseMaterialItem:

    def __init__(self, naucse_data):
        try:
            if naucse_data['type'] == 'special':
                if naucse_data.get('url'):
                    item_type = 'attachment'
                else:
                    item_type = 'text'
            elif naucse_data['type'] in ['link', 'none-link']:
                item_type = 'attachment'
                assert naucse_data['url']
            elif naucse_data['type'] in ['lesson', 'cheatsheet']:
                if naucse_data.get('url'):
                    item_type = naucse_data['type']
                else:
                    item_type = 'text'
            else:
                raise Exception(f"Unknown naucse material type {naucse_data['type']!r}")
            self.data = {
                'material_item_type': item_type,
                'title_html': to_html(naucse_data['title']),
                'url': hotfix_naucse_url(naucse_data.get('url')),
            }
        except Exception as e:
            raise Exception(f'Failed to process naucse material {naucse_data!r}: {e!r}')

    material_item_type = DataProperty('material_item_type')
    title_html = DataProperty('title_html')
    text_html = DataProperty('text_html')
    url = DataProperty('url')

    def export(self):
        return self.data


def hotfix_naucse_url(url):
    if not url:
        return None
    if url.startswith('/'):
        return 'https://naucse.python.cz' + url
    assert url.startswith('https://') or url.startswith('http://')
    return url


class TaskSection:

    def __init__(self, raw_item):
        self.data = {
            'task_item_type': 'section',
            'text_html': to_html(raw_item['section']),
            'top': bool(raw_item.get('top', False)),
        }

    task_item_type = DataProperty('task_item_type')
    text_html = DataProperty('text_html')
    id = None
    submit = None

    def export(self):
        return self.data

    @property
    def first(self):
        return self.data['top']

    def set_number(self, counter):
        pass


class Task:

    def __init__(self, raw, course_id, session_slug):
        self.id = raw.get('id')
        self.course_id = course_id
        self.session_slug = session_slug
        self.data = {
            'task_item_type': 'task',
            'id': None,
            'number': None,
            'text_html': to_html(raw),
            'mandatory': bool(raw.get('mandatory', False)),
            'submit': bool(raw.get('submit', True)),
            'numbered': bool(raw.get('numbered', True)),
            'top': bool(raw.get('top', False)),
        }

    task_item_type = DataProperty('task_item_type')
    text_html = DataProperty('text_html')
    mandatory = DataProperty('mandatory')
    submit = DataProperty('submit')
    number = DataProperty('number')

    def export(self):
        return self.data

    @property
    def first(self):
        return self.data['top']

    def set_number(self, counter):
        if self.data['numbered']:
            number = next(counter)
            self.data['number'] = number
            self.data['id'] = str(self.id or f'{self.session_slug}-{number}')
