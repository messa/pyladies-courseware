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

from .sessions import Session


logger = logging.getLogger(__name__)


async def session_resolver(course, info, slug):
    session, = [s for s in course.sessions if s.slug == slug]
    return session


Course = GraphQLObjectType(
    name='Course',
    interfaces=[NodeInterface],
    fields={
        'id': GraphQLField(
            type=GraphQLNonNull(GraphQLID),
            resolver=lambda c, _: f'Course:{c.id}'),
        'courseId': GraphQLField(
            type=GraphQLNonNull(GraphQLString),
            resolver=lambda c, _: c.id),
        'titleHTML': GraphQLField(
            type=GraphQLString,
            resolver=lambda c, _: c.title_html),
        'subtitleHTML': GraphQLField(
            type=GraphQLString,
            resolver=lambda c, _: c.subtitle_html),
        'descriptionHTML': GraphQLField(
            type=GraphQLString,
            resolver=lambda c, _: c.description_html),
        'startDate': GraphQLField(
            type=GraphQLString,
            resolver=lambda c, _: c.start_date.isoformat()),
        'endDate': GraphQLField(
            type=GraphQLString,
            resolver=lambda c, _: c.end_date.isoformat()),
        'sessions': GraphQLField(
            type=GraphQLList(Session)),
        'session': GraphQLField(
            type=Session,
            args={
                'slug': GraphQLArgument(GraphQLString),
            },
            resolver=session_resolver),

        #'topics': GraphQLField(
        #    type=TopicConnection,
        #    resolver=category_topics_resolver),
    })



CourseConnection = relay_connection_type(Course)


def get_courses(info):
    return info.context['request'].app['courses'].get()


async def all_courses_resolver(root, info, **kwargs):
    courses = get_courses(info)
    return connection_from_list(courses.list_courses(), **kwargs)


async def active_courses_resolver(root, info, **kwargs):
    courses = get_courses(info)
    return connection_from_list(courses.list_active(), **kwargs)


async def past_courses_resolver(root, info, **kwargs):
    courses = get_courses(info)
    return connection_from_list(courses.list_past(), **kwargs)


async def course_resolver(root, info, courseId):
    courses = get_courses(info)
    return courses.get_by_course_id(courseId)
