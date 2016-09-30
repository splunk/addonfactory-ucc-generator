"""
Handles credentials related stuff
"""

import xml.dom.minidom as xdm
import urllib

import splunktalib.common.xml_dom_parser as xdp
import splunktalib.rest as rest
from splunktalib.common import log

logger = log.Logs().get_logger("util")


class CredException(Exception):
    pass


def create_credential_manager(username, password, splunkd_uri, app, owner,
                              realm):
    session_key = CredentialManager.get_session_key(
        username, password, splunkd_uri)
    return CredentialManager(splunkd_uri, session_key, app, owner, realm)


class CredentialManager(object):
    """
    Credential related interfaces
    """

    def __init__(self,
                 splunkd_uri,
                 session_key,
                 app="-",
                 owner="nobody",
                 realm=None):
        """
        :app: when creating/upating/deleting app is required
        """

        self._app = app
        self._splunkd_uri = splunkd_uri
        self._owner = owner
        self._sep = "``splunk_cred_sep``"

        if realm:
            self._realm = realm
        else:
            self._realm = app

        self._session_key = session_key

    def set_appname(self, app):
        """
        This are cases we need edit/remove/create confs in different app
        context. call this interface to switch app context before manipulate
        the confs in different app context
        """

        self._app = app

    @staticmethod
    def get_session_key(username,
                        password,
                        splunkd_uri="https://localhost:8089"):
        """
        Get session key by using login username and passwrod
        :return: session_key if successful, None if failed
        """

        eid = "".join((splunkd_uri, "/services/auth/login"))
        postargs = {"username": username, "password": password, }

        response, content = rest.splunkd_request(
            eid,
            None,
            method="POST",
            data=postargs)

        if response is None and content is None:
            raise CredException("Get session key failed.")

        xml_obj = xdm.parseString(content)
        session_nodes = xml_obj.getElementsByTagName("sessionKey")
        if not session_nodes:
            raise CredException("Invalid username or password.")
        session_key = session_nodes[0].firstChild.nodeValue
        if not session_key:
            raise CredException("Get session key failed.")
        return session_key

    def update(self, stanza):
        """
        Update or Create credentials based on the stanza
        :stanza: nested dict object. The outlayer keys are stanza name, and
                 inner dict is user/pass key/value pair to be encrypted
         {
         "stanza_name": {"tommy": "tommypasswod", "jerry": "jerrypassword"}
         }
        :return: raise on failure
        """

        for name, encr_dict in stanza.items():
            encrypts = []
            for key, val in encr_dict.items():
                encrypts.append(key)
                encrypts.append(val)
            self._update(name, self._sep.join(encrypts))

    def _update(self, name, str_to_encrypt):
        """
        Update the string for the name.
        :return: raise on failure
        """

        self.delete(name)
        return self._create(name, str_to_encrypt)

    def _create(self, name, str_to_encrypt):
        """
        Create a new stored credential.
        :return: raise on failure
        """

        payload = {
            "name": name,
            "password": str_to_encrypt,
            "realm": self._realm,
        }

        endpoint = self._get_endpoint(name)
        resp, content = rest.splunkd_request(endpoint,
                                             self._session_key,
                                             method="POST",
                                             data=payload)
        if not resp or resp.status not in (200, 201):
            raise CredException("Failed to encrypt username {}".format(name))

    def delete(self, name, throw=False):
        """
        Delete the encrypted entry
        """

        endpoint = self._get_endpoint(name)
        response, content = rest.splunkd_request(
            endpoint,
            self._session_key,
            method="DELETE")
        if not response or response not in (200, 201):
            if throw:
                raise CredException(
                    "Failed to delete credential stanza {}".format(name))

    def get_all_passwords(self):
        """
        :return: a list of dict when successful, None when failed.
        the dict at least contains
        {
            "realm": xxx,
            "username": yyy,
            "clear_password": zzz,
        }
        """

        endpoint = "{}/services/storage/passwords".format(self._splunkd_uri)
        response, content = rest.splunkd_request(
            endpoint,
            self._session_key,
            method="GET")
        if response and response.status in (200, 201) and content:
            return xdp.parse_conf_xml_dom(content)
        raise CredException("Failed to get credentials")

    def get_clear_password(self, name=None):
        """
        :return: clear password(s)
        {
        stanza_name: {"user": pass}
        }
        """

        return self._get_credentials("clear_password", name)

    def get_encrypted_password(self, name=None):
        """
        :return: encyrpted password(s)
        """

        return self._get_credentials("encr_password", name)

    def _get_credentials(self, prop, name=None):
        """
        :return: clear or encrypted password for specified realm, user
        """

        endpoint = self._get_endpoint(name, True)
        response, content = rest.splunkd_request(
            endpoint,
            self._session_key,
            method="GET")

        if response is None and content is None:
            raise CredException("Failed to get clear credentials")

        results = {}
        if response and response.status in (200, 201) and content:
            passwords = xdp.parse_conf_xml_dom(content)
            for password in passwords:
                if password.get("realm") == self._realm:
                    values = password[prop].split(self._sep)
                    if len(values) % 2 == 1:
                        continue
                    result = {
                        values[i]: values[i + 1]
                        for i in range(0, len(values), 2)
                    }
                    results[password.get("username")] = result
        return results

    @staticmethod
    def _build_name(realm, name):
        return urllib.quote(
            "".join((CredentialManager._escape_string(realm), ":",
                     CredentialManager._escape_string(name), ":")))

    @staticmethod
    def _escape_string(string_to_escape):
        """
        Splunk secure credential storage actually requires a custom style of
        escaped string where all the :'s are escaped by a single \.
        But don't escape the control : in the stanza name.
        """

        return string_to_escape.replace(":", "\\:").replace("/", "%2F")

    def _get_endpoint(self, name=None, query=False):
        app = self._app
        owner = self._owner
        if query:
            app = "-"
            owner = "-"

        if name:
            realm_user = self._build_name(self._realm, name)
            rest_endpoint = "{}/servicesNS/{}/{}/storage/passwords/{}".format(
                self._splunkd_uri, owner, app, realm_user)
        else:
            rest_endpoint = "{}/servicesNS/{}/{}/storage/passwords".format(
                self._splunkd_uri, owner, app)
        return rest_endpoint
