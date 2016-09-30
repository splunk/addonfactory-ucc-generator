import base64
from gcp_data_makr_common import get_credential
from oauth2client.service_account import ServiceAccountCredentials
from googleapiclient.http import HttpError
import googleapiclient as gac
import googleapiclient.discovery


class PubsubEventGen(object):
    def __init__(self, credential=None, project_name=None, topic_name=None, subscriptions_name=None):
        self.dic_credential = get_credential(credential)
        self.project_name = project_name
        self.topic_name = topic_name
        self.subscriptions_name = subscriptions_name

        self.sac_crediential = ServiceAccountCredentials.from_json_keyfile_dict(self.dic_credential)
        self.srv = gac.discovery.build('pubsub', 'v1', credentials=self.sac_crediential)

        self.topic = 'projects/{}/topics/{}'.format(self.project_name, self.topic_name)
        self.subscriptions = 'projects/{}/subscriptions/{}'.format(self.project_name, self.subscriptions_name)
        self.create_topic()
        self.create_subscriptions()

    def gen(self):
        body = {
            'messages': [
                {
                    'data': base64.b64encode('Automation test message'),
                }
            ]
        }
        self.srv.projects().topics().publish(topic=self.topic, body=body).execute()

    def cleanup(self):
        self.delete_topic()

    def create_subscriptions(self):
        try:
            body = {
                'name': self.subscriptions,
                'topic': self.topic
            }
            self.srv.projects().subscriptions().create(name=self.subscriptions, body=body).execute()
        except HttpError as e:
            if e.resp.status == 409:
                pass
            else:
                raise e

    def create_topic(self):
        try:
            self.srv.projects().topics().create(name=self.topic, body={}).execute()
        except HttpError as e:
            if e.resp.status == 409:
                pass
            else:
                raise e

    def delete_topic(self, delete_topic=False, delete_subscriptions=True):
        if delete_topic:
            self.srv.projects().topics().delete(topic=self.topic).execute()

        if delete_subscriptions:
            self.srv.projects().subscriptions().delete(subscription=self.subscriptions).execute()
