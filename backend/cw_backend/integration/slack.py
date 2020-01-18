import logging
import traceback

import aiohttp

logger = logging.getLogger(__name__)

SLACK_URL_BASE = 'https://slack.com/api/'


class Slackbot:
    def __init__(self, user_token, bot_token, web_url):
        self.user_token = user_token
        self.bot_token = bot_token
        self.user_email_to_id = {}
        self.session = aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=10))
        self.web_url = web_url if web_url.endswith('/') else f'{web_url}/'

    async def handle_event(self, event):
        try:
            type = event.get('type')
            data = event.get('data')

            if type == 'task-solution-update':
                await self.notify_task_update(data['user'], data['initiator'],
                                              data['solved'], data['course'],
                                              data['solution'].task_id)
            elif type == 'task-solution-comment':
                if data['user'].id != data['initiator'].id:
                    await self.notify_task_comment(data['user'], data['initiator'],
                                                   data['comment'], data['course'],
                                                   data['solution'].task_id)
        except:
            # exception boundary, exceptions raised here should not kill the request
            logger.warning(f'Slack event handling error: {traceback.format_exc()}')

    async def notify_task_update(self, user, initiator, solved, course, task_id):
        ctx = await self.get_context(user.email, course, task_id)
        if not ctx:
            return
        user_id, session = ctx

        status = 'vyřešený! :tada:' if solved else 'nevyřešený! :thinking_face:'
        link = self.get_task_link(course, session, task_id)
        task_name = f'{session.slug}/{task_id}'
        initiator_name = await self.format_initiator(initiator)
        message = f'{initiator_name} označil/a tvůj úkol <{link}|{task_name}> jako {status}'
        await self.send_user_message(user_id, message)

    async def notify_task_comment(self, user, initiator, comment, course, task_id):
        ctx = await self.get_context(user.email, course, task_id)
        if not ctx:
            return
        user_id, session = ctx

        task_name = f'{session.slug}/{task_id}'
        link = self.get_task_link(course, session, task_id)
        initiator_name = await self.format_initiator(initiator)
        message = f'{initiator_name} přidal komentář k tvému úkolu <{link}|{task_name}>: {comment}'
        await self.send_user_message(user_id, message)

    def get_task_link(self, course, session, task_id):
        return f'{self.web_url}session?course={course.id}&session={session.slug}#task-{task_id}'

    async def format_initiator(self, initiator):
        user_id = await self.resolve_user(initiator.email)
        if user_id:
            return f'<@{user_id}>'
        return initiator.name

    async def get_context(self, email, course, task_id):
        if not email:
            return None

        user_id = await self.resolve_user(email)
        if not user_id:
            return None

        session = course.get_session_by_task_id(task_id)
        if not session:
            return None

        return (user_id, session)

    async def send_user_message(self, user_id, message):
        return await self.bot_req('POST', 'chat.postMessage', json={
            'channel': user_id,
            'text': message
        })

    async def resolve_user(self, email):
        if email not in self.user_email_to_id:
            self.user_email_to_id[email] = await self.fetch_user_id(email)

        return self.user_email_to_id.get(email)

    async def fetch_user_id(self, email):
        async with await self.user_req('GET', 'users.lookupByEmail', params={
            'email': email
        }) as req:
            if req.status == 200:
                data = await req.json()
                return data['user']['id']
        return None

    async def user_req(self, method, url, params=None, json=None):
        return await self.slack_req(method, url, params, json, self.user_token)

    async def bot_req(self, method, url, params=None, json=None):
        return await self.slack_req(method, url, params, json, self.bot_token)

    async def slack_req(self, method, url, params, json, token):
        url = f'{SLACK_URL_BASE}{url}'
        return await self.session.request(method, url, params=params, json=json, headers={
            'Authorization': f'Bearer {token}',
            'Content-type': 'application/json; charset=utf-8'
        })
