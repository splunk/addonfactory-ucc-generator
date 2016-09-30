# -*- coding: utf-8 -*-
'''
Meta
====
    $Id: //splunk/current/test/tests/static/pychecker.py#8 $
    $DateTime: 2011/05/10 12:01:49 $
    $Author: jlin $
    $Change $
'''

import os, sys, logging, subprocess, time
from xml.dom.minidom import Document


class PycheckerTest:

    def __init__(self, argv):
	'''
	Setup Logger, defaults init path to ".", if none was specified when instantiating PycheckerTest.

	'''

	if len(argv) == 0:
	    self.start_dir = "."
	else:
	    self.start_dir = argv[0]

	self.start_dir = os.path.abspath(self.start_dir)
	logging.basicConfig(level=logging.INFO,
				 format='%(asctime)s %(levelname)-5s  %(message)s',
				 filename='pc_result.log',
				 filemode='w')
	self.logger = logging.getLogger('selenium-python-fw')
	self.logger.info('Logging setup completed.')
	self.logger.info('Starting directory/file: {path}\n'.format(path=self.start_dir))


    def test_pychecker(self, start_dir=None):
	'''
	This test will walk recursively on the sepecified start directory, and find all *.py files.
	It will then run Pychecker on the file. If the start_dir is a file it will just test that one file, if it's a *.py file.

	IF Pychecker returns with no error or warnings, the .py file passed otherwise it fails.

	@type start_dir: string
	@param start_dir: the starting directory/file of where to run the test.

	@rtype:	    list
	@return:    list of dictionarys in the format: { "class":"a", "name":"b", "time":"number in second", "result":"pass/failure", "message":"stack trace/error message"

	'''
	self.logger.info( "inside test_pychecker" )
	if start_dir == None:
	    start_dir = self.start_dir


	results = []
	num_of_files_tested = 0
	num_of_files_passed = 0
	num_of_files_failed = 0

	if not os.path.exists(start_dir):
	    return None

	if os.path.isfile(start_dir):
            file = start_dir 
	    num_of_files_tested += 1
	    self.logger.info( "============================================================" )
	    self.logger.info( "Testing File: {file}\n".format(file=start_dir))
            
            if (file=='nodegraph.py' or file=='emulate_buffered_nulls.py' or file=='testadapter.py' or file=='test.py' or file=='event-emitter.py' or file=='runScript.py' or file=='elapsed_ms.py'): 
                cmd ="" 
            else:
                script = os.path.abspath(os.path.join(os.curdir, 'contrib', 'pychecker', 'pychecker', 'checker.py'))
	        cmd = """python {script} {file}""".format(script=script, file=start_dir) 

	    start_time = time.time()
	    if os.name =='nt':
		p = subprocess.Popen(cmd.replace('/', "\\"), stdout=subprocess.PIPE, stderr=subprocess.STDOUT, shell=True)
	    else:
		p = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, shell=True)

	    proc_stdout = p.communicate()[0]
	    p.wait()

	    time_delta = time.time() - start_time
	    retcode = p.returncode

            #if stdout contains error keywords set returncode to 2 
            if (proc_stdout.find('SyntaxError') != -1 or proc_stdout.find('Caught exception') != -1 or proc_stdout.find('NameError') != -1):  
                retcode = 2   
            
            print retcode 

	    if retcode == 0:
		num_of_files_passed += 1
		results.append({'class': os.path.realpath(start_dir), 'name': start_dir, 'time': time_delta, 'result': 'pass', 'message': ''})
		self.logger.info( "Test Result: PASS\n" )
	    elif retcode == 1:
		num_of_files_passed += 1
		results.append({'class': os.path.realpath(start_dir), 'name': start_dir, 'time': time_delta, 'result': 'pass', 'message': 'Pass with warnings'})
		self.logger.info( "STDOUT: {stdout}".format(stdout=proc_stdout))
		self.logger.info( "Test Result: PASS with warnings\n" )
	    else:
		num_of_files_failed += 1
		results.append({'class': os.path.realpath(start_dir), 'name': start_dir, 'time': time_delta, 'result': 'failure', 'message': proc_stdout})
		self.logger.error( "STDOUT: {stdout}".format(stdout=proc_stdout))
		self.logger.error( "Test Result: FAIL")

	    self.logger.info( "------------------------------------------------------------" )
	else:
	    self.logger.info("Starting path = {path}\n".format(path=start_dir))
	    self.logger.info( "Starting walking the path ..." )
	    for root, dirs, file_list in os.walk(start_dir):
                #ignore files under certain directories
                # TODO: Should probably have a better way to fit for all python version
		if root.find('contrib') != -1 or root.find('test' + os.sep) != -1 or root.find('python2.7') != -1 or root.find('prototypes') != -1:
		    continue

		for file in file_list:
		    if file.endswith(".py"):

			num_of_files_tested += 1

			file_path = os.path.join(root, file)
			self.logger.info( "============================================================" )
			self.logger.info( "Testing File: {file}".format(file=file_path))

                        if (file=='nodegraph.py' or file=='emulate_buffered_nulls.py' or file=='testadapter.py' or file=='test.py' or file=='event-emitter.py' or file=='runScript.py' or file=='elapsed_ms.py'): 
                            cmd ="" 
                        else: 
                            script = os.path.abspath(os.path.join(os.curdir, 'contrib', 'pychecker', 'pychecker', 'checker.py'))
                            cmd = """python {script} {file}""".format(script=script, file=file_path) 
                        
			start_time = time.time()
			if os.name =='nt':
			    p = subprocess.Popen(cmd.replace('/', "\\"), stdout=subprocess.PIPE, stderr=subprocess.STDOUT, shell=True)
			else:
			    p = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, shell=True)

			proc_stdout = p.communicate()[0]
			p.wait()
                         
			time_delta = time.time() - start_time
			retcode = p.returncode

                        #if stdout contains error keywords set returncode to 2 
                        if (proc_stdout.find('SyntaxError') != -1 or proc_stdout.find('Caught exception') != -1 or proc_stdout.find('NameError') != -1):  
                            retcode = 2   
                                                 
			if retcode == 0:
			    num_of_files_passed += 1
			    results.append({'class': root, 'name': file, 'time': time_delta, 'result': 'pass', 'message': ''})
			    self.logger.info( "Test Result: PASS\n" )
			elif retcode == 1:
			    num_of_files_passed += 1
			    results.append({'class': root, 'name': file, 'time': time_delta, 'result': 'pass', 'message': 'Pass with warnings'})
			    self.logger.info( "STDOUT: {stdout}".format(stdout=proc_stdout))
			    self.logger.info( "Test Result: PASS with warnings\n" )
			else:
			    num_of_files_failed += 1
			    results.append({'class': root, 'name': file, 'time': time_delta, 'result': 'failure', 'message': proc_stdout})
			    self.logger.error( "STDOUT: {stdout}".format(stdout=proc_stdout))
			    self.logger.error( "Test Result: FAIL")

			self.logger.info( "------------------------------------------------------------" )


	assert num_of_files_tested == num_of_files_passed + num_of_files_failed, "TOTAL != PASS + FAIL"

	return results


    def print_results(self, results):
	'''
	Prints out the result summary to the logger.

	@type  result:	list
	@param result:	list of dictionaries that has a key "result" mapped to "pass" or "failure". i.e.: result[0]['result'] = 'pass'
	'''

	passed_with_warnings = len([result for result in results if result['message'] == 'Pass with warnings' ])
	passed = len([result for result in results if result['result'] == 'pass' ]) - passed_with_warnings
	failed = len([result for result in results if result['result'] != 'pass' ])
	total = passed + failed + passed_with_warnings

	self.logger.info( "")
	self.logger.info( "******************************")
	self.logger.info( "**\tRESULTS:")
	self.logger.info( "**\t  PASSED:		{num}".format(num=passed))
	self.logger.info( "**\t  PASSED WITH WARNINGS:	{num}".format(num=passed_with_warnings))
	self.logger.info( "**\t  FAILED:		{num}".format(num=failed))
	self.logger.info( "**")
	self.logger.info( "**\tTOTAL: {num}".format(num=total))
	self.logger.info( "******************************")
	self.logger.info( "")



    def generate_xml(self, results, time=0):
	'''
	Generates pc-test-result XML file using the results.

	@type  result:	list
	@param result:	list of dictionarys in the format: { "class":"a", "name":"b", "time":"number in second", "result":"pass/failure", "message":"stack trace/error message"
	'''

	doc = Document()
	testsuite = doc.createElement("testsuite")

	passed = len([result for result in results if result['result'] == 'pass' ])
	failed = len([result for result in results if result['result'] != 'pass' ])
	total = passed + failed

	# Generate the header
	testsuite.setAttribute("name", "pychecker-tests")
	testsuite.setAttribute("errors", "0")
	testsuite.setAttribute("failures", str(failed))
	testsuite.setAttribute("skipped", "0")
	testsuite.setAttribute("tests", str(total))
	testsuite.setAttribute("time", str(time))
	doc.appendChild(testsuite)

	for test in results:
	    # For each file generate a testcase entry in the xml
	    testcase = doc.createElement("testcase")

	    testcase.setAttribute("classname", test['class'])
	    testcase.setAttribute("name", test['name'])
	    testcase.setAttribute("time", str(test['time']))
	    testsuite.appendChild(testcase)

	    # For failed tests (i.e.: test with errors or warnings), show the message of the errors.
	    if not test['result'] == 'pass':
		testfail = doc.createElement("failure")
		testfail.setAttribute("message", "test failure")
                testfail.appendChild(doc.createTextNode(test['message']))
		testcase.appendChild(testfail)

	# Write the xml to disk in directory where the test is executed.
	f = open('test-result.xml', 'w')
	text = doc.toprettyxml("    ", "\n")
	f.write(text)
	f.close()


if __name__ == '__main__':
    pc = PycheckerTest(sys.argv[1:])
    print "Running Pychecker test..."

    start_time = time.time()
    results = pc.test_pychecker()
    time = time.time() - start_time
    pc.print_results(results)
    pc.generate_xml(results, time)

    print "Done."

