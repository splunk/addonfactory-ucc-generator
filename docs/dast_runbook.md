# DAST SCAN

Dynamic Application Security Testing
([DAST](https://splunk.atlassian.net/wiki/spaces/SEC/pages/1078262957897/Centralized+Vulnerability+Management+on+JIRA#DAST))
using OWASP ZAP involves actively scanning web applications and network services to identify potential
vulnerabilities. OWASP ZAP, an open-source tool, simulates attacks on running applications to discover issues
and explore potential security weaknesses. DAST aims to enhance application security by detecting vulnerabilities
through activities such as sending malicious HTTP requests, headers, and other application elements.

## Prerequisites

- Splunk Nova instance (https://splunkit.io/splunk)

## Steps

- build test app with ucc version under test:

```bash
mkdir -p package/lib 
poetry export --without-hashes -o package/lib/requirements.txt
poetry install
rm -rf output
poetry run ucc-gen build --source tests/testdata/test_addons/package_global_config_everything/package
poetry run slim package -o . output/Splunk_TA_UCCExample/
 ```

- install newly created app on Nova instance (Apps -> Manage Apps -> Install app from file -> select newly created app)
- follow instructions contained in [dast_repo](https://cd.splunkdev.com/prodsec/dast_scan/-/blob/master/README.md?ref_type=heads)
- example MR: https://cd.splunkdev.com/prodsec/dast_scan/-/merge_requests/411
