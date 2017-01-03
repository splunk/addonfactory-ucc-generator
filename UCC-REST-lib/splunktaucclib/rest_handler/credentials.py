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
        return json.dumps(data)

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
            existing = True
        except CredentialNotExistException:
            encrypted = {}
            existing = False
        encrypting = self._filter(name, data, encrypted)
        self._merge(name, data, encrypted, encrypting)
        if existing or encrypting:
            # only save credential when the stanza is existing in
            # passwords.conf or encrypting data is not empty
            self._set(name, encrypting)

    def decrypt(self, name, data, show_credentials=False):
        """

        :param name:
        :param data:
        :return: If the passwords.conf is updated, masked data.
            Else, None.
        """
        try:
            encrypted = self._get(name)
            existing = True
        except CredentialNotExistException:
            encrypted = {}
            existing = False
        encrypting = self._filter(name, data, encrypted)
        self._merge(name, data, encrypted, encrypting)
        if existing or encrypting:
            # only save credential when the stanza is existing in
            # passwords.conf or encrypting data is not empty
            self._set(name, encrypting)
        data.update(encrypting)
        return encrypted

    def delete(self, name):
        context = RestCredentialsContext(self._endpoint, name)
        mgr = self._get_manager(context)
        try:
            mgr.delete_password(user=context.username())
        except CredentialNotExistException:
            pass

    def _set(self, name, credentials):
        if credentials is None:
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
            if data[field.name] != self.EMPTY_VALUE:
                encrypting_data[field.name] = data[field.name]
                # non-empty fields
                data[field.name] = self.PASSWORD
                if field.name in encrypted_data:
                    del encrypted_data[field.name]
        return encrypting_data

    def _merge(self, name, data, encrypted, encrypting):
        model = self._endpoint.model(name, data)
        for field in model.fields:
            if field.encrypted is False:
                continue

            val_encrypting = encrypting.get(field.name)
            if val_encrypting:
                encrypted[field.name] = self.PASSWORD
                continue
            elif val_encrypting == self.EMPTY_VALUE:
                del encrypting[field.name]
                encrypted[field.name] = self.EMPTY_VALUE
                continue

            val_encrypted = encrypted.get(field.name)
            if val_encrypted:
                encrypting[field.name] = val_encrypted
                del encrypted[field.name]

    def _get_manager(self, context):
        return CredentialManager(
            self._session_key,
            owner=self._endpoint.user,
            app=self._endpoint.app,
            realm=context.realm(),
        )
