import argparse

from testlink import *
from pyh import *


class Goblin():
    SERVER_URL = "https://testlink-prod.sv.splunk.com/testlink-orig/lib/api/xmlrpc.php"
    DEV_KEY = "2cde5b728747f319ff2fec17f7934672"
    SEARCH_ROOT_ID = "34793"  # TA in Solutions project
    SEARCH_ROOT_NAME = "TA"

    def __init__(self, ta_name1):
        self.ta_name = ta_name1
        tl_helper = TestLinkHelper(Goblin.SERVER_URL, Goblin.DEV_KEY)
        self.testlink = tl_helper.connect(TestlinkAPIClient)
        assert self.testlink.checkDevKey() is True

    def get_test_cases(self, parent_test_suite_id, prefix):
        print 'Scanning test suite', prefix.replace('\\', '>')
        ta_test_cases = {}
        test_cases = self.testlink.getTestCasesForTestSuite(parent_test_suite_id, False, 'full')
        if len(prefix) > 0 and prefix[-1] == '\\':
            test_suite_path = prefix[:-1]
        else:
            test_suite_path = prefix

        if len(test_cases) > 0:
            for a_test_case in test_cases:
                test_case_detail = self.testlink.getTestCase(a_test_case['id'])
                a_test_case['steps'] = test_case_detail[0]['steps']
            ta_test_cases[test_suite_path] = test_cases

        test_suite_nodes = self.testlink.getTestSuitesForTestSuite(parent_test_suite_id)

        if len(test_suite_nodes) > 0:
            if test_suite_nodes.has_key('id'):
                test_suite_nodes = {test_suite_nodes['id']: test_suite_nodes}

            for test_suite_id in test_suite_nodes.keys():
                test_suite_name = test_suite_nodes[test_suite_id]['name']
                ta_test_cases.update(self.get_test_cases(test_suite_id, prefix + test_suite_name + '\\'))

        return ta_test_cases

    def gen_report(self, test_cases, ta_name):
        page = PyH(ta_name + ' Test Case Summary')

        #inline CSS
        page << style("""
        h1
        {
            background: #E9ECEE;
            color: #003399;
            font-size: 20pt;
            margin: 0;
            padding: 1px;
            text-align: center;
        }
        h4
        {
            color: rgb(51, 51, 51);
            font-size: 18px;
            font-style: normal;
            font-weight: bold;
            text-align: left;
            text-decoration: underline;
            text-indent: 0px;
        }
        A, A:Visited
        {
            color: #00F;
        }
        A:Active, A:Hover
        {
            color: #F00;
        }
        table
        {
            border: none;
            border-spacing: 0px;
            border-collapse: collapse;
        }
        th
        {
            vertical-align:top;
            background-color:#e3e6ed;
            border: solid 1px #000000;
            color: #000080;
            font-weight: bold;
            text-align: center;
        }
        td
        {
            vertical-align: top;
            border: solid 1px #000000;
        }
        tr
        {
            text-align: left;
            vertical-align: top;
        }
        """)

        page << h1('Test Case Summary (' + ta_name + ')', cl='center')

        page << h2('Test Suite')
        for test_suite in sorted(test_cases.keys()):
            cases = test_cases[test_suite]
            if len(test_suite) == 0:
                test_suite = self.ta_name
            if len(cases) > 0:
                page << a(test_suite.replace('\\', ' > ') + ' (' + str(len(cases)) + ')',
                          href='#' + test_suite.replace('\\', '_')) << br()
        page << br()

        for test_suite in sorted(test_cases.keys()):
            cases = test_cases[test_suite]
            index = 0
            if len(cases) > 0:
                if len(test_suite) == 0:
                    test_suite = self.ta_name
                page << a('', name=test_suite.replace('\\', '_'))
                page << h2(test_suite.replace('\\', ' > ') + ' (' + str(len(cases)) + ')')
                for case in cases:
                    execution_type = 'Manual'
                    if case['execution_type'] == '2':
                        execution_type = 'Automated'
                    index += 1
                    page << h3(str(index) + '. ' + case['name'] + ' (' + execution_type + ')')

                    if len(case['summary']) > 0:
                        page << h4('Summary:')
                        case['summary'] = case['summary'].encode('ascii', 'replace')
                        page << p(case['summary'])
                    else:
                        page << h4('Summary:')
                        page << p('N/A')
                    if len(case['steps']) > 0:
                        page << h4('Steps:')
                        mytab = page << table(cellspacing="0", cellpadding="2", border="0")
                        tr1 = mytab << tr()
                        tr1 << th('Step', style="width: 36px;") + \
                               th('Action', style="width: 500px;") + \
                               th('Expected Result', style="width: 500px;")
                        for step in case['steps']:
                            step['actions'] = step['actions'].encode('ascii', 'replace')
                            step['expected_results'] = step['expected_results'].encode('ascii', 'replace')
                            tr1 = mytab << tr()
                            tr1 << td(step['step_number'],
                                      style="font-weight:bold;width:36px;text-align:center;vertical-align:middle") + \
                                   td(step['actions'], style="width: 500px;") + \
                                   td(step['expected_results'], style="width: 500px;")

                page << br()
        filename = ta_name + '_testcase.html'
        page.printOut(filename)
        print filename, 'is generated.'

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("ta", help='TA name in testlink')
    args = parser.parse_args()
    ta_name = args.ta
    myl = Goblin(ta_name)
    if ta_name == myl.SEARCH_ROOT_NAME:
        myl.gen_report(myl.get_test_cases(myl.SEARCH_ROOT_ID, ''), ta_name)
    else:
        nodes = myl.testlink.getTestSuitesForTestSuite(myl.SEARCH_ROOT_ID)
        for id1 in nodes.keys():
            if nodes[id1]['name'] == ta_name:
                myl.gen_report(myl.get_test_cases(id1, ''), ta_name)