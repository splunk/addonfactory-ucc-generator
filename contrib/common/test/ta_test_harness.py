#!/usr/bin/python

import json
import os
import argparse
import sys
import time

WORKSPACE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

def stop_splunk(splunk_home):
    process = os.popen(splunk_home + "/bin/splunk status")
    string = process.read()
    process.close()

    if string.startswith("splunkd is running"):
        os.system(splunk_home + "/bin/splunk stop")

def start_splunk(splunk_home):
    os.system(splunk_home + "/bin/splunk start")

def get_app_name():
    if os.path.exists("build.json"):
        with open('build.json') as fp:
            app_name = json.load(fp)['name']

        if app_name.startswith("splunk_app"):
            return app_name
        elif app_name.startswith("Splunk_TA"):
            app_name = app_name.split("_")
            app_name = "-".join(app_name[1:])
            return app_name.lower()
    else:
        return None

def get_package_name():
    if os.path.exists("build.json"):
        with open('build.json') as fp:
            package_name = json.load(fp)['name']

        return package_name
    else:
        return None

def prepare_coverage_env(package_name, splunk_home):
    # prepare coverage rc file for rest
    with open(".coveragerest", "w") as fh:
        fh.write("[run]\n")
        fh.write("parallel=True\n")
        fh.write("data_file=/tmp/" + package_name + "/.coverage\n")
        fh.write("source=" + splunk_home + "/etc/apps/" + package_name + "/bin\n")

    with open("sitecustomize.py", "w") as fh:
        fh.write("#   Version 4.1\n")
        fh.write("import sys\n")
        fh.write("import os\n")
        fh.write("import coverage\n\n")
        fh.write("sys.setdefaultencoding('utf-8')\n")
        fh.write("os.environ['COVERAGE_PROCESS_START']='" + os.path.expanduser("~") + "/.coveragerest'\n")
        fh.write("coverage.process_startup()\n")

    os.system("mv -f .coveragerest " + os.path.expanduser("~") + "/")
    os.system("mv -f sitecustomize.py " + splunk_home + "/lib/python2.7/site-packages/")

    # create tmp dir
    os.system("rm -rf /tmp/" + package_name)
    os.system("mkdir /tmp/" + package_name)

def generate_coverage_report(package_name, python_lib):
    os.system("rm -rf data_tmp")
    os.system("mkdir data_tmp")
    os.system("mv /tmp/" + package_name + "/.coverage.* data_tmp")

    # combine coverage data
    os.system("python " + python_lib + "/coverage/__main__.py combine data_tmp")

    # generate term report
    os.system("python " + python_lib + "/coverage/__main__.py report")

    # generate html report
    os.system("rm -rf coverage_report")
    os.system("python " + python_lib + "/coverage/__main__.py html")

def get_app_branch():
    branch = os.environ.get('bamboo_repository_git_branch', '')
    if branch:
        return branch

    process = os.popen("git branch")
    lines = process.read().splitlines()
    for line in lines:
        line = line.strip()
        if line.startswith("* "):
            print line
            (_, branch) = line.split()

    return branch


def get_app_version():
    with open('build.json') as fp:
        return json.load(fp)['version']


def get_ta_install_name():
    with open('build.json') as fp:
        return json.load(fp)['name']


def get_optargs():
    parser = argparse.ArgumentParser(description='ta test harness: run functional test cases for TA')
    parser.add_argument('-s', '--splunk-version', dest="splunk_version", help='splunk version to install, default: current_ga')
    parser.add_argument("-d", "--splunk-home", dest="splunk_home", help="splunk install location, default: $HOME/splunk-install")
    parser.add_argument("-t", "--wait-time", dest="wait_time", type=int, help="wait time (seconds) for eventgen to generate data")
    parser.add_argument("-c", '--coverage', dest="coverage", action='store_true', help='collect coverage data')
    parser.add_argument("-m", "--enable-cim", dest="cim", action='store_true', help='install and enable cim')
    args = parser.parse_args()

    return args

if __name__ == '__main__':
    # parse arguments
    args           = get_optargs()

    workspace      = os.getcwd()
    splunk_version = "current_ga"
    splunk_home    = os.path.join(os.path.expanduser("~"), "splunk-install")
    app_name       = get_app_name()
    package_name   = get_package_name()
    python_lib     = os.path.join(os.path.expanduser("~"), "python_lib")
    git_branch     = get_app_branch()

    if args.splunk_version:
        splunk_version = args.splunk_version

    if args.splunk_home:
        splunk_home = args.splunk_home

    # Copy matinal test cases to normal location
    if not os.path.exists("test/functional"):
        os.mkdir("test/functional")

    os.system("cp -f contrib/common/matinal/*.py test/functional")

    # Install Splunk and related APPs
    cmd = "contrib/common/AppPandaNew/apppandaCLI.py --splunk_home " + splunk_home + " --version " + splunk_version

    if git_branch.startswith("release/"):
        app_ver = get_app_version()
        if args.cim:
            cmd += " --apps " + app_name + " sa-eventgen sa-commoninformationmodel" + " --app_versions " + app_ver + " released released --app_status develop --artifactory"
        else:
            cmd += " --apps " + app_name + " sa-eventgen" + " --app_versions " + app_ver + " released --app_status develop --artifactory"
    else:
        if args.cim:
            cmd += " --apps " + app_name + " sa-eventgen sa-commoninformationmodel" + " --app_versions latest released released --artifactory"
        else:
            cmd += " --apps " + app_name + " sa-eventgen" + " --app_versions latest released --artifactory"

    print "Command for installing Splunk and APP: " + cmd
    os.system("python " + cmd)

    # Wait time
    if args.wait_time:
        time.sleep(args.wait_time)

    if args.coverage:
        stop_splunk(splunk_home)
        prepare_coverage_env(package_name, splunk_home)
        start_splunk(splunk_home)

    # Launch test cases
    if os.getenv("PYTHONPATH"):
        os.environ["PYTHONPATH"] = os.getenv("PYTHONPATH") + ":" + workspace + "/contrib/common/test:" + python_lib
    else:
        os.environ["PYTHONPATH"] = workspace + "/contrib/common/test:" + python_lib

    if not os.getenv("SPLUNK_HOME"):
        os.environ["SPLUNK_HOME"] = splunk_home

    os.environ["TA_SOURCE_FOLDER"] = workspace

    os.chdir("test/functional")
    cmd = splunk_home + "/bin/splunk cmd python " + python_lib + "/pytest.py --junitxml=ta-pytest-results.xml -v"
    print "Command for launch test cases: " + cmd
    os.system(cmd)

    # Stop Splunk if running
    stop_splunk(splunk_home)

    os.chdir(workspace)

    if args.coverage:
        generate_coverage_report(package_name, python_lib)

    if os.path.isfile(splunk_home + "/var/run/splunk/csv/bamboo.csv"):
        cmd = "cp " + splunk_home + "/var/run/splunk/csv/bamboo.csv splunk_search_result.log"
        print "Copy Splunk search results: " + cmd
        os.system(cmd)
