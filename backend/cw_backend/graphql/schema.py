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


logger = logging.getLogger(__name__)


# conversation_update_events = defaultdict(list) # { topic id: [Event] }


def get_model(info):
    return info.context['request'].app['model']


def resolve_node_type(obj, info):
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
        'id': GraphQLField(type=GraphQLNonNull(GraphQLID)),
    },
    resolve_type=resolve_node_type)


# ReplyPost = GraphQLObjectType(
#     name='ReplyPost',
#     interfaces=[NodeInterface],
#     fields=lambda: {
#         'id': GraphQLField(type=GraphQLNonNull(GraphQLID)),
#         'bodyMarkdown': GraphQLField(
#             type=GraphQLString,
#             resolver=lambda post, info: post.body_markdown),
#     })
#
#
# ReplyPostConnection = relay_connection_type(ReplyPost)
#
# @with_model
# async def post_replies_resolver(post, info, model, **kwargs):
#     replies = await model.list_post_replies(post.id)
#     return connection_from_list(replies, **kwargs)
#
#
# Post = GraphQLObjectType(
#     name='Post',
#     interfaces=[NodeInterface],
#     fields=lambda: {
#         'id': GraphQLField(type=GraphQLNonNull(GraphQLID)),
#         'bodyMarkdown': GraphQLField(
#             type=GraphQLString,
#             resolver=lambda post, info: post.body_markdown),
#         'replies': GraphQLField(
#             type=ReplyPostConnection,
#             args=connection_args,
#             resolver=post_replies_resolver),
#     })
#
#
# PostConnection = relay_connection_type(Post)
#
#
# @with_model
# async def conversation_posts_resolver(conversation, info, model, **kwargs):
#     logger.debug('conversation_posts_resolver(%r)', conversation)
#     posts = await model.list_conversation_posts(conversation_id=conversation.id)
#     return connection_from_list(posts, **kwargs)
#
#
# Conversation = GraphQLObjectType(
#     name='Conversation',
#     interfaces=[NodeInterface],
#     fields=lambda: {
#         'id': GraphQLField(type=GraphQLNonNull(GraphQLID)),
#         'posts': GraphQLField(
#             type=PostConnection,
#             args=connection_args,
#             resolver=conversation_posts_resolver),
#     })
#
#
# ConversationConnection = relay_connection_type(Conversation)
#
#
# @with_model
# async def topic_conversation_resolver(topic, info, model):
#     return await model.get_conversation(topic.conversation_id)
#
#
# @with_model
# async def topic_category_resolver(topic, info, model):
#     categories = await model.list_categories()
#     categories = [cat for cat in categories if topic.id in cat.topic_ids]
#     category, = categories
#     return category
#
#
# Topic = GraphQLObjectType(
#     name='Topic',
#     interfaces=[NodeInterface],
#     fields=lambda: {
#         'id': GraphQLField(type=GraphQLNonNull(GraphQLID)),
#         'title': GraphQLField(type=GraphQLString),
#         'conversation': GraphQLField(
#             type=Conversation,
#             resolver=topic_conversation_resolver),
#         'category': GraphQLField(
#             type=Category,
#             resolver=topic_category_resolver),
#     })
#
#
# TopicConnection = relay_connection_type(Topic)
#
#
# @with_model
# async def category_topics_resolver(category, info, model, **kwargs):
#     return connection_from_list(await gather(*(
#         model.get_topic(topic_id) for topic_id in category.topic_ids)),
#         **kwargs)
#
#
# Category = GraphQLObjectType(
#     name='Category',
#     interfaces=[NodeInterface],
#     fields={
#         'id': GraphQLField(type=GraphQLNonNull(GraphQLID)),
#         'title': GraphQLField(type=GraphQLString),
#         'topics': GraphQLField(
#             type=TopicConnection,
#             resolver=category_topics_resolver),
#     })
#
#
# CategoryConnection = relay_connection_type(Category)


async def node_resolver(root, info, id):
    model = get_model(info)
    raise Exception('NIY')
    #obj = await model.get_by_id(id)
    #logger.debug('node_resolver %r -> %r', id, obj)
    #return obj


# @with_model
# async def categories_resolver(root, info, model, **kwargs):
#     return connection_from_list(await model.list_categories(), **kwargs)
#
#
# async def handle_post_reply(info, **kwargs):
#     logger.info('handle_post_reply(%r, **%r)', info, kwargs)
#     model = info.context['request'].app['model']
#     reply_post = await model.create_reply_post(kwargs['postId'], kwargs['bodyMarkdown'])
#     for event in conversation_update_events[reply_post.conversation_id]:
#         logger.info('Notifying event %r for conversation %r', event, reply_post.conversation_id)
#         event.set()
#     return reply_post
#
#
# PostReplyMutation = mutation(
#     name='PostReply',
#     input_fields={
#         'postId': GraphQLInputObjectField(type=GraphQLNonNull(GraphQLID)),
#         'bodyMarkdown': GraphQLInputObjectField(type=GraphQLNonNull(GraphQLString)),
#     },
#     output_fields={
#         'newReplyPost': GraphQLField(type=ReplyPost),
#     },
#     mutate_and_get_payload=handle_post_reply)
#
#
# async def resolve_count_seconds(root, info):
#     from asyncio import sleep
#     for i in range(100):
#         yield i
#         await sleep(1)
#
#
# async def resolve_conversation_updated(root, info, *, conversationId):
#     try:
#         model = info.context['request'].app['model']
#         event = Event()
#         conversation_update_events[conversationId].append(event)
#         logger.info('Placed event %r for conversation %r', event, conversationId)
#         try:
#             while True:
#                 await event.wait()
#                 logger.info('Triggered event %r for conversation %r', event, conversationId)
#                 event.clear()
#                 conversation = await model.get_by_id(conversationId)
#                 logger.info('Yielding conversation %r', conversation)
#                 yield conversation
#         finally:
#             conversation_update_events[conversationId].remove(event)
#             logger.info('Removed event %r for conversation %r', event, conversationId)
#     except CancelledError:
#         logger.info('resolve_conversation_updated %r', e)
#         return
#     except Exception as e:
#         logger.exception('resolve_conversation_updated failed: %r', e)
#         raise e


Schema = GraphQLSchema(
    query=GraphQLObjectType(
        name='Query',
        fields={
            'node': GraphQLField(
                type=NodeInterface,
                args={
                    'id': GraphQLArgument(GraphQLNonNull(GraphQLID)),
                },
                resolver=node_resolver),
            # 'courses': GraphQLField(
            #     type=CourseConnection,
            #     args=connection_args,
            #     resolver=courses_resolver),
        }
    ),
    # mutation=GraphQLObjectType(
    #     name='Mutation',
    #     fields={
    #         'postReply': PostReplyMutation,
    #     }
    # ),
    # subscription=GraphQLObjectType(
    #     name='Subscription',
    #     fields={
    #         'countSeconds': GraphQLField(
    #             type=GraphQLInt,
    #             resolver=resolve_count_seconds),
    #         'conversationUpdated': GraphQLField(
    #             type=Conversation,
    #             args={
    #                 'conversationId': GraphQLArgument(GraphQLNonNull(GraphQLID)),
    #             },
    #             resolver=resolve_conversation_updated),
    #     }
    # )
)
