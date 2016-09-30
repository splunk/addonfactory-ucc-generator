import hashlib
import json
import logging
import os

import requests


ARTIFACTORY_BASE_URL = 'https://1sot.splunkcloud.com/artifactory'
GET_FILE_INFO_ENDPOINT = 'api/storage'


class Artifactory(object):
    """Authenticated REST requests to Artifactory REST API as documented here:
    http://www.jfrog.com/confluence/display/RTF/Artifactory+REST+API

    """
    def __init__(self, baseurl, username, password):
        self.baseurl = baseurl
        self.username = username
        self.password = password
        self.logger = logging.getLogger(
            "%s username=%s" % (self.__class__.__name__, self.username))

    def get_file_info(self, repo, path):
        endpoint = GET_FILE_INFO_ENDPOINT
        url = '/'.join([self.baseurl, endpoint, repo, path])
        response = requests.get(url, auth=(self.username, self.password))
        if response.status_code != requests.codes.ok:
            self.logger.warn(
                {
                    'status_code': response.status_code, 'url': url,
                    'response': response.text
                })
        return json.loads(response.text)

    def get_file_content(self, repo, path):
        url = '/'.join([self.baseurl, repo, path])
        response = requests.get(url, auth=(self.username, self.password))
        if response.status_code != requests.codes.ok:
            self.logger.warn(
                {
                    'status_code': response.status_code, 'url': url,
                    'response': response.text
                })
        return response.content

    def download_file(self, repo, path, dest):

        self.logger.info(
            {'status': 'retrieving', 'repo': repo, 'path': path})
        file_data = self.get_file_content(repo, path)

        dest_abspath = os.path.abspath(dest)
        with open(dest_abspath, 'w') as outfile:
            self.logger.info(
                {
                    'status': 'writing',
                    'repo': repo,
                    'path': path,
                    'destination': dest_abspath
                })
            outfile.write(file_data)

        if not os.path.isfile(dest):
            raise IOError(
                'File %s not found after downloading from %s' % (
                    dest_abspath, path))

        return dest

    def deploy_artifact(self, filepath, repo, path):
        url = '/'.join([self.baseurl, repo, path])
        response = requests.put(
            url, auth=(self.username, self.password),
            data=open(filepath, 'rb'))
        if response.status_code != requests.codes.created:
            self.logger.warn(
                {
                    'status_code': response.status_code, 'url': url,
                    'response': response.text
                })
        return response.json() if response.text else {}

    def delete_artifact(self, repo, path):
        url = '/'.join([self.baseurl, repo, path])
        response = requests.delete(url, auth=(self.username, self.password))
        if response.status_code != requests.codes.ok:
            self.logger.warn(
                {
                    'status_code': response.status_code, 'url': url,
                    'response': response.text
                })
        return response

def calculate_file_sha1(filepath):
    """Given a filepath, returns the sha1 in string"""
    with open(filepath, 'rb') as f:
        sha1_object = hashlib.sha1(f.read())
        sha1 = sha1_object.hexdigest()
    logging.info({'filepath': filepath, 'sha1': sha1})
    return sha1


def calculate_file_md5(filepath):
    """Given a filepath, returns the md5 in string"""
    with open(filepath, 'rb') as f:
        md5_object = hashlib.md5(f.read())
        md5 = md5_object.hexdigest()
    logging.info({'filepath': filepath, 'md5': md5})
    return md5
