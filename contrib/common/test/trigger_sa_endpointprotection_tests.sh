# This script triggers tests on appropriate codeline (passed from command line)

function invoke_plan()
{
curl -X POST --user dzakharov:bamboo -d bamboo.variable.CODELINE=$CODELINE  bamboo.variable.BRANCH=$BRANCH http://app-bamboo/rest/api/latest/queue/${1}?os_authType=basic
}

# invoke_plan SOLUTIONSSA-SOLNSAENDPOINTPROTECTIONUNITBIEBER
# invoke_plan SOLUTIONSSA-SOLNSAENDPOINTPROTECTIONUNITBIEBERLR
# invoke_plan SOLUTIONSSA-SOLNSAENDPOINTPROTECTIONUNITCURRENT

invoke_plan SOLUTIONSSA-SOLNSAENDPOINTPROTECTIONFUNCTIONALBIEBER
invoke_plan SOLUTIONSSA-SOLNSAENDPOINTPROTECTIONFUNCTIONALBIEBERLR
invoke_plan SOLUTIONSSA-SOLNSAENDPOINTPROTECTIONFUNCTIONALCURRENT
