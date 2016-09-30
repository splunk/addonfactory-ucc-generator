import os
import time
import re
import sys
import time
import logging
import marshal
import string
import difflib
import shutil
import textwrap
import subprocess
import socket
import logging
import json
import csv
import StringIO
try:
    import py
except ImportError, e:
    #We're assuming here that pytest is unavailable
    print "Pytest unavailable, running tests in dev context"

TIMEOUT=120
class SearchUtilException(Exception):
	def __init__(self,message):
		self.message = message
	def __str__(self):
		return repr(self.message)

class SearchUtil:

    def __init__(self, jobs, logger):
        """
        Constructor of the SearchUtil object.
        """
        self.logger = logger
        self.jobs = jobs
        self.splunk_home = os.environ["SPLUNK_HOME"]

    def failTest(self,message):
	'''
	Fail the test appropriately, QA uses pytest. Dev gets a generic message
	'''
	if 'pytest' in sys.modules.keys():
	    py.test.fail(message)
	else:
	    raise SearchUtilException(message)

    def checkQueryContainsRegex(self, query, field, regex, interval=15, retries = 4, number_results=100, max_time=60):
        tryNum = 0
        r = re.compile(regex)
        while tryNum <= retries:
            job = self.jobs.create(query, auto_finalize_ec=number_results, max_time=max_time)
            job.wait()
            results = job.get_results()
            for result_no, result in enumerate(results.as_list):
                if result_no > number_results:
                    self.logger.debug("could not find re: %s in first %d results", regex, number_results)
                    return False
                elif r.match(str(result[field])):
                    self.logger.debug("result['%s']='%s' matches re: %s", field, str(result[field]), regex)
                    return True
            tryNum += 1
            time.sleep(interval)
        self.logger.debug("could not find re: %s", regex)
        return False

    def checkQueryCount(self, query, targetCount, interval=15, retries=4, max_time=120):
        self.logger.debug("query is %s", query)
        tryNum = 0
        while tryNum <= retries:
            job = self.jobs.create(query, max_time=max_time)
            job.wait(max_time)
            
            try:
                #Case where results are truncated to 100 (default value)
                #result_count = len(job.get_results()) # Deprecating because it has the limit of showing 100 results.    
                result_count = job.get_result_count()
            except:
                self.logger.debug("Exception occured while reading job results %s", sys.exc_info())
                result_count = job.get_event_count()
            
            if result_count == targetCount:
                return True
            else:
                self.logger.debug("Count of results is not as expected, it is %d. Expected %d", result_count, targetCount)
                tryNum += 1
                time.sleep(interval)
        
        return False

    def checkQueryCountIsGreaterThanZero(self, query, interval=15, retries=4, max_time=120):
        self.logger.debug("query is %s", query)
        tryNum = 0
        while tryNum <= retries:
            job = self.jobs.create(query, auto_finalize_ec=200, max_time=max_time)
            job.wait(max_time)
            result_count = len(job.get_results())
            if result_count > 0:
                self.logger.debug("Count of results is > 0, it is:%d", result_count)
                return True
            else:
                self.logger.debug("Count of results is 0")
                tryNum += 1
                time.sleep(interval)
        return False

    def checkQueryFields(self,
			 query,
                         expected,            # can be list, set, tuple, or string
                         expectedMinRow = 1,
                         interval       = 15,
                         retries        = 4,
                         namespace='SA-ThreatIntelligence'):

        '''Execute a query and check for a matching set (not necessarily
           complete) of output fields, and secondarily for a minimum
           number of results.
        '''

        tryNum = 0
        status = False

        if not isinstance(expected, set):
            expected = set(expected)

        while tryNum <= retries and not status:

	    job = self.jobs.create(query, auto_finalize_ec=120, max_time=120)
            job.wait(TIMEOUT)
            result_count = len(job.get_results())
	    results = job.get_results()
            messages = job.get_messages()

            if len(job.get_results()) > 0:
                fields = results[0].keys()
                if expected.issubset(fields):
                    self.wrapLogOutput(msg='All expected fields found in result:',
                            actual   = ','.join(fields),
                            expected = ','.join(expected),
                            errors   = '')
                    status = True
                else:
                    self.wrapLogOutput(msg='Expected fields missing from result:',
                            actual   = ','.join(fields),
                            expected = ','.join(expected),
                            errors   = ','.join(expected.difference(fields)))
            else:
                self.wrapLogOutput(msg='Zero results from search:',
                    actual   = '',
                    expected = ','.join(expected),
                    errors   = '\n'.join(messages))

            if not status:
                tryNum += 1
                time.sleep(interval)

        return status

    def wrapLogOutput(self, msg, actual, expected, errors, level="debug"):
        '''Simple wrapper method for showing expected and actual output
           in the debug log. Pass in level to adjust level from default (debug)
           to error or warning.
        '''

        errOutput = string.Template("""${msg}
            ===ACTUAL=====
            ${actual}
            ===EXPECTED===
            ${expected}
            ===ERRORS=====
            ${errors}\n""")

        output = errOutput.substitute({'msg' : msg,
                     'actual'   : actual,
                     'expected' : expected,
                     'errors'   : errors })

        # This is solely so the definition of errOutput above can look good
        # while making the debug output readable.
        if level == "debug":
            self.logger.debug('\n'.join(map(str.strip, map(str,output.splitlines()))))
        elif level == "warning":
            self.logger.warning('\n'.join(map(str.strip, map(str,output.splitlines()))))
        elif level == "error":
            self.logger.error('\n'.join(map(str.strip, map(str,output.splitlines()))))
        else:
            # Whatever, if level specified badly just print as debug
            self.logger.debug('\n'.join(map(str.strip, map(str,output.splitlines()))))

    def checkCommandOutput(self,
                     appName,               # The base app containing the script.
                     inputFile,             # The input file name, passed on STDIN
                     scriptName,            # The script to be executed.
                     outputFile  = None,    # The file containing valid output
                     scriptPath  = '',      # The path to the script, relative to $SPLUNK_HOME/etc/apps/<appName>
                     altAppName  = None,    # Alternate app name if input file is not in the same app.
                     isExternal  = True,    # True if the script is run as an external
                                            # script using "splunk cmd python", False
                                            # if the script is a plain Splunk search.
                     inputFileOnly = False, # if True, use inputFile as outputFile
                     extraArgs   = []):     # Extra command-line argments passed to script.

        '''Test a script included wih a Splunk application.
           Validates multi-line output against a canonical outputFile,
           expecting an inputFile as input to the script (passed on
           STDIN.

           extraArgs are appended to the command line.
        '''

        # TODO: this function is beginning to be too complex

        # Obtain filehandles for input and expected output.
        # Assumes that both are located in ./data/<inputFile>
        # relative to current working directory, unless altAppName
        # is specified, in which case outputFile is in
        # $SPLUNK_HOME/etc/apps/<altAppName>.

        path_to_output  = os.path.join(os.getcwd(), 'data')
        path_to_script  = os.path.join(self.splunk_home,
                              'etc',
                              'apps',
                              appName,
                              scriptPath)

        path_to_input   = path_to_script

        ## Use input file as the output file
        if inputFileOnly:
            path_to_output = path_to_input
            outputFile = inputFile

        if altAppName is not None:
            # Override in case input file is in a different app than the script
            # to be executed.
            path_to_input = os.path.join(self.splunk_home,
                              'etc',
                              'apps',
                              altAppName,
                              scriptPath)
        else:
            pass

        # Input is none unless inputFile is specified.
        # Note that is isExternal is False, inputFile is ignored but
        # will still throw an error if specified incorrectly.
        input = None
        if inputFile is not None:
            try:
                input = open(os.path.join(path_to_input, inputFile), 'r')
            except IOError:
                self.failTest('Input file not found.')

        try:
            output = open(os.path.join(path_to_output, outputFile), 'r')
        except IOError:
                self.failTest('Expected output file not found.')

        if isExternal:
            args = [ os.path.join(self.splunk_home, 'bin', 'splunk'),
                     'cmd',
                     'python',
                     os.path.join(path_to_script, scriptName) ]
            args.extend(extraArgs)
        else:
            # Run the command exactly as given as a Splunk search.
            # Note that certain searches cannot be processed via CLI
            # in this manner; any search beginning with the pipe ('|')
            # character seems to be especially problematic.  In that case
            # use checkExactQueryContent() instead of this method.
            args = [ os.path.join(self.splunk_home, 'bin', 'splunk'),
                     'search' ]
            args.extend(extraArgs)

        self.logger.debug("Executing: " + ' '.join(args))

        task = subprocess.Popen(args,
                   stdin  = input,
                   stdout = subprocess.PIPE,
                   stderr = subprocess.PIPE,
                   cwd    = path_to_script )
        stdout, stderr = task.communicate()

        actual   = stdout.splitlines(True)
        expected = output.readlines()

        self.logger.debug('STDOUT: ' + stdout)
        self.logger.debug('STDERR: ' + stderr)
        self.logger.debug('EXPCTD: ' + ''.join(expected))

        input.close()
        output.close()
        return self.compareContentIgnoreOrder(actual, expected)

    def compareContentIgnoreOrder(self, actual, expected):
        '''Compare two string sequences, generating a unified diff.'''
        # Strip EOL to avoid a common error. Note that one or more
        # inputs may be an empty list so check length first.
        self.wrapLogOutput( msg='Before Strip actual',
                            actual   = '<omitted>',
                            expected = '<omitted>',
                            errors   = actual )

        self.wrapLogOutput( msg='Before Strip expected',
                            actual   = '<omitted>',
                            expected = '<omitted>',
                            errors   = expected )

        if len(actual) > 0:
            actual[-1] = actual[-1].rstrip('\n')

        if len(expected) > 0:
            expected[-1] = expected[-1].rstrip('\n')

        actual[-1] = actual[-1] + '\n'
        expected[-1] = expected[-1] + '\n'

        self.wrapLogOutput( msg='After Strip actual',
                            actual   = '<omitted>',
                            expected = '<omitted>',
                            errors   = actual )

        self.wrapLogOutput( msg='After Strip expected',
                            actual   = '<omitted>',
                            expected = '<omitted>',
                            errors   = expected )



        status = True
        # Compare the lines
        for line in expected:
            if line not in actual:
                self.wrapLogOutput( msg='The following line is not in the output from the command',
                                    actual   = '<omitted>',
                                    expected = '<omitted>',
                                    errors   = line )
                status = False

        # Make sure the number of lines is the expected
        if len(expected) != len(actual):
            self.wrapLogOutput( msg='The line counts differ; the canon file and the output are different',
                                actual   = '<omitted>',
                                expected = '<omitted>',
                                errors   = line )
            status = False

        if (status == False):
      	  #Log the difference
      	  result   = difflib.unified_diff(actual, expected)

          # result is a generator, so obtain the mismatched lines
	  mismatches = []
          for line in result:
            mismatches.append(line)

          if len(mismatches) > 0:
            self.wrapLogOutput( msg='Script output did not match expected',
                                actual   = '<omitted>',
                                expected = '<omitted>',
                                errors   = '\n'.join(mismatches) )


        return status

    def checkExactQueryContent(self,
                          query,
                          expected,
                          namespace = 'SA-ThreatIntelligence',
                          interval = 15,
                          retries  = 4,
                          reformat = False):

        '''Check for exact content in a specific search result.
           Script will issue failure IF no results are obtained
           ( len(result) == 0 ) OR if the expected text does not exist
           in the raw result text.

           If reformat is True, expected can be one of the following:
           1. a csv file name in ./data/ ; the csv can be exported by splunk web
           2. a list of list whose first row is header like a csv

           This function is for use only by tests which do NOT
           require passing input to Splunk on STDIN.
        '''

        tryNum = 0
        status = False

        path_to_output  = os.path.join(os.getcwd(), 'data')
        try:
            output = open(os.path.join(path_to_output, expected), 'r')
        except IOError:
            self.failTest('Expected output file not found.')
        except AttributeError:
            if not reformat:
                raise
            # generate csv from expected (list of list)
            output = StringIO.StringIO()
            csv.writer(output).writerows(expected)
            output.seek(0)

        while tryNum <= retries and not status:
            job = self.jobs.create(query, auto_finalize_ec=10, max_time=60)
            job.wait(TIMEOUT)
            result_count = len(job.get_results())
	    results = job.get_results()
            messages = job.get_messages()


            if len(results) > 0:
                # Careful when using _raw as it is a splunk.search.RawEvent,
                # not a string. Casting to a string converts it to a
                # lxml.etree._ElementStringResult which behaves like a string.
                if reformat:
                    # reformat both actual and expected so that csv file
                    # exported by splunk web is acceptable
                    actual   = ['%s\n' % [str(field) for field in row] for row in [results[0].keys()] + [row.values() for row in results]]
                    expected = ['%s\n' % [str(field) for field in row] for row in csv.reader(output)]
                else:
                    actual = [','.join(results[0].keys()) + '\n']
                    for result in results:
                        actual.append(','.join(map(str, result.values())) + '\n')
                    expected = output.readlines(True)
                status   = self.compareContent(actual, expected)
            else:
                self.wrapLogOutput(msg='Zero results from search:',
                    actual   = '',
                    expected = expected,
                    errors   = '\n'.join(messages))

            if not status:
                tryNum += 1
                time.sleep(interval)

        output.close()
        return status

    def checkGapSearch(self,
                   query,
                   warningGapSizeLimit,
                   warningGapCountLimit,
                   interval       = 1,
                   retries        = 0,
                   namespace='splunk_for_vmware'):

        '''
            Execute a gap detection search to check that a certain number or less of
            gaps exist. Start by checking for gaps in a warning range. Issue Error for gaps longer
            than the warning range. Or if the number of gaps in the warning range is greater than a
            set threshold.
            INPUTS:
            query - gap detection search
            warningGapSizeLimit - max size for a gap to be considered a warning (in seconds)
            warningGapCountLimit - number warning sized gaps allowed before error is raised
            interval - wait period (in seconds) if no data returned before retrying (default 1)
            retries - number of times a gap search is rerun if it returns no results (default 0)
            namespace - the app namespace in which to run the search (default splunk_for_vmware)
            OUTPUTS:
            status - boolean true for no errors, false for errors
            LOGGING OUTPUT:
            Logs the number of warning gaps.
            Logs the number of error gaps.
            GAP DETECTION SEARCHES:
            A gap detection search is any search in which the result rows are gaps with a field delta
            that is valued as their duration in seconds.
            Typical Structure:
            search [Event Gathering Search Command]
            | streamstats first(_time) as prev_endtime window=1 current=f global=false by [Identifier]
            | eval delta = (prev_endtime - _time)
            | search delta>[Expected time between events of the same identifier]
            | fields delta
            '''

        tryNum = 0
        warningCount = 0
        errorCount = 0
        status = True

        while tryNum <= retries and status:

            job = self.jobs.create(query, auto_finalize_ec=10, max_time=60)
            job.wait(TIMEOUT)
            result_count = len(job.get_results())
            results = job.get_results()
            messages = job.get_messages()

            self.logger.debug("Ran Gap Detection search=\"%s\" warningGapCountLimit=%s and warningGapSizeLimit=%s" , query, str(warningGapCountLimit), str(warningGapSizeLimit))

            if len(job.get_results()) > 0:
                warningCount = 0
                errorCount = 0
                for result in results:
                    if float(str(result["delta"])) <= warningGapSizeLimit:
                        # This is a warning sized gap. just report the warning and increase the warningCount
                        warningCount += 1
                        self.wrapLogOutput(msg='Warning Sized Gap detected with detection search',
                                           actual   = "gapSize=" + str(result["delta"]),
                                           expected = "no gaps",
                                           errors   = 'None',
                                           level    = 'warning')
                    else:
                        # The gap is bigger than the warning limit, flag error, set status to false.
                        errorCount += 1
                        self.wrapLogOutput(msg='Error Sized Gap detected with detection search',
                                           actual   = "gapSize=" + str(result["delta"]),
                                           expected = "no gaps, or at least gaps shorter than " + str(warningGapSizeLimit),
                                           errors   = 'Error sized gap detected.',
                                           level    = 'error')
                        status = False

                if warningCount >= warningGapCountLimit:
                    #Too many Warning sized gaps, this test failed.
                    status = False
                    self.wrapLogOutput(msg='Too many warning sized gaps detected with detection search',
                                       actual   = "warningGapCount=" + str(warningCount),
                                       expected = "warningGapCountLimit=" + str(warningGapCountLimit),
                                       errors   = 'Too many warning gaps detected.',
                                       level    = 'error')
                elif warningCount > 0:
                    self.wrapLogOutput(msg='Safe number of warning sized gaps detected with detection search',
                                       actual   = "warningGapCount=" + str(warningCount),
                                       expected = "warningGapCountLimit=" + str(warningGapCountLimit),
                                       errors   = '',
                                       level    = 'warning')
                else:
                    self.wrapLogOutput(msg='No warning sized gaps detected with detection search',
                                       actual   = "warningGapCount=" + str(warningCount),
                                       expected = "warningGapCountLimit=" + str(warningGapCountLimit),
                                       errors   = '',
                                       level    = 'debug')

            else:
                self.wrapLogOutput(msg='PASS: Zero results from gap detection search.',
                                   actual   = '',
                                   expected = '',
                                   errors   = '\n'.join(messages))


            if status:
                tryNum += 1
                time.sleep(interval)

        self.wrapLogOutput(msg='Error-Sized Gap Detection Results for search',
                           actual   = "errorGapCount=" + str(errorCount),
                           expected = "0",
                           errors   = '',
                           level    = 'debug')

        return status

    def checkFieldAgainstCanon(self,
                               query,
                               field,
                               canon,
                               interval       = 30,
                               retries        = 4,
                               namespace='splunk_for_vmware'):
        """
            Execute a search that returns results containing a particular field. Then
            check that every value of that field from every result is included in the
            canon. Also check that every value in canon is represented in results.
            Duplicates in the results set of values that exist in the canon are a pass.
            Please note neither set can be empty and still pass (result nor canon)
            INPUTS:
            query - search
            field - name of the field you are checking (string)
            canon - set of values that should be contained in the results for the field (set)
            interval - wait period (in seconds) if no data returned before retrying (default 30)
            retries - number of times a gap search is rerun if it returns no results (default 4)
            namespace - the app namespace in which to run the search (default splunk_for_vmware)
            OUTPUTS:
            status - boolean true for no errors, false for errors
            LOGGING OUTPUT:
            Logs the values in canon and not in results.
            Logs the values in results and not in canon.
            """
        status = False
        tryNum = 0

        self.logger.debug("Running canon test with canon=\"%s\"" ,str(canon))

        while tryNum <= retries and not status:
            job = self.jobs.create(query, auto_finalize_ec=10, max_time=60)
            job.wait(TIMEOUT)
            result_count = len(job.get_results())
            results = job.get_results()

            self.logger.debug("Ran canon test search=\"%s\"" , query)

            if len(job.get_results()) > 0:
                # Build Result Set
                actual = set()
                for result in results:
                    actual.add(str(result[field]))

                if canon == actual:
                    self.wrapLogOutput("PASS: results match canon exactly", str(actual), str(canon), "None.", "debug")
                    status = True
                else:
                    self.wrapLogOutput("FAIL: actual and canon do not match", str(actual), str(canon), "error=\"results do not match canon\"", "error")
                    self.logger.debug("Results in canon and not in actual: %s",str(canon.difference(actual)))
                    self.logger.debug("Results in actual and not in canon: %s",str(actual.difference(canon)))
            else:
                self.logger.debug("No results from canon test search retrying after wait interval... (unless max tries exceeded)")

            if not status:
                tryNum += 1
                time.sleep(interval)

        return status

    def checkQueryErrorMessage(self,
                               query,
                               expected,
                               namespace='SA-ThreatIntelligence'):

        '''Check for specific error text from a search.
            Unlike checkQueryContent(), it is typically not necessary
            to repeat a test we expect to fail, so we do not retry.
        '''
        status=False
        job = self.jobs.create(query, max_time=60)
        job.wait(TIMEOUT)
        messages = job.get_messages()
        if len(messages) > 0:
            errors = messages.get('error', None)
            if errors is not None:
                matches = [error for error in errors if expected in error]
                if any(matches):
                    # Expected error message found: PASS
                    self.wrapLogOutput(msg='Expected error text found:',
                                       actual   = '\n'.join(matches),
                                       expected = expected,
                                       errors   = 'N/A')
                    status = True
                else:
                    # No matches, but error messages exist: FAIL.
                    pass
        else:
            # No error messages exist: FAIL.
            pass

        if not status:
            self.wrapLogOutput(msg='Expected error text NOT found:',
                               actual   = '\n'.join(map(str, messages)),
                               expected = expected,
                               errors   = 'N/A')

        return status

    def checkQueryFieldValues(self,
                         query,
                         expected_values,            # can be list, set, tuple, or string
                         expectedMinRow = 0,
                         interval       = 15,
                         retries        = 4,
                         namespace='SA-ThreatIntelligence'):

        '''Execute a query and check for a matching set (not necessarily
           complete) of output fields, and secondarily for a minimum
           number of results.
        '''

        tryNum = 0
        status = False

        while tryNum <= retries and not status:

            job = self.jobs.create(query, auto_finalize_ec=10, max_time=60)
            job.wait(TIMEOUT)
            result_count = len(job.get_results())
            results = job.get_results()
            messages = job.get_messages()

            if len(job.get_results()) > 0:
                # we need to cast to str before int because it's a ResultField
                # which can't be cast directly to str...
                values = str(results[expectedMinRow-1].values())
                print values
                print values.__class__.__name__
                if expected_values in values:
                    self.wrapLogOutput(msg='All expected values found in result:',
                            actual   = values,
                            expected = expected_values,
                            errors   = '')
                    status = True
                else:
                    self.wrapLogOutput(msg='Expected field values missing from result:',
                            actual   = values,
                            expected = expected_values,
                            errors   = '')
            else:
                self.wrapLogOutput(msg='Zero results from search:',
                    actual   = '',
                    expected = ','.join(expected_values),
                    errors   = '\n'.join(messages))

            if not status:
                tryNum += 1
                time.sleep(interval)

        return status


    def checkLookupOutput(self,
                          appName,               # The base app containing the script.
                          actualFile,            # The script to be executed.
                          outputFile):           # The file containing valid output

        path_to_output  = os.path.join(os.getcwd(), 'data')
        path_to_lookups = os.path.join(self.splunk_home,
                              'etc',
                              'apps',
                              appName,
                              'lookups')

        try:
            outputFile = open(os.path.join(path_to_output, outputFile), 'r')
        except IOError:
            self.failTest('Expected output file not found.')

 	try:
            actualFile = open(os.path.join(path_to_lookups, actualFile), 'r')
        except IOError:
            self.failTest('actual file not found.')

        actual   = actualFile.readlines()
        expected = outputFile.readlines()

        self.logger.debug('EXPCTD: ' + ''.join(expected))
        self.logger.debug('ACTUAL: ' + ''.join(actual))

        actualFile.close()
        outputFile.close()

        return self.compareContentIgnoreOrder(actual, expected)

    def checkQueryContent(self,
                          query,
                          expected,
                          expectedRow,
                          interval = 15,
                          retries  = 4,
                          namespace='SA-ThreatIntelligence'):

        '''Check for specific content in a specific search result row.
           Script will issue failure IF no results are obtained
           ( len(result) == 0 ) OR if the expected text does not exist
           in the raw result text.
        '''

        tryNum = 0
        status = False

        while tryNum <= retries and not status:
	    job = self.jobs.create(query, auto_finalize_ec=10, max_time=60)
            job.wait(TIMEOUT)
            result_count = len(job.get_results())
            results = job.get_results()
            messages = job.get_messages()

            # TODO: modify this to handle checking any specific row of the output.
            if len(results) > 0 and expectedRow <= len(results):
                # Careful when using _raw as it is a splunk.search.RawEvent,
                # not a string. Casting to a string converts it to a
                # lxml.etree._ElementStringResult which behaves like a string.
                raw = str(results[0].get('_raw', None))
                if raw is not None:
                    if expected in raw:
                        self.wrapLogOutput(msg='Expected text found in result:',
                            actual   = raw,
                            expected = expected,
                            errors   = '')
                        status = True
                    else:
                        self.wrapLogOutput(msg='Expected text NOT found in result:',
                            actual   = raw,
                            expected = expected,
                            errors   = '')
                else:
                    self.wrapLogOutput(msg='Empty raw data from search:',
                        actual   = '',
                        expected = expected,
                        errors   = '\n'.join(messages))
            else:
                self.wrapLogOutput(msg='Zero results from search:',
                    actual   = '',
                    expected = expected,
                    errors   = '\n'.join(messages))

            if not status:
                tryNum += 1
                time.sleep(interval)

        return status


    def compareContent(self, actual, expected):
        '''Compare two string sequences, generating a unified diff.'''
        # Strip EOL to avoid a common error. Note that one or more
        # inputs may be an empty list so check length first.
        if len(actual) > 0:
            actual[-1] = actual[-1].rstrip('\n')

        if len(expected) > 0:
            expected[-1] = expected[-1].rstrip('\n')

        # Note that readlines() RETAINS trailing end-of-line characters.
        # The True argument to splitlines() ensures that the actual output
        # from the command also retains end of line characters.
        result   = difflib.unified_diff(actual, expected)

        # result is a generator, so obtain the mismatched lines
        mismatches = []
        status = True
        for line in result:
            mismatches.append(line)

        if len(mismatches) > 0:
            self.wrapLogOutput( msg='Script output did not match expected',
                                actual   = '<omitted>',
                                expected = '<omitted>',
                                errors   = '\n'.join(mismatches) )
            status = False
        else:
            self.wrapLogOutput( msg='Script output matches.',
                                actual   = '<omitted>',
                                expected = '<omitted>',
                                errors   = 'No errors.' )
        return status

    def getRealtimeNotableSearchResults(self, searchName, interval=15, retries=4, minimumNumberEvents=1):
        self.logger.debug("Retry count: %d", retries)

        tryNum = 0
        searchQuery = 'search `notable(' + searchName + ')`'
        searchResults = []
        while tryNum <= retries:
            self.logger.debug("tryNum Value: %d", tryNum)
            job = self.jobs.create(searchQuery, max_time=60)
            job.wait(TIMEOUT)
            searchResults = job.get_results()
            self.logger.debug("Results Count: %d", len(searchResults))
            self.logger.debug("Results : %s", searchResults)
            if len(searchResults) >= minimumNumberEvents:
                return searchResults
            else:
                self.logger.debug("Retries: %d", tryNum)
                tryNum += 1
                time.sleep(interval)
        return searchResults

    def gen_table(self, table):
        """Return search query string that generates a table.
            The columns are sorted by field name

            Parameters:
            table = a list of dictionary
        """

        def _rows(t):
            return ' | '.join("append [stats count | %s]" % _row(r) for r in t)
        def _row(r):
            return ' | '.join("eval %s=%s" % i for i in r.items())
        return "%s | fields - count" % _rows(table)


    def compareContentRegex(self, actual, expectedRx):
        '''Compare string to a regex.'''
        match = expectedRx.search(actual)

        if not match:
            self.wrapLogOutput( msg='Script output did not match expected',
                                actual   = '<omitted>',
                                expected = '<omitted>',
                                errors   = '<regex omitted>' )
            status = False
        else:
            self.wrapLogOutput( msg='Script output matches.',
                                actual   = '<omitted>',
                                expected = '<omitted>',
                                errors   = 'No errors.' )
            status = True
        return status


    def checkQueryFieldValueIsGreaterThanZero(self,
                         query,
                         field_name,            # can be list, set, tuple, or string
                         expectedMinRow = 0,
                         interval       = 15,
                         retries        = 4,
                         namespace='SA-ThreatIntelligence'):

        '''Execute a query and check for a matching set (not necessarily
           complete) of output fields, and secondarily for a minimum
           number of results.
        '''

        tryNum = 0
        status = False

        while tryNum <= retries and not status:

            job = self.jobs.create(query,  max_time=60)
            job.wait(240)
            result_count = len(job.get_results())
            results = job.get_results()
            messages = job.get_messages()

            if len(results) > 0:
                # we need to cast to str before int because it's a ResultField
                # which can't be cast directly to str...
                keys = map(str, results[0].keys())
                print keys
                values = map(str, results[0].values())
                print values
                dictionary = dict(zip(keys, values))
                print dictionary
                if int(dictionary[field_name])  > 0 :
                    self.wrapLogOutput(msg='Expected field value is greater than 0 ',
                            actual   = values,
                            expected = int(dictionary[field_name]) ,
                            errors   = '')
                    status = True
                else:
                    self.wrapLogOutput(msg='Expected field values missing from result:',
                            actual   = values,
                            expected = int(dictionary[field_name]),
                            errors   = '')
            else:
                self.wrapLogOutput(msg='Zero results from search:',
                    actual   = '',
                    expected = 'greater than 0',
                    errors   = '\n'.join(messages))

            if not status:
                tryNum += 1
                time.sleep(interval)

        return status


    def getFieldValuesDict(self,
                      query,
                      interval       = 15,
                      retries        = 4):

        '''Execute a query and check for a matching set (not necessarily
           complete) of output fields, and secondarily for a minimum
           number of results.
        '''

        tryNum = 0
        status = False

        while tryNum <= retries and not status:

            job = self.jobs.create(query,  max_time=60)
            job.wait(240)
            result_count = len(job.get_results())
            results = job.get_results()
            messages = job.get_messages()

            if result_count > 0:
                # we need to cast to str before int because it's a ResultField
                # which can't be cast directly to str...
                keys = map(str, results[0].keys())
                print keys
                values = map(str, results[0].values())
                print values
                dictionary = dict(zip(keys, values))
                print dictionary
		return dictionary
            else:
                self.wrapLogOutput(msg='Zero results from search:',
                    actual   = '',
                    expected = 'greater than 0',
                    errors   = '\n'.join(messages))

            if not status:
                tryNum += 1
                time.sleep(interval)

        return status


    def checkModInputOutput(self,
                          modInputName,
                          actualFile,
                          outputFile):

        path_to_output  = os.path.join(os.getcwd(), 'data')
        path_to_modinputs = os.path.join(self.splunk_home,
                              'var',
                              'lib',
                              'splunk',
                              'modinputs',
			      modInputName)


        try:
            outputFile = open(os.path.join(path_to_output, outputFile), 'r')
        except IOError:
            self.failTest('Expected output file not found.')

 	try:
            actualFile = open(os.path.join(path_to_modinputs, actualFile), 'r')
        except IOError:
            self.failTest('actual file not found.')

        actual   = actualFile.readlines()
        expected = outputFile.readlines()

        self.logger.debug('EXPCTD: ' + ''.join(expected))
        self.logger.debug('ACTUAL: ' + ''.join(actual))

        actualFile.close()
        outputFile.close()

        return self.compareContentIgnoreOrder(actual, expected)

    def checkRemoteSearch(self, query, starts_with=None, max_time=120):
        self.logger.debug("query is %s", query)
        tryNum = 0
        job = self.jobs.create(query, auto_finalize_ec=200, max_time=max_time)
        job.wait(max_time)
	if starts_with:
            if job.get_remote_search().startswith(starts_with) :
                self.logger.debug("Remote search starts with :%s", starts_with)
                return True
        else:
            self.logger.debug("starts_with is None ")

        return False


    def smbServiceCheck(self):

        # Skip test if running on Windows.
        if (sys.platform == 'win32'):
            py.test.skip("nmblookup test on Windows not yet implemented.")

        # Skip if nmbd daemon is not running.
        ps_task = subprocess.Popen(['ps', '-e'], stdout=subprocess.PIPE)
        stdout, stderr = ps_task.communicate()
        if 'nmbd' not in stdout:
            py.test.skip('NetBIOS services (nmbd) not running on host')

    def checkQueryFieldAllValuesContainsRegex(self, query, field, regex, interval=15, retries = 4, number_results=100, max_time=60):
        tryNum = 0
        r = re.compile(regex)
        match_found = False
        while tryNum <= retries:
            job = self.jobs.create(query, auto_finalize_ec=number_results, max_time=max_time)
            job.wait()
            results = job.get_results()

            for result_no, result in enumerate(results.as_list):
                if r.match(str(result[field])):
                    self.logger.debug("result['%s']='%s' matches re: %s", field, str(result[field]), regex)
                    match_found = True
                else:
                    self.logger.debug("result['%s']='%s' does not match re: %s for %d row", field, str(result[field]), regex,result_no)
                    match_found = False
                    return False
                if result_no > number_results:
                    self.logger.debug("checked for re: %s in first %d results", regex, number_results)
                    return match_found
            tryNum += 1
            time.sleep(interval)
        return match_found

    def checkQueryAllFieldAllValuesContainsRegex(self, query, field_regex_json, interval=15, retries = 4, number_results=100, max_time=60):
        tryNum = 0
        match_found = False
        field_names=field_regex_json.keys()
        while tryNum <= retries:
            job = self.jobs.create(query, auto_finalize_ec=number_results, max_time=max_time)
            job.wait()
            results = job.get_results()

            for result_no, result in enumerate(results.as_list):
                for field in field_names:
                    regex = field_regex_json[field]
                    r = re.compile(regex)
                    self.logger.debug("Looking for field %s in result set", field)
                    if field in result.keys():
                        if r.match(str(result[field])):
                            self.logger.debug("result['%s']='%s' matches re: %s", field, str(result[field]), regex)
                            match_found = True
                        else:
                            self.logger.debug("result['%s']='%s' does not match re: %s for %d row", field, str(result[field]), regex,result_no)
                            match_found = False
                            return False
                        if result_no > number_results:
                            self.logger.debug("checked for re: %s in first %d results", regex, number_results)
                            return match_found
                    else:
                        self.logger.debug("field %s not found in result set fields", result.keys())
                        return False
            tryNum += 1
            time.sleep(interval)
        return match_found