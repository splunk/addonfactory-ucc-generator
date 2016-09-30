import os
import sys
from Utils import AppPandaUtils

class AppPandaTestRunner:
    
    def __init__(self, parse_args, logger):
        self.parser_args = parse_args
        self.logger = logger
        self.ui_test = self.parser_args.ui_test
        self.utils = AppPandaUtils(self.logger)
        
        self.logger.info("In App Panda Test Runner")

        if self.parser_args.runscript is not None:
            self.run_script()
        if self.parser_args.testdirs is not None:
            self.run_tests(self.parser_args.testdirs)
        
    def run_script(self):
        '''
        Run script using pytest.
        '''

        if self.parser_args.newtestdir:
            if os.path.exists(self.parser_args.newtestdir):
                pytest_file = self.get_pytest()
                self.logger.info("The pytest file is %s", pytest_file)
            else:
                self.logger.info("The given newtestdir path does not exist. Cannot run script", self.parser_args.newtestdir)
                print "The given newtestdir path does not exist. Cannot run script"
                return
        else:
            pytest_file = "py.test"
            self.logger.info("The pytest file is %s", pytest_file)

        #Now Run the Script.
        if os.path.exists(self.parser_args.runscript):
            pytest_args = '-v --junitxml test-result.xml'

            if not self.ui_test:
                splunk_bin_path = os.path.join(self.parser_args.splunk_home,"bin","splunk")
                _cmd = " ".join([splunk_bin_path, 'cmd', 'python', pytest_file, self.parser_args.runscript, pytest_args])
            else:
                if sys.platform == 'win32':
                    if os.path.exists("C:\Python27\python.exe"):
                        
                        if self.parser_args.newtestdir:
                            _cmd = " ".join(["C:\Python27\python.exe", pytest_file, self.parser_args.runscript, pytest_args])
                        else:
                            _cmd = " ".join([pytest_file, self.parser_args.runscript, pytest_args])
                    else:
                        if self.parser_args.newtestdir:
                            _cmd = " ".join(['python', pytest_file, self.parser_args.runscript, pytest_args])
                        else:
                            _cmd = " ".join([pytest_file, self.parser_args.runscript, pytest_args])
                            
                else:
                    if self.parser_args.newtestdir:
                        _cmd = " ".join(['python', pytest_file, self.parser_args.runscript, pytest_args])
                    else:
                        _cmd = " ".join([pytest_file, self.parser_args.runscript, pytest_args])
                            
            
            self.logger.info("The Command to Run for Script is %s", _cmd)
            os.system(_cmd)
            self.utils.restart_splunk(self.parser_args.splunk_home)

    def run_tests(self, tests):
        '''
        Run tests using Pytest.
        '''

        if self.parser_args.newtestdir:
            if os.path.exists(self.parser_args.newtestdir):
                pytest_file = self.get_pytest()
                self.logger.info("The pytest file is %s", pytest_file)
            else:
                self.logger.info("The given newtestdir path does not exist. Cannot run script", self.parser_args.newtestdir)
                print "The given newtestdir path does not exist. Cannot run script"
                return
        else:
            pytest_file = "py.test"
            self.logger.info("The pytest file is %s", pytest_file)

        if not self.ui_test:
            splunk_bin_path = os.path.join(self.parser_args.splunk_home,"bin","splunk")

        pytest_args = os.environ.get('PYTEST_ARGS','')
        
        #Now run the tests:
        for test in tests:
            #If the test is a directory, run all the tests in the directory. 
            #If the test is a file, then run the tests in that file.
            
            (folder, ext) = os.path.splitext(test)
            
            if ext == '':
                if not self.ui_test:
                    _cmd = " ".join([splunk_bin_path, 'cmd', 'python', pytest_file, pytest_args])
                else:
                    if sys.platform == 'win32':
                        if os.path.exists("C:\Python27\python.exe"):
                            if self.parser_args.newtestdir:
                                _cmd = " ".join(['C:\Python27\python.exe', pytest_file, pytest_args])
                            else:
                                _cmd = " ".join([pytest_file, pytest_args])
                        else:
                            if self.parser_args.newtestdir:
                                _cmd = " ".join(['python', pytest_file, pytest_args])
                            else:
                                _cmd = " ".join([pytest_file, pytest_args])       
                    else:
                        if self.parser_args.newtestdir:
                            _cmd = " ".join(['python', pytest_file, pytest_args])
                        else:
                            _cmd = " ".join([pytest_file, pytest_args])

                    self.logger.info("The Command to run tests is %s", _cmd)

                current_dir = os.getcwd()
                os.chdir(test)
                os.system(_cmd)
                os.chdir(current_dir)
            else:
                if not self.ui_test:
                    _cmd = " ".join([splunk_bin_path, 'cmd', 'python', pytest_file, test, pytest_args])
                else:
                    if sys.platform == 'win32':
                        if os.path.exists("C:\Python27\python.exe"):
                            _cmd = " ".join(['C:\Python27\python.exe', pytest_file, test, pytest_args])
                        else:
                            _cmd = " ".join(['python', pytest_file, test, pytest_args])
                    else:
                        _cmd = " ".join(['python', pytest_file, test, pytest_args])
                os.system(_cmd)
    
    def get_pytest(self):
        
        current_dir = os.getcwd()
        os.chdir(self.parser_args.newtestdir)
        
        #If on Windows run .cmd.
        if sys.platform == 'win32':
            self.utils.run_cmd("setTestEnv.cmd", required=False, cwd=None, is_shell=True)
        else:
            os.system("source ./setTestEnv")
            
        os.chdir(current_dir)
        new_test_lib    = os.path.join(self.parser_args.newtestdir, 'lib')
        pytest_dir      = os.path.join(new_test_lib, 'pytest')
        sys.path.append(new_test_lib)
        return os.path.join(pytest_dir, 'pytest.py')