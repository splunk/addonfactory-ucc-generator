from datetime import datetime

from gcp_data_makr_common import get_credential
from oauth2client.service_account import ServiceAccountCredentials
import googleapiclient as gac
import googleapiclient.discovery


class MonitoringEventGen(object):
    type_prefix = 'custom.googleapis.com/stores/'

    def __init__(self,
                 credential=None,
                 project_name=None,
                 metric_name=None,
                 double_value=None,
                 end_time=None
                 ):
        self.dic_credential = get_credential(credential)
        self.project_name = project_name
        self.metric_name = metric_name if metric_name.startswith(self.type_prefix) else self.type_prefix + metric_name
        self.double_value = double_value if double_value else 100
        self.end_time = end_time if end_time else datetime.utcnow().replace(microsecond=0).isoformat() + 'Z'

        self.sac_crediential = ServiceAccountCredentials.from_json_keyfile_dict(self.dic_credential)
        self.srv = gac.discovery.build('monitoring', 'v3', credentials=self.sac_crediential)

    def create_metric_descriptors(self):
        payload = {
            "type": self.metric_name,
            "metricKind": "GAUGE",
            "valueType": "DOUBLE"
        }
        name = 'projects/{}'.format(self.project_name)
        self.srv.projects().metricDescriptors().create(name=name, body=payload).execute()

    def delete_metric_descriptors(self):
        name = 'projects/{}/metricDescriptors/{}'.format(self.project_name, self.metric_name)
        self.srv.projects().metricDescriptors().delete(name=name).execute()

    def create_time_series(self):
        name = 'projects/{}'.format(self.project_name)
        paylaod = {
            "timeSeries": [
                {
                    "metric": {
                        "type": self.metric_name
                    },
                    "points": [
                        {
                            "value": {
                                "doubleValue": self.double_value
                            },
                            "interval": {
                                "endTime": self.end_time
                            }
                        }
                    ]
                }
            ]
        }
        self.srv.projects().timeSeries().create(name=name, body=paylaod).execute()

    def cleanup(self):
        self.delete_metric_descriptors()

    def gen(self):
        self.create_metric_descriptors()
        self.create_time_series()

    def get_metric_name(self):
        return self.metric_name

