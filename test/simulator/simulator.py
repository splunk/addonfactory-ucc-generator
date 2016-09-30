import base64
import datetime
import hashlib
import hmac
import json
import os
import random
import time
import uuid
import signal
import sys

import cherrypy

from threading import Thread
from simple_proxy import start_proxy


class _RandomGen(object):
    def __init__(self):
        self._customer_id = str(uuid.uuid4()).replace('-','')
        self._folder = os.path.dirname(os.path.realpath(__file__))
        self._rand = random.Random(time.time())
        self._operations = self._fetch_sample_file('operation')
        self._emails = self._fetch_sample_file('email')
        self._host_names = self._fetch_sample_file('host_name')
        self._ip_addresses = self._fetch_sample_file('ip_address')
        self._events_ctor = [
            self._get_auth_activity_audit_event,
            self._get_auth_activity_audit_event,
            self._get_auth_activity_audit_event,
            self._get_detection_summary_event,
        ]

    def _fetch_sample_file(self, name):
        with open(os.path.join(self._folder, '..', 'examples', name), 'r') as conf:
            return conf.read().split('\n')

    def _get_email(self):
        return self._emails[self._rand.randint(0, len(self._emails) - 1)]

    def _get_host_name(self):
        return self._host_names[self._rand.randint(0, len(self._host_names) - 1)]

    def _get_ip_address(self):
        return self._ip_addresses[self._rand.randint(0, len(self._ip_addresses) - 1)]

    def _get_activity_operation(self):
        return self._operations[self._rand.randint(0, len(self._operations) - 1)]

    def _get_auth_activity_audit_event(self, offset):
        metadata = dict(
            customerIDString=self._customer_id,
            offset=offset,
            eventType='AuthActivityAuditEvent'
        )
        event = dict(
            UserId=self._get_email(),
            UserIp=self._get_ip_address(),
            OperationName=self._get_activity_operation(),
            ServiceName='CrowdStrike Authentication',
            Success='true' if self._rand.randint(0, len(self._operations)) % 2 == 1 else 'false',
            UTCTimestamp=time.time()
        )
        return dict(metadata=metadata, event=event)

    def _get_detection_summary_event(self, offset):
        metadata = dict(
            customerIDString=self._customer_id,
            offset=offset,
            eventType='DetectionSummaryEvent'
        )
        computer_name = self._get_host_name()
        event = {u'CommandLine': u'/Users/Maryam Gholami/Downloads/netcat-win32-1.12 (1)/nc.exe',
                 u'ComputerName': computer_name,
                 u'DetectDescription': u'A file surpassed an antivirus detection threshold as potential adware',
                 u'DetectName': u'Known Malware',
                 u'FalconHostLink': u'https://falcon.crowdstrike.com/detects/8935647444343480192',
                 u'FileName': u'nc.exe',
                 u'FilePath': u'/Device/HarddiskVolume1/Users/Maryam Gholami/Downloads/netcat-win32-1.12 (1)',
                 u'MD5String': u'5dcf26e3fbce71902b0cd7c72c60545b',
                 u'MachineDomain': computer_name,
                 u'ParentProcessId': 103133469329,
                 u'ProcessEndTime': 0,
                 u'ProcessId': 103152535310,
                 u'ProcessStartTime': time.time(),
                 u'SHA1String': u'970bbe298c8ec673fe2257ad6363d29942171fd1',
                 u'SHA256String': u'e8fbec25db4f9d95b5e8f41cca51a4b32be8674a4dea7a45b6f7aeb22dbc38db',
                 u'ScanResults': [{u'Detected': True,
                                   u'Engine': u'K7AntiVirus',
                                   u'ResultName': u'Unwanted-Program ( 004bc56d1 )',
                                   u'Version': u'9.220.19189'},
                                  {u'Detected': True,
                                   u'Engine': u'AegisLab',
                                   u'ResultName': u'Hktl.Netcat.Gen!c',
                                   u'Version': u'4.2'}],
                 u'SensorId': u'1f841c21db914ce15ea81fa7a184f6b9',
                 u'Severity': 2,
                 u'SeverityName': u'Low',
                 u'UserName': u'Ben Hur'}
        return dict(metadata=metadata, event=event)

    def get_event(self, offset):
        return self._events_ctor[self._rand.randint(0, len(self._events_ctor) - 1)](offset)


class FalconHostSimulator(object):
    def __init__(self, accounts, interval):
        self._streams = {}
        self._accounts = accounts
        self._interval = interval
        self._rand = _RandomGen()

    @cherrypy.expose
    def discover(self, appId):
        print "DISCOVERED BY '%s'" % appId
        if not self._http_auth_verifier():
            cherrypy.response.status = 401
            return "Unauthorized"
        partition_url = cherrypy.request.base + "/consume"
        token = str(uuid.uuid4())
        expire = (datetime.datetime.utcnow() + datetime.timedelta(minutes=5))
        expire_s = expire.isoformat()
        self._streams[token] = expire
        return json.dumps(dict(
            meta=dict(pagination=dict(offset=0, count=1, total=1)),
            resources=[
                dict(dataFeedURL=partition_url, sessionToken=dict(token=token, expiration=expire_s))
            ]))

    @cherrypy.expose
    def consume(self, appId, offset=0):
        offset = int(offset)
        print "CONSUMED BY '%s' FROM '%d'" % (appId, offset)
        token = cherrypy.request.headers.get('Authorization')[6:]
        if token not in self._streams or self._streams[token] < datetime.datetime.utcnow():
            cherrypy.response.status = 403
            return "Invalid Token"
        offset = offset or random.randint(1, 100000)
        # streaming response
        stream = self._create_stream(offset)
        print "STREAM GENERATED"
        return stream

    def _http_auth_verifier(self):
        date = cherrypy.request.headers.get('Date')
        auth = cherrypy.request.headers.get('Authorization')
        if not date or not auth:
            return False
        timestamp = datetime.datetime.strptime(date, '%a, %d %b %Y %H:%M:%S GMT')
        if (datetime.datetime.utcnow() - timestamp).total_seconds() > 5:
            return False
        api_uuid, signature = _parse_auth_header(auth)
        if api_uuid not in self._accounts:
            return False
        uri = cherrypy.request.headers.get('Host') + cherrypy.request.path_info
        query = cherrypy.request.query_string
        return signature == _get_signature(uri, query, date, self._accounts[api_uuid])

    def _create_stream(self, start_offset):
        for offset in xrange(start_offset, start_offset + 50000):
            yield json.dumps(self._rand.get_event(offset)) + "\n"
            print "EVENT SENT"
            time.sleep(self._interval)

    consume._cp_config = {'response.stream': True}


def _parse_auth_header(auth_header):
    auth_header = auth_header[8:]
    api_uuid, digest, _ = auth_header.split(':')
    return api_uuid, digest


def _get_signature(canonical_uri, canonical_query, date, api_key):
    request_string = "\n".join(['GET', "", date, canonical_uri, canonical_query])
    digest = hmac.new(str(api_key), str(request_string), digestmod=hashlib.sha256).digest()
    return base64.b64encode(digest).decode()


def start_simulator():
    folder = os.path.dirname(os.path.realpath(__file__))
    with open(os.path.join(folder, 'simulator.json'), 'r') as conf:
        sim_conf = json.load(conf)
    cred, interval = sim_conf['api_credentials'], sim_conf['generation_interval_secs']
    cherrypy.quickstart(FalconHostSimulator(cred, interval))


def main():
    start_simulator()


if __name__ == "__main__":
    main()
