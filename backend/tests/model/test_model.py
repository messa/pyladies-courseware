from pytest import mark


@mark.asyncio
async def test_create_indexes(model):
    await model.create_indexes()
