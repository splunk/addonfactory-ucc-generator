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


import csv
import gzip
import sys

try:
    from splunk.clilib.bundle_paths import make_splunkhome_path
except ImportError:
    from splunk.appserver.mrsparkle.lib.util import make_splunkhome_path
sys.path.append(make_splunkhome_path(["etc", "apps", "Splunk_SA_CIM", "lib"]))

from solnlib.log import Logs

from .cim_actions import ModularAction


class ModularAlertBase(ModularAction):
    def __init__(self, alert_name):
        self._alert_name = alert_name
        # self._logger_name = "modalert_" + alert_name
        self._logger_name = alert_name + "_modalert"
        self._logger = Logs().get_logger(self._logger_name)
        super().__init__(sys.stdin.read(), self._logger, alert_name)

    def log_error(self, msg):
        self._logger.error(msg)

    def log_info(self, msg):
        self._logger.info(msg)

    def log_debug(self, msg):
        self._logger.debug(msg)

    def get_param(self, param_name):
        return self.configuration.get(param_name)

    def dowork(self, result):
        raise NotImplemented()

    def run(self, argv):
        if len(argv) < 2 or argv[1] != "--execute":
            msg = 'Error: argv="{}", expected="--execute"'.format(argv)
            print(msg, file=sys.stderr)
            sys.exit(1)

        try:
            with gzip.open(self.results_file, "rb") as rh:
                for num, result in enumerate(csv.DictReader(rh)):
                    result.setdefault("rid", str(num))
                    self.update(result)
                    self.dowork(result)
        except Exception as e:
            self._logger.error(self.message(e, "failure"))
            self._logger.exception("exception=")
            sys.exit(2)
