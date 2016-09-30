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


class OktagroupEventGen(object):
    def __init__(self, host, access_token, file_path="samples/group.sample",
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
            group = {
                'profile': {
                    'name': item["name"],
                    'description': item["description"]
                }
            }
            try:
                created_group = self.group_client.create_group(group)
                self.add_list.append(created_group.id)
            except:
                pass

    def cleanup(self):
        for item in self.add_list:
            try:
                self.group_client.delete_group(item)
            except:
                pass
