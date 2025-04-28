from typing import List, Dict, Any
from unittest.mock import patch

from splunk_add_on_ucc_framework.commands.rest_builder.global_config_builder_schema import (
    GlobalConfigBuilderSchema,
)
from splunk_add_on_ucc_framework.commands.rest_builder.endpoint.base import (
    RestEndpointBuilder,
)


def test_global_config_builder_schema(global_config_all_json):
    global_config_builder_schema = GlobalConfigBuilderSchema(global_config_all_json)

    # TODO: add more tests to check the endpoints.
    assert global_config_builder_schema.product == "Splunk_TA_UCCExample"
    assert global_config_builder_schema.namespace == "splunk_ta_uccexample"
    assert global_config_builder_schema.settings_conf_file_names == [
        "splunk_ta_uccexample_settings"
    ]
    assert global_config_builder_schema.configs_conf_file_names == [
        "splunk_ta_uccexample_account"
    ]
    assert global_config_builder_schema.oauth_conf_file_names == [
        "splunk_ta_uccexample_oauth"
    ]


def test_global_config_builder_schema_custom_rh_config(global_config_all_json):
    global_config_builder_schema = GlobalConfigBuilderSchema(global_config_all_json)

    # asserting the account config details from valid_config.json
    assert (
        global_config_builder_schema._endpoints.get(
            "account", RestEndpointBuilder("", "")
        ).rh_name
        == "splunk_ta_uccexample_rh_account"
    )
    assert (
        global_config_builder_schema._endpoints.get(
            "account", RestEndpointBuilder("", "")
        ).rh_module
        == "splunk_ta_uccexample_validate_account_rh"
    )
    assert (
        global_config_builder_schema._endpoints.get(
            "account", RestEndpointBuilder("", "")
        ).rh_class
        == "CustomAccountValidator"
    )


@patch(
    "splunk_add_on_ucc_framework.commands.rest_builder.global_config_builder_schema.OAuthModelEndpointBuilder",
    autospec=True,
)
def test__builder_configs_for_oauth(mock_oauth_model, global_config_all_json):
    GlobalConfigBuilderSchema(global_config_all_json)

    mock_oauth_model.assert_called_once_with(
        app_name="Splunk_TA_UCCExample",
        log_level_field="loglevel",
        log_stanza="logging",
        name="oauth",
        namespace="splunk_ta_uccexample",
    )


def test_get_oauth_entities(global_config_all_json):
    content: List[Dict[str, Any]] = [
        {
            "type": "text",
            "label": "Name",
            "field": "name",
            "required": True,
        },
        {
            "type": "oauth",
            "field": "oauth",
            "label": "Not used",
            "options": {
                "auth_type": ["basic", "oauth", "oauth_client_credentials"],
                "basic": [
                    {
                        "oauth_field": "username",
                        "label": "Username",
                        "field": "username",
                    },
                    {
                        "oauth_field": "password",
                        "label": "Password",
                        "encrypted": True,
                        "field": "password",
                    },
                    {
                        "oauth_field": "security_token",
                        "label": "Security Token",
                        "encrypted": True,
                        "field": "token",
                    },
                    {
                        "oauth_field": "some_text",
                        "label": "Disabled on edit for oauth",
                        "field": "basic_oauth_text",
                        "required": False,
                    },
                ],
                "oauth_client_credentials": [
                    {
                        "oauth_field": "client_id_oauth_credentials",
                        "label": "Client Id",
                        "field": "client_id_oauth_credentials",
                    },
                    {
                        "oauth_field": "client_secret_oauth_credentials",
                        "label": "Client Secret",
                        "field": "client_secret_oauth_credentials",
                        "encrypted": True,
                    },
                    {
                        "oauth_field": "endpoint_token_oauth_credentials",
                        "label": "Token endpoint",
                        "field": "endpoint_token_oauth_credentials",
                    },
                ],
                "oauth": [
                    {
                        "oauth_field": "client_id",
                        "label": "Client Id",
                        "field": "client_id",
                    },
                    {
                        "oauth_field": "client_secret",
                        "label": "Client Secret",
                        "field": "client_secret",
                        "encrypted": True,
                    },
                    {
                        "oauth_field": "redirect_url",
                        "label": "Redirect url",
                        "field": "redirect_url",
                    },
                    {
                        "oauth_field": "endpoint_token",
                        "label": "Token endpoint",
                        "field": "endpoint_token",
                    },
                    {
                        "oauth_field": "endpoint_authorize",
                        "label": "Authorize endpoint",
                        "field": "endpoint_authorize",
                    },
                    {
                        "oauth_field": "oauth_some_text",
                        "label": "Disabled on edit for oauth",
                        "field": "oauth_oauth_text",
                        "required": False,
                        "options": {"disableonEdit": True, "enable": False},
                    },
                ],
                "auth_code_endpoint": "/services/oauth2/authorize",
                "access_token_endpoint": "/services/oauth2/token",
                "oauth_timeout": 30,
                "oauth_state_enabled": False,
            },
        },
    ]

    global_config_builder_schema = GlobalConfigBuilderSchema(global_config_all_json)
    assert global_config_builder_schema._get_oauth_enitities(content) == [
        {"field": "name", "label": "Name", "required": True, "type": "text"},
        {"field": "username", "label": "Username", "oauth_field": "username"},
        {
            "encrypted": True,
            "field": "password",
            "label": "Password",
            "oauth_field": "password",
        },
        {
            "encrypted": True,
            "field": "token",
            "label": "Security Token",
            "oauth_field": "security_token",
        },
        {
            "field": "basic_oauth_text",
            "label": "Disabled on edit for oauth",
            "oauth_field": "some_text",
            "required": False,
        },
        {"field": "client_id", "label": "Client Id", "oauth_field": "client_id"},
        {
            "encrypted": True,
            "field": "client_secret",
            "label": "Client Secret",
            "oauth_field": "client_secret",
        },
        {
            "field": "redirect_url",
            "label": "Redirect url",
            "oauth_field": "redirect_url",
        },
        {
            "field": "endpoint_token",
            "label": "Token endpoint",
            "oauth_field": "endpoint_token",
        },
        {
            "field": "endpoint_authorize",
            "label": "Authorize endpoint",
            "oauth_field": "endpoint_authorize",
        },
        {
            "field": "oauth_oauth_text",
            "label": "Disabled on edit for oauth",
            "oauth_field": "oauth_some_text",
            "options": {"disableonEdit": True, "enable": False},
            "required": False,
        },
        {
            "field": "client_id_oauth_credentials",
            "label": "Client Id",
            "oauth_field": "client_id_oauth_credentials",
        },
        {
            "encrypted": True,
            "field": "client_secret_oauth_credentials",
            "label": "Client Secret",
            "oauth_field": "client_secret_oauth_credentials",
        },
        {
            "field": "endpoint_token_oauth_credentials",
            "label": "Token endpoint",
            "oauth_field": "endpoint_token_oauth_credentials",
        },
        {"encrypted": True, "field": "access_token"},
        {"encrypted": True, "field": "refresh_token"},
        {"field": "instance_url"},
        {"field": "auth_type"},
    ]
