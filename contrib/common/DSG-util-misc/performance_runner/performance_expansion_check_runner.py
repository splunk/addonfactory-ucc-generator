############################################################################################################################
#This script is used to check tag expansion issue for eventtypes, and get eventCount, scanCount, runDuration from job inspect
#For more information, please refer to README.txt
#Author: Cloris Yu, Laiqiang Ding
#email: cyu@splunk.com, lding@splunk.com
#############################################################################################################################

from splunktalib import credentials
from splunktalib import rest
import json
import time
import subprocess
import re
import os
import sys
import csv
from collections import namedtuple, defaultdict
import argparse
import logging

# baseurl = 'https://localhost:8089'
# userName = 'admin'
# password = 'changeme'
# excute_time = 5

""" Logging Setup """
logger = logging.getLogger('performance_expansion_check_runner log')
filehandler = logging.FileHandler('performance_expansion_check_runner.log', 'w')
logger.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(levelname)s: %(message)s')
filehandler.setFormatter(formatter)
logger.addHandler(filehandler)

def get_splunk_session_key(splunk_url,userName, passWord):
    con = credentials.CredentialManager(splunk_url,None)
    session_key = con.get_session_key(userName,passWord,splunk_url)
    return session_key

def exec_cmd(cmd, check_pattern="", check_no_pattern=""):
    """
    Execute shell command
    :param cmd: shell command line e.g. ls -l
    :param check_pattern:
    :param check_no_pattern:
    :return: the output text of the execution results (stderr is not covered)
    """
    # print cmd
    output = subprocess.check_output(cmd, shell=True)
    # print output
    if check_pattern:
        assert re.search(check_pattern, output), \
            'Failed to execute the command "{}". no string: "{}" in output'.format(cmd, check_pattern)
    if check_no_pattern:
        assert not re.search(check_no_pattern, output), \
            'Failed to execute the command "{}". string: "{}" in output'.format(cmd, check_no_pattern)

    # pprint(output)
    return output

def run_search_os_system(spl,splunk_bin, local_splunk_root_folder, splunk_mgr_url, splunk_password, splunk_username,detach):

    search_eventtypes_cmd1 = splunk_bin + ' search "{}" -uri "{}" -auth "{}:{}"  -maxout 0 -detach {} '.format(spl, splunk_mgr_url, splunk_username, splunk_password, "true" if detach else "false")
    #print search_eventtypes_cmd1
    result = os.popen(search_eventtypes_cmd1).read()
    return  result



def run_search(spl, local_splunk_root_folder, splunk_mgr_url, splunk_password, splunk_username='admin', detach=False):
    """
    run SPL against Splunk by using CLI, could connect to remote server, and return text as result
    :param spl: spl to run
    :param local_splunk_root_folder: local Splunk installed, need to use its CLI
    :param splunk_mgr_url: remote management URL with port (8089 normally)
    :param splunk_password: admin's password
    :param splunk_username: admin's name ('admin' by default
    :param detach: wait for result, by default as True, if False, means: trigger running and no care about the result
    :return: text result of the SPL (returned by CLI)
    """
    splunk_bin = local_splunk_root_folder + '/bin/splunk'
    search_eventtypes_cmd1 = splunk_bin + ' search "{}" -uri "{}" -auth "{}:{}"  -maxout 0 -detach {} -wrap'.format(
        spl, splunk_mgr_url, splunk_username, splunk_password, "true" if detach else "false")

    return exec_cmd(search_eventtypes_cmd1)

