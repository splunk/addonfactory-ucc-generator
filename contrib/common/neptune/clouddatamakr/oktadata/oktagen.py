from okta import UsersClient
from okta import UserGroupsClient
from okta.models.user import User
from okta.models.usergroup import UserGroup
from okta import EventsClient
from okta.models.event import Event


class OktaEventGen(object):
    def __init__(self, host, access_token):
        self.user_client = UsersClient(host, access_token)
        self.group_client = UserGroupsClient(host, access_token)
        self.event_client = EventsClient(host,access_token)

    def create_user(self, configs):
        # user = User(login='example@example.com',
        #             email='example@example.com',
        #             firstName='Saml',
        #             lastName='Jackson')
        # self.user_client.delete_user('taautotest@splunk.com')
        user = User(**configs)
        user = self.user_client.create_user(user, activate=False)
        return user

    def activate_user(self, user):
        self.user_client.activate_user(user)

    def delete_user(self, user):
        self.user_client.delete_user(user.id)

    def delete_user_id(self, user):
        self.user_client.delete_user(user)

    def create_group(self, configs=None):
        group = UserGroup(*configs)
        group = self.group_client.create_group(group)
        return group

    def add_user_to_group(self, group, user):
        self.group_client.add_user_to_group(group, user)

    def delete_group(self, group):
        self.group_client.delete_group(group.id)

    def get_user(self,user_id):
        return self.user_client.get_user(user_id)

    def get_event(self,limit = 10, start_date = None,filter_string = None):
        return self.event_client.get_events(limit)


if __name__ == '__main__':

    host = 'https://acme2-admin.okta.com'
    access_token = 'dummy'
    eg = OktaEventGen(host, access_token)
    configs = {'login': 'taautotest@splunk.com',
               'email': 'taautotest@splunk.com',
               'firstName': 'AutoTA',
               'lastName': 'Zhang'}
    user = eg.create_user(configs)
    eg.delete_user(user)
