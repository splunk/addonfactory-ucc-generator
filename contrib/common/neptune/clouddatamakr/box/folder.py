from box_event_gen import BoxEventGen


class FolderEventGen(object):
    def __init__(self, client_id, client_secret, access_token, refresh_token, folder_name, parent_folder_id='0'):
        self.box_event_gen = BoxEventGen(client_id, client_secret, access_token, refresh_token)
        self.folder_name = folder_name
        self.parent_folder_id = parent_folder_id
        self.folder_object_set = set()

    def gen(self):
        folder_obj = self.box_event_gen.create_folder(self.folder_name, self.parent_folder_id)
        self.folder_object_set.add(folder_obj)

    def cleanup(self):
        for item in self.folder_object_set:
            self.box_event_gen.delete_folder(item)
