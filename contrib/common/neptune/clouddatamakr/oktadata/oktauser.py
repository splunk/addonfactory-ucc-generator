from okta import UsersClient
from okta import UserGroupsClient
from okta.models.user import User
from okta.models.usergroup import UserGroup
from okta import EventsClient
from okta.models.event import Event
import sys
import os
import json


class OktauserEventGen(object):
    def __init__(self, host, access_token, file_path="samples/user.sample", action="Activate",
                 event_number = 1):
        self.user_client = UsersClient(host, access_token)
        self.group_client = UserGroupsClient(host, access_token)
        self.event_client = EventsClient(host,access_token)
        self.file_path = os.path.dirname(os.path.abspath(__file__))+"/" + file_path
        self.action = action
        self.event_number = event_number
        self.add_list = []


    def gen(self):
        if self.action == "Create":
            json_data = open(self.file_path).read()
            data = json.loads(json_data)
            for item in data:
                user = {'login': item["login"],
                            'email' : item["email"],
                            'firstName' : item["firstName"],
                            'lastName=item' : item["lastName"]}
                try:
                    created_user = self.user_client.create_user(user,activate=True)
                    self.add_list.append(created_user.id)
                except:
                    pass
        else:
            json_data = open(self.file_path).read()
            data = json.loads(json_data)
            for item in data:
                user = self.user_client.get_user(item["login"])
                try:
                    self.user_client.activate_user(user.id)
                    self.add_list.append(user.id)
                except:
                    pass

    def cleanup(self):
        for item in self.add_list:
            try:
                self.user_client.deactivate_user(item)
            except:
                pass
