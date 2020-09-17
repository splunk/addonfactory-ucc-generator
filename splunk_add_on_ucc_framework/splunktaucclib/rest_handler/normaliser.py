"""Normalisers
"""

from __future__ import absolute_import

import sys
from builtins import object
__all__ = ['Normaliser', 'Boolean', 'StringLower', 'StringUpper']
basestring = str if sys.version_info[0] == 3 else basestring


class Normaliser(object):
    """Base class of Normaliser.
    """
    _name = None

    def __init__(self):
        pass

    def normalize(self, value):
        """Normalize a given value.

        :param value: value to normalize.
        :returns: normalized value.
        """
        raise NotImplementedError

    @property
    def name(self):
        """name of normaliser.
        """
        return self._name or self.__class__.__name__


class Userdefined(Normaliser):
    """A Normaliser that defined by user itself.

    The user-defined normaliser function should be in form:
    ``def fun(value, *args, **kwargs): ...``
    It will return the original data if any exception occurred.
    """
    def __init__(self, normaliser, *args, **kwargs):
        """
        :param values: The collection of valid values
        """
        super(Userdefined, self).__init__()
        self._normaliser, self._args, self._kwargs = normaliser, args, kwargs

    def normalize(self, value):
        try:
            return self._normaliser(value, *self._args, **self._kwargs)
        except:
            return value


class Boolean(Normaliser):
    """Normalize a boolean field.

    Normalize given value to boolean: ``0`` or ``1``.
    ``default`` means the return for unrecognizable input of boolean.
    """
    def __init__(self, default=True):
        super(Boolean, self).__init__()
        self._default = '1' if default else '0'

    def normalize(self, value):
        if isinstance(value, (bool, int)):
            return value and '1' or '0'
        if not isinstance(value, basestring):
            return self._default
        value = value.strip().lower()

        vals = {
            '1': {'true', 't', '1', 'yes', 'y'},
            '0': {'false', 'f', '0', 'no', 'n'}
        }
        revDef = {'1': '0', '0': '1'}[self._default]
        return revDef if value in vals[revDef] else self._default


class StringLower(Normaliser):
    """Normalize a string to all lower cases.
    """
    def normalize(self, value):
        if isinstance(value, basestring):
            return value.strip().lower()
        return value


class StringUpper(Normaliser):
    """Normalize a string to all upper cases.
    """
    def normalize(self, value):
        if isinstance(value, basestring):
            return value.strip().upper()
        return value
