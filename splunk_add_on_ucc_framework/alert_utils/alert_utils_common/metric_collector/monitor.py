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


import threading

from future.utils import with_metaclass
from solnlib import log, pattern

from . import event_writer, memory_event_writer
from .metric_exception import MetricException
from .number_metric_collector import NumberMetricCollector

__all__ = ["Monitor"]

logger = log.Logs().get_logger("metric_collector")


class Monitor(with_metaclass(pattern.Singleton, object)):
    EVENT_WRITERS = {
        "memory": memory_event_writer.MemoryEventWriter,
        "file": event_writer.FileEventWriter,
        "hec": event_writer.FileEventWriter,  # TODO; implement a HEC writer
    }

    def __init__(self):
        self._app = None
        self._ewriter = None
        self._ewriter_type = None
        self.number_metric_collector = None
        self.worker_start_lock = threading.Lock()

    def configure(self, conf, force_update=False):
        """
        conf is a dict.
         -- app: the app name
         -- event_writer: the type of event writer.
         -- writer_config: a dict which contains the configuration for the event writer
        force_update: when this is True, update the config of monitor
        """
        if self.number_metric_collector is not None and force_update is False:
            logger.info("monitor has been initialized.")
            return self

        self._app = conf.get("app", self._app)
        if not self._app:
            raise MetricException("app is not found in configuration object.")

        event_writer = str.lower(conf.get("event_writer", "file"))

        if self._ewriter_type != event_writer:
            if event_writer not in self.EVENT_WRITERS:
                raise MetricException("Unknown event writer type:" + event_writer)
            ewriter_cls = self.EVENT_WRITERS[event_writer]
            writer_config = conf.get("writer_config", {})
            self._ewriter_type = event_writer
            self._ewriter = ewriter_cls(self._app, writer_config)
        else:
            writer_config = conf.get("writer_config", {})
            if self._ewriter:
                self._ewriter.update_config(writer_config)
            else:
                raise MetricException(
                    "event writer type is "
                    + self._ewriter_type
                    + ", while event writer is None."
                )

        if self.number_metric_collector is None:
            self.number_metric_collector = NumberMetricCollector(self._ewriter)
        else:
            self.number_metric_collector.set_event_writer(self._ewriter)
        logger.info(
            "Initialize monitor successfully. app=%s, config:%s", self._app, conf
        )
        return self

    def start(self):
        with self.worker_start_lock:
            if self.number_metric_collector:
                if self.number_metric_collector.is_stopped():
                    self.number_metric_collector.start()
                else:
                    logger.info("Collector thread has been started.")
            else:
                raise ValueError("Monitor is not configued yet.")

    def stop(self):
        if self.number_metric_collector:
            self.number_metric_collector.stop()
            self.number_metric_collector.join()

    def is_stopped(self):
        if self.number_metric_collector:
            return self.number_metric_collector.is_stopped()
        else:
            return True

    def write_event(self, ev, tags=[]):
        if self._ewriter:
            self._ewriter.write_event(ev, tags)

    def register_metric(
        self,
        metric_name,
        metric_type=NumberMetricCollector.SUM_METRIC,
        metric_tags=[],
        max_time_span=10,
    ):
        self.number_metric_collector.register_metric(
            metric_name, metric_type, metric_tags, max_time_span
        )

    def record_metric(self, metric_name, metric_value, metric_timestamp=None):
        if self.number_metric_collector:
            self.number_metric_collector.record_metric(
                metric_name, metric_value, metric_timestamp
            )
