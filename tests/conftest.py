#
# SPDX-FileCopyrightText: 2020 Splunk, Inc. <sales@splunk.com>
# SPDX-License-Identifier: LicenseRef-Splunk-1-2020
#
#
import os
import pytest
pytest_plugins = "pytester"


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
