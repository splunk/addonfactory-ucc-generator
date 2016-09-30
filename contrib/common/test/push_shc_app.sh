sleep 120

/usr/local/bamboo/splunk-install/current/bin/splunk apply shcluster-bundle -target https://sc-essshc-sh3.sv.splunk.com:8089 -auth admin:changeme --answer-yes
sleep 120

exit 0
