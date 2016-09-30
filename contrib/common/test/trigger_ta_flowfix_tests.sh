# This script triggers tests on appropriate codeline (passed from command line)

## NB: 
## TA Bamboo Sec now using script @ //splunk/solutions/TA/common/test/trigger_ta_flowfix_tests.sh
## to accomodate copy of //splunk/solutions/TA-flowfix/... to //splunk/solutions/TA/TA-flowfix/...

function invoke_plan()
{
curl -X POST --user dzakharov:bamboo -d bamboo.variable.CODELINE=$CODELINE http://app-bamboo/rest/api/latest/queue/${1}?os_authType=basic
}

invoke_plan SOLUTIONSES-TAFLOWFIXFUNCTIONALCURRENT
