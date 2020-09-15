import unittest
import subprocess
import json
import pytest

@pytest.mark.usefixtures("splunk")
@pytest.mark.usefixtures("splunk_setup")
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
                "required": false,
                "defaultValue": "123456789"
            },
            {
                "field": "api_uuid2",
                "label": "API UUID2",
                "type": "text",
                "required": false,
                "defaultValue": "123456789"
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
            },
            {
                "field": "f1",
                "label": "f1",
                "type": "text",
                "required": false,
                "encrypted": true
            },
            {
                "field": "f2",
                "label": "f2",
                "type": "text",
                "required": false,
                "encrypted": true
            },
            {
                "field": "f3",
                "label": "f3",
                "type": "text",
                "required": false,
                "encrypted": true
            },
            {
                "field": "f4",
                "label": "f4",
                "type": "text",
                "required": false
            },
            {
                "field": "f5",
                "label": "f5",
                "type": "text",
                "required": false
            }
        ]        :return:
        """
        self.endpoint = 'https://localhost:8089/servicesNS/nobody/Splunk_TA_UCCExample/splunk_ta_uccexample_account'
        self.conf_endpoint = 'https://localhost:8089/servicesNS/nobody/Splunk_TA_UCCExample/' \
                             'configs/conf-splunk_ta_uccexample_account'
        self.password_endpoint = 'https://localhost:8089/servicesNS/nobody/-/storage/passwords'
        self.test_item_name = '1'
        self.PASSWORD = '******'

    def create_item(self, data, via_conf=False, name=None):
        if via_conf:
            endpoint = self.conf_endpoint
        else:
            endpoint = self.endpoint

        if not name:
            name = self.test_item_name
        create_cmd = ' '.join([
            self.get_prefix('POST'),
            endpoint,
            data
        ])
        output = subprocess.check_output(create_cmd.split(' ')).decode()
        # check if it's created successfully
        self.assertTrue('<title>{name}</title>'.format(name=name) in output)

    def update_item(self, data, via_conf=False, name=None):
        if via_conf:
            endpoint = self.conf_endpoint
        else:
            endpoint = self.endpoint

        if not name:
            name = self.test_item_name
        update_cmd = ' '.join([
            self.get_prefix('POST'),
            endpoint + '/' + name,
            data
        ])
        output = subprocess.check_output(update_cmd.split(' '))
        # check the update is done
        self.assertTrue('<title>{name}</title>'.format(name=name) in output)

    def delete_item(self, name=None):
        if not name:
            name = self.test_item_name
        delete_cmd = ' '.join([
            self.get_prefix('DELETE'),
            self.endpoint + '/' + name,
            '-d output_mode=json'
        ])
        output = subprocess.check_output(delete_cmd.split(' '))
        try:
            response = json.loads(output)
            entry = response['entry']
        except ValueError:
            self.fail('Fail to get the entry')
        if not name:
            self.assertFalse(entry)

    def get_prefix(self, method):
        return 'curl -k -u admin:admin -X {method}'.format(method=method)

    def get_item_content(self, clear_password=False):
        get_cmd = ' '.join([
            self.get_prefix('GET'),
            self.endpoint + '/' + self.test_item_name,
            '-d output_mode=json'
        ])
        if clear_password:
            get_cmd = ' '.join([get_cmd, '-d --cred--=1'])
        response = subprocess.check_output(get_cmd.split(' '))
        try:
            item = json.loads(response)
        except ValueError:
            self.fail('Could not get the item %s' % self.test_item_name)

        # get the item content
        try:
            content = item['entry'][0]['content']
        except KeyError:
            self.fail('Could not get the item content')
        return content

    def get_all_item(self, clear_password=False):
        get_all_cmd = ' '.join([
            self.get_prefix('GET'),
            self.endpoint,
            '-d output_mode=json'
        ])
        if clear_password:
            get_all_cmd = ' '.join([get_all_cmd, '-d --cred--=1'])
        response = subprocess.check_output(get_all_cmd.split(' '))
        try:
            items = json.loads(response)
        except ValueError:
            self.fail('Could not get the item %s' % self.test_item_name)
        return items

    def get_all_passwords(self):
        get_password_cmd = ' '.join([
            self.get_prefix('GET'),
            self.password_endpoint,
            '-d output_mode=json'
        ])
        output = subprocess.check_output(get_password_cmd.split(' '))
        try:
            passwords = json.loads(output)
        except ValueError:
            self.fail('Could not get the passwords')
        return passwords

    def testCreateWithExisting(self):
        """
            Test: Create an item which already exists
        """
        self.create_item(
            data='-d name={name} -d api_uuid=1 -d endpoint=1 -d api_key=1 -d test_optional_password=1'.format(
                name=self.test_item_name
            )
        )

        # create an item with the same name
        create_cmd = ' '.join([
            self.get_prefix('POST'),
            self.endpoint,
            '-d name={name} -d api_uuid=1 -d endpoint=1 -d api_key=1 -d test_optional_password=1'.format(
                name=self.test_item_name
            )
        ])
        output = subprocess.check_output(create_cmd.split(' '))
        # test the error message
        self.assertTrue(
            'REST Error [409]: Conflict -- Name "{name}" is already in use'.format(
                name=self.test_item_name
            ) in output
        )

        self.delete_item()

    def testCreateWithEmptyOptionalField(self):
        """
            Test: Create an item with empty optional field which has defaultValue defined in schema

        """
        # create an item with the empty field value
        # defaultValue is defined with '123456789' in schema
        self.create_item(
            data='-d name={name} -d api_uuid= -d endpoint=1 -d api_key=1'.format(
                name=self.test_item_name
            )
        )

        content = self.get_item_content()
        # test the empty field 'api_uuid' does not exist in content
        self.assertFalse('api_uuid' in content)
        self.delete_item()

    def testCreateWithMultipleEmptyOptionalField(self):
        """
            Test: Create an item with empty optional field which has defaultValue defined in schema

        """
        # create an item with multiple empty field value
        # defaultValue is defined with '123456789' in schema for both 'api_uuid' and 'api_uuid2'
        self.create_item(
            data='-d name={name} -d api_uuid= -d api_uuid2= -d endpoint=1 -d api_key=1'.format(
                name=self.test_item_name
            )
        )

        content = self.get_item_content()
        # test the empty field 'api_uuid' and 'api_uuid2' does not exist in content
        self.assertFalse('api_uuid' in content)
        self.assertFalse('api_uuid2' in content)
        self.delete_item()

    def testCreateWithoutOptionalField(self):
        """
            Test: Create an item without optional field which has defaultValue defined in schema

        """
        # create an item without optional field 'api_uuid'
        # defaultValue is defined with '123456789' in schema
        self.create_item(
            data='-d name={name} -d endpoint=1 -d api_key=1 -d test_optional_password=1'.format(
                name=self.test_item_name
            )
        )

        content = self.get_item_content()
        # test the empty field 'api_uuid' does not exist in content
        self.assertFalse('api_uuid' in content)
        self.delete_item()

    def testCreateWithMagicPassword(self):
        """
            Test: Create an item with '******' as password value

        """
        # create item with '*****' as value
        self.create_item(
            data='-d name={name} -d endpoint=1 -d api_key=****** -d test_optional_password=1'.format(
                name=self.test_item_name
            )
        )

        content = self.get_item_content(clear_password=True)

        # check if the password equals the magic password
        self.assertEqual(content['api_key'], self.PASSWORD)
        self.delete_item()

    def testCreateWithMultipleMagicPassword(self):
        """
            Test: Create an item with '******' as password value

        """
        # create item with '*******' as value
        self.create_item(
            data='-d name={name} -d endpoint=1 -d api_key=****** -d test_optional_password=******'.format(
                name=self.test_item_name
            )
        )

        content = self.get_item_content(clear_password=True)

        # check if the password equals the magic password
        self.assertEqual(content['api_key'], self.PASSWORD)
        self.assertEqual(content['test_optional_password'], self.PASSWORD)
        self.delete_item()

    def testCreateWithEmptyRequiredField(self):
        """
            Test: Create an account with empty required field 'api_key'
        """
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
        self.create_item(
            data='-d name={name} -d api_uuid=1 -d endpoint=1 -d api_key=1 -d test_optional_password='.format(
                name=self.test_item_name
            )
        )

        item_content = self.get_item_content()
        # check the get request response contains only 'api_key=******'
        self.assertEqual(item_content['api_key'], self.PASSWORD)
        # check the get request response does not contain test_optional_password field
        self.assertFalse('test_optional_password' in item_content)

        clear_item_content = self.get_item_content(clear_password=True)
        # check the clear password is stored in passwords.conf
        self.assertEqual(clear_item_content['api_key'], self.test_item_name)
        # check the get request response does not contain test_optional_password field
        self.assertFalse('test_optional_password' in clear_item_content)

        # delete created item
        self.delete_item()

    def testUpdateNoneExistedItem(self):
        """
            Test: Update an item which does exist
        """
        data = '-d api_uuid=1 -d endpoint=1 -d api_key=1 -d test_optional_password=1'
        update_cmd = ' '.join([
            self.get_prefix('POST'),
            self.endpoint + '/' + self.test_item_name,
            data
        ])
        output = subprocess.check_output(update_cmd.split(' '))
        self.assertTrue('REST Error [404]: Not Found -- "{name}" does not exist'.format(
            name=self.test_item_name
        ) in output)

    def testUpdateWithEmptyValueForRequiredField(self):
        """
            Test: Update an item with empty value for required field
        """
        # create a test item
        self.create_item(
            data='-d name={name} -d api_uuid=1 -d endpoint=1 -d api_key=1 -d test_optional_password=1'.format(
                name=self.test_item_name
            )
        )
        update_cmd = ' '.join([
            self.get_prefix('POST'),
            self.endpoint + '/' + self.test_item_name,
            '-d api_uuid=1 -d endpoint=1 -d api_key='
        ])
        output = subprocess.check_output(update_cmd.split(' '))
        self.assertTrue(
            'Required field is missing: api_key' in output
        )
        self.delete_item()

    def testUpdateWithMagicPassword(self):
        """
            Test: Update existing password with '******', the password should not change after update
        """
        # create a test item
        self.create_item(
            data='-d name={name} -d api_uuid=1 -d endpoint=1 -d api_key=1 -d test_optional_password=1'.format(
                name=self.test_item_name
            )
        )
        # update with password = '******'
        self.update_item(data='-d api_key=******')

        clear_item_content = self.get_item_content(clear_password=True)
        # check the clear password is unchanged
        self.assertEqual(clear_item_content['api_key'], '1')

        # delete the created item
        self.delete_item()

    def testUpdateWithOtherPassword(self):
        """
            Test: Update existing password field value '1' with value 'other'.
            The password field should change to 'other'
        """
        # create a test item
        self.create_item(
            data='-d name={name} -d api_uuid=1 -d endpoint=1 -d api_key=1 -d test_optional_password=1'.format(
                name=self.test_item_name
            )
        )

        # update the test item
        self.update_item(data='-d api_key=other')

        clear_item_content = self.get_item_content(clear_password=True)
        # check the clear password is unchanged
        self.assertEqual(clear_item_content['api_key'], 'other')

        # delete the created item
        self.delete_item()

    def testUpdateWithMultipleEmptyFieldValue(self):
        """
            Test: Create item with f1=1 and f2=2, update item with f1='' and f2=''
            The update should empty field in conf as:
                f1 =
                f2 =

            case 5 and case 6
        """
        # create a test item
        self.create_item(
            data='-d name={name} -d api_uuid=1 -d endpoint=1 -d api_key=1 -d f1=1 -d f2=2'.format(
                name=self.test_item_name
            )
        )
        # update with f1='' and f2=''
        self.update_item(
            data='-d endpoint=1 -d api_key=1 -d f1= -d f2='
        )
        content = self.get_item_content()
        self.assertEqual(content['f1'], '')
        self.assertEqual(content['f2'], '')

        # update with f1='1' and f2='2'
        self.update_item(
            data='-d endpoint=1 -d api_key=1 -d f1=1 -d f2=2'
        )
        content = self.get_item_content(clear_password=True)
        self.assertEqual(content['f1'], '1')
        self.assertEqual(content['f2'], '2')

        self.delete_item()

    def testUpdateWithAdditionalFields(self):
        """
            Test: Create item with 'f1=1', update it with 'f1=2, f2=2, f3=3'
            New field values should be added to the item

            case 7: update + add
        """
        # create a test item
        self.create_item(
            data='-d name={name} -d api_uuid=1 -d endpoint=1 -d api_key=1 -d f1=1'.format(
                name=self.test_item_name
            )
        )
        self.update_item(
            data='-d endpoint=1 -d api_key=1 -d f1=1 -d f2=2 -d f3=3'
        )

        content = self.get_item_content(clear_password=True)
        self.assertEqual(content['f1'], '1')
        self.assertEqual(content['f2'], '2')
        self.assertEqual(content['f3'], '3')

        self.delete_item()

    def testUpdateWithOneEmptyFieldValue(self):
        """
            Test: Create an item with 'f1=1, f2=2, f3=3', update it with 'f1=f1, f2=f2, f3='
            field f3 should be empty after update
            case 8: update + remove
        """
        # create a test item
        self.create_item(
            data='-d name={name} -d api_uuid=1 -d endpoint=1 -d api_key=1 -d f1=1 -d f2=2 -d f3=3'.format(
                name=self.test_item_name
            )
        )
        self.update_item(
            data='-d endpoint=1 -d api_key=1 -d f1=f1 -d f2=f2 -d f3='
        )

        content = self.get_item_content(clear_password=True)
        self.assertEqual(content['f1'], 'f1')
        self.assertEqual(content['f2'], 'f2')
        self.assertEqual(content['f3'], '')

        self.delete_item()

    def testUpdateWithPartialFields(self):
        """
            Test: Create an item with 'f1=1, f2=2, f3=3', update it with 'f1=f1, f2='
            The update result should be 'f1=f1, f2=, f3=3'
            case 9: partial update
        """
        # create a test item
        self.create_item(
            data='-d name={name} -d api_uuid=1 -d endpoint=1 -d api_key=1 -d f1=1 -d f2=2 -d f3=3'.format(
                name=self.test_item_name
            )
        )
        self.update_item(
            data='-d endpoint=1 -d api_key=1 -d f1=f1 -d f2='
        )

        content = self.get_item_content(clear_password=True)
        self.assertEqual(content['f1'], 'f1')
        self.assertEqual(content['f2'], '')
        # keep original password if it's not passed
        self.assertEqual(content['f3'], '3')

        self.delete_item()

    def testUpdateWithMixedUpdate(self):
        """
            Test: Create an item with 'f1=1, f2=2, f3=3, f4=4'
            Update it with 'f1=f1, f2=, f3=f3, f5=f5'
            The update result should be 'f1=f1, f2=, f3=f3, f4=4 f5=f5'
            case 10: mixed update
        """
        # create a test item
        self.create_item(
            data='-d name={name} -d api_uuid=1 -d endpoint=1 -d api_key=1 -d f1=1 -d f2=2 -d f3=3 -d f4=4'.format(
                name=self.test_item_name
            )
        )
        self.update_item(
            data='-d endpoint=1 -d api_key=1 -d f1=f1 -d f2= -d f3=f3 -d f5=f5'
        )

        content = self.get_item_content(clear_password=True)
        # changed
        self.assertEqual(content['f1'], 'f1')
        # reset
        self.assertEqual(content['f2'], '')
        # changed
        self.assertEqual(content['f3'], 'f3')
        # unchanged
        self.assertEqual(content['f4'], '4')
        # added
        self.assertEqual(content['f5'], 'f5')

        self.delete_item()

    def testUpdateWithMixedRemove(self):
        """
            Test: Create an item with 'f1=1, f2=2, f3=3, f4=4'
            Update it with 'f1=, f2=, f3=, f5='
            The update result should be 'f1=, f2=, f3=f3, f4=4, f5='
            case 11: mixed remove
        """
        # create a test item
        self.create_item(
            data='-d name={name} -d api_uuid=1 -d endpoint=1 -d api_key=1 -d f1=1 -d f2=2 -d f3=3 -d f4=4'.format(
                name=self.test_item_name
            )
        )
        self.update_item(
            data='-d endpoint=1 -d api_key=1 -d f1= -d f2= -d f3= -d f5='
        )

        content = self.get_item_content(clear_password=True)
        self.assertEqual(content['f1'], '')
        self.assertEqual(content['f2'], '')
        self.assertEqual(content['f3'], '')
        self.assertEqual(content['f4'], '4')
        self.assertFalse('f5' in content)

        self.delete_item()

    def testGetEncrypt(self):
        """
            Test: Create a stanza via conf, the password fields are encrypted when calling get REST call
        """
        # create account via conf
        self.create_item(
            data='-d name={name} -d api_uuid=1 -d endpoint=1 -d api_key=1 -d test_optional_password=1'.format(
                name=self.test_item_name
            ),
            via_conf=True
        )

        content = self.get_item_content()
        self.assertEqual(content['api_key'], self.PASSWORD)
        self.assertEqual(content['test_optional_password'], self.PASSWORD)

        clear_content = self.get_item_content(clear_password=True)
        self.assertEqual(clear_content['api_key'], '1')
        self.assertEqual(clear_content['test_optional_password'], '1')

        self.delete_item()

    def testGetWithOnePasswordChanged(self):
        """
            Test: Change one password field via conf and get via REST call, the change takes effect

        """
        # create account with password encrypted
        self.create_item(
            data='-d name={name} -d api_uuid=1 -d endpoint=1 -d api_key=1 -d test_optional_password=1'.format(
                name=self.test_item_name
            )
        )
        # update password with other value via conf
        self.update_item(data='-d api_key=other -d test_optional_password=other', via_conf=True)

        # get account
        content = self.get_item_content()
        self.assertEqual(content['api_key'], self.PASSWORD)
        self.assertEqual(content['test_optional_password'], self.PASSWORD)

        # get account with clear password option
        clear_content = self.get_item_content(clear_password=True)
        self.assertEqual(clear_content['api_key'], 'other')
        self.assertEqual(clear_content['test_optional_password'], 'other')

        self.delete_item()

    def testGetWithEmptyOptionalPassword(self):
        """
            Test: Change optional password field to empty in conf
                  Get the stanza via REST will get empty string in response
        """
        self.create_item(
            data='-d name={name} -d api_uuid=1 -d endpoint=1 -d api_key=1 -d test_optional_password=1'.format(
                name=self.test_item_name
            )
        )

        # update password with empty password value via conf
        self.update_item(data='-d api_key=1 -d test_optional_password=', via_conf=True)

        # get account
        content = self.get_item_content()
        self.assertEqual(content['api_key'], self.PASSWORD)
        self.assertEqual(content['test_optional_password'], '')

        # get account with clear password option
        clear_content = self.get_item_content(clear_password=True)
        self.assertEqual(clear_content['api_key'], '1')
        self.assertEqual(clear_content['test_optional_password'], '')

        self.delete_item()

    def testAllWithClearPassword(self):
        """
            Test: Create two stanzas via conf with clear passwords api_key=1 and test_optional_password=1
            Get all stanzas via REST handler. The clear passwords should be encrypted in passwords.conf
            The password fields should be '*******' in response

        """
        self.create_item(
            data='-d name={name} -d api_uuid=1 -d endpoint=1 -d api_key=1 -d test_optional_password=1'.format(
                name='stanza1'
            ),
            via_conf=True,
            name='stanza1'
        )
        self.create_item(
            data='-d name={name} -d api_uuid=1 -d endpoint=1 -d api_key=2 -d test_optional_password=2'.format(
                name='stanza2'
            ),
            via_conf=True,
            name='stanza2'
        )
        items = self.get_all_item()
        for item in items['entry']:
            self.assertEqual(item['content']['api_key'], self.PASSWORD)
            self.assertEqual(item['content']['test_optional_password'], self.PASSWORD)

        items_with_clear_password = self.get_all_item(clear_password=True)
        for item in items_with_clear_password['entry']:
            if item['name'] == 'stanza1':
                self.assertEqual(item['content']['api_key'], '1')
                self.assertEqual(item['content']['test_optional_password'], '1')
            elif item['name'] == 'stanza2':
                self.assertEqual(item['content']['api_key'], '2')
                self.assertEqual(item['content']['test_optional_password'], '2')

        self.delete_item(name='stanza1')
        self.delete_item(name='stanza2')

    def testAllWithEmptyField(self):
        """
            Test:
            1.Create two stanzas via conf with clear passwords:
                stanza1: api_key=1
                stanza2: api_key=2 and test_optional_password=2
            2.Update stanza2 with: test_optional_password=
            3.Get all stanzas via REST handler. The clear passwords should be encrypted in passwords.conf
                For stanza1, test_optional_password should not be in response.
                For stanza2, test_optional_password='' in response
        """
        self.create_item(
            data='-d name={name} -d api_uuid=1 -d endpoint=1 -d api_key=1'.format(
                name='stanza1'
            ),
            via_conf=True,
            name='stanza1'
        )
        self.create_item(
            data='-d name={name} -d api_uuid=1 -d endpoint=1 -d api_key=2 -d test_optional_password=2'.format(
                name='stanza2'
            ),
            via_conf=True,
            name='stanza2'
        )

        self.update_item(
            data='-d api_key=2 -d endpoint=1 -d test_optional_password=',
            via_conf=True,
            name='stanza2'
        )
        items = self.get_all_item()
        for item in items['entry']:
            if item['name'] == 'stanza1':
                self.assertEqual(item['content']['api_key'], self.PASSWORD)
                self.assertFalse('test_optional_password' in item['content'])
            if item['name'] == 'stanza2':
                self.assertEqual(item['content']['api_key'], self.PASSWORD)
                self.assertEqual(item['content']['test_optional_password'], '')

        items_with_clear_password = self.get_all_item(clear_password=True)
        for item in items_with_clear_password['entry']:
            if item['name'] == 'stanza1':
                self.assertEqual(item['content']['api_key'], '1')
                self.assertFalse('test_optional_password' in item['content'])
            elif item['name'] == 'stanza2':
                self.assertEqual(item['content']['api_key'], '2')
                self.assertEqual(item['content']['test_optional_password'], '')

        self.delete_item(name='stanza1')
        self.delete_item(name='stanza2')

    def testDeleteNoneExistentItem(self):
        """
            Test: Delete item that does not exist
                  Current behaviour is getting error response
        """
        delete_cmd = ' '.join([
            self.get_prefix('DELETE'),
            self.endpoint + '/' + self.test_item_name,
            '-d output_mode=json'
        ])
        output = subprocess.check_output(delete_cmd.split(' '))
        self.assertTrue('Could not find object id={name}'.format(name=self.test_item_name) in output)

    def testDeleteItem(self):
        """
            Test: Delete an item with password. The encrypted fields in passwords.conf should be deleted too.
        """
        realm = '#Splunk_TA_UCCExample#configs/conf-splunk_ta_uccexample_account'
        passwords = self.get_all_passwords()

        for password in passwords['entry']:
            if realm in password['name']:
                self.fail("Password should not exist in passwords.conf")
        self.create_item(
            data='-d name={name} -d api_uuid=1 -d endpoint=1 -d api_key=1 -d test_optional_password=1'.format(
                name=self.test_item_name
            )
        )
        # get all passwords again
        passwords = self.get_all_passwords()

        for password in passwords['entry']:
            if realm in password['name']:
                break
        else:
            self.fail("Password should exist in passwords.conf")

        self.delete_item()

        # get passwords after deleting the item
        passwords = self.get_all_passwords()

        for password in passwords['entry']:
            if realm in password['name']:
                self.fail("Password should not exist in passwords.conf")


if __name__ == '__main__':
    unittest.main()
