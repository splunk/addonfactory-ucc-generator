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
import copy
import sys
import pytest
import splunktalib.conf_manager.conf_manager as cm
from splunktalib import credentials


class GCPTATest(BaseTATest):
    # due to the pytest frame, we can not add __init__ function in this class
    # self.account_set is used to store the accounts which are created
    TA_APP_NAME = 'Splunk_TA_google-cloudplatform'
    TA_APP_USER = 'nobody'

    DEFAULT_ACCOUNT = 'default-auto-gcp-account'
    DEFAULT_PROJECT = 'splunk-gcp'

    cred_encrypted_string = "********"
    input_cred_realm = '__REST_CREDENTIAL__#Splunk_TA_google-cloudplatform#configs/conf-google_credentials#'
    proxy_cred_realm = '__REST_CREDENTIAL__#Splunk_TA_google-cloudplatform#configs/conf-google_global_settings#proxy_settings'

    CRED_FILE = 'google_credentials'
    SETTING_FILE = 'google_global_settings'
    PROXY_STANZA = 'proxy_settings'
    LOGGING_STANZA = 'global_settings'

    conf_mgr = None
    cred_mgr = None

    DEFAULT_CRED = None

    @classmethod
    def setup_class(cls):
        super(GCPTATest, cls).setup_class()
        cls.logger.info("Starting setup methods...")
        cls.init_vars_from_pytest()
        cls.get_config_credential()
        cls.logger.info("Test Begins. TA build under test is %s",
                        cls.get_ta_build_number())

    @classmethod
    def teardown_class(cls):
        super(GCPTATest, cls).teardown_class()

    """ Test case wrapper for all GCP TA TC """

    def setup_method(self, method):
        super(GCPTATest, self).setup_method(method)
        self.update_rest_for_gcp_ta()
        self.rest.change_namespace(self.TA_APP_USER, self.TA_APP_NAME)
        self.create_account()

    def teardown_method(self, method):
        super(GCPTATest, self).teardown_method(method)
        if hasattr(self, 'disable_list'):
            self.disable_data_input(self.disable_list)

    def update_rest_for_gcp_ta(self):
        self.logger.info('update rest for gcp ta')
        rip.RESTInPeace.URIS.update({
            'ta_gcp_rest':
                '/servicesNS/{u}/{a}/splunk_ta_google',
            'input_billing':
                '/servicesNS/{u}/{a}/splunk_ta_google/google_inputs_billing',
            'input_monitoring':
                '/servicesNS/{u}/{a}/splunk_ta_google/google_inputs_monitoring',
            'input_pubsub':
                '/servicesNS/{u}/{a}/splunk_ta_google/google_inputs_pubsub',
            'proxy':
                '/servicesNS/{u}/{a}/splunk_ta_google/google_settings/proxy_settings',
            'credentials':
                '/servicesNS/{u}/{a}/splunk_ta_google/google_credentials'
        })

    @classmethod
    def get_default_cred(cls):
        cls.init_vars()
        return cls.DEFAULT_CRED

    @classmethod
    def init_vars(cls):
        if not cls.DEFAULT_CRED:
            cls.gcp_credential_json_file = os.getenv('gcp_credential_json')
            assert cls.gcp_credential_json_file, 'gcp_credential_json must be given'
            assert os.path.exists(cls.gcp_credential_json_file), 'gcp_credential_json does not exist in {}'.format(
                cls.gcp_credential_json_file)
            with open(cls.gcp_credential_json_file, 'r') as f:
                cls.DEFAULT_CRED = f.read()


    @classmethod
    def init_vars_from_pytest(cls):
        '''
        Init TA specific variables, mostly about account, inputs, etc.
        '''
        # Init gcp vars
        cls.init_vars()

    @classmethod
    def get_config_credential(cls):
        cls.conf_mgr = cm.ConfManager(cls.splunk_url, cls.session_key)
        cls.conf_mgr.set_appname(cls.TA_APP_NAME)

    def create_data_input(self, configs, input_type=None):
        """
        @param config = dict of inputs config to create
        @param input_type = google_cloud_monitor|google_pubsub
        example:
            config = {
                'stanza_name': 'test_name',
                'input_type': 'google_pubsub',
                'google_credentials_name': 'auto-cred',
                'google_project': 'splunk-gcp',
                'google_subscriptions': 'testsub',
                'index': 'default'
            }
            self.create_data_input(config, 'google_pubsub')
        """
        stanza_name = configs.pop('stanza_name')
        conf_name = input_type + '_inputs'
        self.conf_mgr.create_stanza(conf_name, stanza_name, configs)
        # self.conf_mgr.create_data_input(input_type, stanza_name, configs)

    def delete_date_input(self, stanza_name, input_type=None):
        conf_name = input_type + '_inputs'
        self.conf_mgr.delete_stanza(conf_name, stanza_name)

    def get_data_input(self, stanza_name, input_type=None):
        self.conf_mgr.get_data_input(input_type, stanza_name)

    def enable_data_input(self, stanza_name, input_type=None):
        self.conf_mgr.enable_data_input(input_type, stanza_name)

    def disable_data_input(self, stanza_name, input_type=None):
        self.conf_mgr.disable_data_input(input_type, stanza_name)

    def update_data_input(self, configs, input_type=None):
        stanza_name = configs.pop('stanza_name')
        self.conf_mgr.update_data_input(input_type, stanza_name, configs)

    def reload_data_input(self, input_type=None):
        self.conf_mgr.reload_data_input(input_type)

    def create_account(self, configs=None):
        '''
        Create a gcp account with config parsed in
        @param config: The dict of gcp config
        '''
        if configs is None:
            configs = {}
            configs['stanza_name'] = self.DEFAULT_ACCOUNT
            configs['google_credentials'] = self.get_default_cred()

        stanza_name = configs.pop('stanza_name')
        if self.conf_mgr.stanza_exist(self.CRED_FILE, stanza_name):
            self.logger.info("gcp account already exist")
            return

        encrypted_key_values = {"google_credentials": configs['google_credentials']}
        configs['google_credentials'] = self.cred_encrypted_string

        self.logger.info("Create gcp acccout with config %s", configs)
        try:
            self.conf_mgr.create_stanza(self.CRED_FILE, stanza_name, configs)
        except Exception:
            self.conf_mgr.update_stanza(self.CRED_FILE, stanza_name, configs)

        self.logger.info("Create encrypted token  %s for data input %s",
                         encrypted_key_values, stanza_name)
        self.cred_mgr = credentials.CredentialManager(
            session_key=self.session_key,
            splunkd_uri=self.splunk_url,
            app=self.TA_APP_NAME,
            realm=self.input_cred_realm + stanza_name)
        self.cred_mgr.update({'username': encrypted_key_values})

    def delete_account(self):
        pass

    def get_account(self):
        pass

    def update_logging(self, log_level):
        configs = {'log_level': log_level.upper()}
        self.conf_mgr.update_stanza(self.SETTING_FILE, self.LOGGING_STANZA,
                                    configs)

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
        encrypted_key_values = {}
        for key in ('proxy_password',):
            if key in configs:
                encrypted_key_values[key] = configs[key]
                configs[key] = self.cred_encrypted_string

        self.logger.info("Create gcp acccout with config %s", configs)
        self.conf_mgr.update_stanza(self.SETTING_FILE, self.PROXY_STANZA,
                                    configs)
        self.cred_mgr = credentials.CredentialManager(
            session_key=self.session_key,
            splunkd_uri=self.splunk_url,
            app=self.TA_APP_NAME,
            realm=self.proxy_cred_realm)
        if encrypted_key_values:
            self.cred_mgr.update({'username': encrypted_key_values})

    def disable_proxy(self):
        configs = {'proxy_enabled': 0}
        self.conf_mgr.update_stanza(self.SETTING_FILE, self.PROXY_STANZA,
                                    configs)

    def enable_proxy(self):
        configs = {'proxy_enabled': 1}
        self.conf_mgr.update_stanza(self.SETTING_FILE, self.PROXY_STANZA,
                                    configs)
