# 2016.08.22 16:01:12 CST
#Embedded file name: /Users/dchen/ta-microsoft-cloudservices/contrib/common/neptune/splunktatest/MSCS/StorageTATest.py
"""
Meta
====
    $Id$  # nopep8
    $DateTime$
    $Author$
    $Change$
"""
from BaseTATest import BaseTATest
import pytest
import ConfigParser
import json
import os
import time
import random
import string
import copy
from datetime import datetime
from helmut.util import rip
import splunktalib.conf_manager.conf_manager as cm

class StorageTATest(BaseTATest):
    TA_APP_NAME = 'Splunk_TA_microsoft-cloudservices'
    TA_APP_USER = 'nobody'
    conf_mgr = None
    cred_mgr = None
    create_inputs_rest = None
    delete_inputs_rest = None
    account_conf = None

    @classmethod
    def setup_class(cls):
        super(StorageTATest, cls).setup_class()
        cls.get_config_credential()
        cls.logger.info('TA build under test is %s', cls.get_ta_build_number())

    @classmethod
    def teardown_class(cls):
        cls.logger.info('Ready to teardown class{}'.format(cls.__name__))
        super(StorageTATest, cls).teardown_class()

    def setup_method(self, method):
        super(StorageTATest, self).setup_method(method)
        self.update_rest_for_mscs_storage_ta()
        self.rest.change_namespace(self.TA_APP_USER, self.TA_APP_NAME)
        self.create_storage_account('with_key_valid')
        self.delete_wating_inputs = set()

    def teardown_method(self, method):
        for name in self.delete_wating_inputs:
            if not self.delete_inputs_rest:
                self.logger.error('delete_inputs_rest not found, failed to delete inputs {}'.format(name))
            else:
                self.delete_inputs_rest(name)

        super(StorageTATest, self).teardown_method(method)

    def update_rest_for_mscs_storage_ta(self):
        """
        Update REST API for AWS TA
        """
        rip.RESTInPeace.URIS.update({'storage_account': '/servicesNS/{u}/{a}/splunk_ta_ms_o365/1.0/ta_mscs_storage_accounts',
         'azure_storage': '/servicesNS/{u}/{a}/splunk_ta_ms_o365/1.0/ta_mscs_azure_accounts',
         'table_input': '/servicesNS/{u}/{a}/configs/conf-mscs_storage_table_inputs',
         'blob_input': '/servicesNS/{u}/{a}/configs/conf-mscs_storage_blob_inputs'})

    @classmethod
    def get_config_credential(cls):
        cls.logger.info('init with %s, %s', cls.splunk_url, cls.TA_APP_NAME)
        cls.conf_mgr = cm.ConfManager(cls.splunk_url, cls.session_key)
        cls.conf_mgr.set_appname(cls.TA_APP_NAME)

    @classmethod
    def get_ta_build_number(cls):
        if pytest.config.remote:
            build = cls.conf_mgr.get_stanza('app', 'install')['build']
            version = cls.conf_mgr.get_stanza('app', 'launcher')['version']
            return version + '.' + build
        else:
            config = ConfigParser.ConfigParser()
            config.read(os.path.join(os.getenv('SPLUNK_HOME'), 'etc', 'apps', StorageTATest.TA_APP_NAME, 'default', 'app.conf'))
            build = '{v}_{b}'.format(v=config.get('launcher', 'version'), b=config.get('install', 'build'))
            return build

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
        self.rest.create_table_input(**configs)
        self.rest.wait_for_table_input_to_be_created(configs['name'], timeout=3)

    def update_data_input(self, configs):
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
        name = configs.pop("name")
        self.rest.edit_table_input(name,**configs)

    def delete_data_input(self, name):
        self.logger.info('Delete data input %s', name)
        self.rest.delete_table_input(name)
        self.rest.wait_for_table_input_to_be_deleted(name, timeout=3)

    def create_blob_input(self, configs):
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
        self.rest.create_blob_input(**configs)
        self.rest.wait_for_blob_input_to_be_created(configs['name'], timeout=3)

    def update_blob_input(self, configs):
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
        name = configs.pop("name")
        self.rest.edit_blob_input(name, **configs)

    def delete_blob_input(self, name):
        self.logger.info('Delete data input %s', name)
        self.rest.delete_blob_input(name)
        self.rest.wait_for_blob_input_to_be_deleted(name, timeout=3)


    def create_index(self, name = ''):
        payload = {'name': name}
        self.rest.create_index(**payload)

    def delete_index(self, name = ''):
        payload = {'name': name}
        self.rest.delete_index(payload['name'])

    def create_storage_account(self, account_type = 'with_key_valid'):
        name, account_name, account_secret, secret_type = self.get_mscs_storage_credential(account_type)
        if account_type == 'aws-cn':
            category = 4
        else:
            category = 1
        if name and account_name and account_secret and secret_type:
            self.logger.info('Create mscs storage account %s', account_name)
            account_settings = {'name': name,
             'account_name': account_name,
             'account_secret': account_secret,
             'account_secret_type': secret_type}
            self.rest.create_storage_account(**account_settings)
            self.rest.wait_for_storage_account_to_be_created(name, timeout=3)
            if not hasattr(self, 'account_set'):
                self.account_set = set()
            self.account_set.add(account_type)

    def delete_storage_account(self, account_type = 'with_key_valid'):
        account_name, key_id, secret_key, secret_type = self.get_mscs_storage_credential(account_type)
        if account_name and key_id and secret_key and secret_type:
            self.logger.info('Delete mscs storage account %s', account_name)
            self.rest.delete_storage_account(account_name)
            self.rest.wait_for_storage_account_to_be_deleted(account_name, timeout=3)

    @staticmethod
    def get_mscs_storage_credential(account_type = 'with_key_valid'):
        """
        Gets AWS account credentials from OS env.
        
        @rtype tuple
        @return AWS account credentials
        """
        conf_path = os.getenv('CONF_PATH')
        print conf_path
        account_conf = ConfigParser.ConfigParser()
        account_conf.read(conf_path + '/accounts.conf')
        name = account_conf.get('storage_account_' + account_type, 'name')
        account_name = account_conf.get('storage_account_' + account_type, 'account_name')
        account_secret = account_conf.get('storage_account_' + account_type, 'account_secret')
        secret_type = account_conf.get('storage_account_' + account_type, 'account_secret_type')
        return (name,
         account_name,
         account_secret,
         secret_type)

