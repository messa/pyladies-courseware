import logging
from pathlib import Path
import requests
from time import monotonic


logger = logging.getLogger(__name__)


class ReloadingContainer:

    def __init__(self, factory):
        self._factory = factory
        self._load()

    def _load(self):
        self._loader = Loader()
        self._obj = self._factory(loader=self._loader)

    def get(self):
        if self._loader.dirty():
            self._load()
        return self._obj


class Loader:

    def __init__(self):
        self._file_loader = FileLoader()
        self._api_loader = APILoader()

    def dirty(self):
        return self._file_loader.dirty() or self._api_loader.dirty()

    def read_text(self, path):
        return self._file_loader.read_text(path)

    def get_json(self, url):
        return self._api_loader.get_json(url)


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


class APILoader:

    def __init__(self):
        self._rs = requests.session()

    def dirty(self):
        # TODO: perform HEAD requests and check Etag (or something similar)
        return False

    def get_json(self, url):
        logger.debug('get_json %s', url)
        r = self._rs.get(url)
        r.raise_for_status()
        return r.json()
