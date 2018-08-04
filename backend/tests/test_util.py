from time import monotonic as monotime

from cw_backend.util import generate_random_id


def test_generate_random_id():
    assert generate_random_id()
    assert isinstance(generate_random_id(), str)


def test_generate_random_id_unique():
    t = monotime()
    ids = [generate_random_id() for i in range(1000)]
    assert len(set(ids)) == len(ids)
    assert monotime() - t < 0.1
