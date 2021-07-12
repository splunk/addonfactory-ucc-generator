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

import queue
import threading
import time

from solnlib import log

from . import metric_aggregator
from .metric_exception import MetricException

__all__ = ["NumberMetricCollector"]

logger = log.Logs().get_logger("metric_collector")


class AggregatorWorker(threading.Thread):
    def __init__(self, collector):
        super().__init__(name="AggregatorWorker")
        self.daemon = True
        self.collector = collector
        self.metric_aggregators = dict()

    def run(self):
        logger.info("Start aggregator worker.")
        stop = False
        while not stop:
            stop = self.collector.process()
        self.collector.flush_all_event()


class NumberMetricCollector:
    SUM_METRIC = "sum"
    AVG_METRIC = "avg"

    def __init__(self, event_writer):
        self.event_writer = event_writer
        self.record_queue = queue.Queue()
        self.aggregators = dict()
        self.worker = None

    def set_event_writer(self, ew):
        self.event_writer = ew

    def is_stopped(self):
        if self.worker is None:
            return True
        else:
            return not self.worker.is_alive()

    def register_metric(
        self, metric_name, metric_type=SUM_METRIC, metric_tags=[], max_time_span=10
    ):
        if metric_name in self.aggregators:
            raise MetricException("metric {} has been registered.".format(metric_name))
        if metric_type == self.AVG_METRIC:
            self.aggregators[metric_name] = metric_aggregator.NumberMetricAverage(
                metric_name, self.event_writer, metric_tags, max_time_span
            )
        elif metric_type == self.SUM_METRIC:
            self.aggregators[metric_name] = metric_aggregator.NumberMetricSum(
                metric_name, self.event_writer, metric_tags, max_time_span
            )
        else:
            raise MetricException("Metric type {} is unsupported.".format(metric_type))

    def record_metric(self, metric_name, metric_value, metric_timestamp=None):
        if metric_name not in self.aggregators:
            raise MetricException(
                "metric {} is not registered yet.".format(metric_name)
            )
        if metric_timestamp is None:
            metric_timestamp = int(time.time())
        self.record_queue.put(
            {
                "type": "metric",
                "ts": metric_timestamp,
                "v": metric_value,
                "n": metric_name,
            }
        )

    def start(self):
        if self.is_stopped() == False:
            raise RuntimeError("collector worker has been started.")
        if self.worker:
            raise RuntimeError("Worker thread is stopped, but the worker is not None.")
        self.worker = AggregatorWorker(self)
        self.worker.start()

    def stop(self, graceful=True):
        self.record_queue.put({"type": "stop"})
        if graceful:
            self.join()
        self.worker = None

    def join(self):
        if self.worker:
            self.worker.join()

    def process(self):
        """
        the entry point for the worker thread
        """
        is_stop = False
        skip_metrics = []
        record = None
        try:
            record = self.record_queue.get(timeout=1)
        except queue.Empty:
            pass
        if record:
            if record["type"] == "stop":
                is_stop = True
            else:
                metric_name = record["n"]
                self.aggregators[metric_name].aggregate_metric(record)
                skip_metrics.append(metric_name)
        self._flush_events(skip_metrics)
        return is_stop

    def _flush_events(self, skip_metrics=[]):
        ts = int(time.time())
        for k, aggr in list(self.aggregators.items()):
            if k in skip_metrics:
                continue
            aggr._flush_buckets(ts)

    def flush_all_event(self):
        for k, v in list(self.aggregators.items()):
            v.flush_all_event()
