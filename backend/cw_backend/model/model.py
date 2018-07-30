import logging

from .users import Users


logger = logging.getLogger(__name__)


class Model:

    def __init__(self, db, conf):
        self.users = Users(db, dev_login_allowed=conf.allow_dev_login)
