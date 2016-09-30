# This script triggers tests on appropriate codeline (passed from command line)

function invoke_plan()
{
curl -X POST --user dzakharov:bamboo -d bamboo.variable.CODELINE=$CODELINE http://app-bamboo/rest/api/latest/queue/${1}?os_authType=basic
}

invoke_plan SOLNNIX-SOLNNIXFUNCTIONALACELR
invoke_plan SOLNNIX-TANIXFUNCTIONALSOLARIS1064
invoke_plan SOLNNIX-TANIXFUNCTIONALSOLARIS1164
invoke_plan SOLNNIX-TANIXFUNCTIONALOSX107
invoke_plan SOLNNIX-TANIXFUNCTIONALOSX108
invoke_plan SOLNNIX-TANIXFUNCTIONALLINUX2632
