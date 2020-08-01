from aiohttp_session import get_session
import logging

from graphql import (
    graphql,
    GraphQLSchema,
    GraphQLInterfaceType,
    GraphQLObjectType,
    GraphQLField,
    #GraphQLInputObjectField,
    GraphQLArgument,
    GraphQLNonNull,
    GraphQLString,
    GraphQLInt,
    GraphQLList,
    GraphQLID,
    GraphQLBoolean,
)

from .relay_helpers import (
    connection_args,
    connection_from_list,
    relay_connection_type,
    mutation,
)

from .node_interface import NodeInterface


logger = logging.getLogger(__name__)


TaskSolution = GraphQLObjectType(
    name='TaskSolution',
    fields={
        'taskSolutionId': GraphQLField(
            GraphQLString,
            resolve=lambda ts, _: ts.id),
        'courseId': GraphQLField(
            GraphQLString,
            resolve=lambda ts, _: ts.course_id),
        'taskId': GraphQLField(
            GraphQLString,
            resolve=lambda ts, _: ts.task_id),
        'userId': GraphQLField(
            GraphQLString,
            resolve=lambda ts, _: ts.user_id),
        'isSolved': GraphQLField(
            GraphQLBoolean,
            resolve=lambda ts, _: ts.is_solved),
        'lastAction': GraphQLField(
            GraphQLString,
            resolve=lambda ts, _: ts.last_action),
    })


MaterialItem = GraphQLObjectType(
    name='MaterialItem',
    fields={
        'materialItemType': GraphQLField(
            GraphQLString,
            resolve=lambda mi, _: mi.material_item_type),
        'titleHTML': GraphQLField(
            GraphQLString,
            resolve=lambda mi, _: mi.title_html),
        'textHTML': GraphQLField(
            GraphQLString,
            resolve=lambda mi, _: mi.text_html),
        'url': GraphQLField(GraphQLString),
    })


async def get_task_my_solution(task_item, info):
    if not task_item.submit:
        return None
    model = info.context['request'].app['model']
    session = await get_session(info.context['request'])
    if not session.get('user'):
        raise None
    solution = await model.task_solutions.get_by_task_and_user_id(
        user_id=session['user']['id'],
        course_id=task_item.course_id,
        task_id=task_item.id)
    return solution


TaskItem = GraphQLObjectType(
    name='TaskItem',
    fields={
        'taskItemType': GraphQLField(
            GraphQLString,
            resolve=lambda ti, _: ti.task_item_type),
        'taskItemId': GraphQLField(
            GraphQLString,
            resolve=lambda ti, _: ti.id),
        'textHTML': GraphQLField(
            GraphQLString,
            resolve=lambda ti, _: ti.text_html),
        'number': GraphQLField(GraphQLInt),
        'mandatory': GraphQLField(GraphQLBoolean),
        'submit': GraphQLField(GraphQLBoolean),
        'mySolution': GraphQLField(
            TaskSolution,
            resolve=get_task_my_solution),
    })


Session = GraphQLObjectType(
    name='Session',
    interfaces=[NodeInterface],
    fields={
        'id': GraphQLField(
            GraphQLNonNull(GraphQLID),
            resolve=lambda s, _: f'Session:{s.course_id}:{s.slug}'),
        'slug': GraphQLField(
            GraphQLString),
        'date': GraphQLField(
            GraphQLString),
        'titleHTML': GraphQLField(
            GraphQLString,
            resolve=lambda s, _: s.title_html),
        'hasTasks': GraphQLField(
            GraphQLBoolean,
            resolve=lambda s, _: bool(s.task_items)),
        'materialItems': GraphQLField(
            GraphQLList(MaterialItem),
            resolve=lambda s, _: s.material_items),
        'taskItems': GraphQLField(
            GraphQLList(TaskItem),
            resolve=lambda s, _: s.task_items),

    })
