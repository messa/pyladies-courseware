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
