#
# Copyright 2021 Splunk Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

# encode=utf-8

from builtins import range
from builtins import object
import time


class NumberMetricArregator(object):
    '''
    aggregate the metric with the the second interval.
    for minute and hour aggregate, use splunk to do it.
    '''
    def __init__(self, metric_name, event_writer, metric_tags=None, max_time_span=10):
        '''
        @params: metric_name - a literal string for the metric
        @params: an MetricEventWriter object which flushes the aggregated metric events
        @params: max_time_span - the aggregator creates max_time_span buckets.
                    Assume the metric event delay will not be large than max_time_span seconds.
        '''
        self.m_name = metric_name
        self.m_span = max_time_span
        self.event_writer = event_writer
        self.metric_tags = metric_tags
        self.oldest_metric_time = None
        self.buckets = dict()

    def aggregate_metric(self, record):
        '''
        this method is invoked in the worker thread.
        '''
        if self.oldest_metric_time is None:
            self.oldest_metric_time = record['ts']
        return self._aggregate_metric(record)

    def _aggregate_metric(self, record):
        raise NotImplemented('Children class must implement _aggregate_metric')

    def _format_metric(self, metric):
        raise NotImplemented('Children class must implement _format_metric')

    def get_formatted_metric(self, ts, metric):
        formatted_metric = self._format_metric(metric)
        formatted_metric['time_slot'] = ts
        formatted_metric['metric_name'] = self.m_name
        return formatted_metric

    def _flush_buckets(self, timestamp):
        if self.oldest_metric_time is None:
            return
        low_water_mark = timestamp - self.m_span
        if low_water_mark > self.oldest_metric_time:
            for ts in range(self.oldest_metric_time, low_water_mark):
                metric = self.buckets.get(ts, None)
                if metric:
                    self.event_writer.write_event(self.get_formatted_metric(ts, metric), self.metric_tags)
                    del self.buckets[ts]
            self.oldest_metric_time = low_water_mark

    def flush_all_event(self):
        for ts, metric in list(self.buckets.items()):
            self.event_writer.write_event(self.get_formatted_metric(ts, metric), self.metric_tags)


class NumberMetricSum(NumberMetricArregator):
    '''
    add all the numbers in the same time slot
    '''
    def __init__(self, metric_name, event_writer, metric_tags=None, max_time_span=10):
        super(NumberMetricSum, self).__init__(metric_name, event_writer, metric_tags, max_time_span)

    def _aggregate_metric(self, record):
        ts = record['ts']
        value = record['v']
        bucket_value = self.buckets.get(ts, None)
        if bucket_value is None:
            self.buckets[ts] = {'sum': value}
        else:
            bucket_value['sum'] = bucket_value['sum'] + value
            self.buckets[ts] = bucket_value
        self._flush_buckets(ts)

    def _format_metric(self, metric):
        return {'sum': metric['sum']}

class NumberMetricAverage(NumberMetricArregator):
    '''
    calculate the average number for the metric
    '''
    def __init__(self, metric_name, event_writer, metric_tags=None, max_time_span=10):
        super(NumberMetricAverage, self).__init__(metric_name, event_writer, metric_tags, max_time_span)

    def _format_metric(self, metric):
        return {'avg': float(metric['sum'])/metric['count'], 'max': metric['max'], 'min': metric['min']}

    def _aggregate_metric(self, record):
        ts = record['ts']
        value = record['v']
        bucket_value = self.buckets.get(ts, None)
        if bucket_value is None:
            self.buckets[ts] = {'sum': value, 'count': 1, 'max': value, 'min': value}
        else:
            self.buckets[ts] = {'sum': bucket_value['sum'] + value, 'count': bucket_value['count'] + 1, 'max': value if value > bucket_value['max'] else bucket_value['max'], 'min': value if value < bucket_value['min'] else bucket_value['min']}
        self._flush_buckets(ts)
