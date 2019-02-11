import logging

from graphql import (
    graphql,
    GraphQLSchema,
    GraphQLInterfaceType,
    GraphQLObjectType,
    GraphQLField,
    GraphQLInputObjectField,
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


MaterialItem = GraphQLObjectType(
    name='MaterialItem',
    fields={
        'materialItemType': GraphQLField(
            type=GraphQLString,
            resolver=lambda mi, _: mi.material_item_type),
        'titleHTML': GraphQLField(
            type=GraphQLString,
            resolver=lambda mi, _: mi.title_html),
        'textHTML': GraphQLField(
            type=GraphQLString,
            resolver=lambda mi, _: mi.text_html),
        'url': GraphQLField(type=GraphQLString),
    })


TaskItem = GraphQLObjectType(
    name='TaskItem',
    fields={
        'taskItemType': GraphQLField(
            type=GraphQLString,
            resolver=lambda ti, _: ti.task_item_type),
        'taskId': GraphQLField(
            type=GraphQLString,
            resolver=lambda ti, _: ti.id),
        'textHTML': GraphQLField(
            type=GraphQLString,
            resolver=lambda ti, _: ti.text_html),
        'number': GraphQLField(type=GraphQLInt),
        'mandatory': GraphQLField(type=GraphQLBoolean),
        'submit': GraphQLField(type=GraphQLBoolean),
    })


Session = GraphQLObjectType(
    name='Session',
    interfaces=[NodeInterface],
    fields={
        'id': GraphQLField(
            type=GraphQLNonNull(GraphQLID),
            resolver=lambda s, _: f'Session:{s.course_id}:{s.slug}'),
        'slug': GraphQLField(
            type=GraphQLString),
        'date': GraphQLField(
            type=GraphQLString),
        'titleHTML': GraphQLField(
            type=GraphQLString,
            resolver=lambda s, _: s.title_html),
        'hasTasks': GraphQLField(
            type=GraphQLBoolean,
            resolver=lambda s, _: bool(s.task_items)),
        'materialItems': GraphQLField(
            type=GraphQLList(MaterialItem),
            resolver=lambda s, _: s.material_items),
        'taskItems': GraphQLField(
            type=GraphQLList(TaskItem),
            resolver=lambda s, _: s.task_items),

    })
