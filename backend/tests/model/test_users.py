from pprint import pprint
from pytest import mark


@mark.asyncio
async def test_create_dev_user_with_all_roles(db, model):
    user = await model.users.create_dev_user('John Smith')
    await model.users.add_user_attended_courses(
        user.id, ['course1', 'course2'])
    await model.users.add_user_coached_courses(
        user.id, ['course2', 'course3'])
    await model.users.set_user_admin(
        user.id, True)
    doc, = await db['users'].find().to_list(None)
    assert doc == {
        '_id': 'id_0',
        'attended_course_ids': ['course1', 'course2'],
        'coached_course_ids': ['course2', 'course3'],
        'dev_login': True,
        'is_admin': True,
        'name': 'John Smith',
    }


@mark.asyncio
async def test_oauth2_users_same_id_different_providers_isolation(db, model):
    user = await model.users.create_oauth2_user(
        'fb', 'a123', 'Joe Smith', 'joe@example.com')
    user = await model.users.create_oauth2_user(
        'google', 'a123', 'Joe Smith', 'joe@example.com')
    assert await db['users'].count_documents({}) == 2


@mark.asyncio
async def test_create_password_user(db, model):
    user = await model.users.create_password_user('joe@example.com', 'topsecret', 'Joe Smith')
    doc, = await db['users'].find().to_list(None)
    assert doc == {
        '_id': 'id_0',
        'email': 'joe@example.com',
        'login': 'joe@example.com',
        'name': 'Joe Smith',
        'password_bcrypt': doc['password_bcrypt'],
    }
