from textwrap import dedent
from splunk_add_on_ucc_framework.generators.conf_files import WebConf


def test_generate_conf_for_conf_only_addon(
    global_config_for_conf_only_TA,
    input_dir,
    output_dir,
):
    web_conf = WebConf(
        global_config_for_conf_only_TA,
        input_dir,
        output_dir,
    )

    output = web_conf.generate()
    assert output is None


def test_web_conf_endpoints(global_config_all_json, input_dir, output_dir):
    ta_name = global_config_all_json.product
    web_conf = WebConf(
        global_config_all_json,
        input_dir,
        output_dir,
    )
    output = web_conf.generate()

    expected_content = dedent(
        """
        [expose:splunk_ta_uccexample_oauth]
        pattern = splunk_ta_uccexample_oauth
        methods = POST, GET

        [expose:splunk_ta_uccexample_oauth_specified]
        pattern = splunk_ta_uccexample_oauth/*
        methods = POST, GET, DELETE
        [expose:splunk_ta_uccexample_account]
        pattern = splunk_ta_uccexample_account
        methods = POST, GET

        [expose:splunk_ta_uccexample_account_specified]
        pattern = splunk_ta_uccexample_account/*
        methods = POST, GET, DELETE
        [expose:splunk_ta_uccexample_settings]
        pattern = splunk_ta_uccexample_settings
        methods = POST, GET

        [expose:splunk_ta_uccexample_settings_specified]
        pattern = splunk_ta_uccexample_settings/*
        methods = POST, GET, DELETE
        [expose:splunk_ta_uccexample_example_input_one]
        pattern = splunk_ta_uccexample_example_input_one
        methods = POST, GET

        [expose:splunk_ta_uccexample_example_input_one_specified]
        pattern = splunk_ta_uccexample_example_input_one/*
        methods = POST, GET, DELETE
        [expose:splunk_ta_uccexample_example_input_two]
        pattern = splunk_ta_uccexample_example_input_two
        methods = POST, GET

        [expose:splunk_ta_uccexample_example_input_two_specified]
        pattern = splunk_ta_uccexample_example_input_two/*
        methods = POST, GET, DELETE

        [expose:data/indexes]
        pattern = data/indexes
        methods = GET
        """
    ).lstrip()

    assert output == [
        {
            "file_name": "web.conf",
            "file_path": f"{output_dir}/{ta_name}/default/web.conf",
            "content": expected_content,
        }
    ]


def test_web_conf_endpoints_with_user_defined_handlers(
    global_config_logging_with_user_defined_handlers, input_dir, output_dir
):
    web_conf = WebConf(
        global_config_logging_with_user_defined_handlers,
        input_dir,
        output_dir,
    )
    output_2 = web_conf.generate()

    expected_content = dedent(
        """
        [expose:splunk_ta_uccexample_settings]
        pattern = splunk_ta_uccexample_settings
        methods = POST, GET

        [expose:splunk_ta_uccexample_settings_specified]
        pattern = splunk_ta_uccexample_settings/*
        methods = POST, GET, DELETE

        [expose:endpoint1]
        pattern = endpoint1
        methods = GET

        [expose:endpoint1_specified]
        pattern = endpoint1/*
        methods = POST, GET, DELETE
        [expose:endpoint2]
        pattern = splunk_ta_uccexample/endpoint2
        methods = DELETE, GET, POST

        """
    ).lstrip()
    assert output_2 is not None
    assert output_2[0]["content"] == expected_content