def get_search_results(spl, local_splunk_root_folder, splunk_mgr_url, splunk_password, splunk_username='admin'):
    """
    run SPL against Splunk by using CLI, could connect to remote server and return results as objects
    :param spl: spl to run
    :param local_splunk_root_folder: local Splunk installed, need to use its CLI
    :param splunk_mgr_url: remote management URL with port (8089 normally)
    :param splunk_password: admin's password
    :param splunk_username: admin's name ('admin' by default
    :param detach: wait for result, by default as True, if False, means: trigger running and no care about the result
    :return: a list of namedtuple, the fields in the namedtuple is automatically orgnized by the SPL.
     e.g. eventtype=abc | table a, b, c
     it will return a list of namedtuple, each tuple has a, b, c field value
    """
    output = run_search(spl, local_splunk_root_folder, splunk_mgr_url, splunk_password, splunk_username)

    assert output, 'SPL "{}" return nothing'.format(spl)

    lines = output.split("\n")

    headers = re.split(r"\s+", lines[0].strip())
    header_cls = namedtuple("Header", headers)
    header_count = len(headers)

    def _mk_field(line, hdr_cnt):
        result_lst = []

        def _get_next_no_empty_str(s):
            result = ""
            while True:
                c = next(s)
                if c.isspace():
                    if result == "":
                        continue
                    else:
                        break
                else:
                    result += c
            return result

        s_iter = iter(line)
        for x in xrange(hdr_cnt - 1):
            result_lst.append(_get_next_no_empty_str(s_iter))
        # last
        result_lst.append(''.join(tuple(s_iter)).strip())

        return header_cls._make(result_lst)

    return [_mk_field(line, header_count) for line in lines[2:-1]]


def get_search_job_parameters(splunk_url, sid, session_key):
    job_sid_url_template = "{}/services/search/jobs/{}?output_mode=json&count=0"
    job_sid_url = job_sid_url_template.format(splunk_url,sid)
    job_done = 0
    ########Max search time limit is 2*300 = 600 seconds########################
    sleep_slot = 2
    max_count = 300
    count = 0
    job_result = {}
    #init_value = "Unknown"
    #eventSearch,scanCount,eventCount,normalizedSearch,runDuration = [init_value,init_value,init_value,init_value,init_value]

    while (count < max_count and job_done is 0):

        job_status_r = rest.splunkd_request(job_sid_url,session_key)
        count = count + 1
        try:

        #job_status = job_status_r[1]
            time.sleep(sleep_slot)
            job_status_json = json.loads(job_status_r[1])
            job_status_content = job_status_json["entry"][0]["content"]
            if job_status_content["dispatchState"] == "DONE":
                job_done = 1
                job_result["eventSearch"] = job_status_content["eventSearch"]
                job_result["scanCount"] = job_status_content["scanCount"]
                job_result["eventCount"] = job_status_content["eventCount"]
                job_result["normalizedSearch"] = job_status_content["normalizedSearch"]
                job_result["runDuration"] = job_status_content["runDuration"]

        except:
            print "Fails to get the job status for sid: ", sid
    return job_result

