from unittest.mock import patch

import pytest

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


@pytest.mark.parametrize(
    "content,expected_result",
    [
        (
            # Test case: oauth combinations (additional_oauth + oauth_client_credentials)
            [
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
                        "auth_type": ["additional_oauth", "oauth_client_credentials"],
                        "additional_oauth": [
                            {
                                "label": "Username",
                                "field": "username_additional_oauth",
                            },
                            {
                                "label": "Password",
                                "field": "password_additional_oauth",
                                "encrypted": True,
                            },
                            {
                                "label": "Certificate",
                                "field": "certificate_additional_oauth",
                            },
                        ],
                        "oauth_client_credentials": [
                            {
                                "label": "Client Id",
                                "field": "client_id_oauth_credentials",
                            },
                            {
                                "label": "Client Secret",
                                "field": "client_secret_oauth_credentials",
                                "encrypted": True,
                            },
                            {
                                "label": "Token endpoint",
                                "field": "endpoint_token_oauth_credentials",
                            },
                        ],
                        "auth_code_endpoint": "/services/oauth2/authorize",
                        "access_token_endpoint": "/services/oauth2/token",
                        "oauth_timeout": 30,
                        "oauth_state_enabled": False,
                    },
                },
            ],
            [
                {"field": "name", "label": "Name", "required": True, "type": "text"},
                {
                    "field": "username_additional_oauth",
                    "label": "Username",
                },
                {
                    "encrypted": True,
                    "field": "password_additional_oauth",
                    "label": "Password",
                },
                {
                    "field": "certificate_additional_oauth",
                    "label": "Certificate",
                },
                {
                    "field": "client_id_oauth_credentials",
                    "label": "Client Id",
                },
                {
                    "encrypted": True,
                    "field": "client_secret_oauth_credentials",
                    "label": "Client Secret",
                },
                {
                    "field": "endpoint_token_oauth_credentials",
                    "label": "Token endpoint",
                },
                {"encrypted": True, "field": "access_token"},
                {"encrypted": True, "field": "refresh_token"},
                {"field": "instance_url"},
                {"field": "auth_type"},
            ],
        ),
        (  # Test case: oauth combinations (additional_oauth only)
            [
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
                        "auth_type": ["additional_oauth"],
                        "additional_oauth": [
                            {
                                "label": "Username",
                                "field": "username_additional_oauth",
                            },
                            {
                                "label": "Password",
                                "field": "password_additional_oauth",
                                "encrypted": True,
                            },
                            {
                                "label": "Certificate",
                                "field": "certificate_additional_oauth",
                            },
                        ],
                    },
                },
            ],
            [
                {"field": "name", "label": "Name", "required": True, "type": "text"},
                {
                    "field": "username_additional_oauth",
                    "label": "Username",
                },
                {
                    "encrypted": True,
                    "field": "password_additional_oauth",
                    "label": "Password",
                },
                {
                    "field": "certificate_additional_oauth",
                    "label": "Certificate",
                },
            ],
        ),
        (  # Test case: oauth combinations (oauth_client_credentials only)
            [
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
                        "auth_type": ["oauth_client_credentials"],
                        "oauth_client_credentials": [
                            {
                                "label": "Client Id",
                                "field": "client_id_oauth_credentials",
                            },
                            {
                                "label": "Client Secret",
                                "field": "client_secret_oauth_credentials",
                                "encrypted": True,
                            },
                            {
                                "label": "Token endpoint",
                                "field": "endpoint_token_oauth_credentials",
                            },
                        ],
                        "auth_code_endpoint": "/services/oauth2/authorize",
                        "access_token_endpoint": "/services/oauth2/token",
                        "oauth_timeout": 30,
                        "oauth_state_enabled": False,
                    },
                },
            ],
            [
                {"field": "name", "label": "Name", "required": True, "type": "text"},
                {
                    "field": "client_id_oauth_credentials",
                    "label": "Client Id",
                },
                {
                    "encrypted": True,
                    "field": "client_secret_oauth_credentials",
                    "label": "Client Secret",
                },
                {
                    "field": "endpoint_token_oauth_credentials",
                    "label": "Token endpoint",
                },
                {"encrypted": True, "field": "access_token"},
                {"encrypted": True, "field": "refresh_token"},
                {"field": "instance_url"},
            ],
        ),
        (
            # Test case: oauth combinations (basic + additional_oauth + oauth_client_credentials)
            # Additionaly mixed boolean types to verify they are not changed
            [
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
                        "auth_type": [
                            "basic",
                            "additional_oauth",
                            "oauth_client_credentials",
                        ],
                        "additional_oauth": [
                            {
                                "label": "Username",
                                "field": "username_additional_oauth",
                            },
                            {
                                "label": "Password",
                                "field": "password_additional_oauth",
                                "encrypted": True,
                            },
                            {
                                "label": "Certificate",
                                "field": "certificate_additional_oauth",
                            },
                        ],
                        "oauth_client_credentials": [
                            {
                                "label": "Client Id",
                                "field": "client_id_oauth_credentials",
                            },
                            {
                                "label": "Client Secret",
                                "field": "client_secret_oauth_credentials",
                                "encrypted": True,
                            },
                            {
                                "label": "Token endpoint",
                                "field": "endpoint_token_oauth_credentials",
                            },
                        ],
                        "basic": [
                            {
                                "label": "Username",
                                "help": "Enter the username for this account.",
                                "field": "username",
                            },
                            {
                                "label": "Password",
                                "encrypted": "true",
                                "help": "Enter the password for this account.",
                                "field": "password",
                            },
                            {
                                "label": "Security Token",
                                "encrypted": "true",
                                "help": "Enter the security token.",
                                "field": "token",
                            },
                        ],
                        "auth_code_endpoint": "/services/oauth2/authorize",
                        "access_token_endpoint": "/services/oauth2/token",
                        "oauth_timeout": 30,
                        "oauth_state_enabled": False,
                    },
                },
            ],
            [
                {"field": "name", "label": "Name", "required": True, "type": "text"},
                {
                    "label": "Username",
                    "help": "Enter the username for this account.",
                    "field": "username",
                },
                {
                    "label": "Password",
                    "encrypted": "true",
                    "help": "Enter the password for this account.",
                    "field": "password",
                },
                {
                    "label": "Security Token",
                    "encrypted": "true",
                    "help": "Enter the security token.",
                    "field": "token",
                },
                {
                    "field": "username_additional_oauth",
                    "label": "Username",
                },
                {
                    "encrypted": True,
                    "field": "password_additional_oauth",
                    "label": "Password",
                },
                {
                    "field": "certificate_additional_oauth",
                    "label": "Certificate",
                },
                {
                    "field": "client_id_oauth_credentials",
                    "label": "Client Id",
                },
                {
                    "encrypted": True,
                    "field": "client_secret_oauth_credentials",
                    "label": "Client Secret",
                },
                {
                    "field": "endpoint_token_oauth_credentials",
                    "label": "Token endpoint",
                },
                {"encrypted": True, "field": "access_token"},
                {"encrypted": True, "field": "refresh_token"},
                {"field": "instance_url"},
                {"field": "auth_type"},
            ],
        ),
    ],
)
def test_get_oauth_entities_combinations(
    global_config_all_json, content, expected_result
):
    global_config_all_json.configuration[0]["entity"] = content

    global_config_builder_schema = GlobalConfigBuilderSchema(global_config_all_json)
    assert global_config_builder_schema._get_oauth_enitities(content) == expected_result
