# This script triggers tests on appropriate codeline (passed from command line)

function invoke_plan()
{
curl -X POST --user dzakharov:bamboo -d bamboo.variable.CODELINE=$CODELINE bamboo.variable.BRANCH=$BRANCH http://app-bamboo/rest/api/latest/queue/${1}?os_authType=basic
}

invoke_plan SOLUTIONSSA-SOLNSAACCESSPROTECTIONUNITBIEBER
invoke_plan SOLUTIONSSA-SOLNSAACCESSPROTECTIONUNITBIEBERLR
invoke_plan SOLUTIONSSA-SOLNSAACCESSPROTECTIONUNITCURRENT


invoke_plan SOLUTIONSSA-SOLNSAACCESSPROTECTIONFUNCTIONALBIEBER
invoke_plan SOLUTIONSSA-SOLNSAACCESSPROTECTIONFUNCTIONALBIEBERLR
invoke_plan SOLUTIONSSA-SOLNSAACCESSPROTECTIONFUNCTIONALCURRENT
