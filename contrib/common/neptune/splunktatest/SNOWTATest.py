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


class SNOWTATest(BaseTATest):
    # due to the pytest frame, we can not add __init__ function in this class
    # self.account_set is used to store the accounts which are created
    TA_APP_NAME = 'Splunk_TA_snow'
    TA_APP_USER = 'nobody'

    conf_mgr = None
    cred_mgr = None

    ckp_filepath = os.environ.get(
        'SPLUNK_HOME') + '/var/lib/splunk/modinputs/snow/'

    @classmethod
    def setup_class(cls):
        super(SNOWTATest, cls).setup_class()
        cls.logger.info("Starting setup methods...")
        cls.init_vars_from_pytest()
        cls.register_rest_api()
        cls.get_config_credential()
        cls.logger.info("Test Begins. TA build under test is %s",
                        SNOWTATest.get_ta_build_number())
        cls.create_account()

    @classmethod
    def teardown_class(cls):
        super(SNOWTATest, cls).teardown_class()

    """ Test case wrapper for all SNOW TA TC """

    def setup_method(self, method):
        super(SNOWTATest, self).setup_method(method)

    def teardown_method(self, method):
        super(SNOWTATest, self).teardown_method(method)
        if hasattr(self, 'disable_list'):
            self.disable_data_input(self.disable_list)
        if hasattr(self, 'delete_input_name'):
            self.delete_data_input(self.delete_input_name)

    @classmethod
    def init_vars_from_pytest(cls):
        """
        Init TA specific variables, mostly about account, inputs, etc.
        """
        # Init snow vars
        cls.SNOW_HOST = pytest.config.getoption('snow_host')
        cls.SNOW_USER = pytest.config.getoption('snow_user')
        cls.SNOW_PASS = pytest.config.getoption('snow_pass')
        cls.SNOW_RELEASE = pytest.config.getoption('snow_release')

    @classmethod
    def register_rest_api(cls):
        """
        Update REST API for SNOW TA
        """
        rip.RESTInPeace.URIS.update({})
        cls.rest.change_namespace(cls.TA_APP_USER, cls.TA_APP_NAME)

    def create_data_input(self, name, key_values=None):
        self.logger.info("starting to create input %s", name)
        self.conf_mgr.create_data_input('snow', name, key_values)

    def delete_data_input(self, name):
        self.logger.info("starting to create input %s", name)
        self.conf_mgr.delete_data_input('snow', name)

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

    @classmethod
    def create_account(cls, configs=None):
        """
        Create a snow account with config parsed in
        @param configs: The dict of snow config
        """
        # conf_mgr = cm.ConfManager(self.splunk_url, self.session_key)
        # conf_mgr.set_appname(self.TA_APP_NAME)-
        if configs is None:
            configs = {
                'url': cls.SNOW_HOST,
                'username': cls.SNOW_USER,
                'password': cls.SNOW_PASS,
                'release': cls.SNOW_RELEASE
            }
        userpass = {'dummy': {configs['username']: configs['password']}}
        # Override the username and password to <encrypted>
        configs['username'] = "<encrypted>"
        configs['password'] = "<encrypted>"
        mgr = credentials.CredentialManager(cls.splunk_url,
                                            cls.session_key,
                                            realm=configs['url'],
                                            app=cls.TA_APP_NAME,
                                            sep="``")
        mgr.update(userpass)

        cls.logger.info("Create snow acccout with config %s", configs)
        result = cls.conf_mgr.get_stanza('service_now', 'snow_account')
        cls.logger.info("get result is %s", result)
        cls.conf_mgr.update_stanza('service_now', 'snow_account', configs)

    def delete_account(self):
        pass

    def get_account(self):
        pass

    def enable_data_input(self, inputs=None):
        """
        Enable a snow data input
        @param inputs: inputs name list
        """

        def _enable_input(input_name):
            self.logger.info("start to enable data input %s", input_name)
            self.conf_mgr.enable_data_input('snow', input_name)

        if inputs is None:
            stanza_list = self.conf_mgr.get_data_input('snow')
            inputs = [s['name'] for s in stanza_list]

        if isinstance(inputs, basestring):
            _enable_input(inputs)
        else:
            for name in inputs:
                _enable_input(name)

    def disable_data_input(self, inputs=None):
        """
        Disable a snow data input
        @param inputs: inputs name list
        """

        def _disable_input(input_name):
            self.logger.info("starting to disable input %s", input_name)
            self.conf_mgr.disable_data_input('snow', input_name)

        if inputs is None:
            stanza_list = self.conf_mgr.get_data_input('snow')
            inputs = [s['name'] for s in stanza_list]

        if isinstance(inputs, basestring):
            _disable_input(inputs)
        else:
            for name in inputs:
                _disable_input(name)

    def reload_data_input(self):
        self.conf_mgr.reload_data_input('snow')

    def update_data_input(self, name, key_values):
        self.conf_mgr.update_data_input('snow', name, key_values)

    def update_proxy(self, proxy_enabled=0, proxy_url='', proxy_port='', proxy_username='', proxy_password='',
                     dns_resolution=0, proxy_type='http'):
        payload = {
            'proxy_enabled': proxy_enabled,
            'proxy_url': proxy_url,
            'proxy_port': proxy_port,
            'proxy_username': proxy_username,
            'proxy_password': proxy_password,
            'dns_resolution': dns_resolution,
            'proxy_type': proxy_type
        }
        self.edit_setup(payload)

    def edit_setup(self, payload):
        from splunktalib.conf_manager.request import content_request
        endpoint = "{}/servicesNS/nobody/Splunk_TA_snow/service_now_setup/snow_proxy/snow_proxy".format(
            self.splunk_url)
        content_request(endpoint, self.session_key, "POST", payload, "Error")

    def _get_ckp_file(self, input_name, timefield):
        ckp_file_name = '{}.{}'.format(input_name, timefield)
        ckp_file = self.ckp_filepath + ckp_file_name
        return ckp_file

    def remove_checkpoint(self, input_name, timefield):
        ckp_file = self._get_ckp_file(input_name, timefield)
        if os.path.exists(ckp_file):
            os.remove(ckp_file)
            self.logger.info('remove check point file success {}'.format(ckp_file))
        else:
            self.logger.warn('check point file does not exist {}'.format(ckp_file))

    def get_checkpoint(self, input_name, timefield):
        ckp_file = self._get_ckp_file(input_name, timefield)
        if not os.path.exists(ckp_file):
            self.logger.warn('check point does not exist {}'.format(ckp_file))
            return None
        with open(ckp_file) as f:
            data = json.load(f)
            return data
