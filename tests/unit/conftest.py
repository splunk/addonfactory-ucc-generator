import pytest

from splunk_add_on_ucc_framework import global_config as global_config_lib
import tests.unit.helpers as helpers


@pytest.fixture
def global_config_all_json() -> global_config_lib.GlobalConfig:
    global_config_path = helpers.get_testdata_file_path("valid_config.json")
    global_config = global_config_lib.GlobalConfig()
    global_config.parse(global_config_path, False)
    return global_config


@pytest.fixture
def global_config_all_yaml() -> global_config_lib.GlobalConfig:
    global_config_path = helpers.get_testdata_file_path("valid_config.yaml")
    global_config = global_config_lib.GlobalConfig()
    global_config.parse(global_config_path, True)
    return global_config


@pytest.fixture
def global_config_only_configuration() -> global_config_lib.GlobalConfig:
    global_config_path = helpers.get_testdata_file_path(
        "valid_config_only_configuration.json"
    )
    global_config = global_config_lib.GlobalConfig()
    global_config.parse(global_config_path, False)
    return global_config


@pytest.fixture
def global_config_only_logging() -> global_config_lib.GlobalConfig:
    global_config_path = helpers.get_testdata_file_path(
        "valid_config_only_logging.json"
    )
    global_config = global_config_lib.GlobalConfig()
    global_config.parse(global_config_path, False)
    return global_config
