import functools
import json
from pathlib import Path

import pytest

from splunk_add_on_ucc_framework import app_manifest as app_manifest_lib
from splunk_add_on_ucc_framework import global_config as global_config_lib
from splunk_add_on_ucc_framework import __file__ as module_init_path
import tests.unit.helpers as helpers
from splunk_add_on_ucc_framework.global_config import OSDependentLibraryConfig


@pytest.fixture
def app_manifest_correct() -> app_manifest_lib.AppManifest:
    content = helpers.get_testdata_file("app.manifest")
    app_manifest = app_manifest_lib.AppManifest(content)
    return app_manifest


@pytest.fixture
def global_config_all_json_content():
    with open(helpers.get_testdata_file_path("valid_config.json")) as fp:
        return json.load(fp)


@pytest.fixture
def global_config_all_json() -> global_config_lib.GlobalConfig:
    global_config_path = helpers.get_testdata_file_path("valid_config.json")
    global_config = global_config_lib.GlobalConfig(global_config_path)
    return global_config


@pytest.fixture
def global_config_all_yaml() -> global_config_lib.GlobalConfig:
    global_config_path = helpers.get_testdata_file_path("valid_config.yaml")
    global_config = global_config_lib.GlobalConfig(global_config_path)
    return global_config


@pytest.fixture
def global_config_only_configuration() -> global_config_lib.GlobalConfig:
    global_config_path = helpers.get_testdata_file_path(
        "valid_config_only_configuration.json"
    )
    global_config = global_config_lib.GlobalConfig(global_config_path)
    return global_config


@pytest.fixture
def global_config_only_logging() -> global_config_lib.GlobalConfig:
    global_config_path = helpers.get_testdata_file_path(
        "valid_config_only_logging.json"
    )
    global_config = global_config_lib.GlobalConfig(global_config_path)
    return global_config


@pytest.fixture
def global_config_multiple_account() -> global_config_lib.GlobalConfig:
    global_config_path = helpers.get_testdata_file_path(
        "valid_config_multiple_account.json"
    )
    global_config = global_config_lib.GlobalConfig(global_config_path)
    return global_config


@pytest.fixture
def global_config_single_authentication() -> global_config_lib.GlobalConfig:
    global_config_path = helpers.get_testdata_file_path(
        "valid_single_authentication_config.json"
    )
    global_config = global_config_lib.GlobalConfig(global_config_path)
    return global_config


@pytest.fixture()
def os_dependent_library_config():
    return lambda name="lib1", python_version="37", target="t", os="os": OSDependentLibraryConfig(
        name=name,
        version="version",
        python_version=python_version,
        platform="platform",
        target=target,
        os=os,
        deps_flag="deps_flag",
    )


@pytest.fixture
def monkeypatch(monkeypatch):
    """
    Extend the default monkeypatch with a new decorator to mock functions.

    Old function is accessible via `_old` attribute

    Example:
        # mock `test_fun` function in `test_module` module

        @monkeypatch.function(test_module)
        def test_fun(arg):
            return test_fun._old(arg + 1)
    """

    def function(module, name=None):
        def wrapper(func, module, name):
            if name is None:
                name = func.__name__

            func._old = getattr(module, name)
            monkeypatch.setattr(module, name, func)

            return func

        return functools.partial(wrapper, module=module, name=name)

    monkeypatch.function = function

    return monkeypatch


@pytest.fixture
def schema_path():
    return Path(module_init_path).parent / "schema" / "schema.json"


@pytest.fixture
def schema_json(schema_path):
    with schema_path.open() as fp:
        return json.load(fp)
