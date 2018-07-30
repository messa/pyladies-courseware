from random import choice


def get_random_name():
    firstname = choice(sample_firstnames)
    lastname = choice(sample_lastnames)
    return f'{firstname} {lastname}'


sample_firstnames = '''
    Mary Patricia Linda Barbara Elizabeth Jennifer Maria Susan Margaret Dorothy Lisa
    James John Robert Michael William David Richard Charles Joseph Thomas Daniel Paul
'''.split()

sample_lastnames = '''
    Smith Johnson Williams Jones Brown Davis Miller Wilson Moore Taylor Anderson Jackson
    White Harris Martin Thompson Garcia Martinez Robinson Clark Rodriguez Lewis Lee Walker
'''.split()
