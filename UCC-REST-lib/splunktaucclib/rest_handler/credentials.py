"""Credentials Management for REST Endpoint
"""

from __future__ import absolute_import

import copy
import json
from urlparse import urlparse
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
            endpoint
    ):
        self._splunkd_uri = splunkd_uri
        self._splunkd_info = urlparse(self._splunkd_uri)
        self._session_key = session_key
        self._endpoint = endpoint
        self._realm = '__REST_CREDENTIAL__#{base_app}#{endpoint}'.format(
            base_app=get_base_app_name(),
            endpoint=self._endpoint.internal_endpoint.strip('/')
        )

    def encrypt(self, name, data):
        """

        :param name:
        :param data:
        :return:
        """
        # Check if encrypt is needed
        model = self._endpoint.model(name, data)
        need_encrypting = all(field.encrypted for field in model.fields)
        if not need_encrypting:
            return
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

    def decrypt_all(self, data):
        """
        :param data:
        :return: changed stanza list
        """
        credential_manager = CredentialManager(
            self._session_key,
            owner=self._endpoint.user,
            app=self._endpoint.app,
            realm=self._realm,
            scheme=self._splunkd_info.scheme,
            host=self._splunkd_info.hostname,
            port=self._splunkd_info.port
        )

        all_passwords = credential_manager._get_all_passwords()
        # filter by realm
        realm_passwords = filter(lambda x: x['realm'] == self._realm, all_passwords)
        return self._merge_passwords(data, realm_passwords)

    def _merge_passwords(self, data, passwords):
        # merge clear passwords to response data
        change_list = []
        password_names = map(lambda x: x['username'], passwords)
        # existed passwords models
        existed_models = filter(lambda x: x['name'] in password_names, data)
        others = filter(lambda x: x['name'] not in password_names, data)
        # For model that password existed
        # 1.Password changed: Update it and add to change_list
        # 2.Password unchanged: Get the password and update the response data
        for existed_model in existed_models:
            name = existed_model['name']
            password = next((x for x in passwords if x['username'] == name), None)
            if password and 'clear_password' in password:
                clear_password = json.loads(password['clear_password'])
                password_changed = False
                for k, v in clear_password.iteritems():
                    if existed_model['content'][k] == self.PASSWORD:
                        existed_model['content'][k] = v
                    else:
                        password_changed = True
                        clear_password[k] = existed_model['content'][k]
                # update the password
                if password_changed and clear_password:
                    change_list.append(existed_model)
                    self._set(name, clear_password)
        # For other models, encrypt the password and return
        for other_model in others:
            name = other_model['name']
            fields = filter(lambda x: x.encrypted, self._endpoint.model(None, data).fields)
            clear_password = {}
            for field in fields:
                clear_password[field.name] = other_model['content'][field.name]
            if clear_password:
                self._set(name, clear_password)

        change_list.extend(others)
        return change_list

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
            scheme=self._splunkd_info.scheme,
            host=self._splunkd_info.hostname,
            port=self._splunkd_info.port
        )
