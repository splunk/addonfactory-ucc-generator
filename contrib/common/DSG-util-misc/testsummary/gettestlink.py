import argparse
from testlink import *
#from pyh import *

# def getwhitelist():
#     filename = 'whitelist.csv'
#     _file = open(filename,'rb')
#     whitelist = []
#     for line in _file.readlines():
#         whitelist.append(line.strip('\n'))
#     _file.close()
#     print whitelist
#     return  whitelist

class trytestlink():
    SERVER_URL = "https://testlink-prod.sv.splunk.com/testlink-orig/lib/api/xmlrpc.php"
    DEV_KEY = "bc842c4c02fe8b57f1c89b4d5f113cc0"
    SEARCH_ROOT_ID = "34793"  # TA in Solutions project
    SEARCH_ROOT_NAME = "TA"

    def __init__(self):
        tl_helper = TestLinkHelper(trytestlink.SERVER_URL, trytestlink.DEV_KEY)
        self.testlink = tl_helper.connect(TestlinkAPIClient)
        assert self.testlink.checkDevKey() is True

    #def get_ta_names(self,parent_test_suite_id):

    def get_test_cases(self, parent_test_suite_id, prefix):
        #print 'Scanning test suite', prefix.replace('\\', '>')
        ta_test_cases = {}
        test_cases = self.testlink.getTestCasesForTestSuite(parent_test_suite_id, False, 'full')
        #print test_cases
        if len(prefix) > 0 and prefix[-1] == '\\':
            test_suite_path = prefix[:-1]
        else:
            test_suite_path = prefix

        if len(test_cases) > 0:
            ta_test_cases[test_suite_path] = test_cases

        test_suite_nodes = self.testlink.getTestSuitesForTestSuite(parent_test_suite_id)

        if len(test_suite_nodes) > 0:
            if test_suite_nodes.has_key('id'):
                test_suite_nodes = {test_suite_nodes['id']: test_suite_nodes}

            for test_suite_id in test_suite_nodes.keys():
                test_suite_name = test_suite_nodes[test_suite_id]['name']
                ta_test_cases.update(self.get_test_cases(test_suite_id, prefix + test_suite_name + '\\'))

        return ta_test_cases

    def count_case(self, test_cases, ta_name):

        manual_count = 0
        automated_count = 0
        total_count = 0

        print ta_name
        for test_suite in sorted(test_cases.keys()):
            cases = test_cases[test_suite]
            if len(cases) > 0:
                for case in cases:
                    total_count += 1
                    if case['execution_type'] == '1':
                        manual_count += 1
                    elif case['execution_type'] == '2':
                        automated_count += 1

        # print "Manual case count is ", manual_count
        # print "automated case count is ", automated_count
        # print "tocal case count is ", total_count
        return [manual_count,automated_count,total_count]



def gettestlink(whitelist):
    mydict = {}
    testlinkdict ={}
    myl = trytestlink()
    nodes = myl.testlink.getTestSuitesForTestSuite(myl.SEARCH_ROOT_ID)

    for id1 in nodes.keys():
        ta_name = nodes[id1]['name'].lower()
        if ta_name in whitelist:
            mydict[ta_name]=myl.count_case(myl.get_test_cases(id1, ''), ta_name)
    for ta_name in whitelist:
        if mydict.has_key(ta_name):
            testlinkdict[ta_name] = mydict[ta_name]
        else:
            testlinkdict[ta_name] = [0,0,0]
    return testlinkdict



