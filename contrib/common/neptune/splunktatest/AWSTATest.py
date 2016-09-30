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


class AWSTATest(BaseTATest):
    # due to the pytest frame, we can not add __init__ function in this class
    # self.account_set is used to store the accounts which are created
    TA_APP_NAME = 'Splunk_TA_aws'
    TA_APP_USER = 'nobody'
    DEFAULT_AWS_REGION = 'ap-southeast-1'
    DEFAULT_EC2_ID = 'i-3f3152b1'
    DEFAULT_EBS_ID = 'vol-6fd6e4a8'

    DEFAULT_SNS_NAME = 'ta-auto-alert'
    DEFAULT_SNS_ARN = 'arn:aws:sns:ap-southeast-1:063605715280:ta-auto-alert'

    account_suffix = {
        "default": "1",
        "invalid": "4",
        "aws-cn": "5",
        "only-cloudwatch": "6",
        "aws-cn-stream": "7",
    }
    conf_mgr = None
    cred_mgr = None

    create_inputs_rest = None
    delete_inputs_rest = None

    @classmethod
    def setup_class(cls):
        super(AWSTATest, cls).setup_class()
        cls.get_config_credential()
        cls.logger.info("TA build under test is %s", cls.get_ta_build_number())

    @classmethod
    def teardown_class(cls):
        cls.logger.info("Ready to teardown class{}".format(cls.__name__))
        super(AWSTATest, cls).teardown_class()

    """ Test case wrapper for all AWS TA TC """

    def setup_method(self, method):
        super(AWSTATest, self).setup_method(method)
        self.update_rest_for_aws_ta()
        self.rest.change_namespace(self.TA_APP_USER, self.TA_APP_NAME)
        self.create_aws_account("default")
        self.delete_wating_inputs = set()

    def teardown_method(self, method):
        # if hasattr(self, "account_set"):
        #     for account in self.account_set:
        #         self.delete_aws_account(account)

        for name in self.delete_wating_inputs:
            if not self.delete_inputs_rest:
                self.logger.error('delete_inputs_rest not found, failed to delete inputs {}'.format(name))
            else:
                self.delete_inputs_rest(name)
        super(AWSTATest, self).teardown_method(method)

    def create_inputs(self, inputs_config):
        if not self.create_inputs_rest:
            raise RuntimeError('create_inputs_rest can not be None')
        if 'name' not in inputs_config.keys():
            raise ValueError('inputs_config does not have key "name"')
        self.create_inputs_rest(**inputs_config)
        self.delete_wating_inputs.add(inputs_config['name'])

    def update_rest_for_aws_ta(self):
        '''
        Update REST API for AWS TA
        '''
        rip.RESTInPeace.URIS.update({
            'settings_account4ui':
            '/servicesNS/{u}/{a}/splunk_ta_aws/settings/account4ui',
            'settings_account':
            '/servicesNS/{u}/{a}/splunk_ta_aws/settings/account',
            'settings_proxy':
            '/servicesNS/{u}/{a}/splunk_ta_aws/settings/aws_proxy',
            'settings_proxy4ui':
            '/servicesNS/{u}/{a}/splunk_ta_aws/settings/proxy4ui',
            'inputs_s3': '/servicesNS/{u}/{a}/splunk_ta_aws/inputs/s3',
            'inputs_billing':
            '/servicesNS/{u}/{a}/splunk_ta_aws/inputs/billing',
            'inputs_config': '/servicesNS/{u}/{a}/splunk_ta_aws/inputs/config',
            'inputs_cloudtrail':
            '/servicesNS/{u}/{a}/splunk_ta_aws/inputs/cloudtrail',
            'inputs_cloudwatch':
            '/servicesNS/{u}/{a}/splunk_ta_aws/inputs/cloudwatch',
            'inputs_description':
            '/servicesNS/{u}/{a}/splunk_ta_aws/inputs/description',
            'inputs_cloudwatchlogs':
            '/servicesNS/{u}/{a}/splunk_ta_aws/inputs/cloudwatch-logs',
            'inputs_kinesis':
            '/servicesNS/{u}/{a}/splunk_ta_aws/inputs/kinesis',
            'inputs_inspector':
            '/servicesNS/{u}/{a}/splunk_ta_aws/inputs/inspector',
            'inputs_configrule':
            '/servicesNS/{u}/{a}/splunk_ta_aws/inputs/config-rule',
            'inputs_sqs':
            '/servicesNS/{u}/{a}/splunk_ta_aws/inputs/sqs',
            'ta_aws_rest':
            '/servicesNS/{u}/{a}/splunk_ta_aws',
            'alert':
            '/servicesNS/{u}/search/saved/searches',
        })

    @classmethod
    def get_config_credential(cls):
        cls.logger.info("init with %s, %s", cls.splunk_url, cls.TA_APP_NAME)
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
            config.read(os.path.join(
                os.getenv('SPLUNK_HOME'), 'etc', 'apps', AWSTATest.TA_APP_NAME,
                'default', 'app.conf'))
            build = '{v}_{b}'.format(v=config.get('launcher', 'version'),
                                     b=config.get('install', 'build'))
            return build

    def get_data_inputs_for(self, service, stanza_name):
        calling_method = getattr(self.rest, 'get_inputs_' + service)
        response, content = calling_method(stanza_name, **{'output_mode':
                                                           'json'})
        if response.status in (200, 201):
            for ret in json.loads(content)['entry']:
                ret['content'].update({u'name': ret['name']})
                return ret['content']
        else:
            return {}

    def create_aws_account(self, account_type):
        account_name, key_id, secret_key = AWSTATest.get_aws_credential(
            account_type)
        # Hard code for now, fix it later
        if account_type == 'aws-cn':
            category = 4
        else:
            category = 1
        if account_name and key_id and secret_key:
            self.logger.info("Create aws account %s", account_name)
            account_settings = {
                'name': account_name,
                'key_id': key_id,
                'secret_key': secret_key,
                'category': category
            }
            self.rest.create_settings_account4ui(**account_settings)
            self.rest.wait_for_settings_account4ui_to_be_created(account_name,
                                                                 timeout=3)
            if not hasattr(self, "account_set"):
                self.account_set = set()
            self.account_set.add(account_type)

    def delete_aws_account(self, account_type):
        account_name, key_id, secret_key = AWSTATest.get_aws_credential(
            account_type)
        if account_name and key_id and secret_key:
            self.logger.info("Delete aws account %s", account_name)
            self.rest.delete_settings_account4ui(account_name)
            self.rest.wait_for_settings_account4ui_to_be_deleted(account_name,
                                                                 timeout=3)

    @staticmethod
    def get_default_aws_account():
        return AWSTATest.get_aws_account("default")

    @staticmethod
    def get_aws_account(account_type):
        return os.getenv(AWSTATest.get_account_name(account_type))

    @staticmethod
    def get_aws_credential(account_type="default"):
        '''
        Gets AWS account credentials from OS env.

        @rtype tuple
        @return AWS account credentials
        '''
        return (os.getenv(AWSTATest.get_account_name(account_type)),
                os.getenv(AWSTATest.get_access_key(account_type)),
                os.getenv(AWSTATest.get_secret_key(account_type)))

    @classmethod
    def get_aws_credential_from_account(cls, account_name):
        for account_type in cls.account_suffix.keys():
            if os.getenv(AWSTATest.get_account_name(
                    account_type)) == account_name:
                return (os.getenv(AWSTATest.get_access_key(account_type)),
                        os.getenv(AWSTATest.get_secret_key(account_type)))

        cls.logger.error('failed to find account_name {}'.format(account_name))
        return None

    @classmethod
    def get_account_name(cls, account_type):
        return "TA_ACCOUNT_NAME_" + cls.account_suffix[account_type]

    @classmethod
    def get_access_key(cls, account_type):
        return "TA_KEY_ID_" + cls.account_suffix[account_type]

    @classmethod
    def get_secret_key(cls, account_type):
        return "TA_SECRET_KEY_" + cls.account_suffix[account_type]

    def update_proxy(self, configs):
        """
        :param configs: dict
        example
            configs = {
                'disabled': disabled,
                'host': host,
                'port': port,
                'username': username,
                'password': password
            }
        """
        self.rest.edit_settings_proxy4ui('aws_proxy', **configs)

        # def get_pid(process_name_keyword):
        #     for proc in psutil.process_iter():
        #         if process_name_keyword in proc.name():
        #             return proc.pid
        #     return None
        #
        #
        # def get_mem_usage(pid):
        #     '''
        #     Returns the memory usage in MB
        #     '''
        #     process = psutil.Process(pid)
        #     return process.memory_info()[0] / float(2 ** 20)
        #
        #
        # def get_cpu_percent(pid):
        #     process = psutil.Process(pid)
        #     return process.cpu_percent(interval=1)
