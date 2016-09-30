import json

import requests

from requests.packages.urllib3.exceptions import InsecureRequestWarning

requests.packages.urllib3.disable_warnings(InsecureRequestWarning)

class Splunk(object):
    def __init__(self, events):
        self.server = "https://elixir.sv.splunk.com:8088/services/collector/event"
        self.token  = "08C2B234-CC2C-4DF8-B2E8-C378A3CE4EDF"
        self.events = events

    def commit(self):
        headers = {'Authorization': 'Splunk ' + self.token}
        for event in self.events:
            try:
                r = requests.post(self.server, headers=headers, verify=False, data=json.dumps(event))
            except requests.exceptions.RequestException as e:
                print e
                print "commit data failed\n"
