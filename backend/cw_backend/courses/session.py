from itertools import count

from ..util import yaml_load

from .helpers import DataProperty, parse_date, to_html


class Session:

    def __init__(self, slug, local_data, naucse_data, course_dir, loader):

        def get(key, default=None):
            for src in local_data, naucse_data:
                if src and key in src:
                    return src[key]
            return default

        self.data = {
            'slug': slug,
            'date': parse_date(get('date')),
            'title_html': to_html(get('title')),
        }

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
        if local_data and local_data.get('tasks', []):
            for task_data in local_data['tasks']:
                if task_data.get('file'):
                    self.task_items.extend(load_tasks_file(
                        course_dir / task_data['file'],
                        session_slug=self.data['slug'],
                        loader=loader))

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


def load_tasks_file(file_path, session_slug, loader):
    try:
        raw = yaml_load(loader.read_text(file_path))
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
