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
