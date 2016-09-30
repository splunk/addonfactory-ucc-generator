from azure.storage.table import TableService, Entity
from azure.storage.table import TableBatch
import json
import os
import sys

sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../'))
from lib.utils import to_bool

class TableEventGen(object):
    def __init__(self, account,
                        key,
                        table_name="SplunkTAAutoTest",
                        create_table = "False",
                        generate_file = "False",
                        file_path = "samples/mscloud_table.sample",
                        event_number = "100",
                        start_index = "0",
                        content_category='["AzureLogs","AzureDiagnosticsInfrastructureLogs",'
                                          '"WindowsEventLogs","PerformanceCounters"]',
                        content_pos='{' \
                                     '"AzureLogs": "samples/table/AzureLogs.sample",' \
                                     '"AzureDiagnosticsInfrastructureLogs": "samples/table/AzureDiagnosticsInfrastructureLogs.sample",' \
                                     '"WindowsEventLogs": "samples/table/WindowsEventLogs.sample",' \
                                     '"PerformanceCounters": "samples/table/PerformanceCounters.sample"' \
                                     '}',
                        log_type="all"
                 ):
        self.table_service = TableService(account_name=account, account_key=key)
        self.table_name = table_name
        self.create_table = to_bool(create_table)
        self.generate_file = to_bool(generate_file)
        self.file_path = os.path.dirname(os.path.abspath(__file__))+"/"  + file_path
        self.content_category = json.loads(content_category)
        self.content_pos = json.loads(content_pos)
        self.log_type = log_type
        self.event_number = int(event_number)
        self.start_index = int(start_index)

    # for automated generating data, not support now

    # def gen_data(self):
    #     print self.file_path
    #     file = open(self.file_path, 'w+')
    #     file.write('{"data":[')
    #     for i in range(0, self.data_size):
    #         data = '{"PartitionKey": "Splunk", "RowKey": "%d", "description": "Splunk Test",' \
    #                '"priority": %d}' % (self.start_index+i, i)
    #         file.write(data)
    #         if i < self.data_size - 1:
    #             file.write(",\n")
    #     file.write("]}")

    def gen(self):
        if self.create_table :
            self.table_service.create_table(self.table_name)
        name = []
        if self.log_type == "all":
            name = self.content_category
        else:
            name.append(self.log_type)
        batch = TableBatch()
        for log_type in name:
            batch = TableBatch()
            json_data = open(os.path.dirname(os.path.abspath(__file__))+"/" + self.content_pos[log_type]).read()
            data = json.loads(json_data)["data"]
            uploaded = 0
            while uploaded<self.event_number:
                for item in data:
                    if(uploaded<self.event_number):
                        batch.insert_entity(item)
                    uploaded +=1
        self.table_service.commit_batch(self.table_name,batch)
    def cleanup(self):
        self.table_service.delete_table(self.table_name)




