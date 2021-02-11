# SPDX-FileCopyrightText: 2020 2020
# SPDX-FileCopyrightText: 2020 Splunk, Inc. <sales@splunk.com>
#
# SPDX-License-Identifier: Apache-2.0
# SPDX-License-Identifier: Apache-2.0

import os
import pytest
pytest_plugins = "pytester"
import urllib.parse
import json
from solnlib.splunk_rest_client import SplunkRestClient
from splunklib import binding

def pytest_configure(config):
    config.addinivalue_line("markers", "external: Test search time only")
    config.addinivalue_line("markers", "docker: Test search time only")



@pytest.fixture(scope="session")
def docker_compose_files(request):
    """
    Get an absolute path to the  `docker-compose.yml` file. Override this
    fixture in your tests if you need a custom location.
    Returns:
        string: the path of the `docker-compose.yml` file
    """
    docker_compose_path = os.path.join(
        str(request.config.invocation_dir), "docker-compose.yml"
    )
    #LOGGER.info("docker-compose path: %s", docker_compose_path)

    return [docker_compose_path]

@pytest.fixture(scope="session")
def get_session_key(splunk, request):
    
    
    uri = f'https://{splunk["host"]}:{splunk["port"]}/services/auth/login'
    _rest_client = SplunkRestClient(
        None, '-', 'nobody', "https", splunk["host"], splunk["port"])
    try:
        response = _rest_client.http.post(
            uri, username=splunk["username"], password=splunk["password"],output_mode='json')
    except binding.HTTPError as e:
        raise

    return uri, json.loads(response.body.read())['sessionKey']