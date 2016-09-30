import copy
import time
import random
import string
from datetime import datetime, timedelta
import threading

import logging

logger = logging.getLogger(__name__)


def params(funcarglist):
    """
    Method used with generated/parameterized tests, can be used to decorate
    your test function with the parameters.  Each dict in your list
    represents on generated test.  The keys in that dict are the parameters
    to be used for that generated test
    """

    def wrapper(function):
        '''
        Wrapper function to add the funcarglist to the function
        '''
        function.funcarglist = funcarglist
        return function

    return wrapper


class TestTACheckHelper(object):
    # Helper methods
    @staticmethod
    def get_search_result(splunk, search_string):
        job = splunk.jobs().create("search {}".format(search_string))
        job.wait()
        job_results = job.get_results()
        return job_results

    @staticmethod
    def retry_task_list(task_list, secondsToStable=60, retry_interval=5, retry_after=0):
        remained_task_list = copy.copy(task_list)

        def run_task():
            logger.info('start retry task, remained task number: {}'.format(len(remained_task_list)))
            tmp_task_list = filter(lambda task: not task(), remained_task_list)
            del remained_task_list[:]
            remained_task_list.extend(tmp_task_list)
            return not remained_task_list

        res = TestTACheckHelper.retry_task(run_task, secondsToStable=secondsToStable, retry_interval=retry_interval,
                                           retry_after=retry_after)

        return res, remained_task_list

    @staticmethod
    def retry_task(task, secondsToStable=60, retry_interval=5, retry_after=0):
        def try_sleep():
            time.sleep(retry_interval)

        begin_time = datetime.now()
        timeout_flag = False
        while True:
            if task():
                break
            if timeout_flag:
                return False
            current_time = datetime.now()
            if (current_time - begin_time).total_seconds() > secondsToStable:
                timeout_flag = True
            try_sleep()
        for _ in range(retry_after):
            if not task():
                return False
            try_sleep()

        return True

    @staticmethod
    def fetch_and_exit(splunk,
                       search_string,
                       secondsToStable=60,
                       retry_interval=5):
        def task():
            return splunk.get_event_count(search_string=search_string) > 0

        return TestTACheckHelper.retry_task(task,
                                            secondsToStable=secondsToStable,
                                            retry_interval=retry_interval)

    @staticmethod
    def fetch_number_and_exit(splunk,
                              number,
                              search_string,
                              secondsToStable=60,
                              retry_interval=5,
                              retry_after=2):
        def task(aim_number):
            def real_task():
                return splunk.get_event_count(
                    search_string=search_string) == aim_number

            return real_task

        return TestTACheckHelper.retry_task(
            task(number),
            secondsToStable=secondsToStable,
            retry_interval=retry_interval,
            retry_after=retry_after)

    @staticmethod
    def gen_random_string(length):
        return ''.join(random.choice(string.ascii_uppercase + string.digits)
                       for _ in range(length))

    @staticmethod
    def retry_and_execute_thread(retry_task, execute_task, secondsToStable=60, retry_interval=5, retry_after=0):
        def thread_target():
            if not TestTACheckHelper.retry_task(task=retry_task, secondsToStable=secondsToStable,
                                                retry_interval=retry_interval, retry_after=retry_after):
                error_message = 'Failed the retry_task: {}'.format(retry_task)
                logger.error(error_message)
                raise RuntimeError(error_message)

            execute_task()

        res_thread = threading.Thread(target=thread_target)
        return res_thread

    @staticmethod
    def fetch_and_exit_from_now(splunk,
                                search_string,
                                offset_time_second=0,
                                secondsToStable=60,
                                retry_interval=5):
        now = datetime.now()
        now -= timedelta(seconds=offset_time_second)
        mark_time = now.strftime('%m/%d/%Y:%H:%M:%S')
        search_string += ' earliest = "{}"'.format(mark_time)
        return TestTACheckHelper.fetch_and_exit(splunk, search_string, secondsToStable=secondsToStable,
                                                retry_interval=retry_interval)

    @staticmethod
    def fetch_number_and_exit_from_now(splunk,
                                       number,
                                       search_string,
                                       offset_time_second=0,
                                       secondsToStable=60,
                                       retry_interval=5):
        now = datetime.now()
        now -= timedelta(seconds=offset_time_second)
        mark_time = now.strftime('%m/%d/%Y:%H:%M:%S')
        search_string += ' earliest = "{}"'.format(mark_time)
        return TestTACheckHelper.fetch_number_and_exit(splunk, number, search_string, secondsToStable=secondsToStable,
                                                       retry_interval=retry_interval)