def get_splunk_ta_eventtypes_job_inspect_parameter(ta_name, excute_times,local_splunk_root_folder, splunk_bin, splunk_mgr_url, splunk_password,
                                         splunk_username='admin'):
    """
    need local Splunk CLI, connect to remote server to get eventtypes' job inspector results
    it will trigger a search with index=* eventtype={} and get the job inspect parameter, expansion check will be run.
    :param ta_name: the name of the TA
    :param excute_times: the run count of each eventtype search, for example, if set to 2, each eventtype search will be run 2 times to get average runDuration
    :param local_splunk_root_folder: local Splunk installed, need to use its CLI
    :param splunk_mgr_url: remote management URL with port (8089 normally)
    :param splunk_password: admin's password
    :param splunk_username: admin's name ('admin' by default
    :return: a dict, with key to be eventtype, value to be a list of [eventCount, scanCount, runDuration]
    """
    spl_all_eventtypes = "| rest /services/saved/eventtypes | search eai:acl.app=Splunk_TA* | table eai:acl.app, title, search | rename eai:acl.app as app | rename title as eventtype"
    print "loading all eventtypes..."
    logger.info("%s",ta_name)
    logger.info("loading all eventtypes...")
    eventtypes = get_search_results(spl_all_eventtypes, local_splunk_root_folder, splunk_mgr_url, splunk_password,
                                    splunk_username)

    search_job_url = "/services/search/jobs/"
    # # filter with white list
    app_whitelist = [ta_name]
    if app_whitelist:
        if not isinstance(app_whitelist, (set, dict)):
            app_whitelist = set(app_whitelist)
        eventtypes = [et for et in eventtypes if et.app in app_whitelist]
    # # get splunk session_key
    session_key = get_splunk_session_key(splunk_mgr_url,splunk_username,splunk_password)
    eventtype_job_result={}

    job_id_rule = re.compile('Job\sid:\s?(.*)')

    #ta_name = 'Splunk_TA_cisco-asa'

    reverse_lookup_list = get_splunk_knowledge_objects_lookup(ta_name,local_splunk_root_folder,splunk_mgr_url,splunk_password,splunk_username)
    sourcetype_rename_list = get_splunk_knowledge_objects_sourcetype_rename(ta_name,local_splunk_root_folder,splunk_mgr_url,splunk_password,splunk_username)

    for result in eventtypes:
        print '#'*60
        print result.eventtype
        scanCount = 0
        rund_sum = 0.0
        eventCount = -1
        for run_count in range(0,excute_times):
            spl_eventtype_search = 'index=* eventtype={} '.format(result.eventtype)
            job_id_str = run_search_os_system(spl_eventtype_search,splunk_bin,local_splunk_root_folder,splunk_mgr_url,splunk_password,splunk_username,'true')

            try:
                job_id = job_id_rule.match(job_id_str).group(1)
                #print job_id
                job_result = get_search_job_parameters(splunk_mgr_url,job_id,session_key)
                scanCount = job_result["scanCount"]
                eventcount_temp = job_result["eventCount"]
                if (eventCount == -1):
                    eventCount = job_result["eventCount"]
                if (eventCount != eventcount_temp):
                    logger.error("ERROR!!!: eventCount is different from the previous one for eventtype %s",result.eventtype)
                    print "ERROR!!!: eventCount is different from the previous one"
                    sys.exit(1)

                runDuration = job_result["runDuration"]
                if run_count == 0:
                    normalizedSearch = job_result["normalizedSearch"]
                    check_expansion(result.eventtype,result.search,normalizedSearch,reverse_lookup_list,sourcetype_rename_list)

                rund_sum = rund_sum + runDuration
                if run_count is 0: print "scanCount, eventCount, runDuration"
                print scanCount,eventCount,runDuration
                logger.info("eventtype %s, run %s time, scanCount: %s, eventCount: %s, runDuration: %s",result.eventtype,run_count+1,scanCount,eventCount,runDuration)
            except:
                print "Fails to run search for eventtype: "+ result.eventtype
                logger.error("Fails to run search for eventtype: %s",result.eventtype)

        run_duration_avg = rund_sum/excute_times
        eventtype_job_result[result.eventtype]=[eventCount,scanCount,run_duration_avg]
    return eventtype_job_result

