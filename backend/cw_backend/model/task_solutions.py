from bson import ObjectId
from datetime import datetime
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
        await self._c_solutions.create_index([
            ('course_id', ASC),
            ('task_id', ASC),
            ('user_id', ASC)
        ], unique=True)
        await self._c_versions.create_index('task_solution_id')

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
                    'marked_as_solved': None,
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

    async def get_by_id(self, task_solution_id):
        doc = await self._c_solutions.find_one({'_id': ObjectId(task_solution_id)})
        return self._build_solution(doc)

    async def get_by_task_and_user_id(self, user_id, course_id, task_id):
        '''
        Returns TaskSolution.
        '''
        doc = await self._c_solutions.find_one({
            'course_id': course_id,
            'task_id': task_id,
            'user_id': user_id,
        })
        return self._build_solution(doc) if doc else None

    async def find_by_course_and_task_ids(self, course_id, task_ids):
        q = {
            'course_id': course_id,
            'task_id': {'$in': list(task_ids)}
        }
        docs = await self._c_solutions.find(q).to_list(None)
        return [self._build_solution(doc) for doc in docs]

    async def find_by_user_and_course_and_task_ids(self, user, course_id, task_ids):
        q = {
            'user_id': user.id,
            'course_id': course_id,
            'task_id': {'$in': list(task_ids)}
        }
        docs = await self._c_solutions.find(q).to_list(None)
        return [self._build_solution(doc) for doc in docs]

    async def find_by_course_id(self, course_id):
        q = {
            'course_id': course_id,
        }
        docs = await self._c_solutions.find(q).to_list(None)
        return [self._build_solution(doc) for doc in docs]

    def _build_solution(self, doc):
        '''
        Helper for building the TaskSolution object from taskSolutions document.
        '''
        return TaskSolution(doc=doc, c_solutions=self._c_solutions, c_versions=self._c_versions)
        # TODO: abstrahovat pristup do DB do nejakeho store objektu?


class TaskSolution:

    def __init__(self, doc, c_solutions, c_versions):
        self._c_solutions = c_solutions
        self._c_versions = c_versions
        self._doc = doc
        self.id = str(doc['_id'])
        self.date = doc['_id'].generation_time
        self._load_doc(doc)

    def _load_doc(self, doc):
        # TODO: předělat na view objekt
        assert doc['_id'] == ObjectId(self.id)
        self._doc = doc
        self.course_id = doc['course_id']
        self.task_id = doc['task_id']
        self.user_id = doc['user_id']
        self.is_solved = None
        self.current_version_id = str(doc['current_version_id']) if doc.get('current_version_id') else None
        if doc.get('marked_as_solved'):
            self.is_solved = doc['marked_as_solved']['solved']
        self.last_action = None
        if doc.get('last_action'):
            self.last_action = doc['last_action']['role']

    async def set_marked_as_solved(self, solved, author_user):
        assert solved in [True, False]
        doc = await self._c_solutions.find_one_and_update(
            {
                '_id': ObjectId(self.id),
            }, {
                '$set': {
                    'marked_as_solved': {
                        'solved': solved,
                        'date': datetime.utcnow(),
                        'by_user': {
                            'id': author_user.id,
                            'name': author_user.name,
                        },
                    },
                }
            }, return_document=ReturnDocument.AFTER)
        logger.info(
            'Task solution %s marked_as_solved: %r -> %r',
            self.id, self._doc.get('marked_as_solved'), doc['marked_as_solved'])
        self._load_doc(doc)

    async def set_last_action(self, role, author_user):
        role = role.lower()
        assert role in ['coach', 'student']
        doc = await self._c_solutions.find_one_and_update(
            {
                '_id': ObjectId(self.id),
            }, {
                '$set': {
                    'last_action': {
                        'role': role,
                        'date': datetime.utcnow(),
                        'by_user': {
                            'id': author_user.id,
                            'name': author_user.name,
                        },
                    },
                }
            }, return_document=ReturnDocument.AFTER)
        logger.info(
            'Task solution %s last_action: %r -> %r',
            self.id, self._doc.get('last_action'), doc['last_action'])
        self._load_doc(doc)

    async def get_current_version(self):
        if not self._doc['current_version_id']:
            return None
        version_doc = await self._c_versions.find_one({'_id': self._doc['current_version_id']})
        return TaskSolutionVersion(version_doc)

    async def get_all_versions(self):
        if not self._doc['current_version_id']:
            return []
        version_docs = await self._c_versions.find({'task_solution_id': self._doc['_id']}).to_list(None)
        return [TaskSolutionVersion(doc) for doc in version_docs]

    async def export(self, with_code=True):
        d = {
            'id': self.id,
            'date': self.date.strftime('%Y-%m-%dT%H:%M:%SZ'),
            'course_id': self.course_id,
            'task_id': self.task_id,
            'user_id': self.user_id,
            'is_solved': self.is_solved,
            'last_action': self.last_action,
        }
        if with_code:
            cv = await self.get_current_version()
            avs = await self.get_all_versions()
            d['current_version'] = cv.export() if cv else None
            d['all_versions'] = [v.export() for v in avs]
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
