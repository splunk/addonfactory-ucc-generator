# This script triggers tests for continuously built vmw installations

function invoke_plan()
{
curl -X POST --user tfletcher:bamboo http://app-bamboo/rest/api/latest/queue/${1}?os_authType=basic
}

invoke_plan SOLN-VMWSMOKECONT

exit 0
