# import unittest
# import subprocess
# import json
# import pytest

# @pytest.mark.usefixtures("splunk")
# @pytest.mark.usefixtures("splunk_setup")
# class TestCreateFunction(unittest.TestCase):
#     def setUp(self):
#         """
#         Account entity definition

#         "entity": [
#             {
#                 "field": "name",
#                 "label": "Name",
#                 "type": "text",
#                 "required": true,
#                 "help": "Enter a unique name for each Crowdstrike falcon host account.",
#                 "validators": [
#                     {
#                         "type": "string",
#                         "minLength": 1,
#                         "maxLength": 50,
#                         "errorMsg": "Length of Name is restricted from 1 to 50."
#                     },
#                     {
#                         "type": "regex",
#                         "pattern": "^\\w+$",
#                         "errorMsg": "Characters of Name should match regex ^\\w+$ ."
#                     }
#                 ]
#             },
#             {
#                 "field": "endpoint",
#                 "label": "Endpoint",
#                 "type": "text",
#                 "required": true,
#                 "defaultValue": "https://firehose.crowdstrike.com/sensors/entities/datafeed/v1",
#                 "options": {
#                     "enabled": false,
#                     "placeholder": "https://firehose.crowdstrike.com/sensors/entities/datafeed/v1"
#                 }
#             },
#             {
#                 "field": "api_uuid",
#                 "label": "API UUID",
#                 "type": "text",
#                 "required": false,
#                 "defaultValue": "123456789"
#             },
#             {
#                 "field": "api_uuid2",
#                 "label": "API UUID2",
#                 "type": "text",
#                 "required": false,
#                 "defaultValue": "123456789"
#             },
#             {
#                 "field": "test_optional_password",
#                 "label": "test_optional_password",
#                 "type": "text",
#                 "required": false,
#                 "encrypted": true
#             }
#         ]
#         """
#         self.endpoint = "https://localhost:8089/servicesNS/nobody/Splunk_TA_UCCExample/splunk_ta_uccexample_account"
#         self.conf_endpoint = (
#             "https://localhost:8089/servicesNS/nobody/Splunk_TA_UCCExample/"
#             "configs/conf-splunk_ta_uccexample_account"
#         )
#         self.password_endpoint = (
#             "https://localhost:8089/servicesNS/nobody/-/storage/passwords"
#         )
#         self.test_item_name = "1"
#         self.PASSWORD = "******"

#     def create_item(self, data, via_conf=False, name=None):
#         if via_conf:
#             endpoint = self.conf_endpoint
#         else:
#             endpoint = self.endpoint

#         if not name:
#             name = self.test_item_name
#         create_cmd = " ".join([self.get_prefix("POST"), endpoint, data])
#         output = subprocess.check_output(create_cmd.split(" "))
#         # check if it's created successfully
#         self.assertTrue("<title>{name}</title>".format(name=name) in str(output))

#     def update_item(self, data, via_conf=False, name=None):
#         if via_conf:
#             endpoint = self.conf_endpoint
#         else:
#             endpoint = self.endpoint

#         if not name:
#             name = self.test_item_name
#         update_cmd = " ".join([self.get_prefix("POST"), endpoint + "/" + name, data])
#         output = subprocess.check_output(update_cmd.split(" "))
#         # check the update is done
#         self.assertTrue("<title>{name}</title>".format(name=name) in output)

#     def delete_item(self, name=None):
#         if not name:
#             name = self.test_item_name
#         delete_cmd = " ".join(
#             [
#                 self.get_prefix("DELETE"),
#                 self.endpoint + "/" + name,
#                 "-d output_mode=json",
#             ]
#         )
#         output = subprocess.check_output(delete_cmd.split(" "))
#         try:
#             response = json.loads(output)
#             entry = response["entry"]
#         except ValueError:
#             self.fail("Fail to get the entry")
#         if not name:
#             self.assertFalse(entry)

#     def get_prefix(self, method):
#         return "curl -k -u admin:admin -X {method}".format(method=method)

#     def get_item_content(self, clear_password=False):
#         get_cmd = " ".join(
#             [
#                 self.get_prefix("GET"),
#                 self.endpoint + "/" + self.test_item_name,
#                 "-d output_mode=json",
#             ]
#         )
#         if clear_password:
#             get_cmd = " ".join([get_cmd, "-d --cred--=1"])
#         response = subprocess.check_output(get_cmd.split(" "))
#         try:
#             item = json.loads(response)
#         except ValueError:
#             self.fail("Could not get the item %s" % self.test_item_name)

#         # get the item content
#         try:
#             content = item["entry"][0]["content"]
#         except KeyError:
#             self.fail("Could not get the item content")
#         return content

#     def testUpdateWithStars(self):
#         self.create_item(
#             data="-d name={name} -d endpoint=1 -d api_key=1 -d test_optional_password=1".format(
#                 name=self.test_item_name
#             )
#         )
#         # update with empty password
#         self.update_item(
#             data="-d endpoint=1 -d endpoint=1 -d api_key=1 -d test_optional_password="
#         )
#         content = self.get_item_content(clear_password=True)
#         self.assertEqual(content["test_optional_password"], "")
#         # update with magic password '******'
#         self.update_item(
#             data="-d endpoint=1 -d endpoint=1 -d api_key=1 -d test_optional_password=*******"
#         )
#         content = self.get_item_content(clear_password=True)
#         self.assertEqual(content["test_optional_password"], "*******")
#         self.delete_item()


# if __name__ == "__main__":
#     unittest.main()
