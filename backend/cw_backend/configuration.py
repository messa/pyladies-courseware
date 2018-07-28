import os
from pathlib import Path

here = Path(__file__).resolve().parent


class Configuration:

    def __init__(self):
        self.data_dir = Path(os.environ.get('DATA_DIR') or here.parent.parent)
