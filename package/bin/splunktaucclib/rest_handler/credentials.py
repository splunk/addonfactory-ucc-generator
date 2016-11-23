"""Credential Management for REST Endpoint
"""

from __future__ import absolute_import

import json
from solnlib.credentials import CredentialManager

from .util import get_base_app_name


__all__ = ['RestCredentials']


class RestCredentials(object):
    """
    Credential Management stored in passwords.conf

    Note: Override it if customized form of ``realm``, ``username``,
        and ``password`` needed.
    """

    PASSWORD = "********"
    REALM = "__REST_CREDENTIAL__#{base_app}#{endpoint}"

    def __init__(
            self,
            splunkd_uri,
            session_key,
            real_model,
    ):
        self.splunkd_uri = splunkd_uri
        self.session_key = session_key
        self.model = real_model

    def realm(self, name):
        """
        RestCredentials context ``realm``.

        :param name:
        :return:
        """
        return RestCredentials.REALM.format(
            base_app=get_base_app_name(),
            endpoint=self.model.endpoint,
        )

    def username(self, name):
        """
        RestCredentials context ``username``.

        :param name:
        :return:
        """
        return name

    def password(self, name, data):
        """
        RestCredentials context ``password``.

        :param name:
        :param data:
        :return:
        """
        return json.dumps(data) if data else None

    def encrypt(self, name, data):
        return data

    def decrypt(self, name, data):
        return data

    def delete(self, name):
        return
