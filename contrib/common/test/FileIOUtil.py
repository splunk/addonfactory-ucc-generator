import os
import logging
import re
import csv

class FileIOUtil:
    
    def __init__(self, logger):
        """
        constructor of the FileIOUtil. The class is used to assist in functional testing.
        """
        self.logger = logger


    def grab_data(self, data_path, uuid_pattern_subs):
        ''' 
        Grabs the pre-populated data, in the format of <raw, noofevents, uuid_pattern, sourcetype, source> 
        It will return an array of tulples (with each individual tuple representing a data.
        @param data_path is the absolute path to the csv seed data.
        @param uuid_pattern_subs will be used to substitute the "TestData.UUID_PATTERN" for the actual enum.
        '''
        target_data = []
        try:
            data_input = csv.reader(open(data_path, 'rU'), skipinitialspace=True, delimiter=",")
        except IOError, iOE:
            self.logger.error("Could not open " + data_path +" to pre-populate data")
            raise iOE
            '''fail here, raise error, or continue?'''
        header=data_input.next()
	print data_input
        for raw, num_events, uuid_pattern, sourcetype, source in data_input:
            try:
                sub_uuid_pattern = uuid_pattern_subs[uuid_pattern.strip()]
            except KeyError, kE:
                self.logger.error("Unknown uuid_pattern for raw: " + raw + ", and for uuid_pattern: " + uuid_pattern)
                raise kE
            target_data.append((raw.strip(), int(num_events), sub_uuid_pattern,
                                sourcetype.replace("'", "").strip(), source.replace("'", "").strip()))
        self.logger.info("Extracted a total of " + str(len(target_data)) + " data entries, logging below:")
        self.logger.info(target_data)
        return target_data

    def write_to_searches(self, output_file, searches_path):
        '''save the found searches into the @param output_file; erases the old searches.txt located at @param searches_path'''
        try:
            os.remove(output_file)
        except OSError, oSE:
            self.logger.error("Could not find the old: " + output_file + ", continuing")
        out = open(output_file, 'w')
        out.write("searches\n")
        for search in searches_path:
            out.write(search+"\n")
        out.close()

    def find_conf_paths(self, base_dir = "."):
        ''' 
        Given a base_directory, returns a comprehensive list of all savedsearches.conf paths. 
        Defaults to the  current direcotry
        ''' 
        ess_apps_path = base_dir
        print ess_apps_path
        fileSet = list()
        for root, dirs, files in os.walk(ess_apps_path):
            for fileName in files:
                if (fileName == 'savedsearches.conf' and os.path.join(root, fileName) not in fileSet):
                    #and "DA-" in root and "SplunkEnterpriseSecurity" not in root):, used to select DA modules
                    fileSet.append(os.path.join(root, fileName))
        return(fileSet)

    def open_and_extract_searches(self, conf_list):
        '''Given a list of savedsearches.conf paths, search through the conf_file to grab relevant searches. '''
        conf_to_search = {}
        for conf_file in conf_list:
            conf_to_search[conf_file] = []
            input = open(conf_file, "r")
            search_valid = False
	    #xsfindbestconcept - covered in test_ess_extreme_searches.py
            for line in input:
                if (re.match("^\[.*\]", line) and not line.strip().endswith("Rule]") and not line.strip().endswith("Multi Gen]") and not line.strip().endswith("TSIDX Gen]") and not line.strip().endswith("Swimlane]") and not line.strip().endswith("Lookup Gen]") and  "[Threatlist Activity" not in line.strip() and not line.strip().endswith("Context Gen]") and not line.strip().endswith("Administrative]")):
                    print line
                    search_valid = True
                elif (search_valid and re.match("^search.*", line)):
		    if ('`incident_review`' not in line and 'Splunk_Audit Web_Service_Errors' not in line and 'View_Activity' not in line and 'es_loadjob' not in line and '`index_time_delta`' not in line and '`suppression_audit`' not in line and '`suppression_audit-expired`' not in line and '`suppressed_notables`' not in line and 'Threat - Suppressed Notables - Summary Gen' not in line and 'datamodel("Splunk_Audit", "Web_Service_Errors")' not in line and '`exclude_stream_base_nonprotos`' not in line and 'xsfindbestconcept' not in line and '`licensing_epd`' not in line):
                        extracted_search = re.sub("search\s+\=", "", line).strip()
                        conf_to_search[conf_file].append(extracted_search) #adding the hash
                    search_valid = False
            input.close()
        return(conf_to_search)

    def normalize_search(self, search):
        '''
        Given a search query, the function will append the term "search" to the head of the query
        if the query doesn't start with ("`" or "|") or it starts with any of the need_to_append_list.
        Be careful not to prematurely close an entry in need_to_append_list with an additional "`".
        '''
        need_to_append_list = ["`get_summary", "`notable", "`suppressed_notables`", "`search_activity`", "`sshdconfig`", "`selinuxconfig`", "`index_time_delta`", "`suppression_audit`", "`suppression_audit-expired`", "`stream_tcp`"]
        search = search.strip()
        if not (search.startswith('`') or search.startswith('|')):
            search = "search " + search
        else:
            for target in need_to_append_list:
                if search.startswith(target):
                    search = "search " + search
                    break;
        return search
        #add search +  get_summary

    def log_and_check_all_search_results(self, search_pass):
        ''''
        Checks that to see if all the searches have passed.
        Logs all search queries that failed.
        @returns True if all searches passed, False otherwise.
        '''
        search_passed = True
        for search, passed in search_pass.items():
            if not passed: #there was a fail
                search_passed = False
                self.logger.error("Failed the following search: " + search)
        return search_passed
