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

from alert_utils.alert_utils_common.metric_collector.event_writer import *


class MemoryEventWriter(MetricEventWriter):
    """
    This class is used to mock a in memory event sink.
    Be careful: all the events are stored in the memory queue
    """

    def __init__(self, app, config):
        super().__init__(app, config)
        max_queue_size = config.get("max_queue_size", 0)
        self.q = queue.Queue(maxsize=max_queue_size)

    def _flush_msg(self, msg):
        self.q.put(msg)

    def pop_msg(self):
        return self.q.get()

    def get_msg_count(self):
        return self.q.qsize()
