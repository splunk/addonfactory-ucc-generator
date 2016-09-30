# This script triggers tests on appropriate codeline (passed from command line)

function invoke_plan()
{
curl -X POST --user dzakharov:bamboo -d bamboo.variable.SPLUNKWEB="$SPLUNKWEB" -d bamboo.variable.SPLUNKD="$SPLUNKD" -d bamboo.variable.USERNAME="$USERNAME" -d bamboo.variable.PASSWORD="$PASSWORD" -d bamboo.variable.CODELINE=$CODELINE http://app-bamboo/rest/api/latest/queue/${1}?os_authType=basic
}

# Cloud UI Dashboard Advanced Thread Tests
invoke_plan SOLUTIONSES-CT

# Cloud UI Dashboard Audit Tests
invoke_plan SOLUTIONSES-CTA

# Cloud UI Dashboard IR, Security Posture, Predictive Anaylistcs
invoke_plan SOLUTIONSES-CRSP

# Cloud UI Dashboard Other
invoke_plan SOLUTIONSES-CLD

# Cloud UI Dashboard SecurityDomains, Access, Identity
invoke_plan SOLUTIONSES-CTD

# Cloud UI Dashboard SecurityDomains, EndPoint, Malware, Other, Update
invoke_plan SOLUTIONSES-CLOD

# Cloud UI Dashboard SecurityDomains, Network, Intrusion, Other, Traffic. Vuln, Web
invoke_plan SOLUTIONSES-COUD

# Cloud UI Config
invoke_plan SOLUTIONSES-CE

# Cloud UI Datamodel
invoke_plan SOLUTIONSES-CLOUDD

# Cloud UI DrillAcross
invoke_plan SOLUTIONSES-CDRILL

# Cloud UI EntityInvestigator
invoke_plan SOLUTIONSES-CENT

# Cloud UI Reports
invoke_plan SOLUTIONSES-CREPORT

# Cloud UI Threat Intelligence Tests
invoke_plan SOLUTIONSES-CIT
