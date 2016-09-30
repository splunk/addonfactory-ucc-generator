# This script exists to centralize commands called from npm

pip install artifactory -t pypi_modules
pip install --index-url http://repo.splunk.com/artifactory/api/pypi/pypi-local/simple --pre artifactory_tool --trusted-host repo.splunk.com -t pypi_modules
