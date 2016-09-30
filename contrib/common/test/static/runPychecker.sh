#! /bin/bash
echo "Running Pychecker..."
export SPLUNK_HOME=/usr/local/bamboo/src/splunk/current/
source /usr/local/bamboo/src/splunk/current/test/setTestEnv
python pychecker.py /usr/local/bamboo/src/splunk/current 
