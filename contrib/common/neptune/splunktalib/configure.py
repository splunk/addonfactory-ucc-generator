"""
This module hanles configuration related stuff
"""

import os
import sys
import subprocess
import ConfigParser
import os.path as op
import traceback

from splunktalib.common import log
from splunktalib.common import util

import splunktalib.credentials as cred
import splunktalib.rest as rest
import splunktalib.common.xml_dom_parser as xdp


_LOGGER = log.Logs().get_logger("ta_util")


def _parse_modinput_configs(root, outer_block, inner_block):
    """
    When user splunkd spawns modinput script to do config check or run

    <?xml version="1.0" encoding="UTF-8"?>
    <input>
      <server_host>localhost.localdomain</server_host>
      <server_uri>https://127.0.0.1:8089</server_uri>
      <session_key>xxxyyyzzz</session_key>
      <checkpoint_dir>ckpt_dir</checkpoint_dir>
      <configuration>
        <stanza name="snow://alm_asset">
          <param name="duration">60</param>
            <param name="host">localhost.localdomain</param>
            <param name="index">snow</param>
            <param name="priority">10</param>
        </stanza>
        ...
      </configuration>
    </input>

    When user create an stanza through data input on WebUI

    <?xml version="1.0" encoding="UTF-8"?>
    <items>
      <server_host>localhost.localdomain</server_host>
      <server_uri>https://127.0.0.1:8089</server_uri>
      <session_key>xxxyyyzzz</session_key>
      <checkpoint_dir>ckpt_dir</checkpoint_dir>
      <item name="abc">
        <param name="duration">60</param>
        <param name="exclude"></param>
        <param name="host">localhost.localdomain</param>
        <param name="index">snow</param>
        <param name="priority">10</param>
      </item>
    </items>
    """

    confs = root.getElementsByTagName(outer_block)
    if not confs:
        _LOGGER.error("Invalid config, missing %s section", outer_block)
        raise Exception("Invalid config, missing %s section".format(
            outer_block
        ))

    configs = []
    stanzas = confs[0].getElementsByTagName(inner_block)
    for stanza in stanzas:
        config = {}
        stanza_name = stanza.getAttribute("name")
        if not stanza_name:
            _LOGGER.error("Invalid config, missing name")
            raise Exception("Invalid config, missing name")

        config["name"] = stanza_name
        params = stanza.getElementsByTagName("param")
        for param in params:
            name = param.getAttribute("name")
            if (name and param.firstChild and
                    param.firstChild.nodeType == param.firstChild.TEXT_NODE):
                config[name] = param.firstChild.data
        configs.append(config)
    return configs


def parse_modinput_configs(config_str):
    """
    @config_str: modinput XML configuration feed by splunkd
    @return: meta_config and stanza_config
    """

    import xml.dom.minidom as xdm

    meta_configs = {
        "server_host": None,
        "server_uri": None,
        "session_key": None,
        "checkpoint_dir": None,
    }
    root = xdm.parseString(config_str)
    doc = root.documentElement
    for tag in meta_configs.iterkeys():
        nodes = doc.getElementsByTagName(tag)
        if not nodes:
            _LOGGER.error("Invalid config, missing %s section", tag)
            raise Exception("Invalid config, missing %s section", tag)

        if (nodes[0].firstChild and
                nodes[0].firstChild.nodeType == nodes[0].TEXT_NODE):
            meta_configs[tag] = nodes[0].firstChild.data
        else:
            _LOGGER.error("Invalid config, expect text ndoe")
            raise Exception("Invalid config, expect text ndoe")

    if doc.nodeName == "input":
        configs = _parse_modinput_configs(doc, "configuration", "stanza")
    else:
        configs = _parse_modinput_configs(root, "items", "item")
    return meta_configs, configs


def get_modinput_configs(modinput, modinput_stanza=None):
    """
    @modinput: modinput name
    @modinput_stanza: modinput stanza name, for multiple instance only
    """

    assert modinput

    splunkbin = util.get_splunk_bin()
    cli = [splunkbin, "cmd", "splunkd", "print-modinput-config", modinput]
    if modinput_stanza:
        cli.append(modinput_stanza)

    out, err = subprocess.Popen(cli, stdout=subprocess.PIPE,
                                stderr=subprocess.PIPE).communicate()
    if err:
        _LOGGER.error("Failed to get modinput configs with error: %s", err)
        return None, None
    else:
        return parse_modinput_configs(out)


