"""
Meta
====
    $Id: //splunk/current/test/tests/static/__init__.py#2 $
    $DateTime: 2011/04/22 11:57:21 $
    $Author: ngiertz $
    $Change: 98595 $
"""


import sys, os

path_to_libs = os.path.abspath(os.path.join(os.path.curdir, '..', '..'))
if path_to_libs not in sys.path:
    sys.path.append(path_to_libs)
