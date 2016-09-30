################################################################################
#
# Copyright (c) 2015 Splunk.Inc. All Rights Reserved
#
################################################################################
"""
This module provide interface to update confluence pages

The XML-RPC and SOAP APIs are deprecated since Confluence 5.5.
But there is a problem to generate table with html by rest-api at this moment, will use rest-api later

Author: Jing Shao(jshao@splunk.com)
Date:    2015/11/19 10:25:22
"""

import xmlrpclib

import config


class ConfluenceRpc(object):
    def __init__(self, username, password, key):
        self.client = xmlrpclib.Server(config.CONFLUENCE_URL, verbose=0)
        self.username = username
        self.password = password
        self.key = key
        self.auth_token = ""

    def log_in(self):
        self.auth_token = self.client.confluence2.login(self.username, self.password)

    def get_pageid_by_title(self, page_title):
        page = self.client.confluence2.getPage(self.auth_token, self.key, page_title)
        return page['id']

    def update_page_content(self, html_content, page_id):
        page = self.client.confluence2.getPage(self.auth_token, page_id)
        page['content'] = page['content'] + html_content
        self.client.confluence2.storePage(self.auth_token, page)

    def log_out(self):
        self.client.confluence2.logout(self.auth_token)