def get_splunk_knowledge_objects_lookup(ta_name,local_splunk_root_folder, splunk_mgr_url, splunk_password,
                                            splunk_username='admin'):
    """
    connect to remote splunk to get knowledge objects via local Splunk CLI
    :param ta_name: the TA you want to collect lookup info
    :param local_splunk_root_folder:
    :param splunk_mgr_url:
    :param splunk_password:
    :param splunk_username:
    :return: a dict, key is sourcetype, value is a dict.
    The value dict's key is lookup output field's name, value is the list of its input field name
    Cureently, looup multi-input is not supported, output field divided by space is not supported
    """
    print ta_name
    spl_all_lookup = "| rest /servicesNS/admin/search/data/props/lookups |search eai:acl.app = {} | table eai:acl.app, stanza, value | rename eai:acl.app as app".format(ta_name)
    #print spl_all_lookup
    print "loading all lookup knowledges..."
    try:
        ko_lookup = get_search_results(spl_all_lookup, local_splunk_root_folder, splunk_mgr_url, splunk_password,
                                   splunk_username)
    except:
        print "No lookup exists for this TA"
        sourcetype_lookup_list = {}
        return sourcetype_lookup_list
    #print(ko_lookup)
    sourcetype_lookup_list={}
    lookup_rule = re.compile('[^\s\=]+\s*(.*)\s*(?:OUTPUT|OUTPUTNEW)\s(.*)$')
    lookup_input_rule = re.compile('.*?AS\s+(.*[^\s^(AS])\s?$',re.I)
    lookup_output_rule = re.compile('.*\sAS\s(.*)?',re.I)
    lookup_output_field_list = []
    for items in ko_lookup:
        #print '#'*30
        #print items
        if not sourcetype_lookup_list.has_key(items[1]):
            sourcetype_lookup_list[items[1]]={}
        try:

            lookup_input = lookup_rule.match(items[2]).group(1).strip()
            lookup_output_list = lookup_rule.match(items[2]).group(2).strip().split(',')
            try:
                lookup_input_field = lookup_input_rule.match(lookup_input).group(1)
            except:
                lookup_input_field = lookup_input
            #print "Lookup input : "+lookup_input
            #print lookup_input_field


            for lookup_output in lookup_output_list:
                #print "check:"
                #print lookup_output
                try:
                    lookup_ouput_field = lookup_output_rule.match(lookup_output).group(1).strip()
                except:
                    lookup_ouput_field = lookup_output.strip()
                #print lookup_ouput_field
                if not sourcetype_lookup_list[items[1]].has_key(lookup_ouput_field):
                    sourcetype_lookup_list[items[1]][lookup_ouput_field] = []
                sourcetype_lookup_list[items[1]][lookup_ouput_field].append(lookup_input_field)


        except:
            print "fails to analyze lookup" + items[2]
            logger.warn("Fails to analyze lookup %s",items[2])
    logger.info("lookup list: %s",sourcetype_lookup_list)
    #print sourcetype_lookup_list

    return sourcetype_lookup_list

def get_splunk_knowledge_objects_sourcetype_rename(ta_name,local_splunk_root_folder, splunk_mgr_url, splunk_password,
                                            splunk_username='admin'):
    """
    connect to remote splunk to get knowledge objects via local Splunk CLI
    :param ta_name: the TA you want to collect sourcetype rename info
    :param local_splunk_root_folder:
    :param splunk_mgr_url:
    :param splunk_password:
    :param splunk_username:
    :return: a dict, key to be the sourcetype after rename, value to be list of sourcetype before rename
    """
    #print ta_name
    spl_all_sourcetype_rename = "| rest /services/data/props/sourcetype-rename | search eai:acl.app = {} |table eai:acl.app, stanza, value | rename eai:acl.app as app".format(ta_name)
    #print spl_all_lookup
    logger.info("loading all sourcetype-rename knowledges...")
    print "loading all sourcetype-rename knowledges..."
    try:
        sourcetype_rename = get_search_results(spl_all_sourcetype_rename, local_splunk_root_folder, splunk_mgr_url, splunk_password,
                                   splunk_username)
    except:
        print "no sourcetype rename for this TA"
        sourcetype_rename_dict = {}
        return sourcetype_rename_dict
    ta_name_list = [ta_name]
    sourcetype_rename = [sr for sr in  sourcetype_rename if sr.app in ta_name_list]
    sourcetype_rename_dict={}
    for item in sourcetype_rename:
        if sourcetype_rename_dict.has_key(item[2]):
            sourcetype_rename_dict[item[2]].append(item[1])
        else:
            sourcetype_rename_dict[item[2]]=[item[1]]

    logger.info("sourcetype rename list: %s",sourcetype_rename_dict)

    return sourcetype_rename_dict

