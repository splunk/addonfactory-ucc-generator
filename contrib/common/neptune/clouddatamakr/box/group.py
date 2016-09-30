from box_event_gen import BoxEventGen


class GroupEventGen(object):
    def __init__(self, client_id, client_secret, access_token, refresh_token, group_name):
        self.box_event_gen = BoxEventGen(client_id, client_secret, access_token, refresh_token)
        self.group_name = group_name
        self.group_object_set = set()

    def gen(self):
        group_obj = self.box_event_gen.create_group(self.group_name)
        self.group_object_set.add(group_obj)

    def cleanup(self):
        for item in self.group_object_set:
            self.box_event_gen.delete_group(item)
