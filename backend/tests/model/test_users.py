from pprint import pprint
from pytest import mark, raises

from cw_backend.model.errors import ModelError, NotFoundError, InvalidPasswordError


@mark.asyncio
async def test_create_dev_user_with_all_roles(db, model):
    user = await model.users.create_dev_user('John Smith')
    await user.add_attended_courses(['course1', 'course2'], author_user_id=None)
    await user.add_coached_courses(['course2', 'course3'], author_user_id=None)
    await user.set_admin(True, author_user_id=None)
    assert user.id == 'id_0'
    assert user.name == 'John Smith'
    assert user.attended_course_ids == ['course1', 'course2']
    assert user.coached_course_ids == ['course2', 'course3']
    assert user.is_admin == True
    doc, = await db['users'].find().to_list(None)
    assert doc == {
        '_id': 'id_0',
        'v': 3,
        'attended_course_ids': ['course1', 'course2'],
        'coached_course_ids': ['course2', 'course3'],
        'dev_login': True,
        'is_admin': True,
        'name': 'John Smith',
    }
    docs = await db['users.changelog'].find(sort=[('_id', 1)]).to_list(None)
    assert docs == [
        {
            '_id': docs[0]['_id'],
            'author_user_id': None,
            'changes': {
                'attended_course_ids': {
                    'new_value': ['course1', 'course2'],
                    'old_value': None
                }
            }
        }, {
            '_id': docs[1]['_id'],
            'author_user_id': None,
            'changes': {
                'coached_course_ids': {
                    'new_value': ['course2', 'course3'],
                    'old_value': None
                }
            }
        }, {
            '_id': docs[2]['_id'],
            'author_user_id': None,
            'changes': {
                'is_admin': {
                    'new_value': True,
                    'old_value': None
                }
            }
        }
    ]


@mark.asyncio
async def test_oauth2_users_same_id_different_providers_isolation(db, model):
    user = await model.users.create_oauth2_user(
        'fb', 'a123', 'Joe Smith', 'joe@example.com')
    user = await model.users.create_oauth2_user(
        'google', 'a123', 'Joe Smith', 'joe@example.com')
    assert await db['users'].count_documents({}) == 2


@mark.asyncio
async def test_create_password_user_and_login(db, model):
    user = await model.users.create_password_user('joe@example.com', 'topsecret', 'Joe Smith')
    doc, = await db['users'].find().to_list(None)
    assert doc == {
        '_id': 'id_0',
        'v': 0,
        'email': 'joe@example.com',
        'login': 'joe@example.com',
        'name': 'Joe Smith',
        'password_hash': doc['password_hash'],
    }

    with raises(ModelError):
        await model.users.create_password_user('joe@example.com', 'test', 'Joe')

    assert await model.users.login_password_user('joe@example.com', 'topsecret')

    with raises(InvalidPasswordError):
        assert await model.users.login_password_user('joe@example.com', 'wrong')

    with raises(NotFoundError):
        assert await model.users.login_password_user('missing@example.com', 'test')
