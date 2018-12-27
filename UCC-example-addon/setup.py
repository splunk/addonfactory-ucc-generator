import os
import shutil
import errno
from distutils.version import StrictVersion


basedir = os.path.dirname(os.path.abspath(__file__))


def install_3rdlibs():
    os.chdir(basedir)
    pip_version = os.popen("pip -V").read().rstrip().split()[1]

    target = os.path.join(basedir)

    install_cmd = "pip install --requirement requirements.txt -i http://repo.splunk.com/artifactory/api/pypi/pypi-virtual/simple --no-compile --no-binary :all: --target " + target

    if StrictVersion(pip_version) > StrictVersion("1.5.6"):
        install_cmd += " --trusted-host repo.splunk.com"

    print "command: " + install_cmd
    os.system(install_cmd)
    os.system("rm -rf " + target + "/*.egg-info")


def copy_directory(src, dest):
    try:
        shutil.copytree(src, dest)
    except OSError as exc:
        if exc.errno == errno.ENOTDIR:
            shutil.copy(src, dest)
        else:
            print'Directory %s not copied. Error: %s' % (src, exc)


def copy_ucc_files():
    # remove existing libs
    shutil.rmtree(basedir + "/uccrestbuilder", ignore_errors=True)
    shutil.rmtree(basedir + "/splunktaucclib", ignore_errors=True)

    rest_builder_dir = os.path.dirname(basedir) + "/UCC-REST-builder/uccrestbuilder"
    copy_directory(rest_builder_dir, basedir + "/uccrestbuilder")

    rest_lib_dir = os.path.dirname(basedir) + "/UCC-REST-lib/splunktaucclib"
    copy_directory(rest_lib_dir, basedir + "/splunktaucclib")


install_3rdlibs()
copy_ucc_files()
