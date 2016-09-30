import logging
import sys

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


def _aggregate(result):
    summary = {}
    for name, thread_testcases in result.iteritems():
        sum_value = 0
        max_value = 0
        min_value = sys.float_info.max
        executions = 0
        summary_item = {}
        if name != 'current_cases' and name != 'total_cases':
            for thread, testcases in thread_testcases.iteritems():
                executions += len(testcases)
                for testcase in testcases:
                    sum_value += testcase['duration']
                    if testcase['duration'] > max_value:
                        max_value = testcase['duration']
                    if testcase['duration'] < min_value:
                        min_value = testcase['duration']
            summary_item['avg'] = sum_value/executions
            summary_item['min'] = min_value
            summary_item['max'] = max_value
            summary_item['executions'] = executions
            summary[name] = summary_item
    return summary


def _print_summary(summary):
    for name, result in summary.iteritems():
        logger.info("Test case name: " + name)
        logger.info("avg: " + str(result['avg']))
        logger.info("min: " + str(result['min']))
        logger.info("max: " + str(result['max']))
