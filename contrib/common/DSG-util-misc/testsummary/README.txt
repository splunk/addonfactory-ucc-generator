###############################################################################################
This program is used to get the testcase count from app-builder and testlink automatically.
For app-builder, this program choose the latest result of CurrGA plan.


Availabe parameter:
-h                     # to see the help message
-o  --outfile          # you can use this parameter to set the filename for your output result. Default to test_summary_result.csv
-s  --sourcefile       # you can use this parameter to set a ta list that you want to collect, just use the repository name on stash for the TA
                       # the example sourcefile: soucefile.csv.example
                       # if you do not set this parameter, TA will collect ta name list from https://confluence.splunk.com/display/SHAN/TA+Status+Overview,
                       this will require to enter username and password for confluence login
-u  --username         # the username for confluence, required when -s is not set
-p  --password         # the password for confluence, required when -s is not set


Below is the way to use this program:
1. If you want to check some special TA's testcase count, put the ta list in your source file, and use the command:
    python testsummary.py  -s your_sourcefile.csv -o your_result.csv

2. If you want to check all the TA's testcase count, you can use the command:
    python testsummary.py -u your_username -p your_password