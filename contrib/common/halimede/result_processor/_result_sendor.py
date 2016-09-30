import urllib

import httplib2
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


class SplunkResultServer:
    def __init__(self, host, hec_token, port=None, x_splunk_request_channel=None):
        self.host = host
        if port is None:
            self.port = '8088'
        else:
            self.port = port
        self.hec_token = hec_token
        if x_splunk_request_channel is None:
            self.x_splunk_request_channel = '18654C68-B28B-4450-9CF0-6E7645CA60CA'
        else:
            self.x_splunk_request_channel = x_splunk_request_channel
        self.url = 'https://' + self.host + ':' + self.port + '/services/collector/raw'

    def receive(self, body):
        server_content = httplib2.Http(disable_ssl_certificate_validation=True).request(
                self.url,
                'POST',
                headers={
                    'X-Splunk-Request-Channel': self.x_splunk_request_channel,
                    'Authorization': 'Splunk ' + self.hec_token
                },
                body=body
                # body=urllib.urlencode(body)
        )[1]
        logger.info('Response from server: %s', server_content)