class TAConfig(object):

    encrypted = "******"
    username_password_sep = "``"
    dummy = "user"

    def __init__(self):
        self.meta_configs = None
        self.stanza_configs = None
        self.app_dir = None
        self.app = None
        self.cred_manager = None

    def get_configs(self):
        meta_configs, stanza_configs = self.get_modinput_configs()
        self.meta_configs = meta_configs
        self.stanza_configs = stanza_configs
        self.cred_manager = cred.CredentialManager(meta_configs["session_key"],
                                                   meta_configs["server_uri"])
        self.app_dir = op.dirname(op.dirname(op.dirname(op.abspath(__file__))))
        self.app = op.basename(self.app_dir)
        return meta_configs, stanza_configs

    @staticmethod
    def get_modinput_configs():
        config_str = TAConfig.get_modinput_config_from_stdin()
        return parse_modinput_configs(config_str)

    @staticmethod
    def get_modinput_config_from_stdin():
        """
        Get modinput from stdin which is feed by splunkd
        """

        try:
            return sys.stdin.read()
        except Exception:
            _LOGGER.error(traceback.format_exc())
            raise

    def encrypt_new_credentials(self, account, conf_file, host_user_passwds):
        """
        Encrypt the user credentials if it is new conf file
        Update the user credentials if it exists in splunkd and conf file
        Encrypt strategy is encrypting both username and password. Splunkd only
        encrypt password, the code works around this by concatenating username
        and password by "``" and treat the concantenated string as password,
        then encrypt the concatenated string. Username is given as "dummy"
        @return None
        """

        encrypted = self.encrypted
        sep = self.username_password_sep

        for (url_k, user_k, passwd_k) in host_user_passwds:
            url, username, password = (account[url_k], account[user_k],
                                       account[passwd_k])
            if (url and username and password and
                    username != encrypted and password != encrypted):
                # Create new one
                user_password = sep.join((username, password))
                res = self.cred_manager.update(url, self.dummy,
                                               user_password, self.app)
                if not res:
                    raise Exception("Failed to encrypt username password")
                _LOGGER.info("Encrypt credential for %s", url)
                self.encrypt_conf_file(conf_file)

    def encrypt_conf_file(self, conf_file):
        """
        Encrypt username/password in conf file
        """

        for d in ("local", "default"):
            conf = op.join(self.app_dir, d, conf_file)
            if not op.exists(conf):
                continue

            new_cp = ConfigParser.ConfigParser()
            parser = ConfigParser.ConfigParser()
            parser.read(conf)
            for section in parser.sections():
                new_cp.add_section(section)
                for option in parser.options(section):
                    op_val = parser.get(section, option)
                    if self._is_credential_section(section, option):
                        if parser.get(section, option).strip():
                            op_val = self.encrypted
                    new_cp.set(section, option, op_val)

            encrypted_file = op.join(self.app_dir, d,
                                     ".{0}.new".format(conf_file))
            with open(encrypted_file, "w") as new_file:
                new_cp.write(new_file)

            os.rename(conf, conf + ".old")
            os.rename(encrypted_file, conf)
            os.remove(conf + ".old")

    @staticmethod
    def _is_credential_section(section, options):
        return False

    def decrypt_existing_credentials(self, defaults, host_user_passwds):
        """
        Decrypt the user credentials if it is encrypted in conf file
        @return None
        """

        sep = self.username_password_sep
        for (url_k, user_k, passwd_k) in host_user_passwds:
            url, username, password = (defaults[url_k], defaults[user_k],
                                       defaults[passwd_k])
            if (url and username and password and username == self.encrypted
                    and password == self.encrypted):
                password = self.cred_manager.get_clear_password(url,
                                                                self.dummy,
                                                                self.app)
                if not password:
                    raise Exception("Failed to decrypt username password.")
                username, password = password.split(sep)
                defaults[user_k] = username
                defaults[passwd_k] = password


