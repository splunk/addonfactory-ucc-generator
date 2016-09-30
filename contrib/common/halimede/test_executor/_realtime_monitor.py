import copy
import json
import logging
from threading import Thread
from time import sleep

from halimede.result_processor.result_template import ResultJSONEncoder

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


class RealtimeMonitor(Thread):
    def __init__(self, uuid, data, status, SplunkResultServer):
        Thread.__init__(self)
        self.uuid = uuid
        self.data = data
        self.status = status
        self.splunk = SplunkResultServer

    def finish(self, status):
        self.status = status
        logger.debug("monitor: test is completed")

    def run(self):
        while True:
            if self.status == 1:
                break
            if self.data:
                for search_name, thread_result in copy.copy(self.data).iteritems():
                    if search_name != 'current_cases' and search_name != 'total_cases' and thread_result:
                        for thread_name, result in copy.copy(thread_result).iteritems():
                            for testcase in result:
                                testcase.update({'uuid': self.uuid, 'thread': thread_name, 'search': search_name, 'progress': 100.00*self.data['current_cases']/self.data['total_cases']})
                                self.splunk.receive(str(json.dumps(testcase, cls=ResultJSONEncoder)))
            sleep(5)
