from snow_event_gen import SnowEventGen

class TableEventGen(object):
    def __init__(self, username, password, instance, table_name, event_number=1, config=None, api='JSONv2'):
        self.snow_event_gen = SnowEventGen(username, password, instance, api)
        self.table_name = table_name
        self.event_number = event_number
        self.config = config

    def gen(self):
        self.snow_event_gen.gen(self.table_name, self.event_number, self.config)

    def cleanup(self):
        raise NotImplementedError