def reload_confs(confs, session_key, splunkd_uri="https://localhost:8089",
                 appname="-"):
    new_confs = []
    for conf in confs:
        conf = op.basename(conf)
        if conf.endswith(".conf"):
            conf = conf[:-5]
            new_confs.append(conf)
        else:
            new_confs.append(conf)

    endpoint_template = "{0}/servicesNS/-/{1}/configs/conf-{2}/_reload"
    for conf in new_confs:
        endpoint = endpoint_template.format(splunkd_uri, appname, conf)
        resp, _ = rest.splunkd_request(endpoint, session_key)
        if not resp or resp.status not in (200, 201):
            _LOGGER.error("Failed to refresh %s, reason=%s",
                          endpoint, resp.reason if resp else "")


class ConfManager(object):

    def __init__(self, splunkd_uri, session_key):
        self.splunkd_uri = splunkd_uri
        self.session_key = session_key

    def create_conf(self, user, appname, file_name, stanzas=()):
        """
        @stanzas: a list of stanza names
        @return: (success, failed_stanzas) tuple
        """

        uri = "".join((self.splunkd_uri, "/servicesNS/", user, "/", appname,
                       "/properties"))
        msg_temp = "Failed to create stanza={} in conf={}"
        result, failed_stanzas = True, []
        payload = {"__stanza": None}
        uri = "{}/{}".format(uri, file_name)
        for stanza in stanzas:
            payload["__stanza"] = stanza
            msg = msg_temp.format(stanza, file_name)
            res = self._do_request(uri, "POST", payload, msg)
            if res is None:
                failed_stanzas.append(stanza)
                result = False
        return result, failed_stanzas

    def delete_conf_stanzas(self, user, appname, file_name, stanzas):
        """
        @return: empty list or a list of failed stanzas
        """

        uri = "".join((self.splunkd_uri, "/servicesNS/", user, "/", appname,
                       "/configs/conf-", file_name))
        msg_temp = "Failed to create stanza={} in conf={}"
        failed_stanzas = []
        for stanza in stanzas:
            stanza_uri = "{}/{}".format(uri, stanza)
            msg = msg_temp.format(stanza, file_name)
            res = self._do_request(stanza_uri, "DELETE", None, msg)
            if res is None:
                failed_stanzas.append(stanza)
        return failed_stanzas

    def update_conf_properties(self, user, appname, file_name,
                               stanza, key_values):
        """
        @return: True if update is successful, otherwise return False
        """

        uri = "".join((self.splunkd_uri, "/servicesNS/", user, "/", appname,
                       "/properties/", file_name, "/", stanza))
        msg = "Failed to update conf={0}, stanza={1}".format(
            file_name, stanza)
        res = self._do_request(uri, "POST", key_values, msg)
        return res is not None

    def get_conf_property(self, user, appname, file_name, stanza, key_name):
        """
        @return: value of the property if successful, otherwise return None
                 if failed or no such that property
        """

        uri = "".join((self.splunkd_uri, "/servicesNS/", user, "/", appname,
                       "/properties/", file_name, "/", stanza, "/",
                       key_name))
        msg = "Failed to update conf={0}, stanza={1}, key={2}".format(
            file_name, stanza, key_name)
        return self._do_request(uri, "GET", None, msg)

    def get_conf(self, user, appname, file_name, stanza=None):
        """
        @return: a list of dict stanza objects if successful.
                 Otherwise return None
        """

        if stanza:
            uri = "".join((self.splunkd_uri, "/servicesNS/", user, "/",
                           appname, "/configs/conf-", file_name, "/", stanza))
        else:
            uri = "".join((self.splunkd_uri, "/servicesNS/", user, "/",
                           appname, "/configs/conf-", file_name,
                           "?count=0&offset=0"))
        msg = "Failed to get conf={0}, stanza={1}".format(file_name, stanza)
        content = self._do_request(uri, "GET", None, msg)
        if content is not None:
            return xdp.parse_conf_xml_dom(content)
        return None

    def reload_confs(self, confs, appname):
        return reload_confs(confs, self.session_key, self.splunkd_uri, appname)

    def create_data_input(self, user, appname, input_type, stanza):
        """
        @user: ACL user
        @appname: target app directory
        @input_type: if it is a script input, the input_type "script",
                     for modinput, say snow, the intput_type "snow"
        @stanza: dict like object contains stanza info, shall contains
                 "name" for the stanza name
        @return: True if success otherwise false
        """

        assert "name" in stanza

        uri = "{}/servicesNS/{}/{}/data/inputs/{}/".format(
            self.splunkd_uri, user, appname, input_type)
        msg = "Failed to create data input for {}, {}".format(
            appname, input_type)
        content = self._do_request(uri, "POST", stanza, msg)
        if content is None:
            return False
        return True

    def update_data_input(self, user, appname, input_type, stanza_name, stanza):
        """
        @user: ACL user
        @appname: target app directory
        @input_type: if it is a script input, the input_type "script",
                     for modinput, say snow, the intput_type "snow"
        @stanza_name: name of the stanza to be updated
        @stanza: dict like object contains stanza info
        @return: True if success otherwise false
        Note: when updating, "name" should not be in stanza
        """

        assert "name" not in stanza

        uri = "{}/servicesNS/{}/{}/data/inputs/{}/{}".format(
            self.splunkd_uri, user, appname, input_type, stanza_name)
        msg = "Failed to update data input for {}, {}, {}".format(
            appname, input_type, stanza_name)
        content = self._do_request(uri, "POST", stanza, msg)
        if content is None:
            return False
        return True

    def disable_data_input(self, user, appname, input_type, stanza_name):
        """
        @user: ACL user
        @appname: target app directory
        @input_type: if it is a script input, the input_type "script",
                     for modinput, say snow, the intput_type "snow"
        @stanza_name: name of the stanza to be updated
        @return: True if success otherwise false
        """

        return self._disable_enable_data_input(
            user, appname, input_type, stanza_name, "disable")

    def enable_data_input(self, user, appname, input_type, stanza_name):
        """
        @user: ACL user
        @appname: target app directory
        @input_type: if it is a script input, the input_type "script",
                     for modinput, say snow, the intput_type "snow"
        @stanza_name: name of the stanza to be updated
        @return: True if success otherwise false
        """

        return self._disable_enable_data_input(
            user, appname, input_type, stanza_name, "enable")

    def _disable_enable_data_input(self, user, appname, input_type,
                                   stanza_name, disable_enable):
        uri = "{}/servicesNS/{}/{}/data/inputs/{}/{}/{}".format(
            self.splunkd_uri, user, appname, input_type,
            stanza_name, disable_enable)
        msg = "Failed to create data input for {}, {}, {}".format(
            appname, input_type, stanza_name)
        content = self._do_request(uri, "POST", None, msg)
        if content is None:
            return False
        return True

    def delete_data_input(self, user, appname, input_type, stanza_name):
        """
        @user: ACL user
        @appname: target app directory
        @input_type: if it is a script input, the input_type "script",
                     for modinput, say snow, the intput_type "snow"
        @stanza_name: name of the stanza to be deleted
        @return: True if success otherwise false
        """

        uri = "{}/servicesNS/{}/{}/data/inputs/{}/{}".format(
            self.splunkd_uri, user, appname, input_type, stanza_name)
        msg = "Failed to delete data input stanza for {}, {}, {}".format(
            appname, input_type, stanza_name)
        content = self._do_request(uri, "DELETE", None, msg)
        if content is None:
            return False
        return True

    def get_data_input(self, user, appname, input_type, stanza_name=None):
        """
        @user: ACL user
        @appname: target app directory
        @input_type: if it is a script input, the input_type "script",
                     for modinput, say snow, the intput_type "snow"
        @stanza_name: name of the stanza to be deleted
        @return: a list of dict objects, each is a stanza if success otherwise
                 None
        """

        if stanza_name:
            uri = "{}/servicesNS/{}/{}/data/inputs/{}/{}".format(
                self.splunkd_uri, user, appname, input_type, stanza_name)
        else:
            uri = "{}/servicesNS/{}/{}/data/inputs/{}?count=0&offset=0".format(
                self.splunkd_uri, user, appname, input_type)

        msg = "Failed to get data input stanza for {}, {}, {}".format(
            appname, input_type, stanza_name)
        content = self._do_request(uri, "GET", None, msg)
        if content is not None:
            return xdp.parse_conf_xml_dom(content)
        return None

    def _do_request(self, uri, method, payload, err_msg):
        resp, content = rest.splunkd_request(uri, self.session_key, method,
                                             data=payload, retry=3)
        if resp is None and content is None:
            return None

        if resp.status in (200, 201):
            return content
        else:
            _LOGGER.debug("%s, reason=%s", err_msg, resp.reason)
        return None
