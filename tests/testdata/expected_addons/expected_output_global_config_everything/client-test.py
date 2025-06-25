import openapi_client
from openapi_client.api.default_api import DefaultApi
import urllib.request
import base64
import json
import ssl


# configuration = openapi_client.Configuration(
#     host = "https://localhost:8089/servicesNS/-/Splunk_TA_UCCExample",
#     username = "admin",
#     password = "Chang3d!",
# )

# configuration.verify_ssl = False


# Replace with your actual values
url = "https://localhost:8089/servicesNS/-/Splunk_TA_UCCExample/splunk_ta_uccexample_account"

credentials = "admin:Chang3d!"
encoded_credentials = base64.b64encode(credentials.encode("utf-8")).decode("utf-8")
ssl_context = ssl._create_unverified_context()

# Create request with Authorization header
req = urllib.request.Request(url)
req.add_header("Authorization", f"Basic {encoded_credentials}")
req.add_header("Accept", "application/json")

with urllib.request.urlopen(req, context=ssl_context, timeout=60) as response:
    response_data = response.read()
    data = json.loads(response_data.decode('utf-8'))
    print(data)
    assert not data["entry"]

# with openapi_client.ApiClient(configuration) as api_client:
#     api_instance = DefaultApi(api_client)

#     output_mode = 'json'

#     # List accounts (should be 0)
#     api_response = api_instance.splunk_ta_uccexample_account_get(output_mode)
#     assert not api_response.entry

#     # Add account some_name
#     api_instance.splunk_ta_uccexample_account_post(output_mode, name = "some_name", account_multiple_select="aaa", account_radio="bbb", custom_endpoint="login.example.com")

#     # List accounts (should be 1)
#     api_response = api_instance.splunk_ta_uccexample_account_get(output_mode)
#     assert len(api_response.entry) == 1
#     assert api_response.entry[0].name == "some_name"

#     # Delete account
#     api_instance.splunk_ta_uccexample_account_name_delete("some_name", output_mode)

#     # List accounts (should be 0)
#     api_response = api_instance.splunk_ta_uccexample_account_get(output_mode)
#     assert not api_response.entry
