import os
import ConfigParser
import pytest
from xml.dom import minidom

def pytest_addoption(parser):

    parser.addoption('--username', dest='username',
                     help='Username',
                     default='admin')

    parser.addoption('--password', dest='password',
                     help='Password',
                     default='changeme')

    parser.addoption('--module', dest='module_name',
                     help='Module Name',
                     default='DA-ITSI-LB')

    parser.addoption('--service_title', dest='service_title',
                     help='Service Name',
                     default='lb')

def pytest_configure(config):
   
    username = config.getvalue('username')
    password = config.getvalue('password')
    module_name = config.getvalue('module_name')
    service_title = config.getvalue('service_title')

    config.__setattr__('username', config.getvalue('username'))
    config.__setattr__('password', config.getvalue('password'))
    config.__setattr__('module_name', config.getvalue('module_name'))
    config.__setattr__('service_title', config.getvalue('service_title'))
    
