"""
REST handler with Python.
"""

from __future__ import absolute_import


class RestHandlerBuilder(object):

    def __init__(self, handler, model, fields, *args, **kwargs):
        self._handler = handler
        self._model = model
        self._fields = fields
        self._args = args
        self._kwargs = kwargs

    def build(self):
        pass
