import unittest
import subprocess
import json


class TestCreateFunction(unittest.TestCase):
    def setUp(self):
        """
        Account entity definition

        "entity": [
            {
                "field": "name",
                "label": "Name",
                "type": "text",
                "required": true,
                "help": "Enter a unique name for each Crowdstrike falcon host account.",
                "validators": [
                    {
                        "type": "string",
                        "minLength": 1,
                        "maxLength": 50,
                        "errorMsg": "Length of Name is restricted from 1 to 50."
                    },
                    {
                        "type": "regex",
                        "pattern": "^\\w+$",
                        "errorMsg": "Characters of Name should match regex ^\\w+$ ."
                    }
                ]
            },
            {
                "field": "endpoint",
                "label": "Endpoint",
                "type": "text",
                "required": true,
                "defaultValue": "https://firehose.crowdstrike.com/sensors/entities/datafeed/v1",
                "options": {
                    "enabled": false,
                    "placeholder": "https://firehose.crowdstrike.com/sensors/entities/datafeed/v1"
                }
            },
            {
                "field": "api_uuid",
                "label": "API UUID",
                "type": "text",
                "required": true,
                "validators": [
                    {
                        "type": "regex",
                        "pattern": "\\w{1,50}"
                    }
                ]
            },
            {
                "field": "api_key",
                "label": "API Key",
                "type": "text",
                "required": true,
                "encrypted": true
            },
            {
                "field": "test_optional_password",
                "label": "test_optional_password",
                "type": "text",
                "required": false,
                "encrypted": true
            }
        ]
        :return:
        """
        self.endpoint = 'https://localhost:8089/servicesNS/nobody/Splunk_TA_crowdstrike/splunk_ta_crowdstrike_account'
        self.test_item_name = '1'
        self.PASSWORD = '********'

    def create_item(self):
        create_cmd = ' '.join([
            self.get_prefix('POST'),
            self.endpoint,
            '-d name={name} -d api_uuid=1 -d endpoint=1 -d api_key=1'.format(
                name=self.test_item_name
            )
        ])
        output = subprocess.check_output(create_cmd.split(' '))
        # check if it's created successfully
        self.assertTrue('<title>{name}</title>'.format(name=self.test_item_name) in output)

    def delete_item(self):
        delete_cmd = ' '.join([
            self.get_prefix('DELETE'),
            self.endpoint + '/' + self.test_item_name,
            '-d output_mode=json'
        ])
        output = subprocess.check_output(delete_cmd.split(' '))
        try:
            response = json.loads(output)
            entry = response['entry']
        except ValueError:
            self.fail('Fail to get the entry')

        self.assertFalse(entry)

    def get_prefix(self, method):
        return 'curl -k -u admin:admin -X {method}'.format(method=method)

    def get_item_content(self, name, clear_password=False):
        get_cmd = ' '.join([
            self.get_prefix('GET'),
            self.endpoint + '/' + name,
            '-d output_mode=json'
        ])
        if clear_password:
            get_cmd = ' '.join([get_cmd, '-d --cred--=1'])
        response = subprocess.check_output(get_cmd.split(' '))
        try:
            item = json.loads(response)
        except ValueError:
            self.fail('Could not get the item %s' % name)

        # get the item content
        try:
            content = item['entry'][0]['content']
        except KeyError:
            self.fail('Could not get the item content')
        return content

    def testCreateWithEmptyRequiredField(self):
        # create an account with empty required field 'api_key'
        create_cmd = ' '.join([
            self.get_prefix('POST'),
            self.endpoint,
            '-d name={name} -d api_uuid=1 -d endpoint=1 -d api_key='.format(
                name=self.test_item_name
            )
        ])
        output = subprocess.check_output(create_cmd.split(' '))
        self.assertTrue('Required field is missing: api_key' in output)

    def testCreateWithNoneEmptyRequiredField(self):
        # create an account with:
        # 1.none empty required field 'api_key'
        # 2.no field 'test_optional_password'
        create_cmd = ' '.join([
            self.get_prefix('POST'),
            self.endpoint,
            '-d name={name} -d api_uuid=1 -d endpoint=1 -d api_key=1 -d test_optional_password='.format(
                name=self.test_item_name
            )
        ])
        output = subprocess.check_output(create_cmd.split(' '))
        # check if it's created successfully
        self.assertTrue('<title>{name}</title>'.format(name=self.test_item_name) in output)

        item_content = self.get_item_content(self.test_item_name)
        # check the get request response contains only 'api_key=********'
        self.assertEqual(item_content['api_key'], self.PASSWORD)
        # check the get request response does not contain test_optional_password field
        self.assertFalse('test_optional_password' in item_content)

        clear_item_content = self.get_item_content(self.test_item_name, clear_password=True)
        # check the clear password is stored in passwords.conf
        self.assertEqual(clear_item_content['api_key'], self.test_item_name)
        # check the get request response does not contain test_optional_password field
        self.assertFalse('test_optional_password' in clear_item_content)

        # delete created item
        self.delete_item()

    def testUpdateWithMagicPassword(self):
        # create a test item
        self.create_item()

        # update with password = '********'
        update_cmd = ' '.join([
            self.get_prefix('POST'),
            self.endpoint + '/' + self.test_item_name,
            '-d api_key=********'
        ])
        output = subprocess.check_output(update_cmd.split(' '))
        # check the update is done
        self.assertTrue('<title>{name}</title>'.format(name=self.test_item_name) in output)

        clear_item_content = self.get_item_content(self.test_item_name, clear_password=True)
        # check the clear password is unchanged
        self.assertEqual(clear_item_content['api_key'], self.test_item_name)

        # delete the created item
        self.delete_item()

    def testUpdateWithOtherPassword(self):
        # create a test item
        self.create_item()

        # update the test item
        update_cmd = ' '.join([
            self.get_prefix('POST'),
            self.endpoint + '/' + self.test_item_name,
            '-d api_key=other'
        ])
        output = subprocess.check_output(update_cmd.split(' '))
        # check the update is done
        self.assertTrue('<title>{name}</title>'.format(name=self.test_item_name) in output)

        clear_item_content = self.get_item_content(self.test_item_name, clear_password=True)
        # check the clear password is unchanged
        self.assertEqual(clear_item_content['api_key'], 'other')

        # delete the created item
        self.delete_item()

if __name__ == '__main__':
    unittest.main()
