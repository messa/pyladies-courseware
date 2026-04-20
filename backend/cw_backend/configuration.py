import logging
import os
from pathlib import Path
from typing import Optional

import pymongo
from yaml import safe_load as yaml_load


logger = logging.getLogger(__name__)

here = Path(__file__).resolve().parent


class Configuration:

    def __init__(self):
        if os.environ.get('CW_CONF'):
            cfg_path = Path(os.environ['CW_CONF']).resolve()
            cfg_dir = cfg_path.parent
            try:
                cfg = yaml_load(cfg_path.read_text())
            except Exception as e:
                raise Exception(f'Failed to read configuration file {cfg_path}: {e!r}') from None
        else:
            cfg = {}
        if os.environ.get('COURSES_FILE'):
            self.courses_file = Path(os.environ['COURSES_FILE'])
        elif cfg.get('courses_file'):
            self.courses_file = cfg_dir / cfg['courses_file']
        else:
            self.courses_file = here.parent.parent / 'data/courses.yaml'
        self.fb_oauth2 = OAuth2('fb', cfg)
        self.google_oauth2 = OAuth2('google', cfg)
        self.allow_dev_login = bool(os.environ.get('ALLOW_DEV_LOGIN'))
        self.slack = Slack.from_cfg(cfg)
        self.mongodb = MongoDB(cfg)


class OAuth2:

    def __init__(self, name, cfg):
        cfg_section = cfg.get(name) or {}
        get = lambda key: os.environ.get(f'{name}_OAUTH2_{key}'.upper()) or cfg_section.get(key)
        self.client_id = get('client_id')
        self.client_secret = get('client_secret')
        self.callback_url = get('callback_url')
        if not self.client_id:
            logger.debug('%s client_id not configured', name)

    def __bool__(self):
        return bool(self.client_id and self.client_secret and self.callback_url)


class MongoDB:

    def __init__(self, cfg):
        cfg_section = cfg.get('mongodb') or {}
        self.connection_uri = os.environ.get('MONGODB_URI') \
                              or cfg_section.get('uri') \
                              or 'mongodb://127.0.0.1:27017'
        self.db_name = os.environ.get('MONGODB_DB_NAME') \
                       or cfg_section.get('db_name') \
                       or db_name_from_uri(self.connection_uri) \
                       or 'courseware_dev'


class Slack:

    @staticmethod
    def from_cfg(cfg) -> Optional["Slack"]:
        user_auth = cfg.get('slack_user_token')
        bot_auth = cfg.get('slack_bot_token')
        web_url = cfg.get('slack_web_url')
        if user_auth is None or bot_auth is None or web_url is None:
            return None
        return Slack(user_auth, bot_auth, web_url)

    def __init__(self, user_auth: str, bot_auth: str, web_url: str):
        self.user_auth = user_auth
        self.bot_auth = bot_auth
        self.web_url = web_url


def db_name_from_uri(mongo_uri):
    return pymongo.uri_parser.parse_uri(mongo_uri)['database']
