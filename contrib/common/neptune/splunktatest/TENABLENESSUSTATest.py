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


class TENABLENESSUSTATest(BaseTATest):
    # due to the pytest frame, we can not add __init__ function in this class
    # self.account_set is used to store the accounts which are created
    TA_APP_NAME = 'Splunk_TA_nessus'
    TA_APP_USER = 'nobody'
    DEFAULT_START_DATE = '2009/01/01'
    DEFAULT_INTERVAL = '120'
    DEFAULT_INDEX = 'main'
    DEFAULT_BATCHSIZE = '10000'
    encrypted_string = '********'
    # # Default info for Plugin data
    DEFAULT_PLUGIN_NAME = 'test_plugin_auto_0'
    #DEFAULT_PLUGIN_CHECKPOINT_NAME = ''
    # # Default info for Scan data
    DEFAULT_SCAN_NAME = 'test_scan_auto_0'
    #DEFAULT_SCAN_CHECKPOINT_NAME = 'nessus_scan_{}.ckpt'.format(DEFAULT_SCAN_NAME)


    conf_mgr = None
    cred_mgr = None

    ckp_filepath_nessus = os.environ.get(
        'SPLUNK_HOME') + '/var/lib/splunk/modinputs/nessus/'

    @classmethod
    def setup_class(cls):
        super(TENABLENESSUSTATest, cls).setup_class()
        cls.logger.info("Starting setup methods...")
        cls.init_vars_from_pytest()
        cls.register_rest_api()
        cls.get_config_credential()
        cls.logger.info("Test Begins. TA build under test is %s",
                        TENABLENESSUSTATest.get_ta_build_number())
        #cls.create_nessus_plugin_input()
        #cls.enable_data_input('test_plugin_auto_0')

    @classmethod
    def teardown_class(cls):
        super(TENABLENESSUSTATest, cls).teardown_class()
        #name = cls.reload_data_input(None)
        #cls.logger.info("closir input: %s",name)


    """ Test case wrapper for all Nessus TA TC """

    def setup_method(self, method):
        super(TENABLENESSUSTATest, self).setup_method(method)

    def teardown_method(self, method):
        super(TENABLENESSUSTATest, self).teardown_method(method)
        if hasattr(self, 'disable_list'):
            self.disable_data_input(self.disable_list)
        if hasattr(self, 'delete_input_name'):
            self.delete_data_input(self.delete_input_name)

    @classmethod
    def init_vars_from_pytest(cls):
        """
        Init TA specific variables, mostly about account, inputs, etc.
        """
        # Init vars for Nessus 6.x

        cls.NESSUS_URL = pytest.config.getoption('nessus_url')
        cls.ACCESS_KEY = pytest.config.getoption('access_key')
        cls.SECRET_KEY = pytest.config.getoption('secret_key')


    @classmethod
    def register_rest_api(cls):
        """
        Update REST API for SNOW TA
        """
        rip.RESTInPeace.URIS.update({})
        cls.rest.change_namespace(cls.TA_APP_USER, cls.TA_APP_NAME)

    def delete_date_input(self, stanza_name, input_type=None):
        conf_name = input_type + '_inputs'
        self.conf_mgr.delete_stanza(conf_name, stanza_name)

    def get_data_input(self, stanza_name, input_type=None):
        if input_type is None:
            input_type = 'nessus'
        self.conf_mgr.get_data_input(input_type, stanza_name)

    def enable_data_input(self, stanza_name, input_type=None):
        if input_type is None:
            input_type = 'nessus'
        self.conf_mgr.enable_data_input(input_type, stanza_name)

    def disable_data_input(self, stanza_name, input_type=None):
        if input_type is None:
            input_type = 'nessus'
        self.conf_mgr.disable_data_input(input_type, stanza_name)

    def update_data_input(self, configs, input_type=None):
        stanza_name = configs.pop('stanza_name')
        self.conf_mgr.update_data_input(input_type, stanza_name, configs)

    def reload_data_input(self, input_type=None):
        self.conf_mgr.reload_data_input(input_type)

    @classmethod
    def disable_nessus_input(cls,input_name):
        cls.conf_mgr.disable_data_input('nessus',input_name)

    @classmethod
    def delete_nessus_input(cls,input_name):
        cls.conf_mgr.delete_data_input('nessus', input_name)


    @classmethod
    def get_config_credential(cls):
        cls.conf_mgr = cm(cls.splunk_url, cls.session_key)
        cls.conf_mgr.set_appname(cls.TA_APP_NAME)

    @classmethod
    def enable_nessus_input(cls,stanza_name):
        cls.conf_mgr.enable_data_input('nessus', stanza_name)


    @classmethod
    def create_nessus_plugin_input(cls, input_name = None,configs=None):
        """
        Create a snow account with config parsed in
        @param configs: The dict of snow config
        """
        # conf_mgr = cm.ConfManager(self.splunk_url, self.session_key)
        # conf_mgr.set_appname(self.TA_APP_NAME)-

        plugin_matrix = 'nessus_plugin'
        if input_name is None:
            input_name = cls.DEFAULT_PLUGIN_NAME
        stanza_name = "nessus://{}".format(input_name)
        if configs is None:
            configs = {
                'url': cls.NESSUS_URL,
                'access_key': cls.ACCESS_KEY,
                'secret_key': cls.SECRET_KEY,
                'metric': plugin_matrix,
                'start_date': cls.DEFAULT_START_DATE
            }
        dummy = "__Splunk_TA_nessus_inputs_{}".format(input_name)
        #userpass = {dummy: {configs['access_key']: configs['secret_key']}}
        userpass = {dummy: {'access_key':configs['access_key'],'secret_key':configs['secret_key']}}
        # Override the username and password to <encrypted>
        configs['access_key'] = cls.encrypted_string
        configs['secret_key'] = cls.encrypted_string
        mgr = credentials.CredentialManager(cls.splunk_url,
                                            cls.session_key,
                                            realm=cls.TA_APP_NAME,
                                            app=cls.TA_APP_NAME,
                                            owner = cls.TA_APP_USER
                                            )
        mgr.update(userpass)
        cls.logger.info("Create nessus plugin input with config %s", configs)
        #result = cls.conf_mgr.get_stanza('inputs', 'unique_input_name')
        try:
            result = cls.conf_mgr.create_stanza('inputs', stanza_name, configs)
        except Exception:
            result = cls.conf_mgr.update_stanza('inputs',stanza_name, configs)

        cls.logger.info("get result is %s", result)
        cls.enable_nessus_input(input_name)

    @classmethod
    def create_nessus_scan_input(cls, input_name = None,configs=None):
        """
        Create a snow account with config parsed in
        @param configs: The dict of snow config
        """
        # conf_mgr = cm.ConfManager(self.splunk_url, self.session_key)
        # conf_mgr.set_appname(self.TA_APP_NAME)-

        scan_matrix = 'nessus_scan'
        if input_name is None:
            input_name = cls.DEFAULT_SCAN_NAME
        stanza_name = "nessus://{}".format(input_name)
        if configs is None:
            configs = {
                'url': cls.NESSUS_URL,
                'access_key': cls.ACCESS_KEY,
                'secret_key': cls.SECRET_KEY,
                'metric': scan_matrix,
                'start_date': cls.DEFAULT_START_DATE
            }
        dummy = "__Splunk_TA_nessus_inputs_{}".format(input_name)
        #userpass = {dummy: {configs['access_key']: configs['secret_key']}}
        userpass = {dummy: {'access_key':configs['access_key'],'secret_key':configs['secret_key']}}
        # Override the username and password to <encrypted>
        configs['access_key'] = cls.encrypted_string
        configs['secret_key'] = cls.encrypted_string
        mgr = credentials.CredentialManager(cls.splunk_url,
                                            cls.session_key,
                                            realm=cls.TA_APP_NAME,
                                            app=cls.TA_APP_NAME,
                                            owner = cls.TA_APP_USER
                                            )
        mgr.update(userpass)
        cls.logger.info("Create nessus plugin input with config %s", configs)
        #result = cls.conf_mgr.get_stanza('inputs', 'unique_input_name')
        try:
            result = cls.conf_mgr.create_stanza('inputs', stanza_name, configs)
        except Exception:
            result = cls.conf_mgr.update_stanza('inputs',stanza_name, configs)

        cls.logger.info("get result is %s", result)
        cls.enable_nessus_input(input_name)

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
        self.edit_setup(endpoint, payload)

    def edit_setup(self, endpoint, payload):
        from splunktalib.conf_manager.request import content_request
        content_request(endpoint, self.session_key, "POST", payload, "Error")

    def check_checkpoint_exists(cls, data_type,input_name=None):
        checkpoint_name = 'unknown'
        if data_type is "nessus_scan":
            if input_name is None:
                input_name = cls.DEFAULT_SCAN_NAME
            checkpoint_name = 'nessus_scan_{}.ckpt'.format(input_name)
        elif data_type is 'nessus_plugin':
            if input_name is None:
                input_name = cls.DEFAULT_PLUGIN_NAME
            #checkpoint_name = 'nessus_plugin_{}_https_10_66_128_246_8834.ckpt.ckpt'.format(input_name)
            checkpoint_name = 'nessus_plugin_{}_https_ta_nessus_vendor_env_8834.ckpt'.format(input_name)
        else:
            cls.logger.error("invalid data type %s",data_type)

        ckp_file = cls.ckp_filepath_nessus + checkpoint_name
        if not os.path.exists(ckp_file):
            cls.logger.warn('check point does not exist {}'.format(ckp_file))
            return None
        with open(ckp_file) as f:
            data = json.load(f)
            return data




