import requests


class BattleCat(object):
    def __init__(self, host, port, token=None, is_ssl=False):
        self._host = host
        self._port = port
        self._token = token
        self._is_ssl = is_ssl
        self._buildurl()

        self._header = {'Authorization': 'Splunk {}'.format(self._token)}

    def _buildurl(self):
        self._url = "http{}://{}:{}/services/collector".format(
            's' if self._is_ssl else '', self._host, self._port)

    def send(self, data):
        r = requests.post(
            self._url, headers=self._header,
            data=data, verify=False)
        if r.status_code != 200:
            r.raise_for_status()
