from bson import ObjectId
import logging
from operator import itemgetter
from pymongo import ASCENDING as ASC
from pymongo import ReturnDocument


logger = logging.getLogger(__name__)


class TaskSolutions:

    def __init__(self, db):
        self._c_solutions = db['taskSolutions']
        self._c_versions = self._c_solutions['versions']

    async def create_indexes(self):
        await self._c_solutions.create_index(
            [('course_id', ASC), ('task_id', ASC), ('user_id', ASC)], unique=True)

    async def create_revision(self, user, course_id, task_id, code):
        '''
        Create task solution, if does not exist yet, and insert new version.
        Returns TaskSolution.
        '''
        await self.create_indexes()
        solution_doc = await self._c_solutions.find_one_and_update(
            {
                'course_id': course_id,
                'task_id': task_id,
                'user_id': user.id,
            }, {
                '$setOnInsert': {
                    'current_version_id': None,
                    'conclusion': None,
                },
            }, upsert=True, return_document=ReturnDocument.AFTER)
        logger.debug('Task solution id: %s', solution_doc['_id'])
        r = await self._c_versions.insert_one({
            'task_solution_id': solution_doc['_id'],
            'code': code,
        })
        logger.debug('Task solution version id: %s', r.inserted_id)
        solution_doc = await self._c_solutions.find_one_and_update(
            {
                '_id': solution_doc['_id'],
            }, {
                '$set': {
                    'current_version_id': r.inserted_id,
                },
            }, return_document=ReturnDocument.AFTER)
        return self._build_solution(solution_doc)

    async def get_by_task_and_user(self, user, course_id, task_id):
        '''
        Returns TaskSolution.
        '''
        doc = await self._c_solutions.find_one({
            'course_id': course_id,
            'task_id': task_id,
            'user_id': user.id,
        })
        return self._build_solution(doc) if doc else None

    def _build_solution(self, doc):
        '''
        Helper for building the TaskSolution object from taskSolutions document.
        '''
        return TaskSolution(c_versions=self._c_versions, doc=doc)
        # TODO: abstrahovat pristup do DB do nejakeho store objektu?


class TaskSolution:

    def __init__(self, c_versions, doc):
        self._c_versions = c_versions
        self._doc = doc
        self.id = str(doc['_id'])
        self.date = doc['_id'].generation_time

    async def get_current_version(self):
        if not self._doc['current_version_id']:
            return None
        version_doc = await self._c_versions.find_one({'_id': self._doc['current_version_id']})
        return TaskSolutionVersion(version_doc)

    async def export(self, with_code=True):
        d = {
            'id': self.id,
            'date': self.date.strftime('%Y-%m-%dT%H:%M:%SZ'),
        }
        if with_code:
            cv = await self.get_current_version()
            d['current_version'] = cv.export() if cv else None
        return d


class TaskSolutionVersion:

    def __init__(self, doc):
        self.id = str(doc['_id'])
        self.date = doc['_id'].generation_time
        self.code = doc['code']

    def export(self):
        return {
            'id': self.id,
            'date': self.date.strftime('%Y-%m-%dT%H:%M:%SZ'),
            'code': self.code,
        }
