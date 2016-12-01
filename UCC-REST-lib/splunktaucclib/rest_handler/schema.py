"""
REST Schema
"""

from __future__ import absolute_import

__all__ = [
    'RestSchemaError',
    'RestSchema',
]


class RestSchemaError(Exception):
    pass


class RestSchema(object):
    """
    REST Scheme.
    """

    def __init__(self, *args, **kwargs):
        pass

    @staticmethod
    def endpoint_name(name, namespace):
        return '{}_{}'.format(namespace, name)

    @property
    def product(self):
        raise NotImplementedError()

    @property
    def namespace(self):
        raise NotImplementedError()

    @property
    def version(self):
        raise NotImplementedError()
