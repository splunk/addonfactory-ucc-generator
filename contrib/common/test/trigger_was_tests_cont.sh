# This script triggers tests for continuously built was installations

function invoke_plan()
{
curl -X POST --user ilin:bamboo http://app-bamboo/rest/api/latest/queue/${1}?os_authType=basic
}

invoke_plan SOLUTIONSWAS-WASSMOKECONT

exit 0
