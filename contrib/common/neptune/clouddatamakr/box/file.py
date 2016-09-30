import os
from box_event_gen import BoxEventGen


class FileEventGen(object):
    def __init__(self, client_id, client_secret, access_token, refresh_token, file_name, parent_folder_id='0',
                 sample_file=None):
        self.box_event_gen = BoxEventGen(client_id, client_secret, access_token, refresh_token)
        self.file_name = file_name
        self.parent_folder_id = parent_folder_id

        sample_folder = BoxEventGen.get_sample_folder()
        if sample_file:
            self.sample_file = os.path.join(sample_folder, sample_file)
        else:
            self.sample_file = os.path.join(sample_folder, 'test_file_01.txt')

        self.file_object_set = set()

    def gen(self):
        folder_obj = self.box_event_gen.get_folder_obj(self.parent_folder_id)
        file_obj = self.box_event_gen.create_file(folder_obj, self.sample_file, self.file_name)
        self.file_object_set.add(file_obj)

    def cleanup(self):
        for item in self.file_object_set:
            self.box_event_gen.delete_file(item)
