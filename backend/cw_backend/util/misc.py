from secrets import token_urlsafe


def generate_random_id():
    try_count = 0
    while True:
        try_count += 1
        assert try_count < 100
        s = token_urlsafe(9)
        if s.isalnum():
            return s
