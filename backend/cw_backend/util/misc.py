from bson import ObjectId
from secrets import token_urlsafe
from reprlib import repr as smart_repr


def generate_random_id():
    try_count = 0
    while True:
        try_count += 1
        assert try_count < 100
        s = token_urlsafe(9)
        if s.isalnum():
            return s


def to_oid(v):
    if not v:
        return None
    if isinstance(v, ObjectId):
        return v
    if isinstance(v, str):
        try:
            return ObjectId(v)
        except Exception as e:
            raise Exception(f'Cannot convert to ObjectId: {smart_repr(v)}')
    raise Exception(f'Must be str or ObjectId: {smart_repr(v)}')


def to_str(v):
    if v is None:
        return None
    if isinstance(v, ObjectId):
        return str(v)
    if not isinstance(v, str):
        raise Exception(f'Could not conver to str: {smart_repr(v)}')
    return v
