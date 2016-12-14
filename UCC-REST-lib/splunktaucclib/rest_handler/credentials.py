"""Credentials Management for REST Endpoint
"""

from __future__ import absolute_import

import copy
import json
from solnlib.credentials import (
    CredentialManager,
    CredentialNotExistException,
)

from .util import get_base_app_name
from .error import RestError
from .eai import EAI_FIELD_PREFIX


__all__ = [
    'RestCredentialsContext',
    'RestCredentials',
]


class RestCredentialsContext(object):
    """
    Credentials' context, including realm, username and password.
    """

    REALM = '__REST_CREDENTIAL__#{base_app}#{endpoint}'

    def __init__(self, endpoint, name, *args, **kwargs):
        self._endpoint = endpoint
        self._name = name
        self._args = args
        self._kwargs = kwargs

    def realm(self):
        """
        RestCredentials context ``realm``.
        :return:
        """
        return self.REALM.format(
            base_app=get_base_app_name(),
            endpoint=self._endpoint.internal_endpoint.strip('/'),
        )

    def username(self):
        """
        RestCredentials context ``username``.
        :return:
        """
        return self._name

    def dump(self, data):
        """
        RestCredentials context ``password``.
        Dump data to string.
        :param data: data to be encrypted
        :type data: dict
        :return:
        """
        return json.dumps(data) if data else None

    def load(self, string):
        """
        RestCredentials context ``password``.
        Load data from string.
        :param string: data has been decrypted
        :type string: basestring
        :return:
        """
        try:
            return json.loads(string)
        except ValueError:
            raise RestError(
                500,
                'Fail to load encrypted string, invalid JSON'
            )


class RestCredentials(object):
    """
    Credential Management stored in passwords.conf
    """

    PASSWORD = '********'
    EMPTY_VALUE = ''

    def __init__(
            self,
            splunkd_uri,
            session_key,
            endpoint,
    ):
        self._splunkd_uri = splunkd_uri
        self._session_key = session_key
        self._endpoint = endpoint

    def encrypt(self, name, data):
        """

        :param name:
        :param data:
        :return:
        """
        try:
            encrypted = self._get(name)
        except CredentialNotExistException:
            encrypted = {}
        encrypting = self._filter(name, data, encrypted)
        credentials = self._merge(encrypted, encrypting)
        if credentials:
            self._set(name, credentials)

    def decrypt(self, name, data):
        """

        :param name:
        :param data:
        :return: If the passwords.conf is updated, masked data.
            Else, None.
        """
        masked = None
        if not self._has_credentials(name, data):
            return masked

        try:
            encrypted = self._get(name)
        except CredentialNotExistException:
            encrypted = {}
        encrypting = self._filter(name, data, encrypted)
        credentials = self._merge(encrypted, encrypting)
        if self._need_encrypting(encrypted, encrypting):
            self._set(name, credentials)
            masked = copy.copy(data)
            for key in masked.keys():
                if key.startswith(EAI_FIELD_PREFIX) or key == 'disabled':
                    del masked[key]

        data.update(credentials)
        return masked

    def delete(self, name):
        context = RestCredentialsContext(self._endpoint, name)
        mgr = self._get_manager(context)
        try:
            mgr.delete_password(user=context.username())
        except CredentialNotExistException:
            pass

    def _set(self, name, credentials):
        if not credentials:
            return
        context = RestCredentialsContext(self._endpoint, name)
        mgr = self._get_manager(context)
        mgr.set_password(
            user=context.username(),
            password=context.dump(credentials)
        )

    def _get(self, name):
        context = RestCredentialsContext(self._endpoint, name)
        mgr = self._get_manager(context)
        string = mgr.get_password(user=context.username())
        return context.load(string)

    def _filter(self, name, data, encrypted_data):
        model = self._endpoint.model(name, data)
        encrypting_data = {}
        for field in model.fields:
            if field.encrypted is False:
                # remove non-encrypted fields
                if field.name in encrypted_data:
                    del encrypted_data[field.name]
                continue
            if field.name not in data:
                # ignore un-posted fields
                continue
            if data[field.name] == self.PASSWORD:
                # ignore already-encrypted fields
                continue
            encrypting_data[field.name] = data[field.name]
            if data[field.name] != self.EMPTY_VALUE:
                # non-empty fields
                data[field.name] = self.PASSWORD
                if field.name in encrypted_data:
                    del encrypted_data[field.name]
        return encrypting_data

    def _merge(self, encrypted, encrypting):
        credentials_data = copy.copy(encrypted)
        credentials_data.update(encrypting)
        for key, val in encrypting.iteritems():
            if val == self.EMPTY_VALUE:
                del credentials_data[key]
        return credentials_data

    def _get_manager(self, context):
        return CredentialManager(
            self._session_key,
            owner=self._endpoint.user,
            app=self._endpoint.app,
            realm=context.realm(),
        )

    @staticmethod
    def _need_encrypting(encrypted, encrypting):
        for key, val_encrypting in encrypting.iteritems():
            val_encrypted = encrypted.get(key, RestCredentials.EMPTY_VALUE)
            if val_encrypting != val_encrypted:
                return True
        return False

    def _has_credentials(self, name, data):
        model = self._endpoint.model(name, data)
        for field in model.fields:
            if field.encrypted is True:
                return True
        return False
