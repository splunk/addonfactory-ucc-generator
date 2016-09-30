import json
import os
import sys

class GenesisManager:
    '''
    Parse the Genesis.txt and the Genesis.json files.
    '''
    
    def __init__(self, path):

        self.genesis_txt    = os.path.join(path, "Genesis.txt")
        self.genesis_json   = os.path.join(path, "Genesis.json")
        self.path = path
    
    def genesis_files_exist(self):
        '''
        Return True if the genesis files exist.
        ''' 

        if os.path.isfile(self.genesis_txt) and os.path.isfile(self.genesis_json):
            return True
        
        return False

    def get_enabled_tests(self):
        '''
        Get the tests that are enabled in Genesis.txt.
        '''
        
        if not self.genesis_files_exist():
            print "The Genesis.txt OR Genesis.json file passed do not exist. Please re-check!"
            sys.exit(0)
        
        enabled_tests = [t.strip('\n').split('=')[0].strip() for t in open(self.genesis_txt) if t.strip('/n').split('=')[1].strip()=='1']
        return enabled_tests

    def get_enabled_tests_paths(self):
        '''
        Parser the JSON file and get the paths to the tests that are enabled.
        '''
        enabled_tests = self.get_enabled_tests()

        if 'RUNUITESTS' not in enabled_tests:
            self.create_dummy_test_results_report()
            print "You need RUNUITESTS=1 in Genesis.txt for tests to run. Please add it and re-run."
            sys.exit(0)

        with open(self.genesis_json) as t:
            all_test_paths = json.load(t)

        enabled_test_paths = {}

        for test in enabled_tests:
            if test == "RUNUITESTS":
                continue

            if all_test_paths.get(test, None) is None:
                print "Test %s has no tests in JSON File" % test
            else:
                enabled_test_paths[test] = all_test_paths[test]

        return enabled_test_paths

    def get_tests_to_run(self):
        '''
        Get the tests to run.
        '''
        all_tests = []
        for component, tests in self.get_enabled_tests_paths().iteritems():
            for test in tests:
                all_tests.append(os.path.join(self.path, test.lstrip("/")))

        return all_tests
    
    def create_dummy_test_results_report(self):
        '''
        When we have no tests we need to create this as bamboo needs it.
        '''
        file_name = 'test-reports-result.xml'
        test_result = '''<?xml version="1.0" encoding="utf-8"?>
<testsuite errors="0" failures="0" name="nose2-junit" skips="0" tests="1" time="0.004">
  <testcase classname="pkg1.test.test_things" name="test_gen:1" time="0.000141" />
</testsuite>''' 
        with open(os.path.join(self.path, file_name), 'w') as f:
            f.write(test_result)