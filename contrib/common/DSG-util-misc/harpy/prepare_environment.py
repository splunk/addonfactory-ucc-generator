import json
import os
from optparse import OptionParser
import sys
import time

WORKSPACE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))

branch_mapping = {
    "current_ga": "galaxy",
    "current_nightly": "galaxy-sustain",
    "next": "current"
}

def get_app_name():
    if os.path.exists("build.json"):
        with open('build.json') as fp:
            app_name = json.load(fp)['name']
    else:
        with open('build.properties') as fp:
            for line in fp:
                line = line.strip()
                if line.startswith("package.name"):
                    _, app_name = line.split("=")

    if app_name.startswith("splunk_app"):
        return app_name, app_name
    elif app_name.startswith("Splunk_TA"):
        app_name2 = app_name.split("_")
        return app_name, "-".join(app_name2[1:])

def get_app_branch():
    branch = os.environ['bamboo_repository_git_branch']
    if branch:
        return branch

    process = os.popen("/opt/git/bin/git branch")
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
    parser = OptionParser()

    help_info = "the version of splunk"
    parser.add_option('--splunk-version', dest='splunk_version', help=help_info)

    help_info = "wait time (seconds) for eventgen to generate data"
    parser.add_option('--wait-time', dest='wait_time', type="int", help=help_info)

    help_info = "test"
    parser.add_option('--sample-count', dest='sample_count', type="int", help=help_info)

    return parser

if __name__ == '__main__':
    parser = get_optargs()
    (opts, args) = parser.parse_args()

    if not opts.splunk_version:
        parser.print_help()
        exit(1)

    os.chdir(WORKSPACE)

    SPLUNK_HOME = "/usr/local/bamboo/splunk-install"
    PYTHON_LIB  = "/usr/local/bamboo/python_lib"
    GIT_BRANCH  = get_app_branch()
    FOLDER_NAME, APP_NAME = get_app_name()

    # Install Splunk and related APPs
    cmd = "contrib/common/AppPandaNew/apppandaCLI.py --splunk_home " + SPLUNK_HOME + " --branch " + branch_mapping[opts.splunk_version]

    if GIT_BRANCH == "develop":
        cmd += " --apps " + APP_NAME + " SA-Eventgen2" + " --artifactory"
    else:
        app_ver = get_app_version()
        cmd += " --apps " + APP_NAME + " SA-Eventgen2" + " --app_versions " + app_ver + " --artifactory"

    print "Command for installing Splunk and APP: " + cmd
    os.system("/usr/bin/python " + cmd)

    cmd = "cp -f test/performance/eventgen.conf " + SPLUNK_HOME + "/etc/apps/" + FOLDER_NAME + "/default/eventgen.conf"
    print "Command for copy eventgen.conf: " + cmd
    os.system(cmd)

    cmd = SPLUNK_HOME + "/bin/splunk cmd python contrib/common/DSG-util-misc/harpy/gen_event_until.py 1000000"
    print "Command for waiting for events generation: " + cmd
    os.system(cmd)

    cmd = "rm -rf " + SPLUNK_HOME + "/etc/apps/SA-Eventgen"
    print "Remove eventgen as a workaround: " + cmd
    os.system(cmd)

    cmd = SPLUNK_HOME + "/bin/splunk restart"
    print "Restart Splunk: " + cmd
    os.system(cmd)
