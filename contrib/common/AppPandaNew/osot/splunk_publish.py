"""
Class to publish items to 1sot Artifactory

Copyright 2014 Splunk, Inc.
All rights reserved

created by rich braun <rbraun@splunk.com> 29-Oct-2014

TODO: Consolidate this class with SplunkPypi
"""

import logging

import osot.client


class PublishFailure(Exception):
    pass


class SplunkPublish(object):
    """Class: Publish items to a repo/subdir on 1sot"""
    def __init__(
            self, username, password, repo,
            baseurl=osot.client.ARTIFACTORY_BASE_URL,
            subdir=''):
        self.repo = repo
        self.logger = logging.getLogger(
            "%s repo=%s" % (self.__class__.__name__, self.repo))
        self.artifactory = osot.client.Artifactory(baseurl, username, password)
        self.subdir = subdir

    def package_published(self, name, package_name, sha1sum=None):
        path = '/'.join([self.subdir, name, package_name])
        response_text = self.artifactory.get_file_info(self.repo, path)
        published = 'uri' in response_text
        if not published:
            self.logger.info(
                {
                    'status': 'not_published',
                    'package_name': package_name
                })
        if sha1sum and ('checksums' in response_text and
                        sha1sum is not response_text['checksums']['sha1']):
            self.logger.warn(
                {
                    'status': 'published',
                    'package_name': package_name,
                    'sha1sum': response_text['checksums']['sha1'],
                    'message': 'colliding checksum=%s' % sha1sum
                })
        return published

    def publish_package(self, package_path, name, package_name):
        path = '/'.join([self.subdir, name, package_name])
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
                'uri': response_text['uri'] if 'uri' in response_text else '',
                'sha1sum': response_text['checksums']['sha1'] if 'checksums' in response_text else ''
            })
        return response_text
