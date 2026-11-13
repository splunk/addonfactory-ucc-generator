import os

import openapi_client


def test_generated_client_can_manage_an_account():
    splunk_host = os.environ.get("SPL_HOST", "localhost")
    configuration = openapi_client.Configuration(
        host=f"https://{splunk_host}:8089/servicesNS/-/Splunk_TA_UCCExample",
        username="admin",
        password=os.environ["SPLUNK_PASSWORD"],
    )
    configuration.verify_ssl = False

    with openapi_client.ApiClient(configuration) as api_client:
        api = openapi_client.DefaultApi(api_client)
        output_mode = "json"
        account_name = "ucc_openapi_client_test"

        assert not api.splunk_ta_uccexample_account_get(output_mode).entry

        try:
            api.splunk_ta_uccexample_account_post(
                output_mode,
                name=account_name,
                account_multiple_select="aaa",
                account_radio="bbb",
                custom_endpoint="login.example.com",
            )

            response = api.splunk_ta_uccexample_account_get(output_mode)
            assert len(response.entry) == 1
            assert response.entry[0].name == account_name
        finally:
            api.splunk_ta_uccexample_account_name_delete(account_name, output_mode)

        assert not api.splunk_ta_uccexample_account_get(output_mode).entry
