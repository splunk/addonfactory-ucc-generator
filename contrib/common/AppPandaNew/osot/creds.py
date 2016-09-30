import json
import logging
import os

import osot.client

DEFAULT_ARTIFACTORY_URL = 'https://1sot.splunkcloud.com/artifactory'

# Expected to be found in $HOME
DEFAULT_READONLY_CREDENTIALS_FILE = '.artifactory_readonly.json'

# Artifactory repo in 1sot that stores the credentials
CREDENTIALS_REPO = 'sec-dev'

# Paths to the SSH keys
DEFAULT_KEY_FILE_PATH = 'ssh/infra_whisper.key'
GOVCLOUD_KEY_FILE_PATH = (
    'ssh/splunk-test-govcloud/us-gov-west-1/infra_whisper.key')

LDAP_CREDS_PATH = 'whisper-qa/splunk-cloudauto-ldap.json'
QA_CREDS_PATH = 'whisper-qa/whisper-rest-qa.json'

DEFAULT_AWS_TEST_ACCOUNT = 'splunk-whisper-test'
GOVCLOUD_AWS_TEST_ACCOUNT = 'splunk-test-govcloud'

# TODO: change to use user dedicated for automation instead of hsebastian's AMI
DEFAULT_AWS_CREDS_PATH = 'chef/aws-splunk-cloud-test-automation.json'
GOVCLOUD_AWS_CREDS_PATH = 'chef/aws-splunk-test-govcloud.json'
# TODO: change this path once a separate S3 account has been set up SEC-3581
FAKE_CUSTOMER_AWS_CREDS_PATH = 'chef/aws-splunk-whisper-test.json'

# Artifactory repo in 1sot that stores credentials below.
STACKMAKR_REPO = 'stackmakr-general'

# Paths in repo 'stackmakr-general'
VORMETRIC_CREDS_PATH = 'credentials/vormetric-creds.json'
CLOUDPASSAGE_CREDS_PATH = 'credentials/cloudpassage.json'
PINGDOM_CREDS_PATH = 'credentials/pingdom-creds.json'


class UnknownCloudVendor(Exception):
    pass