def get_command_list_search_job_inspect_parameter(command_list, excute_times,local_splunk_root_folder, splunk_bin, splunk_mgr_url, splunk_password,
                                         splunk_username='admin'):
    session_key = get_splunk_session_key(splunk_mgr_url,splunk_username,splunk_password)

    job_id_rule = re.compile('Job\sid:\s?(.*)')
    command_job_result = {}
    for command in command_list:
        print '#'*60
        print command
        logger.info("search command: %s",command)
        scanCount = 0
        eventCount = 0
        rund_sum = 0.0
        for run_count in range(0,excute_times):
            job_id_str = run_search_os_system(command,splunk_bin,local_splunk_root_folder,splunk_mgr_url,splunk_password,splunk_username,'true')
            try:
                job_id = job_id_rule.match(job_id_str).group(1)
                print job_id
                job_result = get_search_job_parameters(splunk_mgr_url,job_id,session_key)
                scanCount = job_result["scanCount"]
                eventCount = job_result["eventCount"]
                runDuration = job_result["runDuration"]
                rund_sum = rund_sum + runDuration
                if run_count == 0 : print "scanCount, eventCount, runDuration"
                print scanCount,eventCount,runDuration
                logger.info("command: %s, run %s time, scanCount: %s, eventCount: %s, runDuration: %s",command,run_count+1, scanCount,eventCount,runDuration)
            except:
                print "Fails to run search for command: "+ command
                logger.error("Fails to run search for command %s",command)
        run_duration_avg = rund_sum/excute_times
        #print "average:" + eventCount+ ','+scanCount+',' + run_duration_avg
        command_job_result[command]=[eventCount,scanCount,run_duration_avg]
    return command_job_result

# def get_nomalizedSearch_sourcetype_field(search_string):
#     sourcetype_rule = re.compile('sourcetype\s*=\s*"*(.*?)"*\s+')
#     kv_rule = re.compile('\s*([\w\-]+)\s*!?=\s*.*?[\)\s]+')
#
#

# def get_nomarlized_search_sourcetype(normalizedSearch):
#
#     sourcetype_rule = re.compile('sourcetype\s*=\s*\"*(.*?)\"*[\s\)]+')
#     sourcetypes = set(re.findall(sourcetype_rule,normalizedSearch))
#     return sourcetypes

def get_search_sourcetype(search_string):
    #sourcetype_rule = r"sourcetype\s*=\s*\"*(.*?)\"*\s+"
    # # Below regex need refine
    sourcetype_rule = re.compile('sourcetype\s*=\s*\"*([^\s)("]*)\"*')
    sourcetypes = set(re.findall(sourcetype_rule,search_string))
    return sourcetypes
# def expansion_analyser(eventtype_def, normalizedSearch):
#
#

def check_expansion(eventtype, eventtype_def,normalizedSearch,reverse_lookup_list, sourcetype_rename_list):
    is_expanded = 1
    white_list = ['keepcolorder', 'index','sourcetype','__f']

    orignal_fields = get_search_fields(eventtype_def)
    orignal_sourcetype_value = get_search_sourcetype(eventtype_def)
    search_fields = get_search_fields(normalizedSearch)
    search_sourcetype_value = get_search_sourcetype(normalizedSearch)

    diff_field =set(search_fields)-set(orignal_fields)-set(white_list)
    diff_sourcetype = set(search_sourcetype_value)-set(orignal_sourcetype_value)-set(white_list)

    if len(diff_field) != 0 or len(diff_sourcetype)!=0:

        if len(diff_field) != 0 and len(reverse_lookup_list) != 0 :
            for sourcetype in orignal_sourcetype_value:
                #print sourcetype
                if reverse_lookup_list.has_key(sourcetype):
                    for field in orignal_fields:
                        #print reverse_lookup_list[sourcetype]
                        if reverse_lookup_list[sourcetype].has_key(field):
                            reverse_input_field =set(diff_field)&set(reverse_lookup_list[sourcetype][field])
                            diff_field = set(diff_field)-reverse_input_field

            if len(diff_field) ==0:
                print "eventtype: "+ eventtype +" has reverse lookup"
                logger.info("eventtype: %s has reverse lookup", eventtype)

        if len(diff_sourcetype) != 0 and len(sourcetype_rename_list)>0 :

            for sourcetype in orignal_sourcetype_value:
                if sourcetype_rename_list.has_key(sourcetype):
                    #print sourcetype_rename_list[sourcetype]
                    sourcetype_orignal_name_list = sourcetype_rename_list[sourcetype]
                    rename_sourcetype_in_eventtype = set(sourcetype_orignal_name_list)&set(diff_sourcetype)
                    #print "sourcetype_orignal_name" + sourcetype_orignal_name
                    diff_sourcetype = set(diff_sourcetype)-rename_sourcetype_in_eventtype
            if len(diff_sourcetype) == 0:
                print "eventtype: "+ eventtype + " has sourcetype rename"
                logger.info("eventtype: %s has sourcetype rename", eventtype)

    if len(diff_field) == 0 and len(diff_sourcetype) == 0:
        is_expanded = 0
        print "eventtype: "+ eventtype+ " has no expansion"
        logger.info("eventtype: %s has no expansion", eventtype)

    else:
        print "It's expanded"
        logger.error("eventtype: %s is expanded, it is expanded to %s",eventtype,normalizedSearch)
        print "sourcetype added: "
        print diff_sourcetype
        print "field added: "
        print diff_field
        #print "it is expanded to: "
        #print normalizedSearch
    return is_expanded

