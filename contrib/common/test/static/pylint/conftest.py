import sys
import os
import logging

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'contrib')))

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(name)s %(levelname)-8s :: %(message)s',
                    filename='pylint-test.log', filemode='w')

#for path in sys.path:
#    if path.find('site-packages') >= 0:
#        index = sys.path.index(path)
#        sys.path.pop(index)
#sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..', 'python-site')))

def pytest_addoption(parser):
    ''' CLI test specific command-line options '''
    group = parser.getgroup("CLI tests additional options")
    group._addoption('', '--rcfile', action="store", dest="rcfile", 
                     default=os.path.join(os.path.dirname(__file__), 'config.ini'), 
                     help="configuration and rules file for pylint")
    group._addoption('', '--module', action="store", dest="module", default='splunk', 
                     help="python module or package to run pylint on or path to python script " \
                          "(default to splunk python module)")

def pytest_configure(config):
    config.option.verbose = True