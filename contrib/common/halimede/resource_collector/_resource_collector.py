import logging

from splunklib import results

from halimede.resource_collector import resources

KEY_LIST = {'_time', '_span', 'datetime'}
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

def _collect(splunk_service, starttime, endtime, config):
    resource_metrics = []
    for name, value in config.iteritems():
        if name == 'process':
            for process in config['process']:
                if hasattr(resources, 'process_'+process):
                    rel = calc_result(splunk_service, 'process_'+process, starttime, endtime)
                    resource_metrics.append(rel)
                else:
                    logger.debug('process: ' + process + ' is not defined')
        elif value is True:
            rel = calc_result(splunk_service, name, starttime, endtime)
            resource_metrics.append(rel)
    return resource_metrics


def calc_result(splunk_service, name, starttime, endtime):
    global search
    rel = {}
    if hasattr(resources, name):
        search = getattr(resources, name)
    kwargs = {"earliest_time": starttime,
              "latest_time": endtime}
    oneshotsearch_results = splunk_service.jobs.oneshot(search, **kwargs)
    reader = results.ResultsReader(oneshotsearch_results)
    calc_results = {}
    for item in reader:
        for key in item:
            if key not in KEY_LIST:
                if key in calc_results:
                    count = calc_results[key]['count']
                    this_value = float(item[key])
                    avg = (calc_results[key]['avg'] * count + this_value) / (count + 1)
                    calc_results[key]['count'] = count + 1
                    calc_results[key]['avg'] = avg
                    if this_value > calc_results[key]['max']:
                        calc_results[key]['max'] = this_value
                    if this_value < calc_results[key]['min']:
                        calc_results[key]['min'] = this_value

                else:
                    rel['count'] = 1
                    initial_value = float(item[key])
                    rel['avg'] = initial_value
                    rel['max'] = initial_value
                    rel['min'] = initial_value
                    rel['name'] = name
                    calc_results[key] = rel
    return rel
