
"""
Custom REST Handler in Splunk add-on.
"""

from __future__ import absolute_import

import json
import traceback
from urllib import quote
from urlparse import urlparse
from functools import wraps
from splunklib import binding
from solnlib.splunk_rest_client import SplunkRestClient

from .error import RestError
from .entity import RestEntity
from .credentials import RestCredentials


__all__ = ['RestHandler']


def _encode(meth):
    """
    Encode payload before request.
    :param meth:
    :return:
    """
    @wraps(meth)
    def wrapper(self, name, data):
        real_model = self._model.real_model(name, data)
        real_model.validate(data)
        real_model.encode(data)

        rest_credentials = RestCredentials(
            self._splunkd_uri,
            self._session_key,
            real_model,
        )
        rest_credentials.encrypt(name, data)
        return meth(self, name, data)
    return wrapper


def _decode(meth):
    """
    Decode response.
    :param meth:
    :return:
    """
    def parse(self, response):
        body = response.body.read()
        cont = json.loads(body)

        for entry in cont['entry']:
            name = entry['name']
            data = entry['content']
            real_model = self._model.real_model(name, data)
            rest_credentials = RestCredentials(
                self._splunkd_uri,
                self._session_key,
                real_model,
            )
            rest_credentials.decrypt(name, data)
            real_model.decode(data)

            rest_entity = RestEntity(
                name,
                data,
                real_model,
                acl=entry['acl'],
            )
            yield rest_entity

    @wraps(meth)
    def wrapper(self, *args, **kwargs):
        try:
            response = meth(self, *args, **kwargs)
            return parse(self, response)
        except RestError:
            raise
        except binding.HTTPError as exc:
            raise RestError(exc.status, exc.message)
        except Exception:
            raise RestError(500, traceback.format_exc())
    return wrapper


class RestHandler(object):

    def __init__(
            self,
            splunkd_uri,
            session_key,
            model,
            *args,
            **kwargs
    ):
        self._splunkd_uri = splunkd_uri
        self._session_key = session_key
        self._model = model
        self._args = args
        self._kwargs = kwargs

        splunkd_info = urlparse(self._splunkd_uri)
        self._client = SplunkRestClient(
            self._session_key,
            self._model.app,
            scheme=splunkd_info[0],
            host=splunkd_info[1],
            port=splunkd_info[2],
        )

    @_decode
    def get(self, name):
        self.reload()
        return self._client.get(
            self._path_segment(name=name),
            output_mode='json',
        )

    @_decode
    def all(self, **query):
        self.reload()
        return self._client.get(
            self._path_segment(),
            output_mode='json',
            **query
        )

    @_decode
    @_encode
    def create(self, name, data):
        self._check_name(name)
        return self._client.post(
            self._path_segment(),
            output_mode='json',
            name=name,
            **data
        )

    @_decode
    @_encode
    def update(self, name, data):
        return self._client.post(
            self._path_segment(name=name),
            output_mode='json',
            **data
        )

    @_decode
    def delete(self, name):
        return self._client.delete(
            self._path_segment(name=name),
            output_mode='json',
        )

    @_decode
    def disable(self, name):
        return self._client.post(
            self._path_segment(name=name, action='disable'),
            output_mode='json',
        )

    @_decode
    def enable(self, name):
        return self._client.post(
            self._path_segment(name=name, action='enable'),
            output_mode='json',
        )

    def reload(self):
        self._client.get(self._path_segment(action='_reload'))

    def _path_segment(self, name=None, action=None):
        template = '{endpoint}{name}{action}'
        name = ('/%s' % quote(name.encode('utf-8'))) if name else ''
        path = template.format(
            endpoint=self._model.endpoint.strip('/'),
            name=name,
            action='/%s' % action if action else '',
        )
        return path.strip('/')

    def _check_name(self, name):
        if name == 'default':
            raise RestError(
                400,
                '"default" is not allowed for entity name',
            )
        if name.startswith("_"):
            raise RestError(
                400,
                '"default" is not allowed for entity name',
            )
