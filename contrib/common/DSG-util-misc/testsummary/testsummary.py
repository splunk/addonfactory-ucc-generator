################################################################################################
#This script is used to generate testsummary, get testcases count from testlink and bamboo agent
#Author: Cloris Yu
#email: cyu@splunk.com
#################################################################################################
import argparse
import csv
import sys
import gettalist as gettalist
import bamboo as bamboo
import gettestlink as testlink

default_output_filename = 'test_summary_result.csv'


def get_ta_list_from_file(filename):
    _file = open(filename,'rb')
    whitelist = []
    for line in _file.readlines():
        whitelist.append(line.strip('\n'))
    _file.close()
    return  whitelist

def getbamboo(ta_name_list):
    keys = bamboo.get_currga_unit_keys(ta_name_list)
    bamboo.compare_bamboo_input_output(ta_name_list, keys)
    case_count = bamboo.get_plan_result_on_currga_and_unit(ta_name_list,keys)
    return case_count

def writefile(ta_name_list,testlink_result, bamboo_result,filename):
    csvfile = file(filename, 'wb')
    resultwrite = csv.writer(csvfile)
    resultwrite.writerow(['TA-name', 'Test case - Total', 'Manual', 'Automated','Auto Rate', 'Unit Test' ])
    total_count_sum = 0
    automated_count_sum = 0
    manual_count_sum = 0
    for ta_name in ta_name_list:
        testlink_total_count = 0
        testlink_automated_count = 0
        testlink_manaul_count = 0
        if testlink_result.has_key(ta_name):
            testlink_total_count = testlink_result[ta_name][2]
            testlink_automated_count = testlink_result[ta_name][1]
            testlink_manaul_count = testlink_result[ta_name][0]

        bamboo_count = 0
        unit_count = 0
        if bamboo_result.has_key(ta_name):
            bamboo_count = bamboo_result[ta_name][0]
            unit_count = bamboo_result[ta_name][1]
        ########Only manual case in testlink is counted, automated testcase in testlink is ignored. As there maybe some
        ########overlap between testlink automated cases and bamboo automated cases.
        if type(bamboo_count) is int and bamboo_result.has_key(ta_name):
            total_count = bamboo_count+testlink_manaul_count
            #automated_count = bamboo_count + testlink_automated_count
            automated_count = bamboo_count
            manual_count =  testlink_manaul_count
            total_count_sum += total_count
            automated_count_sum += automated_count
            manual_count_sum += manual_count
            if total_count > 0:
                auto_rate = round((automated_count/float(total_count)),2)
            else:
                auto_rate = 0
        else:##########For total count, anything has warning info on app-builder if not considered
            total_count_sum += testlink_manaul_count
            automated_count_sum += 0
            manual_count_sum += testlink_manaul_count
            manual_count = testlink_manaul_count
            automated_count = 0
            total_count = "Need to confirm app-builder: "+ str(bamboo_count)
            auto_rate = "Need to confirm app-builder"
        if unit_count == 0:
            resultwrite.writerow([ta_name,total_count,manual_count,automated_count,auto_rate])
        else:
            resultwrite.writerow([ta_name,total_count,manual_count,automated_count,auto_rate,unit_count])
    if total_count_sum > 0:
        auto_rate_sum = round((automated_count_sum/float(total_count_sum)),2)
    else:
        auto_rate_sum = 0
    resultwrite.writerow(["Total",total_count_sum, manual_count_sum, automated_count_sum, auto_rate_sum])
    csvfile.close()




if __name__ == "__main__":


    ########Available parameters
    parser = argparse.ArgumentParser(description= 'This python script is used to generate test summary')
    parser.add_argument("--username", "-u", dest="username", help= 'Enter your username for Confluence, if you do not have sourcefile')
    parser.add_argument("--password", "-p", dest="password", help= 'Enter your password for confluence, if you do not have sourcefile')
    parser.add_argument("--sourcefile", "-s", dest="source_filename",help='Enter the source filename, the file contains the list of TA you want to generate summary. If not specified, will use the list on Confluence: TA status overview' )
    parser.add_argument("--outfile", "-o", dest="output_filename", help= 'Enter the output filename, default to test_summary_result.csv')
    args = parser.parse_args()

    # If the output filename is not given, use the default name
    if args.output_filename is None:
        output_filename = default_output_filename
    else:
        output_filename = args.output_filename


    ### If the source filename is not given, get the ta list from Confluence
    if args.source_filename is None:
        ##Check if username/password is given
        if args.username is None or args.password is None:
            print "Please enter your username or password"
            sys.exit(1)
        confluence_username = args.username
        confluence_password = args.password
        print "Trying to get ta list from Confluence: https://confluence.splunk.com/display/SHAN/TA+Status+Overview"
        ta_name_list = gettalist.get_confluence_ta_status_overview(confluence_username,confluence_password)
    else:
        print "Trying to get ta list from source file: ",args.source_filename
        ta_name_list = get_ta_list_from_file(args.source_filename)

    if ta_name_list is None:
        print "Get no ta list, exit the program"
        sys.exit(1)

    print "Trying to get test case count from testlink: https://testlink-prod.sv.splunk.com/testlink-orig"
    testlink_result = testlink.gettestlink(ta_name_list)

    print "Trying to use get test case count from app-builder: https://app-builder.sv.splunk.com"
    bamboo_result = getbamboo(ta_name_list)

    print "Trying to write the result to the file: ", output_filename
    writefile(ta_name_list,testlink_result, bamboo_result, output_filename)


    print bamboo_result

