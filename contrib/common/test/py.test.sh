#!/usr/bin/env bash
# Wrapper to just call py.test using the splunk-boot instance on bamboo agents
$SPLUNK_BOOT/bin/splunk cmd python /home/bamboo/pytest-2.2.4/pytest.py --junitxml=test-result.xml $1
