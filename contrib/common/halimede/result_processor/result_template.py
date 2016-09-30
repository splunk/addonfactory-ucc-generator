import json


class SummaryResult:
    def __init__(self, uuid, test_name, status, product_config, unit, summary_result=None, resource_metrics=None, extra_metrics=None):
        self.uuid = uuid
        self.test_name = test_name
        self.status = status
        self.product_name = product_config['product_name']
        self.product_category = product_config['product_category']
        self.product_version = product_config['product_version']
        self.build_version = product_config['build_version']
        self.search_metrics = []
        self.resource_metrics = resource_metrics
        if summary_result is not None:
            for case_name, case_metrics in summary_result.iteritems():
                self.search_metrics.append(SearchMetric(case_name, unit, case_metrics))
        self.extra_metrics = extra_metrics

    def toJSON(self):
        jsondict = dict(uuid=self.uuid,
                        testname=self.test_name,
                        status=self.status,
                        product_name=self.product_name,
                        product_category=self.product_category,
                        product_version=self.product_version,
                        build_version=self.build_version,
                        search_metrics=self.search_metrics,
                        resource_metrics=self.resource_metrics)
        if self.extra_metrics is not None:
            jsondict.update(self.extra_metrics)
        return jsondict


class ResultJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if hasattr(obj,'toJSON'):
            return obj.toJSON()
        else:
            return json.JSONEncoder.default(self, obj)


class SearchMetric:
    def __init__(self, name, unit, metric):
        self.name = name
        self.unit = unit
        self.executions = metric['executions']
        self.avg = metric['avg']
        self.min = metric['min']
        self.max = metric['max']

    def toJSON(self):
        return dict(name=self.name,
                    executions=self.executions,
                    unit=self.unit,
                    average=self.avg,
                    minimum=self.min,
                    maximum=self.max)

'''
{
  //source_type = test_case_perf
  "test_name" : "akamai_test_1",
  "test_case_name" : "dashboard_search_1",
  "start_time" : 123456789,
  "end_time" : 987654321,
  "duration" : 12345,
  "category" : "response_time",
  "unit" : "millisecond"
}
'''


class RawResult:
    def __init__(self, thread_id, test_name, test_case_name, unit, start_time, status, end_time=None, duration=None, category=None):
        self.thread_id = thread_id
        self.test_name = test_name
        self.test_case_name = test_case_name
        self.unit = unit
        self.start_time = start_time
        self.end_time = end_time
        self.duration = duration
        if end_time:
            self.duration = end_time - start_time
        self.category = category
        self.status = status

    def toJSON(self):
        return dict(thread_id=self.thread_id,
                    test_name=self.test_name,
                    test_case_name=self.test_case_name,
                    unit=self.unit,
                    start_time=self.start_time,
                    status=self.status,
                    end_time=self.end_time,
                    duration=self.duration,
                    category=self.category)
