from bson import ObjectId
import logging
from operator import itemgetter


logger = logging.getLogger(__name__)


class TaskSolutions:

    def __init__(self, db):
        self.c_solutions = db['taskSolutions']

    async def create(self, user, course_id, lesson_slug, task_id, code):
        doc = {
            '_id': ObjectId(),
            'user_id': user.id,
            'course_id': course_id,
            'lesson_slug': lesson_slug,
            'task_id': task_id,
            'code': code,
        }
        await self.c_solutions.insert_one(doc)
        return self._solution(doc)

    async def list_for_user_task(self, user, course_id, lesson_slug, task_id):
        q = {
            'user_id': user.id,
            'course_id': course_id,
            'lesson_slug': lesson_slug,
            'task_id': task_id,
        }
        docs = await self.c_solutions.find(q).to_list(None)
        docs.sort(key=itemgetter('_id'))
        return [self._solution(doc) for doc in docs]

    def _solution(self, doc):
        return TaskSolution(doc)


class TaskSolution:

    def __init__(self, doc):
        self.id = str(doc['_id'])
        self.code = doc['code']
