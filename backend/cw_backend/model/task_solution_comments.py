from bson import ObjectId
from collections import defaultdict
from datetime import datetime
from logging import getLogger
from operator import itemgetter
from pymongo import ASCENDING as ASC
from pymongo import ReturnDocument

from ..util import smart_repr, to_oid, to_str


logger = getLogger(__name__)


class TaskSolutionComments:

    def __init__(self, db):
        self._c_comments = db['taskSolutions']['comments']

    async def create_indexes(self):
        await self._c_comments.create_index('task_solution_id')
        await self._c_comments.create_index('reply_to_comment_id')

    async def create(self, task_solution, reply_to_comment_id, author_user, body):
        assert isinstance(body, str)
        logger.info(
            'Creating comment - task solution: %s, reply_to_comment_id: %s, author user: %s, body: %s',
            task_solution, reply_to_comment_id, author_user, smart_repr(body))
        doc = {
            '_id': ObjectId(),
            'task_solution_id': to_oid(task_solution.id),
            'task_solution_version_id': to_oid(task_solution.current_version_id),
            'reply_to_comment_id': to_oid(reply_to_comment_id),
            'author_user': {
                'id': author_user.id,
                'name': author_user.name,
            },
            'body': body,
        }
        await self._c_comments.insert_one(doc)
        return self._build(doc)

    async def get_by_id(self, comment_id):
        doc = await self._c_comments.find_one({'_id': to_oid(comment_id)})
        return self._build(doc)

    async def find_by_task_solution_id(self, task_solution_id):
        q = {'task_solution_id': to_oid(task_solution_id)}
        all_docs = await self._c_comments.find(q).to_list(None)
        all_docs.sort(key=itemgetter('_id'))
        all_comments = [self._build(doc) for doc in all_docs]
        top_comments = [c for c in all_comments if not c.reply_to_comment_id]
        replies_by_comment_id = defaultdict(list)
        for c in all_comments:
            replies_by_comment_id[c.reply_to_comment_id].append(c)
        for c in top_comments:
            c.fill_replies(replies_by_comment_id)
        return top_comments

    def _build(self, doc):
        return TaskSolutionComment(doc)


class TaskSolutionComment:

    def __init__(self, doc, reply_docs=None):
        self.id = to_str(doc['_id'])
        self.date = doc['_id'].generation_time
        self.reply_to_comment_id = to_str(doc['reply_to_comment_id'])
        self.body = doc['body']
        self.author_user_id = doc['author_user']['id']
        self.author_name = doc['author_user']['name']
        self.replies = None

    def fill_replies(self, replies_by_comment_id):
        replies = []
        stack = [self.id]
        already_processed = set()
        while stack:
            c_id = stack.pop()
            assert c_id not in already_processed
            already_processed.add(c_id)
            for c in replies_by_comment_id[c_id]:
                replies.append(c)
                stack.append(c.id)
        self.replies = sorted(replies, key=lambda c: c.id)

    def export(self):
        data = {
            'id': self.id,
            'date': self.date.strftime('%Y-%m-%dT%H:%M:%SZ'),
            'body': self.body,
            'author': {
                'user_id': self.author_user_id,
                'name': self.author_name,
            },
            'reply_to_comment_id': self.reply_to_comment_id,
        }
        if self.replies is not None:
            data['replies'] = [c.export() for c in self.replies]
        return data