def get_search_fields(s1):
    """
    parse fields used in eventtype's search,
    support =, <=, !=, ==, etc
    :param s1: search string
    e.g. input: sourcetype=abc "ACS" field1 = "abc" field2>=100 field3!=3
    :return: fields used in formd of set()
    e.g. {"sourcetype", "field1", "field2", "field3"}
    """
    # all k with =
    ptn = r"\s*([^\s\(\)\*=\?\"\'\-\!\<\>]+)\s*(?:=|>|<|!){1,3}"
    ret = set(re.findall(ptn, s1))
    for x in ret:
        assert not re.search(r"[^\w\.\:]+", x), "***** WARNING **** field name: " + x
    return ret

def get_command_list(filename):
    _file = open(filename,'rb')
    command_list = []
    for line in _file.readlines():
        if len(line)>1:  ######to skip the empty line
            command_list.append(line.strip('\n'))
    _file.close()
    return  command_list

def write_result(filename,result,from_file = 0):
    file_to_wirte = file(filename,'wb')
    result_file = csv.writer(file_to_wirte)
    if from_file is 0:
        result_file.writerow(['eventttype search','eventCount','scanCount','runDuration'])
    else:
        result_file.writerow(['search command','eventCount','scanCount','runDuration'])
    for key in result:
        result_file.writerow([key,result[key][0],result[key][1],result[key][2]])



def test():
    local_splunk_root_folder = '/Applications/Splunk'
    splunk_bin = local_splunk_root_folder + '/bin/splunk'
    #splunk_mgr_url = "https://localhost:8089"
    #splunk_mgr_url = "https://taperf01:8089"
    splunk_mgr_url = "https://ta_es_eventtype_performance_server:8089"
    splunk_username = "admin"
    splunk_password = "changeme"

    ta_name = 'Splunk_TA_cisco-esa'
    # command_list = ['index = * (tag=attack and tag=ids)',
    #                 'index = * tag=av',
    #                 'index = * (tag=malware AND tag=attack)',
    #                 'index = * tag=inventory',
    #                 'index = * tag=firewall',
    #                 'index= * tag=watchlist',
    #                 'index=* (tag=malware AND tag=operations)'
    # ]
    #get_splunk_knowledge_objects_sourcetype_rename('Splunk_TA_cisco-asa',local_splunk_root_folder,splunk_mgr_url,splunk_password,splunk_username)
    #get_splunk_knowledge_objects_lookup('Splunk_TA_cisco-asa',local_splunk_root_folder,splunk_mgr_url,splunk_password)
    eventtype_rund = get_splunk_ta_eventtypes_job_inspect_parameter(ta_name,1,local_splunk_root_folder,splunk_bin,splunk_mgr_url,splunk_password)
    print eventtype_rund
    #write_result(filename,eventtype_rund)
    #command_list = get_command_list('tag_search_command.txt')
    #command_result = get_command_list_search_job_inspect_parameter(command_list,5,local_splunk_root_folder,splunk_bin,splunk_mgr_url,splunk_password)
    #print command_result

    #haha = get_command_list('tag_search_command.txt')

