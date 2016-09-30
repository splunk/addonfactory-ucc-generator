##################################################################################################################################################################################
This script has two main function:
1. Check expansion for eventtype defined in given TA, get eventCount, scanCount, runDuration parameter from job inspect for each eventtype search
   (Attention, before eventtype search, index=* is added to get all the data from the splunk instance, which means, command actually run is index=* eventtype=<your_venttype> )
2. Run search command in given file, get eventCount, scanCount, runDuration parameter from job inspect
For both function, you can specify the number for each command to get the average runDuration
To run this script, you must have local splunk installed
##################################################################################################################################################################################


Availabe parameter:
-h                               # to see the help message
-t   --ta_name                   # you can use this parameter to set the TA you want to check tag expansion issue, example "Splunk_TA_cisco-asa"
-c   --command_file_name         # you can use this paremeter to set the filename, then the script will excute each command in the given file, required if --ta_name is not set
-l   --local_splunk_root_folder  # set your local splunk folder, default value is "/Applications/Splunk"
-mgr --splunk_mgr_url            # the splunk mgr url you want to run spl search on, default value is "https://ta_es_eventtype_performance_server:8089"
-p   --splunk_password           # the web login password of splunk mgr url, default value is "changeme"
-u   --splunk_username           # the web login username of splunk mgr url, default value is "admin"
-e   --excute_times              # if this parameter is set to n, then each search command will be excuted for n times to get the average runDuration, default value is '1'
-0   --output_filename           # you can use this parameter to set the output filename, this file will have eventCount, scanCount, (average) runDuration for each search command. Default value is "es_performance_expansion_test_result.txt"



Below is the way to use this program:
1. If you want to check Cisco ASA's tag expansion issue on "https://test:8089", and for each command, you want to run 5 times to get the average runDuration, you can use following command:
        python performance_expansion_check_runner.py  -t Splunk_TA_cisco-asa -mgr https://test:8089 -p admin -e 5
   You can check the log file "es_performance_test_runner.log" to check the expansion issue, all expansion will be ERROR message

2. If you want to run self-defined searches instead of eventtype in specified TA, put your search command in the file, and use following command:
        python performance_expansion_check_runner.py -c search_command.txt -e 5
   Currently, we do not do expansion check for self-defined searches, only eventCount,scanCount and (average) runDuration will be generated.
