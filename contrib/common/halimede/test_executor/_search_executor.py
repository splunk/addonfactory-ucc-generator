import logging
import threading
from threading import Thread

import splunklib.client as client
from time import sleep, time
import sys

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


class AppSearch(Thread):
    def __init__(self, host, port, username, password, app, result, iteration, think_time, searches, dashboards, id,
                 kwargs=None):
        Thread.__init__(self)
        self.host = host
        self.port = port
        self.username = username
        self.password = password
        self.app = app
        self.searches = searches
        self.dashboards = dashboards
        self.start_id = id
        self.result = result
        self.iteration = iteration
        self.think_time = think_time
        if kwargs is None:
            self.kwargs = {"exec_mode": "normal"}
        else:
            self.kwargs.update({"exec_mode": "normal"})
        self.service = client.connect(
                host=self.host,
                port=self.port,
                username=self.username,
                password=self.password,
                app=self.app
        )

    def run(self):
        ite = 1
        sid_map = {}
        sid_state_map = {}
        for x in range(self.iteration):
            jobs = []
            dashboard_searches = self.searches[self.dashboards[self.start_id]]
            for search_name, search in dashboard_searches.iteritems():
                job = self.service.jobs.create(search, **self.kwargs)
                jobs.append(job)
                sid_map[job['sid']] = search_name
                sid_state_map[job['sid']] = 0
                this_result = {'start_time': time(), 'id': ite, 'status': 'running',
                               'dashboard': self.dashboards[self.start_id]}
                if search_name not in self.result:
                    this_thread_result = {threading.currentThread().getName(): [this_result]}
                    self.result[search_name] = this_thread_result
                else:
                    if threading.currentThread().getName() not in self.result[search_name]:
                        this_search = [this_result]
                        self.result[search_name][threading.currentThread().getName()] = this_search
                    else:
                        self.result[search_name][threading.currentThread().getName()].append(this_result)

            jobs_count = len(jobs)
            jobs_done = 0
            while True:
                output = '\r'
                for job in jobs:
                    while not job.is_ready():
                        pass
                    stats = {"sid": job["sid"],
                             "isDone": job["isDone"],
                             "doneProgress": float(job["doneProgress"]) * 100,
                             "scanCount": int(job["scanCount"]),
                             "eventCount": int(job["eventCount"]),
                             "resultCount": int(job["resultCount"])}

                    status = ("%(doneProgress)03.1f%%   %(scanCount)d scanned   "
                              "%(eventCount)d matched   %(resultCount)d results\n") % stats

                    output += status
                    if stats["isDone"] == "1" and sid_state_map[stats['sid']] == 0:
                        sid_state_map[stats['sid']] = 1
                        search_name = sid_map[stats['sid']]
                        uncompleted_result = self.result[search_name][threading.currentThread().getName()][-1]
                        uncompleted_result['end_time'] = time()
                        uncompleted_result['status'] = 'completed'
                        uncompleted_result['duration'] = float(job['runDuration'])
                        # uncompleted_result['end_time'] - uncompleted_result['start_time']
                        self.result[search_name][threading.currentThread().getName()][-1] = uncompleted_result
                        self.result['current_cases'] += 1
                        sys.stdout.write("search name: " + search_name + " sid:" + stats["sid"] + " is Done!\n")
                        jobs_done += 1
                        # jobs.remove(job)
                if jobs_done == jobs_count:
                    logger.info(threading.currentThread().getName() + " worker is done")
                    break
                sleep(5)
            ite += 1
            sleep(self.think_time / 1000)
            self.start_id = (self.start_id + 1) % len(self.dashboards)


def _search(host, port, username, password, search, kwargs=None):
    service = client.connect(
            host=host,
            port=port,
            username=username,
            password=password
    )
    if kwargs is None:
        kwargs = {"exec_mode": "normal"}
    else:
        kwargs.update({"exec_mode": "normal"})

    job = service.jobs.create(search, **kwargs)

    while True:
        while not job.is_ready():
            pass
        stats = {"isDone": job["isDone"],
                 "doneProgress": float(job["doneProgress"]) * 100,
                 "scanCount": int(job["scanCount"]),
                 "eventCount": int(job["eventCount"]),
                 "resultCount": int(job["resultCount"])}

        status = ("\r%(doneProgress)03.1f%%   %(scanCount)d scanned   "
                  "%(eventCount)d matched   %(resultCount)d results") % stats

        sys.stdout.write(status)
        sys.stdout.flush()
        if stats["isDone"] == "1":
            sys.stdout.write("\n\nDone!\n\n")
            break
        sleep(2)


if __name__ == '__main__':
    searches = ["| search index=main | stats count",
                "| search index=_internal | stats count",
                "| search index=_introspection | stats count"]
    # _app_search('10.66.130.125', '8089', 'admin', 'password', searches)
    # sys.stdout.write('\r0.0%   0 scanned   0 matched   0 results\n25.2%   3118684 scanned   3118684 matched   0 results\n100.0%   656738 scanned   656738 matched   1 results\n1469433912.246 is Done!')
    # sys.stdout.flush()
