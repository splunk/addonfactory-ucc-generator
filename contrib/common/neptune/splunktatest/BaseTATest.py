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

import logging
from StringIO import StringIO
import pytest
import ConfigParser
import os
from helmut.connector.base import Connector
from helmut.util import rip
from helmut.log import HelmutFormatter
from helmut.log import _LOG_FORMAT as LOG_FORMAT

from splunktalib import credentials
import splunktalib.conf_manager.conf_manager as cm

LOGGER = logging.getLogger(__name__)
LOG_BUFFER = StringIO()
LOG_HANDLER = logging.StreamHandler(LOG_BUFFER)
LOG_HANDLER.setFormatter(HelmutFormatter(LOG_FORMAT))
TIMEOUT = 60
POLL_FREQUENCY = 10

LOGGER.addHandler(LOG_HANDLER)
LOG_HANDLER.setLevel(logging.DEBUG)


class BaseTATest(object):
    '''
    Base TA test cases setup
    '''
    logger = LOGGER
    splunk = None
    session_key = None
    rest = None
    splunk_url = None

    TA_APP_NAME = 'Splunk_TA_dummy'
    TA_APP_USER = 'nobody'

    @classmethod
    def setup_class(cls):
        '''
        Setup Class to run before each session.
        '''
        # Logger
        cls.logger.debug('x' * 80)
        cls.logger.debug('CLASS SETUP')
        cls.logger.debug('x' * 80)

        # Splunk
        cls.logger.info("Setting up splunk instance in setup class.")
        cls.splunk = pytest.config.splunk
        cls.splunk_home = pytest.config.splunk_home

        # rest
        conn = pytest.config.splunk.create_logged_in_connector(
            False,
            Connector.REST,
            username=pytest.config.username,
            password=pytest.config.password)

        cls.logger.info("Setting up REST using the rip module, "
                        "in setup class.")
        cls.rest = rip.RESTInPeace(conn)

        # session_key, for raw rest api handling
        cls.splunk_url = 'https://' + pytest.config.splunk_url + ':8089'
        cls.logger.info("Setting up session_key in setup class to url %s",
                        cls.splunk_url)
        cls.session_key = cls.get_splunk_session_key(
            cls.splunk_url, pytest.config.username, pytest.config.password)
        cls.logger.info("TA build under test is %s",
                        BaseTATest.get_ta_build_number())

    @classmethod
    def teardown_class(cls):
        '''
        Teardown Class to run after each session.
        '''
        cls.logger.debug('x' * 80)
        cls.logger.debug('CLASS TEARDOWN')
        cls.logger.debug('x' * 80)

    @classmethod
    def get_config_credential(cls):
        pass

    @staticmethod
    def get_splunk_session_key(splunk_url, username, password):
        conn = credentials.CredentialManager(splunk_url, None)
        session_key = conn.get_session_key(username, password, splunk_url)
        return session_key

    @classmethod
    def get_ta_build_number(cls):
        return "UNKNOWN"
        # if pytest.config.remote:
        #     config = cls.conf_mgr.get_stanza('log_info', 'aws_s3')
        #     cls.logger.info("config = %s", config)
        #     return "UNKNOWN"
        # else:
        #     config = ConfigParser.ConfigParser()
        #     config.read(os.path.join(cls.splunk_home, 'etc', 'apps',
        #                              cls.TA_APP_NAME, 'default', 'app.conf'))
        #     build = '{v}_{b}'.format(v=config.get('launcher', 'version'),
        #                              b=config.get('install', 'build'))
        #     return build

    def setup_method(self, method):
        '''
        Setup Method to run before each test case
        '''
        LOG_BUFFER.truncate(0)
        LOG_BUFFER.seek(0)

        self.logger = BaseTATest.logger
        self.test_name = method.func_name
        self.logger.info('=' * 80)
        self.logger.info('START test case: %s' % self.test_name)
        self.logger.info('-' * 80)

    def teardown_method(self, method):
        '''
        Setup Method to run after each test case
        '''
        self.logger.info('')
        self.logger.info('-' * 80)
        self.logger.info('END case: {s}'.format(s=self.test_name))
        self.logger.info('=' * 80)
        self.logger.info('')
