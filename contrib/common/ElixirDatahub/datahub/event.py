import socket
import time

class Event(object):
    def __init__(self, bamboo_data, cases_data):
        self.bamboo_data = bamboo_data
        self.cases_data = cases_data

    def gen_events(self):
        #print self.bamboo_data
        host = socket.gethostbyname(socket.gethostname())
        source = socket.getfqdn()
        event_list = []
        for data in self.cases_data:
            testcase_list = data['testsuite']['testcase']

            for testcase in testcase_list:
                event_dict = {}
                testcase.update(self.bamboo_data)
                event_dict["host"] = host
                event_dict["source"] = source
                event_dict["sourcetype"] = "bamboo:testcase"
                event_dict["time"] = time.time()
                event_dict["index"] = "bamboo"
                event_dict["event"] = testcase
                event_list.append(event_dict)
        return event_list

