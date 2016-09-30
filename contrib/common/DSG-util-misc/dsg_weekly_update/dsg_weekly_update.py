#! /usr/bin/env python
# ###############################################################################
#
# Copyright (c) 2016 Splunk.Inc. All Rights Reserved
#
# ###############################################################################
"""
Main function
Author: Jing Shao(jshao@splunk.com)
Date:    2016/4/20 14:25:01
version: 1.0 0
"""

import sys
import re
import getopt

import config
from conflunce_rpc import ConfluenceRpc


def help_message():
    print "Usage: ./dsg_weekly_update.py  -w <Wiki URL> -u <username> -p <password>\n"
    print "./dsg_weekly_update.py -u jane -p 1234"
    print "-u(mandatory) : Username to login confluence"
    print "-p(mandatory) : Password to login confluence"


def get_parameters(argv):
    username = ''
    password = ''
    try:
        opts, args = getopt.getopt(argv, 'hu:p:')
    except getopt.GetoptError:
        help_message()
        sys.exit(1)
    for opt, arg in opts:
        if opt == "-u":
            username = arg.strip()
        elif opt == "-p":
            password = arg.strip()
        else:
            help_message()
            sys.exit(1)
    if username is '' or password is '':
        help_message()
        sys.exit(1)

    return username, password


def get_person_status(page_content):
    """
    :param page_content:
    :return: status["person"] = {"This week": "123"; "Next week": "456"}
    """
    pattern = r'<td colspan="1">.+?</td></tr><tr>'
    all_status = re.findall(pattern, page_content)

    status = {}
    for person_status in all_status:
        pattern = r'(<td colspan="1">.+?</td>)'
        person_items = re.findall(pattern, person_status)
        re_h = re.compile('</?\w+[^>]*>', re.I)
        re_td = re.compile('</?td[^>]*>', re.I)
        if len(person_items) < 4:
            continue
        status[re_h.sub('', person_items[0])] = {}
        status[re_h.sub('', person_items[0])][config.DONE] = re_td.sub('', person_items[1])
        status[re_h.sub('', person_items[0])][config.TODO] = re_td.sub('', person_items[2])
    return status


def get_date_in_title(latest_children_title, source):
    """
    :param latest_children_title:Weekly Update 20160416 - 20160421 / 2016-04-21 DSG Weekly Update
    :source:"src" / "dst"
    :return:20160421
    """
    if source is "src":
        split_list = latest_children_title.split("-")
        date = split_list[1].strip()
    if source is "dst":
        split_list = latest_children_title.split(" ")
        date = split_list[0].strip().replace("-", "")
    return date


def main(argv):
    username, password = get_parameters(argv)
    conf_source = ConfluenceRpc(config.SOURCE_URL, username, password)
    conf_source.log_in()

    try:
        src_page_content = conf_source.get_latest_children_page_content()
        latest_children_title = conf_source.get_latest_children_page_title()
        # Weekly Update 20160416 - 20160421
        src_date = get_date_in_title(latest_children_title, 'src')

        all_status = get_person_status(src_page_content)
    except Exception, e:
        print e
        print "ERROR: Failed to get status form QA Weekly Update Table"
        sys.exit(1)
    conf_source.log_out()

    conf_dst = ConfluenceRpc(config.DEST_URL, username, password)
    conf_dst.log_in()

    try:
        dst_page_id = conf_dst.get_latest_children_page_id()
        dst_page_content = conf_dst.get_latest_children_page_content()
        latest_children_title = conf_dst.get_latest_children_page_title()
        # 2016-04-20 DSG Weekly Update
        dst_date = get_date_in_title(latest_children_title, 'dst')

        if dst_date != src_date:
            print "Date in DSG Weekly update table title is not align with QA Weekly update tile"
            print "Check whether Josh has created the DSG Weekly update table\n"
            sys.exit(1)

        for (username, userkey) in config.NAME_KEY_MAPPING.items():
            repl = "<td><p>{}:</p>{}<p>{}:</p>{}</td>".format(
                config.DONE,
                all_status[username][config.DONE],
                config.TODO,
                all_status[username][config.TODO])

            pattern = r'((<td><ac:link><ri:user ri:userkey="{}" /></ac:link></td>)(.+?{}.+?{}.+?)</td>)'.format(
                userkey,
                config.DONE,
                config.TODO)

            person_status = re.findall(pattern, dst_page_content)
            if not person_status:
                print "Have not find person {} in destination DSG page. Ignore".format(username)
                continue
            replaced_person_status = person_status[0][1] + repl
            dst_page_content = re.sub(pattern, replaced_person_status, dst_page_content)
            print "Update status for {}".format(username)

        conf_dst.update_page_content(dst_page_content, dst_page_id)
    except Exception, e:
        print e
        print "ERROR: Failed to update DSG Weekly Update Table"
        sys.exit(1)

    conf_dst.log_out()


if __name__ == "__main__":
    main(sys.argv[1:])
