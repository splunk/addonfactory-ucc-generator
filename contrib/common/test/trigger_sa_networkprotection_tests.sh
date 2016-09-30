# This script triggers tests on appropriate codeline (passed from command line)

function invoke_plan()
{
curl -X POST --user dzakharov:bamboo -d bamboo.variable.CODELINE=$CODELINE bamboo.variable.BRANCH=$BRANCH http://app-bamboo/rest/api/latest/queue/${1}?os_authType=basic
}

invoke_plan SOLUTIONSSA-SOLNSANETWORKPROTECTIONUNITBIEBER
invoke_plan SOLUTIONSSA-SOLNSANETWORKPROTECTIONUNITBIEBERLR
invoke_plan SOLUTIONSSA-SOLNSANETWORKPROTECTIONUNITCURRENT


invoke_plan SOLUTIONSSA-SOLNSANETWORKPROTECTIONFUNCTIONALBIEBER
invoke_plan SOLUTIONSSA-SOLNSANETWORKPROTECTIONFUNCTIONALBIEBERLR
invoke_plan SOLUTIONSSA-SOLNSANETWORKPROTECTIONFUNCTIONALCURRENT