if __name__ == '__main__':
    #main()
    default_local_splunk_root_folder = '/Applications/Splunk'
    default_splunk_mgr_url = "https://ta_es_eventtype_performance_server:8089"
    default_splunk_username = "admin"
    default_splunk_password = "changeme"
    default_excute_times = 1
    #default_command_file_name = 'tag_search_command.txt'
    defaut_output_filename = "performance_expansion_test_result.txt"




    parser = argparse.ArgumentParser(description= 'This python script is used to get job inspect info and check expansion issue')
    parser.add_argument("--ta_name", "-t", dest="ta_name", help= 'Enter the TA name which you want to check expansion')
    parser.add_argument("--local_splunk_root_folder", "-l", dest="local_splunk_root_folder", help= 'Enter you local splunk folder, default value is /Applications/Splunk')
    parser.add_argument("--splunk_mgr_url", "-mgr", dest="splunk_mgr_url",help='Enter the splunk management url, eventtype/command searches will be run on this machine, example: https://ta_es_eventtype_performance_server:8089 ' )
    parser.add_argument("--splunk_password", "-p", dest="splunk_password", help= 'Enter the splunk password of splunk_mgr_url, default to be changeme')
    parser.add_argument("--splunk_username", "-u", dest="splunk_username", help= 'Enter the splunk username of splunk_mgr_url, default to be admin')
    parser.add_argument("--excute_times", "-e", dest="excute_times", help= 'Enter the times for each eventtype/command search you want to run to get the average runDuration, default to be 1')
    parser.add_argument("--command_file_name", "-c", dest="command_file_name", help= 'Enter the command file name you want to run, this is needed when you want to run self-defined searches instead of command searches ')
    parser.add_argument("--output_filename", "-o", dest="output_filename", help= 'Enter the output filename, default to performance_expansion_test_result.csv')

    args = parser.parse_args()
    if args.ta_name is None and args.command_file_name is None:
        print "Please enter TA name or command file name"
        sys.exit(1)
    else:
        ta_name = None
        command_file_name = None

        if args.ta_name is not None:
            # # run eventtype searches in specified TA
            ta_name = args.ta_name
            command_file_name = None
        else:
            # # run self-defined searches defined in command_file_name
            command_file_name = args.command_file_name

        if args.local_splunk_root_folder is None:
            local_splunk_root_folder = default_local_splunk_root_folder
        else:
            local_splunk_root_folder = args.local_splunk_root_folder

        splunk_bin = local_splunk_root_folder + '/bin/splunk'

        if args.splunk_mgr_url is None:
            splunk_mgr_url = default_splunk_mgr_url
        else:
            splunk_mgr_url = args.splunk_mgr_url

        if args.splunk_password is None:
            splunk_password = default_splunk_password
        else:
            splunk_password = args.splunk_password

        if args.splunk_username is None:
            splunk_username = default_splunk_username
        else:
            splunk_username = args.splunk_username

        if args.excute_times is None:
            excute_times = default_excute_times
        else:
            excute_times = int(args.excute_times)

        if args.output_filename is None:
            output_filename = defaut_output_filename
        else:
            output_filename = args.output_filename

    if ta_name is not None:
        eventtype_rund = get_splunk_ta_eventtypes_job_inspect_parameter(ta_name,excute_times,local_splunk_root_folder,splunk_bin,splunk_mgr_url,splunk_password,splunk_username)
        write_result(output_filename,eventtype_rund,0)
        print '*'*90
        print eventtype_rund
    else:
        command_list = get_command_list(command_file_name)
        logger.info("get command list from file: %s",command_file_name)
        result = get_command_list_search_job_inspect_parameter(command_list,excute_times,local_splunk_root_folder,splunk_bin,splunk_mgr_url,splunk_password,splunk_username)
        write_result(output_filename,result,1)
        print '*'*90
        print result






