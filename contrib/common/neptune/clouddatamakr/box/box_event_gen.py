import os
import time
import traceback
from boxsdk import OAuth2
from boxsdk import Client
from boxsdk.exception import BoxAPIException


class BoxEventGen(object):
    def __init__(self, client_id, client_secret, access_token, refresh_token,
                 dev_token=None):
        if dev_token is not None:
            access_token = dev_token

        self.has_store_new_tokens = False
        self.new_access_token = None
        self.new_refresh_token = None

        def store_new_tokens(access_token, refresh_token):
            self.has_store_new_tokens = True
            self.new_access_token = access_token
            self.new_refresh_token = refresh_token

        oauth = OAuth2(client_id=client_id,
                       client_secret=client_secret,
                       access_token=access_token,
                       refresh_token=refresh_token,
                       store_tokens=store_new_tokens)
        self.client = Client(oauth)

    def get_folder_obj(self, folder_id):
        return self.client.folder(folder_id=folder_id)

    def create_folder(self, folder_name, parent_folder_id='0'):
        shared_folder = None
        try:
            shared_folder = self.client.folder(
                folder_id=parent_folder_id, ).create_subfolder(folder_name)
        except BoxAPIException as e:
            traceback.print_exc()
            if e.status == 409:
                items = self.client.folder(folder_id=parent_folder_id).get_items(limit=100,
                                                                                 offset=0)
                folder_id = [folder.get()['id']
                             for folder in items
                             if folder.get()['name'] == folder_name][0]
                shared_folder = self.client.folder(folder_id=folder_id)
        return shared_folder

    def delete_folder(self, folder_object):
        try:
            self.client.folder(
                folder_id=folder_object.object_id, ).delete()
        except Exception as e:
            traceback.print_exc()

    def create_file(self, folder_obj, local_filepath, remote_filename):
        uploaded_file = None
        try:
            uploaded_file = folder_obj.upload(local_filepath, remote_filename)
        except BoxAPIException as e:
            traceback.print_exc()
            if e.status == 409:
                items = self.client.folder(
                    folder_id=folder_obj.get()['id']).get_items(limit=100,
                                                                offset=0)
                uploaded_file = [file_obj
                                 for file_obj in items
                                 if file_obj.get()['name'] == remote_filename
                                 ][0]
        return uploaded_file

    def delete_file(self, file_object):
        self.client.file(file_object.object_id).delete()

    def create_group(self, group_name):
        new_group = None
        try:
            new_group = self.client.create_group(group_name)
        except BoxAPIException as e:
            if e.status == 409:
                id = [gp.get()['id']
                      for gp in self.client.groups()
                      if gp.get()['name'] == group_name][0]
                new_group = self.client.group(id)
        return new_group

    def delete_group(self, group_object):
        self.client.group(group_id=group_object.object_id).delete()

    def create_user(self, name):
        self.client.create_user(name)

    def get_users(self):
        return self.client.users()

    def add_metadata(self, file_obj, key, val):
        # Create metadata
        file_obj.metadata().create({key: val})

    @staticmethod
    def get_sample_folder():
        current_folder = os.path.dirname(os.path.abspath(__file__))
        sample_folder = os.path.join(current_folder, 'samples')
        return sample_folder


if __name__ == '__main__':
    client_id = '8iifmntnheff5z35bc6nyslrjsmr8rwm'
    client_secret = 'aAvJQTiOehwAuje2KHtK0Fb2m6IyKz7n'
    access_token = 'B8xSBZ9Y7w4LNo4c3qRmOC6IxQbv1F6c'
    refresh_token = '96hiQimDwU8mhPbewVYJuBG6RSMfj9V9V4KvSPR5z6jSCWHQWOFm7ELrwIK2ork6'
    dev_token = 'lyLvA6fi8m5qZ2DeojnMcvNyC43SVnzX'

    group_name = 'test-group2'
    folder_name = 'shared_folder2'
    file_name = 'box' + str(time.time()) + '.py'

    eg = BoxEventGen(client_id, client_secret, access_token, refresh_token,
                     dev_token)

    ofolder = eg.create_folder(folder_name)
    ofile = eg.create_file(ofolder, __file__, file_name)
    ofolder.add_collaborator(group_name)
    eg.add_metadata(ofile, 'testkey', 'testval')
