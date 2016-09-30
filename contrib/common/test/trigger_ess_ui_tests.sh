# This script triggers tests on appropriate codeline (passed from command line)

function invoke_plan()
{
curl -X POST --user dzakharov:bamboo -d bamboo.variable.SPLUNKWEB="$SPLUNKWEB" -d bamboo.variable.SPLUNKD="$SPLUNKD" -d bamboo.variable.USERNAME="$USERNAME" -d bamboo.variable.PASSWORD="$PASSWORD" -d bamboo.variable.CODELINE=$CODELINE http://app-bamboo/rest/api/latest/queue/${1}?os_authType=basic
}

# UI Dashboard Advanced Thread Tests
invoke_plan SOLUTIONSES-SOLNESUIAUTOPART1

# UI Dashboard Audit Tests
invoke_plan SOLUTIONSES-ET

# UI Dashboard IR, Security Posture, Predictive Anaylistcs
invoke_plan SOLUTIONSES-ESPART3

# UI Dashboard Other
invoke_plan SOLUTIONSES-ESPART4

# UI Dashboard SecurityDomains, Access, Identity
invoke_plan SOLUTIONSES-ESPART5

# UI Dashboard SecurityDomains, EndPoint, Malware, Other, Update
invoke_plan SOLUTIONSES-ESPART6

# UI Dashboard SecurityDomains, Network, Intrusion, Other, Traffic. Vuln, Web
invoke_plan SOLUTIONSES-ESPART7

# UI Config
invoke_plan SOLUTIONSES-ESUIAUTOCURRENTPART3

# UI Datamodel
invoke_plan SOLUTIONSES-ESUIDATAMODELAUTOCURRENT

# UI DrillAcross
invoke_plan SOLUTIONSES-ESUIDRILLACROSS

# UI EntityInvestigator
invoke_plan SOLUTIONSES-ESUIENTITYINVESTIGATORNEXT

# UI Jasmine
invoke_plan SOLUTIONSES-ESUIJASMINE

# UI Reports
invoke_plan SOLUTIONSES-SOLNESUIAUTOP2

