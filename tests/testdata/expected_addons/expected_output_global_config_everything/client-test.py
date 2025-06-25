import openapi_client
from openapi_client.api.default_api import DefaultApi
import urllib.request
import base64
import json
import ssl

host = "https://localhost:8089/servicesNS/-/"
addon_name = "Splunk_TA_UCCExample"
username = "admin"
password = "Chang3d!"
query_param = "output_mode=json"
# configuration = openapi_client.Configuration(
#     host = host,
#     username = username,
#     password = password,
# )

# configuration.verify_ssl = False

def make_request(url: str):
    encoded_credentials = base64.b64encode(f"{username}:{password}".encode("utf-8")).decode("utf-8")
    ssl_context = ssl._create_unverified_context()

    req = urllib.request.Request(url)
    req.add_header("Authorization", f"Basic {encoded_credentials}")
    req.add_header("Accept", "application/json")

    with urllib.request.urlopen(req, context=ssl_context, timeout=60) as response:
        response_data = response.read()
        data = json.loads(response_data.decode('utf-8'))
        return data

def list_all_apps():
    response = make_request(url= f"{host}?{query_param}")
    exp_addon_installed = False
    for app in response["entry"]:
        print(f"App Installed: {app["name"]}")
        exp_addon_installed = True if app["name"] == addon_name else exp_addon_installed
    
    if exp_addon_installed:
        perform_addon_account_crud()

def perform_addon_account_crud():
    response = make_request(url= f"{host}{addon_name}/splunk_ta_uccexample_account?{query_param}")
    print(f"GET response for accounts endpoint: {response}")
    assert not response["entry"]

list_all_apps()
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
