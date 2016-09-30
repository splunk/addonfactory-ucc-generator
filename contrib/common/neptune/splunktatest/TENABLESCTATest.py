#!/usr/bin/python
# vim: set fileencoding=utf-8 :
"""
Meta
====
    $Id$  # nopep8
    $DateTime$
    $Author$
    $Change$
"""

from .BaseTATest import BaseTATest
import ConfigParser
import json
import os
import time
import random
import string
from helmut.util import rip
import sys
import pytest
from splunktalib.conf_manager.conf_manager import ConfManager as cm
from splunktalib import credentials
#from solnlib import time_parser


class TENABLESCTATest(BaseTATest):
    # due to the pytest frame, we can not add __init__ function in this class
    # self.account_set is used to store the accounts which are created
    TA_APP_NAME = 'Splunk_TA_nessus'
    TA_APP_USER = 'nobody'

    conf_mgr = None
    cred_mgr = None

    ckp_filepath_tenable_sc = os.environ.get(
        'SPLUNK_HOME') + '/var/lib/splunk/modinputs/tenable_sc/'

    @classmethod
    def setup_class(cls):
        super(TENABLESCTATest, cls).setup_class()
        cls.logger.info("Starting setup methods...")
        cls.init_vars_from_pytest()
        cls.register_rest_api()
        cls.get_config_credential()
        cls.logger.info("Test Begins. TA build under test is %s",
                        TENABLESCTATest.get_ta_build_number())
        cls.create_sc_server()

    @classmethod
    def teardown_class(cls):
        super(TENABLESCTATest, cls).teardown_class()
        cls.delete_sc_server()

    """ Test case wrapper for all Nessus TA TC """

    def setup_method(self, method):
        super(TENABLESCTATest, self).setup_method(method)

    def teardown_method(self, method):
        super(TENABLESCTATest, self).teardown_method(method)
        if hasattr(self, 'disable_list'):
            self.disable_data_input(self.disable_list)
        if hasattr(self, 'delete_input_name'):
            self.delete_data_input(self.delete_input_name)

    @classmethod
    def init_vars_from_pytest(cls):
        """
        Init TA specific variables, mostly about account, inputs, etc.
        """
        # Init vars for Security Center server
        cls.SC_URL = pytest.config.getoption('sc_url')
        cls.SC_USERNAME = pytest.config.getoption('sc_username')
        cls.SC_PASSWORD = pytest.config.getoption('sc_password')


    @classmethod
    def register_rest_api(cls):
        """
        Update REST API for SNOW TA
        """
        rip.RESTInPeace.URIS.update({})
        cls.rest.change_namespace(cls.TA_APP_USER, cls.TA_APP_NAME)

    def create_data_input(self, name, key_values=None):
        self.logger.info("starting to create input %s", name)
        self.conf_mgr.create_data_input('ta_tenable', name, key_values)

    def delete_data_input(self, name):
        self.logger.info("starting to create input %s", name)
        self.conf_mgr.delete_data_input('ta_tenable', name)

    def get_data_input(self, service, stanza_name, method='rest'):
        calling_method = getattr(self.rest, 'get_inputs_' + service)
        response, content = calling_method(stanza_name, **{'output_mode': 'json'})
        if response.status in (200, 201):
            for ret in json.loads(content)['entry']:
                ret['content'].update({u'name': ret['name']})
                return ret['content']
        else:
            return {}

    @classmethod
    def get_config_credential(cls):
        cls.conf_mgr = cm(cls.splunk_url, cls.session_key)
        cls.conf_mgr.set_appname(cls.TA_APP_NAME)


    # def create_nessus_account(cls, configs=None):
    #     """
    #     Create a nessus account with config parsed in
    #     @param configs: The dict of nessus config
    #     """
    #     # conf_mgr = cm.ConfManager(self.splunk_url, self.session_key)
    #     # conf_mgr.set_appname(self.TA_APP_NAME)-
    #     if configs is None:
    #         configs = {
    #             'url': cls.NESSUS_URL,
    #             'access_key': cls.NESSUS_AK,
    #             'secret_key': cls.NESSUS_SK,
    #             'metric': cls.NESSUS_MATRIX
    #         }
    #     userpass = {'dummy': {configs['access_key']: configs['secret_key']}}
    #     # Override the username and password to <encrypted>
    #     configs['access_key'] = "<encrypted>"
    #     configs['secret_key'] = "<encrypted>"
    #     mgr = credentials.CredentialManager(cls.splunk_url,
    #                                         cls.session_key,
    #                                         realm=configs['url'],
    #                                         app=cls.TA_APP_NAME,
    #                                         sep="``")
    #     mgr.update(userpass)
    #
    #     cls.logger.info("Create nessus acccout with config %s", configs)
    #     result = cls.conf_mgr.get_stanza('service_now', 'snow_account')
    #     cls.logger.info("get result is %s", result)
    #     cls.conf_mgr.update_stanza('service_now', 'snow_account', configs)
    #
    @classmethod
    def create_sc_server(cls, sc_server_name = None, configs=None):
        """
        Create a sc account with config parsed in
        @param configs: The dict of sc config
        """
        # conf_mgr = cm.ConfManager(self.splunk_url, self.session_key)
        # conf_mgr.set_appname(self.TA_APP_NAME)-
        if configs is None:
            configs = {
                'url': cls.SC_URL,
                'username': cls.SC_USERNAME,
                'password': cls.SC_PASSWORD,
            }

        if sc_server_name is None:
            sc_server_name = "test_sc_server_0"
        # userpass = {'dummy': {configs['access_key']: configs['secret_key']}}
        # # Override the username and password to <encrypted>
        # configs['password'] = "<encrypted>"
        # mgr = credentials.CredentialManager(cls.splunk_url,
        #                                     cls.session_key,
        #                                     realm=configs['url'],
        #                                     app=cls.TA_APP_NAME,
        #                                     sep="``")
        # mgr.update(userpass)

        cls.logger.info("Create Security Center server with config %s", configs)
        result = cls.conf_mgr.create_stanza('tenable_sc_servers',sc_server_name, configs)
        cls.logger.info("get result is %s", result)
        #cls.conf_mgr.update_stanza('service_now', 'snow_account', configs)

    def get_sc_server_credential(cls):

        cls.logger.info("Get Security Center server Credential")
        result = cls.conf_mgr.all_stanzas_as_dicts('tenable_sc_servers')
        passwords = []
        for key in result:
            value = result[key]
            cls.logger.info('Item %s',value)
            passwords.append(value['password'])

        cls.logger.info('Credential %s',passwords)
        return passwords

    @classmethod
    def delete_sc_server(cls, sc_server_name=None):
        if sc_server_name is None:
            sc_server_name = "test_sc_server_0"
        cls.conf_mgr.reload_conf('tenable_sc_servers')
        cls.conf_mgr.delete_stanza('tenable_sc_servers', sc_server_name)


    def create_sc_input(cls,input_name,configs):
        """
        Create a snow account with config parsed in
        @param configs: The dict of snow config
        """
        # conf_mgr = cm.ConfManager(self.splunk_url, self.session_key)
        # conf_mgr.set_appname(self.TA_APP_NAME)-

        cls.logger.info("Create sc input with config %s", configs)
        result = cls.conf_mgr.create_stanza('tenable_sc_inputs',input_name,configs)
        cls.logger.info("get result is %s", result)

    #def disable_sc_input(cls,input_name, configs):

    def disable_sc_inputs(cls, input_name):
        key_values = {'disabled':1}
        cls.conf_mgr.reload_conf('tenable_sc_inputs')
        cls.conf_mgr.update_properties('tenable_sc_inputs', input_name, key_values)

    def enable_sc_inputs(cls, input_name):
        key_values = {'enabled':1}
        cls.conf_mgr.reload_conf('tenable_sc_inputs')
        cls.conf_mgr.update_properties('tenable_sc_inputs', input_name, key_values)

    def update_sc_inputs(cls, input_name, key_values):
        cls.conf_mgr.reload_conf('tenable_sc_inputs')
        cls.conf_mgr.update_properties('tenable_sc_inputs', input_name, key_values)

    def delete_sc_inputs(cls, input_name):
        cls.conf_mgr.reload_conf('tenable_sc_inputs')
        cls.conf_mgr.delete_stanza('tenable_sc_inputs',input_name)

    def reload_data_input(self):
        self.conf_mgr.reload_data_input('tenable_sc_inputs')

    def update_data_input(self, name, key_values):
        self.conf_mgr.update_data_input('tenable_sc_inputs', name, key_values)

    def create_index(self, name=''):
        payload = {
            'name': name
        }
        self.rest.create_index(**payload)

    def delete_index(self, name=''):
        payload = {
            'name': name
        }
        self.rest.delete_index(payload['name'])

    def update_proxy(self, proxy_enabled=0, proxy_url='', proxy_port='', proxy_username='', proxy_password='',
                     proxy_rdns=0, proxy_type='http'):
        payload = {
            'proxy_enabled': proxy_enabled,
            'proxy_url': proxy_url,
            'proxy_port': proxy_port,
            'proxy_username': proxy_username,
            'proxy_password': proxy_password,
            'proxy_rdns': proxy_rdns,
            'proxy_type': proxy_type
        }
        endpoint = "{}/servicesNS/nobody/Splunk_TA_nessus/ta_tenable/ta_tenable_settings/nessus_proxy".format(self.splunk_url)
        self.edit_setup(payload, endpoint)

    def update_loglevel(self, extra_payload=None):
        # there must be a 'loglevel' in payload, or nothing will be updated
        payload = {
            'loglevel': 'WRAN'
        }
        if extra_payload:
            payload.update(extra_payload)
        endpoint = "{}/servicesNS/nobody/Splunk_TA_nessus/ta_tenable/ta_tenable_settings/nessus_loglevel".format(self.splunk_url)
        self.edit_setup(payload, endpoint)

    def edit_setup(self, payload, endpoint):
        from splunktalib.conf_manager.request import content_request
        content_request(endpoint, self.session_key, "POST", payload, "Error")

    # def remove_sc_checkpoint(self, checkpoint_name):
    #     ckp_file = self.ckp_filepath_tenable_sc + checkpoint_name
    #     if os.path.exists(ckp_file):
    #         return True
    #     else:
    #         return False

    def check_checkpoint_exists(self, checkpint_name):
        ckp_file = self.ckp_filepath_tenable_sc + checkpint_name
        if not os.path.exists(ckp_file):
            self.logger.warn('check point does not exist {}'.format(ckp_file))
            return None
        with open(ckp_file) as f:
            data = json.load(f)
            return data







