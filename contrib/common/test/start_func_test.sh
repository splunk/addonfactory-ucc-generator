# !/usr/bin/env bash
#Starts the functional testing.

START=$(date +%s)

#Make sure this path is set.
if [ "$SOLN_ROOT" == "" ]; then
echo "WARN: the path SOLN_ROOT is empty, the test will not run properly without the path."
fi

clean=true #cleans irrelevant files by default.
if [ "$2" == "-v" ] || [ "$2" == "-verbose" ]; then
    clean=false
    echo "Verbose Mode"
fi

if [ "$1" == "access" ]; then
    echo "targeting access"
    target="test_access_center_report.py"
elif [ "$1" == "endpoint" ]; then
    echo "targeting Endpoint"
    target="test_endpoint_center_report.py"
elif [ "$1" == "identity" ]; then
    echo "targeting Identity"
    target="test_identity_center_report.py"
elif [ "$1" == "network" ]; then
    echo "targeting Network"
    target="test_network_center_report.py"
else
    echo "usage: access, endpoint, identity, network [-v | -verbose]"
    exit 1
fi

#actually starts the test here.
/Applications/splunk/bin/splunk cmd python /Applications/py-1.2.1/bin/py.test $SOLN_ROOT/ess/mainline/test/functional/$target -k test_main

#appends the results for quick views.

cat ess-test.log
cat test-result.xml

END=$(date +%s)
DIFF=$(($END - $START))
echo "========================================================="
echo "The test took $DIFF seconds"
echo "========================================================="

#Actually removes irrelevant files
if $clean; then
	echo "Removing extra logs, note that some of them might not exist"
	rm py-test-triage.log
	rm rest-test.log
	rm selenium-test.log
	rm report.html
	rm SSHRPC.debug_log
fi
