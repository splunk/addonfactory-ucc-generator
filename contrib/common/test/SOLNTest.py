#Please use splunk's python when executing these tests
#################################################################################
## Quick Start Readme
#  1) define an environment variable SPLUNK_NEW_TEST that references splunk/current/new_test
#  2) set your SOLN_ROOT path by using . setenv.sh in splunk/solutions
#  3) SPLUNK_SERVER,SPLUNK_WEB,SPLUNK_USER,SPLUNK_PASSWORDS are all local defaults
#     unless overwritten in the environment
#  4) Use splunk cmd python to execute these tests
#
## Testing
#   1) self.splunkweb.request issues splunk web requests
#   2) splunkd requests can be made by using rest.simpleRequest using self.splunkd_session_key
#   3) the command line interface uses splunkcli
#################################################################################
import unittest
import os
import sys
import time
import logging
import datetime
import json
from optparse import OptionParser
#Splunk imports (typically)
try:
    import splunk.auth
    import lxml.etree as et
except ImportError, e:
    print "*** ERROR ***"
    print e
    print "*** Please use splunk's python ($SPLUNK_HOME/bin/splunk cmd python)"
    print "*** To execute the unit tests"
    sys.exit(1)

soln_root = os.environ.get("SOLN_ROOT",None)
if soln_root != None:
    sys.path.append(os.path.join(soln_root,"common","test"))
try:
    import splunkweb
except ImportError, e:
    print "*** ERROR ***"
    print e
    print "*** Could not import splunkweb.  Possible causes"
    print "***  Check that you have grabbed it from"
    print "***  splunk/solutions/common/test"
    if soln_root == None:
        print "*** check SOLN_ROOT is defined and references splunk/solutions/"

#############################################################
#Now that we know the environment is sane, make all of the tests
#############################################################
class SOLNTestException(Exception): pass
class SetupError(SOLNTestException): pass
class QuerySanityCheckException(SOLNTestException): pass
    # def __init__(self,message):
    #     self.message = message
    # def __str__(self):
    #     return repr(self.message)


if "pytest" not in sys.modules.keys():
    class TestBase(unittest.TestCase):
        '''
        When running in a development environment, we want to use unittest.TestCase ...
        '''
        pass
else:
    class TestBase(object):
        '''
        When running on py.test, we don't want to extend unittest, just use plain old objects
        '''
        pass

    import pytest
    import py

class Tester(TestBase):
    '''
    Use the tester class
    '''

    ignoreSkip = False

    @staticmethod
    def splunk_setup(self):
        '''
        Sets up splunk to be used later in tests
        '''
        #Grab the environment, with reasonable defaults
        self.splunk_server_path = os.environ.get("SPLUNK_SERVER","https://localhost:8089")
        self.splunk_web_path = os.environ.get("SPLUNK_WEB","https://localhost:8000")
        self.splunk_user = os.environ.get("SPLUNK_USER","admin")
        self.splunk_password = os.environ.get("SPLUNK_PASSWORD","changeme")
        #Unfortunately, we cant really infer this, so we'll need the user to set it explicitly
        self.splunk_home = os.environ.get("SPLUNK_HOME",None)
        if self.splunk_home == None:
            print "*** ERRROR: Please define SPLUNK_HOME before proceeding"
            print "*** This should point to your local splunk install path"
            sys.exit(1)
        # Workaround for ITOA-325: we may find ourselves in a state when splunkd is
        # running, but not accepting connections
        import httplib2
        http = httplib2.Http(disable_ssl_certificate_validation=True)
        #First, just check and see the splunkd is up and running
        from socket import error as socketerror
        try:
            r,c = http.request(self.splunk_server_path, "GET")
        except socketerror,e:
            print "*** ERROR: exception %s" % e
            print "*** Check that splunk server at %s is up and running" % self.splunk_server_path
            sys.exit(1)
        max_tries = 300
        for i in xrange(max_tries):
            try:
                r, c = http.request(self.splunk_web_path, "GET")
                if r.status == 200:
                    break
            except Exception as e:
                pass
            finally:
                time.sleep(0.1)

        #Get an interface to splunkweb
        try:
            self.splunk_web = splunkweb.SplunkWeb(username = self.splunk_user,
                                                password = self.splunk_password,
                                                hostpath = self.splunk_web_path)
        except splunkweb.SplunkWebLoginException as e:
            print("Error while trying to log into Splunk Web. Are your SPLUNK_WEB, SPLUNK_USER, and SPLUNK_PASSWORD environment variables set correctly?")
            print("SplunkWeb error: %s" % str(e))
            sys.exit(1)

        #Prep everything for splunkd access
        self.splunkd_session_key = splunk.auth.getSessionKey(username=self.splunk_user,
                                                             password=self.splunk_password,
                                                             hostPath=self.splunk_server_path)

        #Look in the self's directory for classes
        #TODO:  Would it be better to use inspect?
        self_directory = dir(self)
        if 'custom_class_setup' in self_directory:
            #Since we are in the setup already, we need to invoke this
            self.custom_class_setup()
        if 'custom_class_teardown' in self_directory:
            self.tearDownClass = self.custom_class_teardown
            self.teardown_class = self.custom_class_teardown
        if 'custom_method_setup' in self_directory:
            self.setUp = self.custom_method_setup
            self.setup_method = self.custom_method_setup
        if 'custom_method_teardown' in self_directory:
            self.tearDown = self.custom_method_teardown
            self.teardown_method = self.custom_method_teardown


    @classmethod
    def setUpClass(self):
        '''Default initialization - used by unittest'''
        Tester.splunk_setup(self)

    def setup_class(self):
        '''Default initialization - used by pytest'''
        Tester.splunk_setup(self)



    def results_sanity_check(self,response,content):
        try:
            assert response.status == 200 or response.status == 201 or response.status == 204
        except AssertionError:
            raise QuerySanityCheckException("Invalid response status: %i\n%s\n%s" % (response.status, content, response))

#######################################################
# Splunk search jobs
#######################################################
    @classmethod
    class skip(object):
        def __init__(self,cls,*args):
            if len(args) == 0:
                self.message = "Skipping for no particular reason"
            else:
                self.message = args[0]
            if "pytest" not in sys.modules.keys():
                self.skip_wrapper = unittest.skip
            else:
                unconditionalskip = py.test.mark.skipif(True,reason=self.message)
                self.skip_wrapper = unconditionalskip

        def __call__(self,func):
            wrapper = self.skip_wrapper
            message = "SKIPPING: " + self.message + " ... "
            def wrapper2(self,*args,**kwargs):
                if Tester.ignoreSkip:
                    return func(self)
                else:
                    sys.stdout.write(message)
                    sys.stdout.flush()
                    return wrapper
            return wrapper2

class TestRunner(object):
    '''
    Responsible for executing the tests of the class passed in
    '''
    logger = logging.getLogger('test.grayskull')

    def do_dev_tests(self,cls,tests=None):
        parser = OptionParser()
        parser.add_option("-t","--test",dest="testname",default=None,
                help="invoke a specific test via the command line")
        (options,args) = parser.parse_args()
        tests_to_run = tests
        #Supercede with user input
        if options.testname != None:
            tests_to_run = [options.testname]
            Tester.ignoreSkip = True

        loader = unittest.TestLoader()
        if tests_to_run == None:
            suite = unittest.TestLoader().loadTestsFromTestCase(cls)
        else:
            suite = unittest.TestSuite()
            for test in tests_to_run:
                suite.addTest(cls(test))

        #Execute
        unittest.TextTestRunner(verbosity=2).run(suite)
