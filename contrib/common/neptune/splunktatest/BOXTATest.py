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


class BOXTATest(BaseTATest):
    # due to the pytest frame, we can not add __init__ function in this class
    # self.account_set is used to store the accounts which are created
    TA_APP_NAME = 'Splunk_TA_box'
    TA_APP_USER = 'nobody'
    INPUT_NAME = 'box_service'

    conf_mgr = None
    cred_mgr = None

    ckp_filepath = os.environ.get(
        'SPLUNK_HOME') + '/var/lib/splunk/modinputs/box_service/'

    @classmethod
    def setup_class(cls):
        super(BOXTATest, cls).setup_class()
        cls.logger.info("Starting setup methods...")
        cls.init_vars_from_pytest()
        cls.register_rest_api()
        cls.get_config_credential()
        cls.logger.info("Test Begins. TA build under test is %s",
                        BOXTATest.get_ta_build_number())
        cls.create_account()

    @classmethod
    def teardown_class(cls):
        super(BOXTATest, cls).teardown_class()
        cls.save_token()

    """ Test case wrapper for all BOX TA TC """

    def setup_method(self, method):
        super(BOXTATest, self).setup_method(method)

    def teardown_method(self, method):
        super(BOXTATest, self).teardown_method(method)
        if hasattr(self, 'disable_list'):
            self.disable_data_input(self.disable_list)
        if hasattr(self, 'clean_up'):
            self.clean_up()
        self.__class__.update_token()

    @classmethod
    def save_token(cls):
        cls.update_token()
        with open(cls.box_token_file, 'w') as f:
            f.write('\n'.join([cls.ACCESS_TOKEN, cls.REFRESH_TOKEN]))
        cls.logger.info('access_token: {} refresh_token: {}'.format(cls.ACCESS_TOKEN, cls.REFRESH_TOKEN))

    @classmethod
    def update_token(cls):
        config = cls.conf_mgr.get_stanza('box', 'box_account')
        if config["access_token"] == '<encrypted>':
            cls.logger.debug('token in conf_manager is encrypted, try to get token from CredentialManager')
            mgr = credentials.CredentialManager(cls.splunk_url,
                                                cls.session_key,
                                                realm='https://api.box.com/2.0',
                                                app=cls.TA_APP_NAME,
                                                sep="``")
            token = mgr.get_clear_password('dummy').values()[0]
            cls.ACCESS_TOKEN = token.values()[0]
            cls.REFRESH_TOKEN = token.keys()[0]
        else:
            cls.logger.debug('token in conf_manager is clear, try to get token from conf_manager')
            cls.ACCESS_TOKEN = config["access_token"]
            cls.REFRESH_TOKEN = config["refresh_token"]

    @classmethod
    def init_vars_from_pytest(cls):
        """
        Init TA specific variables, mostly about account, inputs, etc.
        """
        # Init box vars
        cls.CLIENT_ID = pytest.config.getoption('--client_id')
        cls.CLIENT_SECRET = pytest.config.getoption('--client_secret')
        cls.box_token_file = os.getenv('box_token_file')
        assert cls.box_token_file, '--box_token_file must be given'
        assert os.path.exists(cls.box_token_file), 'box_token_file does not exist in {}'.format(cls.box_token_file)
        with open(cls.box_token_file, 'r') as f:
            line = f.readlines()
            cls.ACCESS_TOKEN = line[0].strip()
            cls.REFRESH_TOKEN = line[1].strip()

    @classmethod
    def register_rest_api(cls):
        """
        Update REST API for BOX TA
        """
        rip.RESTInPeace.URIS.update({})
        cls.rest.change_namespace(cls.TA_APP_USER, cls.TA_APP_NAME)

    def get_data_input(self, service, stanza_name, method='rest'):
        calling_method = getattr(self.rest, 'get_inputs_' + service)
        response, content = calling_method(stanza_name, **{'output_mode':
                                                               'json'})
        if response.status in (200, 201):
            for ret in json.loads(content)['entry']:
                ret['content'].update({u'name': ret['name']})
                return ret['content']
        else:
            return {}

    @classmethod
    def get_config_credential(cls):
        cls.conf_mgr = cm.ConfManager(cls.splunk_url, cls.session_key)
        cls.conf_mgr.set_appname(cls.TA_APP_NAME)

    @classmethod
    def create_account(cls, configs=None):
        """
        Create a box account with config parsed in
        @param configs: The dict of box config
        """
        # conf_mgr = cm.ConfManager(self.splunk_url, self.session_key)
        # conf_mgr.set_appname(self.TA_APP_NAME)-
        if configs is None:
            configs = {
                'client_id': cls.CLIENT_ID,
                'client_secret': cls.CLIENT_SECRET,
                'access_token': cls.ACCESS_TOKEN,
                'refresh_token': cls.REFRESH_TOKEN
            }
        # Update client id and secret
        userpass = {'dummy': {configs['client_id']: configs['client_secret']}}
        mgr = credentials.CredentialManager(cls.splunk_url,
                                            cls.session_key,
                                            realm='https://api.box.com',
                                            app=cls.TA_APP_NAME,
                                            sep="``")
        mgr.update(userpass)
        # Update access token and refresh token
        userpass = {'dummy': {configs['refresh_token']:
                                  configs['access_token']}}
        mgr = credentials.CredentialManager(cls.splunk_url,
                                            cls.session_key,
                                            realm='https://api.box.com/2.0',
                                            app=cls.TA_APP_NAME,
                                            sep="``")
        mgr.update(userpass)
        # Override the username and passwored to <encrypted>

        # Override configs to '<encrypted> and save to config
        for key in configs.keys():
            configs[key] = '<encrypted>'

        cls.logger.info("Create box acccout with config %s", configs)
        cls.conf_mgr.update_stanza('box', 'box_account', configs)

    def delete_account(self):
        pass

    def get_account(self):
        pass

    def enable_data_input(self, inputs=None):
        """
        Enable a box data input
        @param inputs: inputs name list
        """

        def _enable_input(input_name):
            self.logger.info("start to enable data input %s", input_name)
            self.conf_mgr.enable_data_input(self.INPUT_NAME, input_name)

        if inputs is None:
            stanza_list = self.conf_mgr.get_data_input(self.INPUT_NAME)
            inputs = [s['name'] for s in stanza_list]
        if isinstance(inputs, basestring):
            _enable_input(inputs)
        else:
            for name in inputs:
                _enable_input(name)

    def disable_data_input(self, inputs=None):
        """
        Disable a box data input
        @param inputs: inputs name list
        """

        def _disable_input(input_name):
            self.logger.info("starting to disable input %s", input_name)
            self.conf_mgr.disable_data_input(self.INPUT_NAME, input_name)

        if inputs is None:
            stanza_list = self.conf_mgr.get_data_input(self.INPUT_NAME)
            inputs = [s['name'] for s in stanza_list]
        if isinstance(inputs, basestring):
            _disable_input(inputs)
        else:
            for name in inputs:
                _disable_input(name)

    def update_data_input(self, name, key_values):
        """
        @param name: data input name
        @param key_values: K-V dict of configs in stanza
        """
        self.conf_mgr.update_data_input(self.INPUT_NAME, name, key_values)

    def reload_data_input(self):
        self.conf_mgr.reload_data_input(self.INPUT_NAME)

    def update_created_after(self, change_time):
        created_after = change_time.isoformat()
        payload = {
            'created_after': created_after,
        }
        self.update_loglevel(payload)

    def update_data_collection(self, collect_folder=1, collect_collaboration=1, collect_file=1, collect_task=1):
        payload = {
            'collect_folder': str(collect_folder),
            'collect_collaboration': str(collect_collaboration),
            'collect_file': str(collect_file),
            'collect_task': str(collect_task)
        }
        self.update_loglevel(payload)

    def update_loglevel(self, extra_payload=None):
        # there must be a 'loglevel' in payload, or nothing will be updated
        payload = {
            'loglevel': 'INFO',
            'created_after': ''
        }
        if extra_payload:
            payload.update(extra_payload)
        self.edit_setup(payload)

    def update_proxy(self, proxy_enabled=0, proxy_url='', proxy_port='', proxy_username='', proxy_password=''):
        payload = {
            'proxy_enabled': proxy_enabled,
            'proxy_url': proxy_url,
            'proxy_port': proxy_port,
            'proxy_username': proxy_username,
            'proxy_password': proxy_password
        }
        self.edit_setup(payload)

    def edit_setup(self, payload):
        from splunktalib.conf_manager.request import content_request
        endpoint = "{}/servicesNS/nobody/Splunk_TA_box/box_setup/box_data_collection/box_default" \
            .format(self.splunk_url)
        content_request(endpoint, self.session_key, "POST", payload, "Error")

    def remove_checkpoint(self, input_name):
        ckp_file = self.ckp_filepath + input_name
        if os.path.exists(ckp_file):
            os.remove(ckp_file)
            self.logger.info('remove check point file success {}'.format(ckp_file))
        else:
            self.logger.warn('check point file does not exist {}'.format(ckp_file))

    def create_data_input(self, name, key_values=None):
        self.logger.info("starting to create input %s", name)
        self.conf_mgr.create_data_input(self.INPUT_NAME, name, key_values)

    def delete_data_input(self, name):
        self.logger.info("starting to create input %s", name)
        self.conf_mgr.delete_data_input(self.INPUT_NAME, name)
