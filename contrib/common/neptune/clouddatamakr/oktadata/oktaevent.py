from okta import UsersClient
from okta import UserGroupsClient
from okta.models.user import User
from okta.models.usergroup import UserGroup
from okta import EventsClient
from okta.models.event import Event
import sys
import os
import json
import time


class OktaeventEventGen(object):
    def __init__(self, host, access_token, file_path="samples/event.sample",
                 event_number = 1):
        self.user_client = UsersClient(host, access_token)
        self.group_client = UserGroupsClient(host, access_token)
        self.event_client = EventsClient(host,access_token)
        self.file_path = os.path.dirname(os.path.abspath(__file__))+"/" + file_path
        self.event_number = event_number
        self.add_list = []


    def gen(self):
        json_data = open(self.file_path).read()
        data = json.loads(json_data)
        for item in data:
            self.group_client.add_user_to_group_by_id(item["group"], item["user"])

    def cleanup(self):
        # Todo
        raise NotImplemented


