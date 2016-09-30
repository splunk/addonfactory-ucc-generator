#!/usr/bin/python

import json
import os
import sys

from bs4 import BeautifulSoup
from confluence import Api

basedir = os.getcwd()

def get_app_type():
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
        return "APP"
    elif app_name.startswith("Splunk_TA"):
        return "TA"
    elif app_name == "SA-ModularInput-PowerShell": # special for powershell
        return "TA"
    elif app_name.startswith("DA"):
        return "DA"
    else:
        return ""

def get_app_name():
    if os.path.exists("build.json"):
        with open('build.json') as fp:
            app_name = json.load(fp)['name']

        if app_name.startswith("splunk_app") or app_name.startswith("Splunk_TA"):
            if app_name == "splunk_app_db_connect":
                return "app-dbx"
            app_name = app_name.split("_")
            app_name = "-".join(app_name[1:])
            return app_name.lower()
        elif app_name == "SA-ModularInput-PowerShell": # special for powershell
            return "ta-powershell"
        else:
            return app_name.lower()
    else:
        return None

def get_app_branch():
    if sys.platform == "win32":
        process = os.popen("git.exe branch")
    else:
        process = os.popen("git branch")
    lines = process.read().splitlines()
    for line in lines:
        line = line.strip()
        if line.startswith("* "):
            # sometime bamboo check out in * (HEAD detached at 5bcbf9c) mode
            items = line.split()
            if len(items) == 2:
                branch = items[1]
            else:
                branch = os.environ['bamboo_repository_git_branch']

    return branch

def get_app_revision():
    if sys.platform == "win32":
        process = os.popen("git.exe log --oneline -1")
    else:
        process = os.popen("git log --oneline -1")
    revision = process.read().split()[0]

    return revision

def get_app_status(app_name):
    app_status_map = {}

    try:
        wiki_url = "https://confluence.splunk.com"
        user, pwd = ("jira_service", "jira_service")
        api = Api(wiki_url, user, pwd)
        content = api.getpagecontent("TA Status Overview", "SHAN")
        soup = BeautifulSoup(content, 'html.parser')
        for row in soup.find_all('tr'):
            items = row.find_all('td')
            if len(items) >= 2:
                app_status_map[items[0].get_text()] = items[1].get_text()

        if app_name in app_status_map:
            return app_status_map[app_name]
        else:
            return "develop"
    except:
        return "develop"

os.chdir(basedir)

app_name    = get_app_name()
app_status  = get_app_status(app_name.lower())
branch      = get_app_branch()
app_type    = get_app_type()
revision    = get_app_revision()
buildnumber = os.environ['BUILDNUMBER']

if not app_type:
    print "APP type is None"
    exit(0)

with open("artifacts.conf", 'w') as conf:
    conf.write("[artifactory]\n")
    conf.write("url=http://repo.splunk.com/artifactory/Solutions/\n")
    conf.write("maxcount=10\n")
    conf.write("searchdir=.\n")

    if branch == "develop":
        conf.write("branchpath=" + app_type + "/" + app_name + "/builds/develop\n")
        if app_status == "develop":
            conf.write("demopath=" + app_type+ "/" + app_name + "/demo\n")
    elif branch.startswith("release"):
        if os.path.exists("build.json"):
            with open('build.json') as fp:
                version = json.load(fp)['version']
                conf.write("branchpath=" + app_type+ "/" + app_name + "/builds/" + version + "\n")
        else:
            with open('build.properties') as fp:
                for line in fp:
                    line = line.strip()
                    if line.startswith("version.major"):
                        _, major = line.split("=")

                    if line.startswith("version.minor"):
                        _, minor = line.split("=")

                    if line.startswith("version.revision"):
                        _, revision = line.split("=")

                version = major + "." + minor + "." + revision

                conf.write("branchpath=" + app_type + "/" + app_name + "/builds/" + version + "\n")

        if app_status == "staging":
            conf.write("demopath=" + app_type + "/" + app_name + "/demo\n")
    else:
        exit(0)

if sys.platform == "win32":
    os.system("python.exe contrib\\common\\artifactorytool\\artifacts.py --push --buildnumber=" + buildnumber + " --commit=" + revision)
else:
    os.system("python contrib/common/artifactorytool/artifacts.py --push --buildnumber=" + buildnumber + " --commit=" + revision)
