#########################################################################################
# This file is to get the latest testcase count on Test-CurrGA branch for a list of TA
# on  https://app-builder.sv.splunk.com using REST API
#Author: Cloris Yu
#email: cyu@splunk.com
#########################################################################################

import requests
import json
import math
import sys
import re


SERVER_URL = "https://app-builder.sv.splunk.com/rest/api/latest"
#This account only has read permission
username_password = ('ta-test','changeme')
##This limit is set to avoid possible error and give warning message
#If the testcase count is less than 50, a warning will be shown
case_limit = 38

def get_plan_result_on_currga_and_unit(whitelist, KEYS):
    case_count = {}
    for ta_name in whitelist:
        if KEYS.has_key(ta_name):
            currga_key = KEYS[ta_name][1]
            currga_unit_key = KEYS[ta_name][2]

            if currga_key != None:
                currga_plan_result_url = SERVER_URL+"/result/"+currga_key+".json"
                currga_plan_result_r = requests.get(currga_plan_result_url,auth=username_password)
                if currga_plan_result_r.status_code is 200:

                    currga_plan_result_rjson = json.loads(currga_plan_result_r._content)
                    currga_latest_plan_result_url = currga_plan_result_rjson['results']['result'][0]['link']['href'] + '.json'
                    currga_latest_plan_result_r = requests.get(currga_latest_plan_result_url, auth=username_password)
                    currga_latest_plan_result_rjson = json.loads(currga_latest_plan_result_r._content)
                    successful_test_count = currga_latest_plan_result_rjson['successfulTestCount']
                    failed_test_count = currga_latest_plan_result_rjson['failedTestCount']
                    total_test_count = successful_test_count + failed_test_count
                    if total_test_count <= case_limit:
                        case_count[ta_name] = ["warning: "+str(total_test_count)]
                    else:
                        case_count[ta_name] = [total_test_count]
                else:
                    print "Bad CurrGA URL for: " + currga_key

                if currga_unit_key != None:
                    currga_unit_result_url = SERVER_URL+"/result/"+currga_unit_key+".json"
                    currga_unit_result_r = requests.get(currga_unit_result_url,auth=username_password)
                    if currga_unit_result_r.status_code is 200:
                        currga_unit_result_rjson = json.loads(currga_unit_result_r._content)
                        currga_latest_unit_result_url = currga_unit_result_rjson['results']['result'][0]['link']['href'] + '.json'
                        currga_latest_unit_result_r = requests.get(currga_latest_unit_result_url, auth=username_password)
                        currga_latest_unit_result_rjson = json.loads(currga_latest_unit_result_r._content)
                        successful_test_count = currga_latest_unit_result_rjson['successfulTestCount']
                        failed_test_count = currga_latest_unit_result_rjson['failedTestCount']
                        total_test_count = successful_test_count + failed_test_count
                        unit_result_str = str(successful_test_count)+'/'+str(total_test_count)
                        case_count[ta_name].append(unit_result_str)
                    else:
                        print "Bad Unit test URL for: "+ currga_unit_key

                else:
                    case_count[ta_name].append(0)

        else:
            case_count[ta_name] = ["warning",0]
    return case_count




    #get = r._content

def get_project_keys(whitelist):
    KEYS = {}
    all_projects_url=SERVER_URL+"/project.json"
    r = requests.get(all_projects_url,auth=username_password)
    if r.status_code is not 200:
        print "Error when connecting to "+ all_projects_url
        sys.exit(1)
    rjson = json.loads(r._content)
    size = rjson['projects']['size']
    max_result = rjson['projects']['max-result']
    tries = int(math.ceil(size/float(max_result)))
    for cnt in range (0,tries,1):
        start_index = cnt*25
        all_projects_url = SERVER_URL+"/project.json?start-index=" + str(start_index)
        print all_projects_url
        r = requests.get(all_projects_url,auth=username_password)
        if r.status_code is not 200:
            print "Error when connecting to "+ all_projects_url
            return KEYS
        rjson = json.loads(r._content)
        projectlist = rjson['projects']['project']
        count = len (projectlist)
        for i in range(0,count,1):
            if projectlist[i]['name'] in whitelist:
                ta_name = projectlist[i]['name']
                KEYS[ta_name] =projectlist[i]['key']
    return KEYS

