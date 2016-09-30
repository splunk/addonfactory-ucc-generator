import ConfigParser
import re
import argparse

from jira import JIRA
from testlink import *


def testlink_find_id_by_path(testlink_client, root_id, path):
    nodes = path.split('/')
    id = root_id
    for name in nodes:
        test_suite_list = testlink_client.getTestSuitesForTestSuite(id)
        old_id = id
        for test_suite_id, test_suite_info in test_suite_list.items():
            if test_suite_info['name'] == name:
                id = test_suite_id
                break
        if id == old_id:
            return None
    return id


def testlink_add_test_case(testlink_client, test_suite_id, test_case_name, summary, steps):
    test_case_in_suite = testlink_client.getTestCasesForTestSuite(test_suite_id, 'false', 'simple')

    for tc in test_case_in_suite:
        if test_case_name == tc['name']:
            print test_case_name, 'already exists.'
            return

    print 'Create test case: ', test_case_name

    if len(steps) == 0:
        testlink_client.initStep('', '', 1)

    for i in range(len(steps)):
        if i == 0:
            testlink_client.initStep(steps[i]['action'], steps[i]['result'], 1)
        else:
            testlink_client.appendStep(steps[i]['action'], steps[i]['result'], 1)
    try:
        testlink_client.createTestCase(test_case_name, test_suite_id, '3506', 'ayu', summary)
    except:
        print 'Create test case', test_case_name, 'Failed.'


def generate_test_case(key, summary, description):
    if summary.startswith('['):
        test_case_name = summary[summary.find(']') + 1:]
    else:
        test_case_name = summary
    test_case_name = test_case_name.strip(' ').replace(' ', '_').lower()

    test_case_summary = 'JIRA Ticket: <a href="https://jira.splunk.com/browse/' + key + '">' +\
                        key + '</a>'

    lines = description.splitlines()
    test_case_steps = []
    for line in lines:
        r = re.search('^\d*\.\w*(.*)', line)
        if r:
            test_case_steps.append({'action': r.group(1), 'result': ''})
        else:
            if line.lower().find('steps to reproduce') < 0:
                test_case_summary += '<br>' + line

    return test_case_name, test_case_summary, test_case_steps


def get_test_suite_id(test_suite_mapping, labels):
    for label in labels:
        if label in test_suite_mapping.keys():
            return test_suite_mapping[label]

    return None


if __name__ == '__main__':

    parser = argparse.ArgumentParser()
    parser.add_argument("-u", help='JIRA login username')
    parser.add_argument("-p", help='JIRA_login_password')
    args = parser.parse_args()
    jira_user = args.u
    jira_pass = args.p

    config = ConfigParser.ConfigParser()
    config.read('j2t.cfg')

    jira_server = config.get('JIRA', 'server')
    jira_jql = config.get('JIRA', 'jql')

    testlink_server = config.get('TestLink', 'server')
    testlink_dev_key = config.get('TestLink', 'dev_key')
    testlink_root_id = config.get('TestLink', 'root_id')
    testlink_project_id = config.get('TestLink', 'project_id')

    testlink_helper = TestLinkHelper(testlink_server, testlink_dev_key)
    testlink_client = testlink_helper.connect(TestlinkAPIClient)
    testlink_client.checkDevKey() is True

    test_suite_base = config.get('TestSuite', 'base')
    test_suite_default = test_suite_base + '/' + config.get('TestSuite', 'default')
    test_suite_default_id = testlink_find_id_by_path(testlink_client,
                                                     testlink_root_id,
                                                     test_suite_default)

    test_suite_mapping = {}
    for jira_label, test_suite_path in config.items('TestSuite'):
        if test_suite_path not in ['base', 'default']:
            test_suite_path = test_suite_base + '/' + test_suite_path
            test_suite_id = testlink_find_id_by_path(testlink_client,
                                                     testlink_root_id,
                                                     test_suite_path)
        if test_suite_id:
            test_suite_mapping[jira_label] = test_suite_id

    jira = JIRA(jira_server, basic_auth=(jira_user, jira_pass))
    jira_issues = jira.search_issues(jql_str=jira_jql, maxResults=False)

    jira_key_list = []
    for issue in jira_issues:
        jira_key_list.append(issue.key)

    for jira_key in jira_key_list:
        issue = jira.issue(jira_key, fields='summary,labels,resolution,description')

        # if 'tabuilder_UI' in issue.fields.labels:
        #     print jira_key
        #     issue.fields.labels.remove('tabuilder_UI')
        #     issue.fields.labels.append('tabuilder_ui')
        #     print issue.fields.labels
        #     issue.update(fields={"labels": issue.fields.labels})

        # test_case_name, test_case_summary, test_case_steps = generate_test_case(jira_key,
        #                                                                         issue.fields.summary,
        #                                                                         issue.fields.description)
        #
        # test_suite_id = get_test_suite_id(test_suite_mapping, issue.fields.labels)
        # if test_suite_id is None:
        #     test_suite_id = test_suite_default_id
        #
        # if str(issue.fields.resolution) == 'Fixed':
        #     testlink_add_test_case(testlink_client,
        #                            test_suite_id,
        #                            test_case_name,
        #                            test_case_summary,
        #                            test_case_steps)