class CredentialsHelper(object):
    """
    A Helper to retrieve credentials from Artifactory through
    osot.client.Artifactory
    """
    def __init__(self, artifactory_url=DEFAULT_ARTIFACTORY_URL,
                 credentials_path=None):
        """
        :param artifactory_url: path to artifactory
        :param credentials_path: absolute path to artifactory.json
        """
        self.logger = logging.getLogger(__name__)
        if credentials_path is None:
            if 'HOME' not in os.environ:
                raise EnvironmentError('Expected environment variable HOME but'
                                       'not found')
            credentials_path = os.path.join(
                os.environ['HOME'], DEFAULT_READONLY_CREDENTIALS_FILE)
            if not os.path.isfile(credentials_path):
                raise EnvironmentError(
                    'Expected %s in $HOME=%s but not found' % (
                        DEFAULT_READONLY_CREDENTIALS_FILE, os.environ['HOME']))

        # get artifactory credentials from given credentials_path
        self.username, self.password = self.get_artifactory_creds(
            credentials_path)
        self.artifactory_client = osot.client.Artifactory(
            artifactory_url, self.username, self.password)

    def get_artifactory_creds(self, credentials_path):
        """
        Retrieves artifactory credentials found in credentials_path
        :param credentials_path: absolute path to artifactory.json
        :return: tuple username and password
        """
        self.logger.info(
            {
                'status': 'retrieving',
                'creds': 'artifactory',
                'path': credentials_path
            })
        with open(credentials_path) as f:
            json_data = json.load(f)
        username = json_data.get("user")
        password = json_data.get("password")
        return username, password

    def get_splunk_test_user_credentials(self, repo=CREDENTIALS_REPO,
                                         path=QA_CREDS_PATH):
        """
        Retrieves test user credentials
        :param repo: repo that contains test user credentials
        :param path: path to test user credentials
        :return: file info for test user credentials
        """
        self.logger.info({'status': 'retrieving', 'creds': 'splunk_test_user'})
        return json.loads(self.artifactory_client.get_file_content(repo, path))

    def get_ldap_user_credentials(self, repo=CREDENTIALS_REPO,
                                  path=LDAP_CREDS_PATH):
        """
        Retrieves LDAP user credentials
        :param repo: repo that contains ldap credentials
        :param path: path to ldap credentials
        :return: file info for ldap user credentials
        """
        self.logger.info({'status': 'retrieving', 'creds': 'ldap_test_user'})
        return json.loads(self.artifactory_client.get_file_content(repo, path))

    def get_fake_customer_aws_credentials(
            self, repo=CREDENTIALS_REPO, path=FAKE_CUSTOMER_AWS_CREDS_PATH):
        """
        Retrieves aws credentials from an account used to simulate customer's
        AWS account (for archiving).

        :param repo: repo that contains aws credentials
        :param path: path to aws credentials
        :return: json of aws ID and key
        """
        return self.get_aws_credentials(repo=repo, path=path)

    def get_aws_credentials(
            self, repo=CREDENTIALS_REPO, path=DEFAULT_AWS_CREDS_PATH):
        """
        Retrieves aws credentials
        :param repo: repo that contains aws credentials
        :param path: path to aws credentials
        :return: file info for ldap user credentials
        """
        self.logger.info(
            {'status': 'retrieving', 'creds': 'aws', 'path': path})
        return json.loads(self.artifactory_client.get_file_content(repo, path))

    def get_aws_credentials_by_account(self, account=DEFAULT_AWS_TEST_ACCOUNT):
        """
        Retrieves aws credentials
        :param account expects aws-{account}.json file on 1sot with aws keys
        """
        repo = CREDENTIALS_REPO

        # Determine path
        if account == GOVCLOUD_AWS_TEST_ACCOUNT:
            path = GOVCLOUD_AWS_CREDS_PATH
        elif account == DEFAULT_AWS_TEST_ACCOUNT:
            path = DEFAULT_AWS_CREDS_PATH
        else:
            raise UnknownCloudVendor("account=%s" % account)

        self.logger.info({'status': 'retrieving', 'creds': 'aws'})
        return self.get_aws_credentials(repo=repo, path=path)

    def get_pingdom_credentials(self, repo=STACKMAKR_REPO,
                                path=PINGDOM_CREDS_PATH):
        """
        Retrieves pingdom credentials
        :param repo: repo that contains pingdom credentials
        :param path: path to pingdom credentials
        :return: file info for pingdom credentials
        """
        self.logger.info({'status': 'retrieving', 'creds': 'pingdom'})
        return json.loads(self.artifactory_client.get_file_content(repo, path))

    def get_vormetric_credentials(self, repo=STACKMAKR_REPO,
                                  path=VORMETRIC_CREDS_PATH):
        """
        Retrieves vormetric credentials
        :param repo: repo that contains vormetric credentials
        :param path: path to vormetric credentials
        :return: file info for pingdom credentials
        """
        self.logger.info({'status': 'retrieving', 'creds': 'vormetric'})
        return json.loads(self.artifactory_client.get_file_content(repo, path))

    def get_cloudpassage_credentials(self, repo=STACKMAKR_REPO,
                                     path=CLOUDPASSAGE_CREDS_PATH):
        """
        Retrieves cloudpassage credentials
        :param repo: repo that contains cloudpassage credentials
        :param path: path to cloudpassage credentials
        :return: file info for cloudpassage credentials
        """
        self.logger.info({'status': 'retrieving', 'creds': 'cloudpassage'})
        return json.load(self.artifactory_client.get_file_content(repo, path))

    def get_ssh_key_file(self, repo=CREDENTIALS_REPO,
                         path=DEFAULT_KEY_FILE_PATH,
                         dest='/tmp/'):
        """
        Download the ssh key if it does not exist. The ssh key file name is
        extracted from the path and defaulted to be saved in /tmp/.

        :param repo: Artifactory repository with the ssh key file
        :param path: path in Artifactory to the ssh key file
        :param dest: destination, without the filename
        :return: path to key file
        """
        # Extract filename from path
        filename = path.split(os.path.sep)[-1]
        download_path = os.path.abspath(os.path.join(dest, filename))

        self.logger.info(
            {
                'status': 'downloading',
                'creds': 'ssh_key',
                'destination': download_path
            })
        return self.artifactory_client.download_file(repo, path, download_path)

    def get_ssh_key_file_by_account(
            self, account=DEFAULT_AWS_TEST_ACCOUNT, dest='/tmp'):
        """
        Works like CredentialsHelper.get_ssh_key_file but
        :param account the account name of the cloud vendor as a string
        """

        # Determine path
        if account == GOVCLOUD_AWS_TEST_ACCOUNT:
            path = GOVCLOUD_KEY_FILE_PATH
        elif account == DEFAULT_AWS_TEST_ACCOUNT:
            path = DEFAULT_KEY_FILE_PATH
        else:
            raise UnknownCloudVendor("account=%s" % account)

        # Determine download dir
        download_dir = os.path.join(dest, account)
        if not os.path.isdir(download_dir):
            self.logger.info({'status': 'creating', 'dir': download_dir})
            os.makedirs(download_dir)
        return self.get_ssh_key_file(path=path, dest=download_dir)
