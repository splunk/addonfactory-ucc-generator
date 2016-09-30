import datetime
import json
import os
import platform
import re
import time

from bs4 import BeautifulSoup
import psutil
import pytz
import requests

def get_app_name():
    if os.path.exists("build.json"):
        with open('build.json') as fp:
            app_name = json.load(fp)['name']

    return app_name

def local_to_utc(strdate):
    # bamboo server use PDT time, the timezone is America/Los_Angeles
    local = pytz.timezone("America/Los_Angeles")
    naive = datetime.datetime.strptime(strdate, '%d-%b-%Y %H:%M:%S')
    local_dt = local.localize(naive)
    utc_dt = local_dt.astimezone(pytz.utc)

    return utc_dt

class Bamboo(object):
    def __init__(self):
        self.product_name     = ""
        self.job_name         = ""
        self.product_category = ""
        self.product_branch   = ""
        self.ci_category      = "bamboo"
        self.job_keyname      = ""
        self.build_no         = ""
        self.starttime        = None
        self.endtime          = None
        self.splunk           = ""
        self.package          = ""
        self.run_host         = ""
        self.dependency       = []
        self.host_env         = {}
        self.commits          = []
        self.git_revision     = ""

    def __get_host_env__(self):
        if platform.system() == "Linux":
            (os_name, os_version, _) = platform.linux_distribution()

            self.host_env['os_type']    = "Linux"
            self.host_env['os_name']    = os_name
            self.host_env['os_version'] = os_version

            self.host_env['cpu_count']  = psutil.cpu_count()

            mem = psutil.virtual_memory()
            self.host_env['memory'] = mem.total

            self.host_env['disk'] = []
            for part in psutil.disk_partitions():
                disk_info = {}
                disk_info['mountpoint'] = part.mountpoint
                disk_info['total'] = psutil.disk_usage(part.mountpoint).total
                self.host_env['disk'].append(disk_info)

    def __analyze_build_log__(self, build_log):
        r = requests.get(build_log, auth=("bamboo", "bamboo"))
        lines = r.text.splitlines()

        (_, self.starttime, _) = lines[0].split("\t")
        self.starttime = local_to_utc(self.starttime)
        self.starttime = time.mktime(self.starttime.timetuple())

        # get endtime from build log is not correct as maybe the build.log is not flushed by bamboo
        self.endtime = datetime.datetime.utcnow()
        self.endtime = time.mktime(self.endtime.utctimetuple())

        for line in lines:
            m = re.match(r'.+started building on agent (.+)', line)
            if m:
                self.run_host = m.group(1)
                continue

            m = re.match(r".+Installing the following Splunk\s+-\s+(.+)", line)
            if m:
                self.splunk = m.group(1)
                continue

            m = re.match(r".+Installing the following App -  (.+)", line)
            if m:
                app_name = get_app_name()
                if m.group(1).startswith(app_name):
                    self.package = m.group(1)
                else:
                    dep_line = m.group(1)
                    dep_m = re.match(r"(.+)-(\d+\.\d+\.\d)+-.+", dep_line)
                    dep = {}
                    dep['name'] = dep_m.group(1)
                    dep['version'] = dep_m.group(2)
                    self.dependency.append(dep)
                continue

    def __analyze_commit__(self, commit):
        r = requests.get(commit, auth=("bamboo", "bamboo"))
        content = r.text

        if content:
            soup = BeautifulSoup(content, 'html.parser')
            fullChanges = soup.find("div", id="fullChanges")

            if not fullChanges.find('ul'):
                print "No commits"
                return

            commits = fullChanges.find('ul').find_all('li', recursive=False)
            valid_commits = []
            for commit in commits:
                if len(commit.find('ul').find_all('li')) > 0:
                    commit_dict = {}
                    links = commit.find("h3").find_all('a')
                    commit_dict['commitor'] = links[0].string
                    commit_dict['commit_msg'] = commit.find('p').string
                    commit_dict['commit_hash'] = links[1].string
                    commit_dict['files'] = []
                    files = commit.find('ul').find_all('li')
                    for commit_file in files:
                        file_name = commit_file.find("a").string
                        commit_dict['files'].append(file_name.strip())
                    valid_commits.append(commit_dict)
        else:
            return

        self.commits = valid_commits

    def collect_data(self):
        bamboo_server = "https://app-builder.sv.splunk.com"

        planName = os.environ.get("bamboo_planName", "")
        if planName:
            plan_array = planName.split()
            self.product_name = plan_array[0]
            self.job_name     = plan_array[2]
        else:
            return None

        if self.product_name:
            self.product_category = self.product_name.split("-")[0]

        self.product_branch = os.environ.get("bamboo_repository_git_branch", "")

        self.job_keyname = os.environ.get("bamboo_buildKey", "")

        self.build_no = int(os.environ.get("bamboo_buildNumber", 0))

        self.git_revision = os.environ.get("bamboo_repository_revision_number", "")

        build_log = bamboo_server + os.path.join("/download", self.job_keyname, "build_logs", self.job_keyname + "-" + str(self.build_no)  + ".log")

        # get host data
        self.__get_host_env__()

        # get data from build log
        self.__analyze_build_log__(build_log)

        # get data from commits
        commits_page = bamboo_server + os.path.join("/browse", self.job_keyname + "-" + str(self.build_no), "commit")
        self.__analyze_commit__(commits_page)

        data_dict = {}
        data_dict['product_name'] = self.product_name
        data_dict['job_name'] = self.job_name
        data_dict['product_category'] = self.product_category
        data_dict['product_branch'] = self.product_branch
        data_dict['ci_category'] = self.ci_category
        data_dict['job_keyname'] = self.job_keyname
        data_dict['build_no'] = self.build_no
        data_dict['starttime'] = self.starttime
        data_dict['endtime'] = self.endtime
        data_dict['splunk'] = self.splunk
        data_dict['package'] = self.package
        data_dict['run_host'] = self.run_host
        data_dict['dependency'] = self.dependency
        data_dict['host_env'] = self.host_env
        data_dict['commits'] =  self.commits
        data_dict['git_revision'] = self.git_revision

        return data_dict

