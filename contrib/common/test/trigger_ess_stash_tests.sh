# This script triggers tests on appropriate codeline (passed from command line)

function invoke_plan()
{
curl -X POST --user bamboo_io:bamboo http://app-tester/rest/api/latest/queue/${1}?os_authType=basic
}

invoke_plan SOLNESS-ESF1-JOB1
invoke_plan SOLNESS-ESF1-ESFUNCFRAMEWORK
invoke_plan SOLNESS-ESF1-ESFUNCREPORTS
invoke_plan SOLNESS-ESF1-ESFUNCSEARCHES
invoke_plan SOLNESS-ESFUNCDIST
invoke_plan SOLNESS-ESFUNCCORSEARCH

invoke_plan SOLNESS-ESSMOKE
invoke_plan SOLNESS-ESUNIT
invoke_plan SOLNESS-ESUPGRUNIT
invoke_plan SOLNESS-ES
