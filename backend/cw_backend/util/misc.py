from secrets import token_urlsafe


def generate_random_id():
    while True:
        s = token_urlsafe(9)
        if s.isalnum():
            return s
            
