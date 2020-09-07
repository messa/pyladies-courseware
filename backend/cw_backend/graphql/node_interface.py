import logging


from graphql import (
    GraphQLInterfaceType,
    GraphQLField,
    GraphQLNonNull,
    GraphQLID,
)

logger = logging.getLogger(__name__)


async def node_resolver(root, info, id):
    '''
    Return object by id
    '''
    #model = get_model(info)
    raise Exception('NIY')
    #obj = await model.get_by_id(id)
    #logger.debug('node_resolver %r -> %r', id, obj)
    #return obj


def resolve_node_type(obj, info):
    '''
    Return GraphQL type of given object.
    Usually called from objects returned from node_resolver().
    '''
    # See also: https://stackoverflow.com/q/34726666/196206
    # if obj.node_type == 'Post':
    #     return Post
    # if obj.node_type == 'Category':
    #     return Category
    # if obj.node_type == 'Topic':
    #     return Topic
    # if obj.node_type == 'Conversation':
    #     return Conversation
    raise Exception(f'Unknown node type: {obj!r}')


NodeInterface = GraphQLInterfaceType(
    name='Node',
    fields={
        'id': GraphQLField(GraphQLNonNull(GraphQLID)),
    },
    resolve_type=resolve_node_type)
