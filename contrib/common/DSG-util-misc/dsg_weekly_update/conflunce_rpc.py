# ###############################################################################
#
# Copyright (c) 2015 Splunk.Inc. All Rights Reserved
#
################################################################################
"""
This module provide interface to update confluence pages

The XML-RPC and SOAP APIs are deprecated since Confluence 5.5.
But there is a problem to generate table with html by rest-api at this moment, will use rest-api later

Author: Jing Shao(jshao@splunk.com)
Date:   2015/11/19 10:25:22
"""

import xmlrpclib
import sys
import config
import re
import requests
from urllib import unquote


def get_key_and_page_title(confluence_url):
    """
    :param confluence_url(https://confluence.splunk.com/display/SHAN/TA+QA+Weekly+Update+-+2016)
    :return: key: ~jshao
    :return: page_title: TA QA Weekly Update - 2016
    """
    url_parts = confluence_url.split('/')
    key = url_parts[-2]
    match = re.search('.+', url_parts[-1])
    if match is not None:
        page_title = unquote(match.group(0)).replace('+', ' ')
    return key, page_title


class ConfluenceRpc(object):
    def __init__(self, confluence_url, username, password):
        self.client = xmlrpclib.Server(config.CONFLUENCE_URL, verbose=0)
        self.username = username
        self.password = password
        (self.key, self.page_title) = get_key_and_page_title(confluence_url)
        self.auth_token = ""
        self.page_id = ""

    def log_in(self):
        try:
            self.auth_token = self.client.confluence2.login(self.username, self.password)
        except Exception, e:
            print e
            print "ERROR: Failed to login confluence, please check your username and password "
            sys.exit(1)
        return self

    def get_pageid_by_title(self):
        page = self.client.confluence2.getPage(self.auth_token, self.key, self.page_title)
        return page['id']

    def get_page_content(self, page_id):
        return self.client.confluence2.getPage(self.auth_token, page_id)

    def update_page_content(self, html_content, page_id):
        page = self.client.confluence2.getPage(self.auth_token, page_id)
        page['content'] = html_content
        self.client.confluence2.storePage(self.auth_token, page)

    def get_latest_children_page_id(self):
        """
        The latest children's page_id and content under the page
        :return page_id
        """
        page_data = self.get_children_info()
        size = page_data['size']
        return page_data["results"][size - 1]['id']

    def get_latest_children_page_content(self):
        """
        The latest children's page_id and content under the page
        :return page_content
        """
        page_data = self.get_children_info()
        size = page_data['size']
        page_id = page_data["results"][size - 1]['id']
        page_content = self.get_page_content(page_id)
        return page_content["content"]

    def get_latest_children_page_title(self):
        """
        The latest children's page_id and content under the page
        :return page_content
        """
        page_data = self.get_children_info()
        size = page_data['size']
        page_id = page_data["results"][size - 1]['id']
        page_content = self.get_page_content(page_id)
        return page_content["title"]

    def get_children_info(self):
        """
        The latest children's page_id and content under the page
        :return page_id
        :return page_content
        """
        self.page_id = self.get_pageid_by_title()
        confluence_page = "https://confluence.splunk.com/rest/api/content/{}/child/page".format(self.page_id)
        auth = (self.username, self.password)
        r = requests.get(confluence_page, auth=auth)
        page_data = r.json()
        return page_data

    def log_out(self):
        self.client.confluence2.logout(self.auth_token)


