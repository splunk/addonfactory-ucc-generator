#
# Copyright 2024 Splunk Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
import logging
import subprocess
from splunk_add_on_ucc_framework import watchdog_handler
import os


logger = logging.getLogger("ucc_gen")
internal_root_dir = os.path.dirname(os.path.dirname(__file__))


def set_up_env(splunk_version):
    logger.info(f"Setting up env: {splunk_version}")
    sv = splunk_version if splunk_version else "latest"
    path_to_script = os.path.join(internal_root_dir, "commands", "run_splunk.sh")
    process = subprocess.Popen([path_to_script, sv], text=True, stdout=subprocess.PIPE)
    while True:
        line = process.stdout.readline()
        if not line:
            break
        print(line.rstrip(), flush=True)
    print("Splunk is up! Code monitor is running:")
    watchdog_handler.run_watchdog()
