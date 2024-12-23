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
import time
import json
import subprocess
from pprint import pprint
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler


def get_gc(path):
    with open(path) as f:
        file = f.read()
        gc = json.loads(file)
    return gc

#  TODO parse config path
old_gc = get_gc(r"/Users/sgoral/Splunk_repos/addonfactory-ucc-generator/tests/testdata/test_addons/package_global_config_everything/globalConfig.json")


class OnMyWatch:
    #  TODO parse directory path
    watchDirectory = r"/Users/sgoral/Splunk_repos/addonfactory-ucc-generator/tests/testdata/test_addons/package_global_config_everything"

    def __init__(self):
        self.observer = Observer()

    def run(self) -> None:
        event_handler = Handler(self.observer)
        self.observer.schedule(event_handler, self.watchDirectory, recursive=True)
        self.observer.start()
        try:
            while True:
                time.sleep(5)
        except:
            self.observer.stop()
            print("Observer Stopped")

        self.observer.join()


class Handler(FileSystemEventHandler):
    def __init__(self, observer):
        self.observer = observer
        self.last_trigger = time.time()

    def on_any_event(self, event) -> None:
        if event.is_directory:
            return None
        if event.src_path.find('~') == -1:
            global old_gc
            print("Watchdog received created event - % s." % event.src_path)
            #  TODO handle different files than globalConfig.json
            new_gc = get_gc(event.src_path)
            if only_meta_changed(old_gc, new_gc):
                pass
            else:
                #  TODO parse package path from console
                #  TODO fix infinite build
                pa = r"/Users/sgoral/Splunk_repos/addonfactory-ucc-generator/tests/testdata/test_addons/package_global_config_everything/package"
                cmd = f"ucc-gen build --source {pa}"
                subprocess.run(cmd, shell=True)

                refresh_addon()

            old_gc = new_gc


def only_meta_changed(old_config: dict, new_config: dict) -> bool:
    changed = set()
    for ok, ov in old_config.items():
        for nk, nv in new_config.items():
            if ok == nk:
                if ov != nv:
                    changed.add(ok)

    if len(changed) == 1 and next(iter(changed)) == "meta":
        return True
    return False


def refresh_addon():
    #  TODO call endpoint https://127.0.0.1:8089/services/apps/local/<addon-name>?refresh=true
    pass


def run_watchdog():
    watch = OnMyWatch()
    watch.run()
