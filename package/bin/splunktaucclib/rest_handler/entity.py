
from __future__ import absolute_import

from .eai import RestEAI

__all__ = ['RestEntity']


class RestEntity(object):

    def __init__(self, name, data, real_model, acl=None):
        self.name = name
        self.data = data
        self.model = real_model

        self._eai = RestEAI(self.model, acl)

    @property
    def eai(self):
        return self._eai
