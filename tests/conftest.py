#
# Copyright 2021 Splunk Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

import os

import pytest

pytest_plugins = "pytester"
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
    # LOGGER.info("docker-compose path: %s", docker_compose_path)

    return [docker_compose_path]


@pytest.fixture(scope="session")
def get_session_key(splunk, request):

    uri = f'https://{splunk["host"]}:{splunk["port"]}/services/auth/login'
    _rest_client = SplunkRestClient(
        None, "-", "nobody", "https", splunk["host"], splunk["port"]
    )
    try:
        response = _rest_client.http.post(
            uri,
            username=splunk["username"],
            password=splunk["password"],
            output_mode="json",
        )
    except binding.HTTPError as e:
        raise

    return uri, json.loads(response.body.read())["sessionKey"]
