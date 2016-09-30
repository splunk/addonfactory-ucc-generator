import os
import sys
from distutils.version import StrictVersion

basedir = os.path.dirname(os.path.abspath(__file__))

def install_3rdlibs():
    os.chdir(basedir)
    pip_version = os.popen("pip -V").read().rstrip().split()[1]

    target = os.path.join(basedir, "package", "bin", "splunk_ta_crowdstrike")

    install_cmd = "pip install --requirement requirements.txt -i http://repo.splunk.com/artifactory/api/pypi/pypi-virtual/simple --no-compile --no-binary :all: --target " + target

    if StrictVersion(pip_version) > StrictVersion("1.5.6"):
        install_cmd += " --trusted-host repo.splunk.com"

    print "command: " + install_cmd
    os.system(install_cmd)
    os.system("rm -rf " + target + "/*.egg-info")

install_3rdlibs()
