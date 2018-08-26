import logging

from .task_solutions import TaskSolutions
from .users import Users


logger = logging.getLogger(__name__)


class Model:

    def __init__(self, db, conf, generate_id=None):
        self.users = Users(db,
            dev_login_allowed=conf.allow_dev_login,
            generate_id=generate_id)
        self.task_solutions = TaskSolutions(db)

    async def create_indexes(self):
        await self.users.create_indexes()
        await self.task_solutions.create_indexes()
