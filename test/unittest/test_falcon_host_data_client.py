import json
import logging
import os
import sys
import unittest

folder_path = os.path.dirname(os.path.realpath(__file__))
sys.path.append(os.path.join(folder_path, '../../package/bin/splunk_ta_crowdstrike'))
import splunktaucclib.common.log

# let's patch official log
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)
splunktaucclib.common.log.logger = logger

from falcon_host_data_client import FalconHostDataClient


class TestFalconHostClient(unittest.TestCase):
    all_conf_contents = {
        '_version': '1.0.0.0',
        'accounts': {
            'DefaultAccount': {
                'endpoint': "http://127.0.0.1:8080/discover",
                'api_uuid': '9078fc2c-6c1f-4627-b072-b6e02a9b03af',
                'api_key': 'ODQ4MzhlMDQtZjU3Yi00MThmLWE5NzktMTFhODFhNDQ0ODQx',
                'disabled': 'false'
            }
        },
        'global_settings': {
            'crowdstrike_proxy': {
                'proxy_username': '',
                'proxy_enabled': '0',
                'proxy_type': 'http',
                'proxy_password': '',
                'proxy_port': '',
                'proxy_url': ''
            },
            'crowdstrike_loglevel': {
                'loglevel': 'DEBUG'
            }
        },
        '_rest_namespace': 'ta_crowdstrike',
        '_product': 'Splunk_TA_crowdstrike',
        '_protocol_version': '',
        '_encryption_formatter': '',
        'inputs': {
            'MainInput': {
                '_divide_endpoint': 'inputs',
                'index': 'default',
                'disabled': 'false',
                'interval': '300',
                'account': 'DefaultAccount'
            }
        },
        '_rest_prefix': ''
    }

    all_conf_contents_proxy = {
        '_version': '1.0.0.0',
        'accounts': {
            'DefaultAccount': {
                'endpoint': "http://127.0.0.1:8080/discover",
                'api_uuid': '91864710-af4f-44a1-8ea4-eb46d0d4196b',
                'api_key': 'NjFjOWQyYzItOTE5NS00Mjk0LWJiYTgtYzUxNTg4YjZlMTYy',
                'disabled': 'false'
            }
        },
        'global_settings': {
            'crowdstrike_proxy': {
                'proxy_username': 'testuser',
                'proxy_enabled': '1',
                'proxy_type': 'socks5',
                'proxy_password': '123456',
                'proxy_port': '8016',
                'proxy_url': '10.0.0.2'
            },
            'crowdstrike_loglevel': {
                'loglevel': 'INFO'
            }
        },
        '_rest_namespace': 'ta_crowdstrike',
        '_product': 'Splunk_TA_crowdstrike',
        '_protocol_version': '',
        '_encryption_formatter': '',
        'inputs': {
            'MainInput': {
                '_divide_endpoint': 'inputs',
                'index': 'default',
                'disabled': 'false',
                'interval': '300',
                'account': 'DefaultAccount'
            }
        },
        '_rest_prefix': ''
    }

    task_config = {
        '_divide_endpoint': 'inputs',
        'appname': 'splunk_ta_crowdstrike',
        'index': 'default',
        'stanza_name': 'MainInput',
        'use_kv_store': False,
        '_divide_key': ['index'],
        'disabled': 'false',
        'interval': 300,
        'account': 'DefaultAccount'
    }

    def test_client_able_to_consume_falcon_host(self):
        client = FalconHostDataClient(all_conf_contents=self.all_conf_contents,
                                      meta_config=None,
                                      task_config=self.task_config)
        client.initialize()
        events, checkpoint = client.get()
        self.assertEquals(1, len(events))
        self.assertEquals(
            json.loads(events[0].raw_data)['metadata']['offset'], checkpoint.get('offset'))
        first_offset = checkpoint.get('offset')
        events, checkpoint = client.get()
        self.assertEquals(1, len(events))
        self.assertEquals(
            json.loads(events[0].raw_data)['metadata']['offset'], checkpoint.get('offset'))
        self.assertEquals(first_offset+1, checkpoint.get('offset'))

    def test_client_checkpoint_is_reusable(self):
        client = FalconHostDataClient(all_conf_contents=self.all_conf_contents,
                                      meta_config=None,
                                      task_config=self.task_config)
        client.initialize()
        events, checkpoint = client.get()
        self.assertEquals(1, len(events))
        self.assertEquals(
            json.loads(events[0].raw_data)['metadata']['offset'], checkpoint.get('offset'))
        first_offset = checkpoint.get('offset')
        client = FalconHostDataClient(all_conf_contents=self.all_conf_contents,
                                      meta_config=None,
                                      task_config=self.task_config,
                                      checkpoint=checkpoint)
        client.initialize()
        events, checkpoint = client.get()
        self.assertGreater(checkpoint.get('offset'), first_offset)

    def test_client_is_closable(self):
        client = FalconHostDataClient(all_conf_contents=self.all_conf_contents,
                                      meta_config=None,
                                      task_config=self.task_config)
        client.initialize()
        events, checkpoint = client.get()
        self.assertEquals(1, len(events))
        self.assertEquals(
            json.loads(events[0].raw_data)['metadata']['offset'], checkpoint.get('offset'))
        client.stop()
        stopped = False
        try:
            client.get()
        except StopIteration:
            stopped = True
        self.assertTrue(stopped)

    def test_client_should_be_closed_when_exception(self):
        client = FalconHostDataClient(all_conf_contents=self.all_conf_contents,
                                      meta_config=None,
                                      task_config=self.task_config)
        client.initialize()
        events, checkpoint = client.get()
        self.assertEquals(1, len(events))
        self.assertEquals(
            json.loads(events[0].raw_data)['metadata']['offset'], checkpoint.get('offset'))
        client._closer()
        self.assertFalse(client.is_stopped())
        stopped = False
        try:
            client.get()
        except StopIteration:
            stopped = True
        self.assertTrue(stopped and client.is_stopped())

    def test_get_process_identifier(self):
        from falcon_host_data_client import _get_process_identifier
        identifier = _get_process_identifier("test-test")
        self.assertNotEqual(identifier, _get_process_identifier("test-test"))
        self.assertEquals(identifier[:15], _get_process_identifier("test-test")[:15])
        identifier = _get_process_identifier("test-test-test-test-test-test")
        self.assertEquals(32, len(identifier))
        self.assertEquals("test-test-test-test-test-test"[:28], identifier[:28])

    def test_parse_configurations(self):
        client = FalconHostDataClient(all_conf_contents=self.all_conf_contents_proxy,
                                      meta_config=None,
                                      task_config=self.task_config)
        proxies = client._parse_proxies()
        https_cred, http_cred = proxies['http'], proxies['https']
        self.assertEquals(http_cred, https_cred)
        self.assertEquals('socks5://testuser:123456@10.0.0.2:8016', http_cred)

if __name__ == "__main__":
    unittest.main()
