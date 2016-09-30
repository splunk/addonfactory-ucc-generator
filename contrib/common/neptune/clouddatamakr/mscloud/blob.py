from azure.storage.blob import PublicAccess
from azure.storage.blob import BlockBlobService
from azure.storage.blob import ContentSettings
import random
import sys
import os
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../'))
from lib.utils import gen_random_string, to_bool
import json


class BlobEventGen(object):
    def __init__(self,
                 account,
                 key,
                 container_name="splunk-ta-test",
                 create_container="True",
                 public_access="False",
                 generate_file="False",
                 file_path="samples/mscloud_blob.sample",
                 event_number="100",
                 content_category = '["IISLogs","FailedRequestTracelogs",'
                                    '"CrashDumps","CustomErrorLogs"]',
                 content_pos='{' \
                     '"IISLogs": "samples/blob/IISLogs.sample",' \
                     '"FailedRequestTracelogs": "samples/blob/FailedRequestTracelogs.sample",' \
                     '"CrashDumps": "samples/blob/CrashDumps.sample",' \
                     '"CustomErrorLogs": "samples/blob/CustomErrorLogs.sample"' \
                 '}',
                 content_name='{' \
                             '"IISLogs": "IISname",' \
                             '"FailedRequestTracelogs": "FailedRequestTracelogs",' \
                             '"CrashDumps": "CrashDumps",' \
                             '"CustomErrorLogs": "CustomErrorLogs"' \
                             '}',
                 log_type = "all"
                 ):
        self.blob_service = BlockBlobService(account_name=account, account_key=key)
        self.container_name = container_name
        self.create_container = to_bool(create_container)
        self.public_access = to_bool(public_access)
        self.generate_file = to_bool(generate_file)
        self.file_path = os.path.dirname(os.path.abspath(__file__))+"/" + file_path
        self.event_number = int(event_number)
        self.content_category = json.loads(content_category)
        self.content_pos = json.loads(content_pos)
        self.content_name = json.loads(content_name)
        self.log_type = log_type

    # for automated generating data, not support now

    # def gen_file(self):
    #     file = open(self.file_path, 'w+')
    #     file.write("{")
    #     for j in range(0,self.content_index):
    #         pos = self.content_pos[self.content_category[j]]
    #         content_type = self.content_category[j]
    #         file.write('"'+ content_type + '":[')
    #         for i in range(0,self.data_size):
    #             name = "ta-auto-test-{}".format(gen_random_string(6))
    #             path = ""
    #             path += name
    #             data = '{"name":"%s", "blob_name":"%s", "pos":"%s", "type":"%s"}\n' \
    #                    % (self.container_name,path,pos,content_type)
    #             file.write(data)
    #             if i < self.data_size - 1:
    #                 file.write(",")
    #         file.write("]")
    #         if j < self.content_index - 1:
    #             file.write(",\n")
    #     file.write("}")

    def gen(self):
        if self.create_container :
            if self.public_access:
                self.blob_service.create_container(self.container_name, PublicAccess.Container)
            else:
                self.blob_service.create_container(self.container_name)
        data = []
        if self.log_type == "all":
            data = self.content_category
        else:
            data = data.append(self.log_type)
        for type_item in data:
            for i in range(0,self.event_number):
                name = self.content_name[type_item] + gen_random_string(2)
                self.blob_service.create_blob_from_path(self.container_name, name  ,os.path.dirname(os.path.abspath(__file__))+"/" + self.content_pos[type_item])

    def cleanup(self):
        self.blob_service.delete_container(self.container_name)




