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
import splunktalib.conf_manager.conf_manager as cm
from splunktalib import credentials


class OktaTATest(BaseTATest):
    # due to the pytest frame, we can not add __init__ function in this class
    # self.account_set is used to store the accounts which are created
    TA_APP_NAME = 'Splunk_TA_okta'
    TA_APP_USER = 'nobody'
    INPUT_NAME = 'okta'

    conf_mgr = None
    cred_mgr = None

    ckp_filepath = os.environ.get(
        'SPLUNK_HOME') + '/var/lib/splunk/modinputs/okta/'

    # Some hard coded vars for okta conf/passwd
    data_input_type = "okta"
    cred_encrypted_string = "********"
    cred_realm = TA_APP_NAME
    cred_input_prefix = '__Splunk_TA_okta_inputs_'
    cred_proxy_prefix = '__Splunk_TA_okta_proxy__'
    cred_server_prefix = '__Splunk_TA_okta_server__'

    @classmethod
    def setup_class(cls):

        super(OktaTATest, cls).setup_class()
        cls.logger.info("Starting setup methods...")
        cls.init_vars_from_pytest()
        cls.register_rest_api()
        cls.get_config_credential()
        cls.logger.info("Test Begins. TA build under test is %s",
                        OktaTATest.get_ta_build_number())
    @classmethod
    def teardown_class(cls):
        super(OktaTATest, cls).teardown_class()

    """ Test case wrapper for all OKTA TA TC """

    def setup_method(self, method):
        super(OktaTATest, self).setup_method(method)
        self.create_account()

    def teardown_method(self, method):
        super(OktaTATest, self).teardown_method(method)
        if hasattr(self, 'disable_list'):
            self.disable_data_input(self.disable_list)

    @classmethod
    def init_vars_from_pytest(cls):
        '''
        Init TA specific variables, mostly about account, inputs, etc.
        '''
        # Init okta vars
        pass

    @classmethod
    def register_rest_api(cls):
        '''
        Update REST API for OKTA TA
        '''
        rip.RESTInPeace.URIS.update({})
        cls.rest.change_namespace(cls.TA_APP_USER, cls.TA_APP_NAME)

    @classmethod
    def get_config_credential(cls):
        cls.conf_mgr = cm.ConfManager(cls.splunk_url, cls.session_key)
        cls.conf_mgr.set_appname(cls.TA_APP_NAME)
        cls.cred_mgr = credentials.CredentialManager(
            session_key=cls.session_key,
            splunkd_uri=cls.splunk_url,
            app=cls.TA_APP_NAME)

    def create_data_input(self, configs):
        """
        @param config = dict of inputs config to create
        example:
            config = {
                'stanza_name': 'testokta5',
                'batch_size': 10000,
                'interval': 3600,
                'metrics': 'event',
                'page_size': 1000,
                'token': '*****'
                'url': 'https://acme2-admin.okta.com',
            }
            self.create_data_input(config)
        """
        encrypted_key_values = {"token": configs['token']}
        configs['token'] = self.cred_encrypted_string
        stanza_name = configs.pop('stanza_name')
        self.logger.info("Create okta acccout with config %s", configs)
        self.conf_mgr.create_data_input(self.INPUT_NAME, stanza_name, configs)
        stanza_name = "".join((self.cred_input_prefix, stanza_name))
        self.logger.info("Create encrypted token  %s for data input %s",
                         encrypted_key_values, stanza_name)
        self.cred_mgr.update({stanza_name: encrypted_key_values})

    def get_data_input(self, stanza_name):
        return self.conf_mgr.get_data_input(self.INPUT_NAME, stanza_name)

    def enable_data_input(self, stanza_name):
        self.conf_mgr.enable_data_input(self.INPUT_NAME, stanza_name)

    def disable_data_input(self, stanza_name):
        self.conf_mgr.disable_data_input(self.INPUT_NAME, stanza_name)

    def update_data_input(self, configs):
        stanza_name = configs.pop('stanza_name')
        self.conf_mgr.update_data_input(self.INPUT_NAME, stanza_name, configs)

    def reload_data_input(self):
        self.conf_mgr.reload_data_input(self.INPUT_NAME)

    def create_account(self, configs=None):
        '''
        Create a okta account with config parsed in
        @param config: The dict of okta config
        '''
        pass

    def delete_account(self):
        pass

    def get_account(self):
        pass

    def update_custom_cmd(self, configs):
        """
        @parms = configs: dict of configs
        example:
            config = {
                'custom_cmd_enabled': 1,
                'okta_server_token': 'dummy',
                'okta_server_url': 'https://acme2-admin.okta.com'
            }
            self.update_custom_cmd(config)
        """
        encrypted_key_values = {'okta_server_url': configs['okta_server_url'],
                                'okta_server_token':
                                configs['okta_server_token']}
        for k in encrypted_key_values.keys():
            configs[k] = self.cred_encrypted_string
        stanza_name = 'okta_server'
        self.logger.info("Create okta acccout with config %s", configs)
        self.conf_mgr.update_stanza(self.INPUT_NAME, stanza_name, configs)
        self.logger.info("Create encrypted token  %s for data input %s",
                         encrypted_key_values, self.cred_server_prefix)
        self.cred_mgr.update({self.cred_server_prefix: encrypted_key_values})

    def disable_custom_cmd(self):
        stanza_name = 'okta_server'
        configs = {'custom_cmd_enabled': 0}
        self.conf_mgr.update_stanza(self.INPUT_NAME, stanza_name, configs)

    def enable_custom_cmd(self):
        stanza_name = 'okta_server'
        configs = {'custom_cmd_enabled': 1}
        self.conf_mgr.update_stanza(self.INPUT_NAME, stanza_name, configs)

    def update_logging(self, log_level):
        stanza_name = 'okta_loglevel'
        configs = {'loglevel': log_level.upper()}
        self.conf_mgr.update_stanza(self.INPUT_NAME, stanza_name, configs)

    def update_proxy(self, configs):
        """
        @param: configs
        example:
            config = {
                'proxy_enabled': 0,
                'proxy_password': 'password',
                'proxy_port': 3128,
                'proxy_url': '10.0.0.1',
                'proxy_username': 'username'
            }
            self.update_proxy(config)
        """
        encrypted_key_values = {'proxy_username': configs['proxy_username'],
                                'proxy_password': configs['proxy_password']}
        for k in encrypted_key_values.keys():
            configs[k] = self.cred_encrypted_string
        stanza_name = 'okta_proxy'
        self.logger.info("Create okta acccout with config %s", configs)
        self.conf_mgr.update_stanza(self.INPUT_NAME, stanza_name, configs)
        self.logger.info("Create encrypted token  %s for data input %s",
                         encrypted_key_values, self.cred_server_prefix)
        self.cred_mgr.update({self.cred_proxy_prefix: encrypted_key_values})

    def disable_proxy(self):
        stanza_name = 'okta_proxy'
        configs = {'proxy_enabled': 0}
        self.conf_mgr.update_stanza(self.INPUT_NAME, stanza_name, configs)

    def enable_proxy(self):
        stanza_name = 'okta_proxy'
        configs = {'proxy_enabled': 1}
        self.conf_mgr.update_stanza(self.INPUT_NAME, stanza_name, configs)

    #delete created data input
    def delete_data_input(self, name):
        self.logger.info("starting to create input %s", name)
        self.conf_mgr.delete_data_input(self.INPUT_NAME, name)
