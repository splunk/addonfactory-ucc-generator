"""
REST Handler.
"""

from __future__ import absolute_import

import json
import traceback
from urlparse import urlparse
from functools import wraps
from solnlib.packages.splunklib import binding
from solnlib.splunk_rest_client import SplunkRestClient

from .error import RestError
from .entity import RestEntity
from .credentials import RestCredentials


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
            entities = list(self.get(name))
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
    def decode(self, name, data, acl):
        self._endpoint.decode(name, data)
        return RestEntity(
            name,
            data,
            self._endpoint.model(name, data),
            self._endpoint.user,
            self._endpoint.app,
            acl=acl,
        )

    @wraps(meth)
    def wrapper(self, *args, **kwargs):
        try:
            for name, data, acl in meth(self, *args, **kwargs):
                yield decode(self, name, data, acl)
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
        self.FILTERS = [u'eai:appName', u'eai:acl', u'eai:userName', u'disabled']
        self.PASSWORD = u'********'

    @_decode_response
    def get(self, name, decrypt=False):
        if self._endpoint.need_reload:
            self.reload()
        response = self._client.get(
            self.path_segment(
                self._endpoint.internal_endpoint,
                name=name,
            ),
            output_mode='json',
        )
        return self._flay_response(response, decrypt)

    @_decode_response
    def all(self, decrypt=False, **query):
        if self._endpoint.need_reload:
            self.reload()
        response = self._client.get(
            self.path_segment(self._endpoint.internal_endpoint),
            output_mode='json',
            **query
        )
        return self._flay_all_response(response, decrypt)

    @_decode_response
    @_encode_request()
    def create(self, name, data):
        self._check_name(name)
        data['name'] = name
        response = self._client.post(
            self.path_segment(self._endpoint.internal_endpoint),
            output_mode='json',
            body=data
        )
        return self._flay_response(response)

    @_decode_response
    @_encode_request(existing=True)
    def update(self, name, data):
        response = self._client.post(
            self.path_segment(
                self._endpoint.internal_endpoint,
                name=name,
            ),
            output_mode='json',
            body=data
        )
        return self._flay_response(response)

    @_decode_response
    def delete(self, name):
        response = self._client.delete(
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
        return self._flay_response(response)

    @_decode_response
    def disable(self, name):
        response = self._client.post(
            self.path_segment(
                self._endpoint.internal_endpoint,
                name=name,
                action='disable',
            ),
            output_mode='json',
        )
        return self._flay_response(response)

    @_decode_response
    def enable(self, name):
        response = self._client.post(
            self.path_segment(
                self._endpoint.internal_endpoint,
                name=name,
                action='enable',
            ),
            output_mode='json',
        )
        return self._flay_response(response)

    def reload(self):
        self._client.get(
            self.path_segment(
                self._endpoint.internal_endpoint,
                action='_reload',
            ),
        )

    @classmethod
    def path_segment(cls, endpoint, name=None, action=None):
        """
        Make path segment for given context in Splunk REST format:
        <endpoint>/<entity>/<action>

        :param endpoint: Splunk REST endpoint, e.g. data/inputs
        :param name: entity name for request, "/" will be quoted
        :param action: Splunk REST action, e.g. disable, enable
        :return:
        """
        template = '{endpoint}{entity}{action}'
        entity = ''
        if name:
            # all special characters except "/" will be
            # url-encoded in splunklib.binding.UrlEncoded
            entity = '/' + name.replace('/', '%2F')
        path = template.format(
            endpoint=endpoint.strip('/'),
            entity=entity,
            action='/%s' % action if action else '',
        )
        return path.strip('/')

    def _flay_response(self, response, decrypt=False):
        body = response.body.read()
        try:
            cont = json.loads(body)
        except ValueError:
            raise RestError(
                500,
                'Fail to load response, invalid JSON'
            )
        for entry in cont['entry']:
            name = entry['name']
            data = entry['content']
            acl = entry['acl']
            if self._need_decrypt(name, data, decrypt):
                self._load_credentials(name, data)
            if not decrypt:
                self._clean_credentials(name, data)
            yield name, data, acl

    def _flay_all_response(self, response, decrypt=False):
        body = response.body.read()
        try:
            cont = json.loads(body)
        except ValueError:
            raise RestError(
                500,
                'Fail to load response, invalid JSON'
            )
        # cont['entry']: collection list, load credentials in one request
        if self._all_need_decrypt(cont['entry']):
            self._load_all_credentials(cont['entry'])
        if not decrypt:
            self._clean_all_credentials(cont['entry'])

        for entry in cont['entry']:
            name = entry['name']
            data = entry['content']
            acl = entry['acl']
            yield name, data, acl

    def _load_credentials(self, name, data):
        rest_credentials = RestCredentials(
            self._splunkd_uri,
            self._session_key,
            self._endpoint
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

    def _load_all_credentials(self, data):
        rest_credentials = RestCredentials(
            self._splunkd_uri,
            self._session_key,
            self._endpoint
        )
        # get clear passwords for response data and get the password change list
        change_list = rest_credentials.decrypt_all(data)
        import itertools as it
        field_names = set(it.imap(
            lambda x: x.name,
            it.ifilter(lambda x: x.encrypted, self._endpoint.model(None, data).fields)
        ))
        for model in change_list:
            masked = model['content'].copy()
            for k in self.FILTERS:
                if k in masked:
                    del masked[k]
            for k in masked:
                if k in field_names and masked[k]:
                    masked[k] = self.PASSWORD
            self._client.post(
                self.path_segment(
                    self._endpoint.internal_endpoint,
                    name=model['name'],
                ),
                body=masked
            )

    def _all_need_decrypt(self, data):
        if filter(lambda x: x.encrypted, self._endpoint.model(None, data).fields):
            return True
        return False

    def _need_decrypt(self, name, data, decrypt):
        # some encrypted-needed fields are plain text in *.conf.
        encrypted_field = False
        for field in self._endpoint.model(name, data).fields:
            if field.encrypted is False:
                # ignore non-encrypted fields
                continue
            encrypted_field = True
            if not data.get(field.name):
                # ignore un-stored/empty fields
                continue
            if data[field.name] == RestCredentials.PASSWORD:
                # ignore already-encrypted fields
                continue
            return True

        if decrypt and encrypted_field:
            # clear credentials is required by request and
            # there are some encrypted-needed fields
            return True
        return False

    def _clean_credentials(self, name, data):
        for field in self._endpoint.model(name, data).fields:
            if field.encrypted is True and field.name in data:
                del data[field.name]

    def _clean_all_credentials(self, data):
        for model in data:
            for field in self._endpoint.model(None, data).fields:
                if field.encrypted and field.name in model['content']:
                    del model['content'][field.name]

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
