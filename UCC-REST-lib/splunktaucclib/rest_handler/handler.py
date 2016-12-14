"""
REST Handler.
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
from splunk.appserver.mrsparkle.lib import i18n


__all__ = ['RestHandler']


def _encode_request(existing=False):
    """
    Encode payload before request.
    :param existing: if check existing needed
    :return:
    """

    def _encode_request_wrapper(meth):
        """

        :param meth: RestHandler instance method
        :return:
        """
        def check_existing(self, name):
            if not existing:
                return None
            entities = self.get(name)
            if len(entities) < 1:
                raise RestError(
                    404,
                    'name=%s' % name,
                )
            return entities[0].content

        @wraps(meth)
        def wrapper(self, name, data):

            self._endpoint.validate(
                name,
                data,
                check_existing(self, name),
            )
            self._endpoint.encode(name, data)

            rest_credentials = RestCredentials(
                self._splunkd_uri,
                self._session_key,
                self._endpoint,
            )
            rest_credentials.encrypt(name, data)
            return meth(self, name, data)

        return wrapper

    return _encode_request_wrapper


def _decode_response(meth):
    """
    Decode response body.
    :param meth: RestHandler instance method
    :return:
    """
    def parse(self, response):
        body = response.body.read()
        cont = json.loads(body)

        entities = []
        for entry in cont['entry']:
            name = entry['name']
            data = entry['content']
            rest_credentials = RestCredentials(
                self._splunkd_uri,
                self._session_key,
                self._endpoint,
            )
            masked = rest_credentials.decrypt(name, data)
            if masked:
                # passwords.conf changed
                self._client.post(
                    self.path_segment(
                        self._endpoint.internal_endpoint,
                        name=name,
                    ),
                    **masked
                )
            self._endpoint.decode(name, data)

            entity = RestEntity(
                name,
                data,
                self._endpoint.model(name, data),
                self._endpoint.user,
                self._endpoint.app,
                acl=entry['acl'],
            )
            entities.append(entity)
        return entities

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
            endpoint,
            *args,
            **kwargs
    ):
        self._splunkd_uri = splunkd_uri
        self._session_key = session_key
        self._endpoint = endpoint
        self._args = args
        self._kwargs = kwargs

        splunkd_info = urlparse(self._splunkd_uri)
        self._client = SplunkRestClient(
            self._session_key,
            self._endpoint.app,
            scheme=splunkd_info.scheme,
            host=splunkd_info.hostname,
            port=splunkd_info.port,
        )

    @_decode_response
    def get(self, name):
        if self._endpoint.need_reload:
            self.reload()
        return self._client.get(
            self.path_segment(
                self._endpoint.internal_endpoint,
                name=name,
            ),
            output_mode='json',
        )

    @_decode_response
    def all(self, **query):
        if self._endpoint.need_reload:
            self.reload()
        return self._client.get(
            self.path_segment(self._endpoint.internal_endpoint),
            output_mode='json',
            **query
        )

    @_decode_response
    @_encode_request()
    def create(self, name, data):
        self._check_name(name)
        return self._client.post(
            self.path_segment(self._endpoint.internal_endpoint),
            output_mode='json',
            name=name,
            **data
        )

    @_decode_response
    @_encode_request(existing=True)
    def update(self, name, data):
        return self._client.post(
            self.path_segment(
                self._endpoint.internal_endpoint,
                name=name,
            ),
            output_mode='json',
            **data
        )

    @_decode_response
    def delete(self, name):
        ret = self._client.delete(
            self.path_segment(
                self._endpoint.internal_endpoint,
                name=name,
            ),
            output_mode='json',
        )

        # delete credentials
        rest_credentials = RestCredentials(
            self._splunkd_uri,
            self._session_key,
            self._endpoint,
        )
        rest_credentials.delete(name)
        return ret

    @_decode_response
    def disable(self, name):
        return self._client.post(
            self.path_segment(
                self._endpoint.internal_endpoint,
                name=name,
                action='disable',
            ),
            output_mode='json',
        )

    @_decode_response
    def enable(self, name):
        return self._client.post(
            self.path_segment(
                self._endpoint.internal_endpoint,
                name=name,
                action='enable',
            ),
            output_mode='json',
        )

    def reload(self):
        self._client.get(
            self.path_segment(
                self._endpoint.internal_endpoint,
                action='_reload',
            ),
        )

    @classmethod
    def path_segment(cls, endpoint, name=None, action=None):
        template = '{endpoint}{name}{action}'
        name = ('/%s' % quote(name.encode('utf-8'))) if name else ''
        path = template.format(
            endpoint=endpoint.strip('/'),
            name=name,
            action='/%s' % action if action else '',
        )
        return path.strip('/')

    @classmethod
    def _check_name(cls, name):
        if name == 'default':
            raise RestError(
                400,
                '"%s" is not allowed for entity name' % name
            )
        if name.startswith("_"):
            raise RestError(
                400,
                'Name starting with "_" is not allowed for entity'
            )
