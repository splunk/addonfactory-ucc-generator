import httplib2
import sys
import os
if sys.version_info[0] < 3:
    httplib2_py2_path = os.path.join(os.path.dirname(
        os.path.abspath(__file__)), "httplib2_py2")
    sys.path.insert(0, httplib2_py2_path)
else:
    httplib2_py3_path = os.path.join(os.path.dirname(
        os.path.abspath(__file__)), "httplib2_py3")
    sys.path.insert(0, httplib2_py3_path)
import httplib2
