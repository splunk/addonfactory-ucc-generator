import openapi_client
from openapi_client.rest import ApiException
from pprint import pprint

configuration = openapi_client.Configuration(
    host = "https://localhost:8089/servicesNS/-/Splunk_TA_UCCExample",
    username = "admin",
    password = "Chang3d!",
)

configuration.verify_ssl = False

with openapi_client.ApiClient(configuration) as api_client:
    api_instance = openapi_client.DefaultApi(api_client)
    output_mode = 'json'

    # List accounts (should be 0)
    api_response = api_instance.splunk_ta_uccexample_account_get(output_mode)
    assert not api_response.entry

    # Add account some_name
    api_instance.splunk_ta_uccexample_account_post(output_mode, "some_name", account_multiple_select="aaa", account_radio="bbb", custom_endpoint="login.example.com")

    # List accounts (should be 1)
    api_response = api_instance.splunk_ta_uccexample_account_get(output_mode)
    assert len(api_response.entry) == 1
    assert api_response.entry[0].name == "some_name"

    # Delete account
    api_instance.splunk_ta_uccexample_account_name_delete("some_name", output_mode)

    # List accounts (should be 0)
    api_response = api_instance.splunk_ta_uccexample_account_get(output_mode)
    assert not api_response.entry
