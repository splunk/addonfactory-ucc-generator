#! /usr/bin/env python
# ###############################################################################
#
# Copyright (c) 2015 Splunk.Inc. All Rights Reserved
#
################################################################################
"""
Tool to generate table "Installation Locations and Limitations" for TA's internal document
Main function
Author: Jing Shao(jshao@splunk.com)
Date:    2015/11/19 10:25:01
"""

import sys
import re
import getopt
import subprocess

from urllib import unquote

import config
from html_content import HtmlContent
from conflunce_rpc import ConfluenceRpc
from rules import RuleFactory


def help_message():
    print "Usage: matrix_generator.py -t <TA Path> -w <Wiki URL> -u <username> -p <password>\n"
    print "Example: python matrix_generator.py -t ~/Source/ta-jboss -w " \
          "https://confluence.splunk.com/display/~jshao/New+Table -u jane -p 1234\n"
    print "-t(mandatory) : TA path"
    print "-w(mandatory) : Confluence url, will add the table to the end of your page."
    print "-u(mandatory) : Username to login confluence"
    print "-p(mandatory) : Password to login confluence"


def get_key_and_page_title(wiki_url):
    """
    https://confluence.splunk.com/display/~jshao/New+Table
    """
    url_parts = wiki_url.split('/')
    key = url_parts[-2]
    page_title = ''
    match = re.search('.+', url_parts[-1])
    if match is not None:
        page_title = unquote(match.group(0))
        page_title = page_title.replace('+', ' ')
    return key, page_title


def format_ta_path(ta_path):
    """
    Can work both in source code folder and installed TA folder
    1. ta_path/package/default
    2. ta_path/default
    """
    command = "find %s -type d -name package" % ta_path
    p = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    (std_output, err_output) = p.communicate()
    if len(err_output.strip()) != 0:
        print "Error: %s" % err_output
        sys.exit(1)
    elif len(std_output.strip()) != 0:
        if "package" not in ta_path:
            ta_path = ta_path + "/package"
    else:
        pass

    return ta_path


def get_parameters(argv):
    ta_path = ''
    key = ''
    page_title = ''
    username = ''
    password = ''
    try:
        opts, args = getopt.getopt(argv, 'ht:w:u:p:')
    except getopt.GetoptError:
        help_message()
        sys.exit(1)
    for opt, arg in opts:
        if opt == '-t':
            ta_path = arg.strip()
            ta_path = format_ta_path(ta_path)
        elif opt == "-w":
            wiki_url = arg.strip()
            key, page_title = get_key_and_page_title(wiki_url)
        elif opt == "-u":
            username = arg.strip()
        elif opt == "-p":
            password = arg.strip()
        else:
            help_message()
            sys.exit(1)
    if username is '' or password is '' or page_title is '' or key is '' or ta_path is '':
        help_message()
        sys.exit(1)

    return ta_path, key, page_title, username, password


def main(argv):
    check_result = []
    ta_path, key, page_title, username, password = get_parameters(argv)

    rule_factory = RuleFactory()

    for index, question in enumerate(config.QUESTIONS):
        rule = rule_factory.create_rule(ta_path, index)
        rule.check()
        result = rule.create_result()
        check_result.extend(result)

    html_content = HtmlContent(check_result)
    html = html_content.generate()

    conf = ConfluenceRpc(username, password, key)
    try:
        conf.log_in()
    except Exception, e:
        print e
        print "ERROR: Failed to login confluence, please check your username and password "
        sys.exit(1)
    try:
        page_id = conf.get_pageid_by_title(page_title)
    except Exception, e:
        print e
        print "ERROR: Failed to access the page, please check your url"
        sys.exit(1)

    conf.update_page_content(html, page_id)
    conf.log_out()


if __name__ == "__main__":
    main(sys.argv[1:])