def get_currga_unit_keys(whitelist):
    KEYS = {}
    currga_rule = re.compile('^(ta-.*)\s+-+\s+Test-CurrGA*$')
    currga_unit_rule = re.compile('^(ta-.*)\s+-+\s+Test-CurrGA-Unit*$')
    all_projects_url=SERVER_URL+"/project.json?expand=projects.project.plans"
    r = requests.get(all_projects_url,auth=username_password)
    if r.status_code is not 200:
        print "Error when connecting to "+ all_projects_url
        sys.exit(1)
    rjson = json.loads(r._content)
    size = rjson['projects']['size']
    max_result = rjson['projects']['max-result']
    tries = int(math.ceil(size/float(max_result)))
    for cnt in range (0,tries,1):
        start_index = cnt*max_result
        all_projects_url = SERVER_URL+"/project.json?expand=projects.project.plans&start-index=" + str(start_index)
        print all_projects_url
        r = requests.get(all_projects_url,auth=username_password)
        if r.status_code is not 200:
            print "Error when connecting to "+ all_projects_url
            return KEYS
        rjson = json.loads(r._content)

        projectlist = rjson['projects']['project']
        count = len (projectlist)
        for i in range(0,count,1):
            if projectlist[i]['name'] in whitelist:

                ta_name = projectlist[i]['name']
                PROJECT_KEY = projectlist[i]['key']
                plan_size = projectlist[i]['plans']['max-result']
                ##########Check the Test-CURRGA and Unit Key######
                CURRGA_KEY = None
                CURRGA_UNIT_KEY = None
                for plan_cnt in range(0,plan_size,1):
                    plan_name = projectlist[i]['plans']['plan'][plan_cnt]['name']
                    if (CURRGA_KEY == None and currga_rule.search(plan_name)):
                        CURRGA_KEY = projectlist[i]['plans']['plan'][plan_cnt]['key']
                    elif (CURRGA_UNIT_KEY == None and currga_unit_rule.search(plan_name)):
                        CURRGA_UNIT_KEY = projectlist[i]['plans']['plan'][plan_cnt]['key']

                KEYS[ta_name]=(PROJECT_KEY,CURRGA_KEY,CURRGA_UNIT_KEY)
    return KEYS

def get_currga_keys(ta_name_list):
    KEYS = {}
    ta_name_rule = re.compile('^(ta-.*)\s+-+\s+Test-CurrGA*$')
    all_projects_url=SERVER_URL+"/plan.json"
    all_projects_url_r = requests.get(all_projects_url,auth=username_password)
    if all_projects_url_r.status_code is not 200:
        print "Error when connecting to "+ all_projects_url
        sys.exit(1)
    all_projects_url_rjson = json.loads(all_projects_url_r._content)
    max_result = all_projects_url_rjson['plans']['max-result']
    size = all_projects_url_rjson['plans']['size']
    #print max_result, size
    tries = int(math.ceil(size/float(max_result)))
    for cnt in range (0,tries,1):
        start_index = cnt*max_result
        all_projects_url = SERVER_URL+"/plan.json?start-index=" + str(start_index)
        #print all_projects_url
        all_projects_url_r = requests.get(all_projects_url,auth=username_password)
        if all_projects_url_r.status_code is not 200:
            print "Error when connecting to "+ all_projects_url
            return KEYS
        all_projects_url_rjson = json.loads(all_projects_url_r._content)

        plan_list = all_projects_url_rjson['plans']['plan']
        count = len (plan_list)
        for i in range(0,count,1):
            name = plan_list[i]['name']
            try:
                ta_name = ta_name_rule.match(name).group(1)
            except:
                ta_name = None

            if ta_name is not None:
                if ta_name in ta_name_list:
                    currga_plan_key = plan_list[i]['planKey']['key']
                    KEYS[ta_name] = currga_plan_key
    return KEYS

def compare_bamboo_input_output(whitelist,keys):
    if (len(whitelist) != len(keys)):
        print ""
        for ta_name in whitelist:
            if not keys.has_key(ta_name):
                print "WARNING: TA: "+ ta_name + " is not found on bamboo currga agent"
