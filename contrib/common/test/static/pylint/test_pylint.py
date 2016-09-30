'''
This is a test script to run pylint against various python code in our source code
'''
import logging
import os
import sys
import tempfile
import py
import re
import subprocess

from VerifierBase import VerifierBase

# this path needs to be added to ignore errors like this:
# F0401: 17: Unable to import 'lib.apps'
import splunk.appserver.mrsparkle

from pylint import lint
from pylint.reporters.text import TextReporter

logger = logging.getLogger(__name__)
verifier = VerifierBase()

ERRORCODES = {'FATAL': 1,
              'ERROR': 2,
              'WARNING': 4,
              'REFACTOR': 8,
              'CONVENTION': 16}
MAXOPENFILES = 8192
STANDALONESCRIPT = os.path.join(os.path.dirname(__file__), '..', 'contrib', 'bin', 'lint.py')
LINEBREAK = '\n'

def run_pylint(args, testlimit=ERRORCODES['ERROR']):
    '''
    In here, we instantiate lint.Run which automatically runs pylint on the target file/module. In 
    addition, a file is passed to their TextReporter so that its output can be routed to a file
    instead of stdout. 
    
    It tries to catch OSError since pylint opens too many files. The OS may prevent pylint to 
    continue.
    
    Pylint exits with a SystemExit and a return code which is the OR combination of their messages.
    
    After running pylint, parse out pylint return code and the message for debugging
    
    Output:
        Using the default text output, the message format is :
        MESSAGE_TYPE: LINE_NUM:[OBJECT:] MESSAGE
        There are 5 kind of message types :
        * (C) convention, for programming standard violation
        * (R) refactor, for bad code smell
        * (W) warning, for python specific problems
        * (E) error, for probable bugs in the code
        * (F) fatal, if an error occurred which prevented pylint from doing
        further processing.
    
    Output status code:
        Pylint should leave with following status code:
        * 0 if everything went fine
        * 1 if a fatal message was issued
        * 2 if an error message was issued
        * 4 if a warning message was issued
        * 8 if a refactor message was issued
        * 16 if a convention message was issued
        * 32 on usage error
        status 1 to 16 will be bit-ORed so you can know which different
        categories has been issued by analysing pylint output status code
    
    @type  args: list
    @param args: The list of arguments that you would pass to pylint
    @type  testlimit: int
    @param testlimit: The highest status code that would be regarded as a failure (default to ERROR)
    
    @rtype: tuple
    @return: 1. dict of unique errors with their count and 
             2. all pylint messages
    
    '''
    
    # run pylint and provide a file handler to catch the output message
    returncode = 0
    f = tempfile.TemporaryFile(prefix='pylint-tmp')
    logger.info("Using tempfile: %s" % f.name)
    try:
        logger.info( "Testing Script/Module: %s" % args)
        lint.Run(args, reporter=TextReporter(f))
    except OSError, oe:
        logger.info(oe)
        raise
    except SystemExit, se:
        logger.info('System Exitting')
        returncode = se.code
    f.seek(os.SEEK_SET)
    messages = f.readlines()
    f.close()
    logger.info("pylint return code: %s" % returncode)
    
    verifier.verify_not_equals(returncode, 32, "usage error when pylint ran on %s" % args[0])
    
    # bit operation kungfu to decrypt pylint return code
    codes = []
    meanings = []
    for key in ERRORCODES:
        z = returncode & ERRORCODES[key]
        if z == ERRORCODES[key]: 
            codes.append(ERRORCODES[key])
            meanings.append(key)
    logger.info("pylint results: %s" % meanings)
    
    uniqueerrors = {}
        
    # NOTE: This is where we determine that we only look at ERRORs and FATALs by using
    #       string parsing kungfu to knock off only relevant results to the log file
    for message in messages:
        if re.search('^[EF]\d+|^\*+', message):
            logger.info(message.split(LINEBREAK)[0])
            if not message.startswith('*'):
                errorcode = message.split(':')[0]
                if errorcode not in uniqueerrors:
                    uniqueerrors[errorcode] = 1
                else:
                    uniqueerrors[errorcode] += 1
    logger.info("Unique errors/fatals found:")
    total = 0
    for error in uniqueerrors:
        total += uniqueerrors[error]
        logger.info("    %s: %s" % (error, uniqueerrors[error]))
    logger.info("Total number of errors found: %s" % total)
    logger.info("Total number of unique errors/fatals found: %s" % len(uniqueerrors))
    
    # get the number of all pylint messages: call pylint w/ '--list-msgs' and 
    # filter anything that start with ':'
    # XXX add --rcfile if more messages are added through plugin
    to_execute = 'python %s --list-msgs' % STANDALONESCRIPT
    p = subprocess.Popen(to_execute, env=os.environ, shell=True, stderr=subprocess.STDOUT, 
                         stdout=subprocess.PIPE)
    output = p.communicate()[0].split(LINEBREAK)
    allmessages = []
    for line in output:
        # finish off the ERRORs and FATALs with a flying spinning mid-air regex kick. Haiiiyahh!
        # Game Over!!!
        m = re.match(":([E|F]\d+):", line)
        if m != None: allmessages.append(m.group(1))
    logger.info("Total number of pylint messages: %s" % len(allmessages))
    
    # print the help message for each unique result
    for errorcode in uniqueerrors:
        to_execute = 'python %s --help-msg=%s' % (STANDALONESCRIPT, errorcode)
        logger.info(to_execute)
        p = subprocess.Popen(to_execute, env=os.environ, shell=True, 
                             stderr=subprocess.STDOUT, 
                             stdout=subprocess.PIPE)
        logger.info(p.communicate()[0])
    
    return uniqueerrors, allmessages

def pytest_generate_tests(metafunc):
    '''
    Entry point
    '''
    if metafunc.function.func_name == 'test_pylint':
        rcfilearg = '--rcfile=%s' % py.test.config.option.rcfile
        uniqueerrors, allmessages = run_pylint([py.test.config.option.module, rcfilearg])
        for message in allmessages:
            metafunc.addcall(funcargs={'message': message, 'uniqueerrors': uniqueerrors}, 
                             id=message)

class TestPylint(object):
    def test_pylint(self, message, uniqueerrors):
        '''
        Verify for each pylint message that we care, it is not found in the error result dict 
        '''
        found = message in uniqueerrors
        count = 0
        if found: count = uniqueerrors[message]
        verifier.verify_false(found, "Number of errors for %s: %s" % (message, count))
