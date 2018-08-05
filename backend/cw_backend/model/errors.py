'''
Exception classes
'''


class ModelError (Exception):
    '''
    Base class for all model exceptions
    '''
    pass


class NotFoundError (ModelError):
    pass


class InvalidPasswordError (ModelError):
    pass


class RetryNeeded (ModelError):
    '''
    Operation should be retried
    '''
    pass
