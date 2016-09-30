import argparse

from jira import JIRA


jira_server = 'https://jira.splunk.com'
sprint_start_date = '2016-05-06'
all_bug_jql = 'project="Add-on Builder" and type=Bug and sprint in openSprints()'


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument("-u", help='JIRA login username')
    parser.add_argument("-p", help='JIRA_login_password')
    args = parser.parse_args()
    jira_user = args.u
    jira_pass = args.p

    jira = JIRA(jira_server, basic_auth=(jira_user, jira_pass))
    jira_issues = jira.search_issues(jql_str=all_bug_jql, maxResults=False)


