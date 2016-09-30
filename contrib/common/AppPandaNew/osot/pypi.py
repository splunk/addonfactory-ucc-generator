import logging

import osot.client


SPLUNK_PYPI_REPO = 'splunk-pypi'
SPLUNK_PYPI_SUBDIR = 'packages'


class PublishFailure(AssertionError):
    pass


class SplunkPypi(object):
    """Class that represents a client to Splunk internal python code repo"""
    def __init__(
            self, username, password, repo=SPLUNK_PYPI_REPO,
            baseurl=osot.client.ARTIFACTORY_BASE_URL):
        self.repo = repo
        self.logger = logging.getLogger(
            "%s repo=%s" % (self.__class__.__name__, self.repo))
        self.artifactory = osot.client.Artifactory(baseurl, username, password)

    def package_published(self, name, package_name):
        path = '/'.join([SPLUNK_PYPI_SUBDIR, name, package_name])
        response_text = self.artifactory.get_file_info(self.repo, path)
        published = 'uri' in response_text
        if published:
            self.logger.info(
                {
                    'status': 'already_published',
                    'package_name': package_name
                })
        else:
            self.logger.warn(
                {
                    'status': 'not_published',
                    'package_name': package_name
                })
        return published

    def publish_package(self, package_path, name, package_name):
        path = '/'.join([SPLUNK_PYPI_SUBDIR, name, package_name])
        response_text = self.artifactory.deploy_artifact(
            package_path, self.repo, path)
        return response_text

    def publish_nonexistent_package_only(
            self, package_path, name, package_name):
        response_text = self.publish_package(package_path, name, package_name)

        # Handling the case when the package already exists
        if 'errors' in response_text:
            for error in response_text['errors']:
                if error['status'] == 403 and 'overwrite' in error['message']:
                    self.logger.info(
                        {
                            'status': 'already_published',
                            'package_name': package_name
                        })
                    return response_text
            raise PublishFailure(str(response_text))

        self.logger.info(
            {
                'status': 'published',
                'package_name': package_name,
                'uri': response_text['uri']
            })
        return response_text
