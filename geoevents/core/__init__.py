# This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
# is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

from functools import wraps


def disable_for_loaddata(signal_handler):
    """
    Decorator that turns off signal handlers when loading fixture data.
    """

    @wraps(signal_handler)
    def wrapper(*args, **kwargs):
        if kwargs['raw']:
            return
        signal_handler(*args, **kwargs)

    return wrapper


def enable_on_object_creation(signal_handler):
    """
    Decorator that only runs signal handlers when an object has been created.
    """

    @wraps(signal_handler)
    def wrapper(*args, **kwargs):
        if not kwargs.get('created', False):
            return
        signal_handler(*args, **kwargs)

    return wrapper