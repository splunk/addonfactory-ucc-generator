import os
import logging

from helmut.ssh.connection import SSHConnection

from helmut.splunk.ssh import SSHSplunk
from helmut.splunk.local import LocalSplunk
from helmut.splunk_factory.splunkfactory import SplunkFactory

LOGGER = logging.getLogger()


def ta_common_pytest_addoption(parser):
    """
    This is a pytest hook to add options from the command line so that we can use it later.
    :param parser:
    :return:
    """
    splk_group = parser.getgroup("Splunk Options")
    splk_group.addoption('--splunk-home',
                         dest='splunk_home',
                         help='The location of the Splunk instance, if using a '
                              'pre-installed splunk instance',
                         default=(os.environ['SPLUNK_HOME'] if 'SPLUNK_HOME' in os.environ else
                                  None))

    splk_group.addoption('--username',
                         dest='username',
                         help='Splunk username, defaults to admin',
                         default='admin')

    splk_group.addoption('--password',
                         dest='password',
                         help='Splunk password, defaults to changeme',
                         default='changeme')

    splk_group.addoption('--new_password',
                         dest='new_password',
                         help='New splunk password to change to, needed for remote '
                              'login if current password is changeme',
                         default="notchangeme")

    splk_group.addoption('--splunk-url',
                         dest='splunk_url',
                         help='The url of splunk instancem, only support localhost for now',
                         default='localhost')

    splk_group.addoption('--remote',
                         dest='remote',
                         action="store_true",
                         help='Whether this is a remote test',
                         default=False
                         )

    splk_group.addoption('--dryrun',
                         action="store_true",
                         help='dryrun to test the script only.')
    splk_group.addoption('--ssh_username',
                         dest='ssh_username',
                         help='remote ssh username',
                         default=''
                         )


def ta_common_pytest_configure(config):
    config.__setattr__('username', config.getvalue('username'))
    config.__setattr__('password', config.getvalue('password'))
    config.__setattr__('dryrun', config.getvalue('dryrun'))
    config.__setattr__('splunk_url', config.getvalue('splunk_url'))
    config.__setattr__('splunk_home', config.getvalue('splunk_home'))
    config.__setattr__('remote', config.getvalue('remote'))

    if config.remote:
        LOGGER.info("This is a remote test")
        ssh_conn = SSHConnection(config.splunk_url, user=config.getvalue('ssh_username'))
        config.__setattr__('splunk', SSHSplunk(ssh_conn, config.splunk_home))
        config.splunk.start(auto_ports=True)
    else:
        LOGGER.info("Setting pytest.config.splunk to a LocalSplunk instance.")
        config.__setattr__('splunk', LocalSplunk(config.splunk_home))
        config.splunk.start(auto_ports=True)
