import json

from splunk_add_on_ucc_framework.commands.openapi_generator import ucc_to_oas

from tests.unit.helpers import get_testdata_file


def test_transform_config_all(global_config_all_json, app_manifest_correct):
    openapi_object = ucc_to_oas.transform(global_config_all_json, app_manifest_correct)

    expected_open_api_json = get_testdata_file("openapi.json.valid_config.generated")

    assert json.loads(expected_open_api_json) == openapi_object.json


def test_transform_no_configuration(
    global_config_no_configuration, app_manifest_correct
):
    openapi_object = ucc_to_oas.transform(
        global_config_no_configuration, app_manifest_correct
    )

    print("\n\n api object", openapi_object)

    expected_open_api_json = get_testdata_file("openapi.json.no_config.generated")
    assert json.loads(expected_open_api_json) == openapi_object.json


def test_transform_multiple_account(
    global_config_multiple_account, app_manifest_correct
):
    global_config_multiple_account.expand()
    openapi_object = ucc_to_oas.transform(
        global_config_multiple_account, app_manifest_correct
    )

    expected_open_api_json = get_testdata_file(
        "openapi.json.multiple_account.generated"
    )
    assert json.loads(expected_open_api_json) == openapi_object.json


def test_transform_one_auth_type(
    global_config_single_authentication, app_manifest_correct
):
    global_config_single_authentication.expand()
    openapi_object = ucc_to_oas.transform(
        global_config_single_authentication, app_manifest_correct
    )

    expected_open_api_json = get_testdata_file(
        "openapi.json.single_authentication.generated"
    )
    assert json.loads(expected_open_api_json) == openapi_object.json
