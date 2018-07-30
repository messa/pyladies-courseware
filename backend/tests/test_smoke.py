from pytest import mark


def test_import():
    import cw_backend


@mark.asyncio
async def test_mongo_insert_and_find(db):
    docs = await db['foo'].find().to_list(None)
    assert docs == []
    await db['foo'].insert_one({'_id': 11})
    docs = await db['foo'].find().to_list(None)
    assert docs == [{'_id': 11}]


@mark.asyncio
async def test_mongo_is_cleaned_up_before_another_test(db):
    docs = await db['foo'].find().to_list(None)
    assert docs == []
