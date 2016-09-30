import logging
from time import time, sleep

import sys
from splunklib import client

from halimede.resource_collector import _resource_collector
from halimede.test_executor._realtime_monitor import RealtimeMonitor
from halimede.test_executor._search_executor import AppSearch

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


def get_case_count(searches, dashboards, idx, iteration):
    count = 0
    for x in range(iteration):
        dashboard = dashboards[idx]
        count += len(searches[dashboard])
        idx = (idx + 1) % len(dashboards)
    return count


class TestScenario:
    def __init__(self, uuid, concurrency, iteration, think_time, config, app, realtime=False, kwargs=None, splunk=None,
                 resource_config=None, searches_config=None):
        self.uuid = uuid
        self.concurrency = concurrency
        self.iteration = iteration
        self.think_time = think_time
        self.detail_result = {'current_cases': 0}
        self.config = config
        self.searches = app.global_searches
        self.saved_searches = app.s_searches
        self.dm_jobs = app.d_searches
        self.dashboards = app.dashboards
        self.realtime = realtime
        self.kwargs = kwargs
        self.splunk = splunk
        self.resource_metrics = []
        self.resource_config = resource_config
        self.saved_searches_required = searches_config['saved_search']

    def start_dashboard_test(self):
        global test_monitor
        logger.info('Test is started')
        test_workers = []
        stime = time()
        if self.realtime is True:
            test_monitor = RealtimeMonitor(self.uuid, self.detail_result, 0, self.splunk)
            test_monitor.setDaemon(True)
            test_monitor.start()
        idx = 0
        '''
        The run logic is -
        user1: {
            ite1: dashboard1,
            (think_time)
            ite2: dashboard2,
            (think_time)
            ite3: dashboard3
        }
        user2: {
            ite1: dashboard2,
            (think_time)
            ite2: dashboard3,
            (think_time)
            ite3: dashboard4
        }
        ...
        '''
        total_cases = 0
        for x in range(self.concurrency):
            total_cases += get_case_count(self.searches, self.dashboards, idx, self.iteration)
            test_worker = AppSearch(self.config['host'],
                                    self.config['port'],
                                    self.config['username'],
                                    self.config['password'],
                                    self.config['app_name'],
                                    self.detail_result,
                                    self.iteration,
                                    self.think_time,
                                    self.searches,
                                    self.dashboards,
                                    idx,
                                    self.kwargs)
            test_workers.append(test_worker)
            idx += 1
        self.detail_result.update({'total_cases': total_cases})
        logger.info('The test is about to start')
        print 'Test is about to start'
        for test_worker in test_workers:
            test_worker.start()

        for worker in test_workers:
            worker.join()
        if test_monitor:
            test_monitor.finish(1)
            test_monitor.join()
        etime = time()
        logger.info("test is done, the duration is " + str(etime - stime) + " ms")

        logger.info("start to collect resource usage")
        service = client.connect(
                host=self.config['host'],
                port=self.config['port'],
                username=self.config['username'],
                password=self.config['password'],
                app=self.config['app_name']
        )
        self.resource_metrics = _resource_collector._collect(service, stime, etime, self.resource_config)
        logger.info("resource collection is done")
        return self.detail_result

    def start_saved_search_test(self):
        saved_search_metrics = {'saved_search_metrics': []}
        kwargs = {'is_scheduled': False}
        for saved_search in self.saved_searches:
            saved_search_metric = {'name': saved_search.name}
            saved_search.update(**kwargs).refresh()
            sum_value = 0
            max_value = 0
            min_value = sys.float_info.max
            for x in range(self.iteration):
                job = saved_search.dispatch()
                while not job.is_ready():
                    pass
                while True:
                    job.refresh()
                    stats = {"isDone": job["isDone"],
                             "doneProgress": float(job["doneProgress"]) * 100,
                             "scanCount": int(job["scanCount"]),
                             "eventCount": int(job["eventCount"]),
                             "resultCount": int(job["resultCount"])}
                    status = ("\r%(doneProgress)03.1f%%   %(scanCount)d scanned   "
                              "%(eventCount)d matched   %(resultCount)d results") % stats

                    if stats["isDone"] == "1":
                        logger.info("Saved search: " + saved_search.name + " is completed")
                        sum_value += float(job['runDuration'])
                        if float(job['runDuration']) < min_value:
                            min_value = float(job['runDuration'])
                        if float(job['runDuration']) > max_value:
                            max_value = float(job['runDuration'])
                        break
                    sleep(2)
                saved_search_metric.update({'average': sum_value / self.iteration,
                                            'minimum': min_value,
                                            'maximum': max_value,
                                            'executions': self.iteration,
                                            'unit': 'second'})
            saved_search_metrics['saved_search_metrics'].append(saved_search_metric)
        return saved_search_metrics
