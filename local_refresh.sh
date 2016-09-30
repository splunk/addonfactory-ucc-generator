#! /usr/bin/env bash

splunk stop
splunk clean eventdata -f
rm -rf /opt/splunk/etc/apps/splunk_ta_crowdstrike
rm /opt/splog/splunk_ta_crowdstrike*.log
rm -rf /opt/ckpt/falcon_host_api
cp -R package /opt/splunk/etc/apps/splunk_ta_crowdstrike
splunk start