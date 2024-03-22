from splunk_add_on_ucc_framework.commands.rest_builder.global_config_builder_schema import (
    GlobalConfigBuilderSchema,
)


def test_global_config_builder_schema(global_config_all_json):
    global_config_builder_schema = GlobalConfigBuilderSchema(global_config_all_json)

    # TODO: add more tests to check the endpoints.
    assert global_config_builder_schema.product == "Splunk_TA_UCCExample"
    assert global_config_builder_schema.namespace == "splunk_ta_uccexample"
    assert global_config_builder_schema.settings_conf_file_names == {
        "splunk_ta_uccexample_settings"
    }
    assert global_config_builder_schema.configs_conf_file_names == {
        "splunk_ta_uccexample_account"
    }
    assert global_config_builder_schema.oauth_conf_file_names == {
        "splunk_ta_uccexample_oauth"
    }

def test_global_config_builder_schema_custom_rh_config(global_config_all_json):
    global_config_builder_schema = GlobalConfigBuilderSchema(global_config_all_json)

    # asserting the account config details from valid_config.json
    assert global_config_builder_schema._endpoints.get("account")._rest_handler_name == "splunk_ta_uccexample_rh_account"
    assert global_config_builder_schema._endpoints.get("account")._rest_handler_module == "splunk_ta_uccexample_validate_account_rh" 
    assert global_config_builder_schema._endpoints.get("account")._rest_handler_class == "CustomAccountValidator"
