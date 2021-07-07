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

import json
import logging
import logging.handlers
import re

import splunk.rest as rest
from splunk.util import normalizeBoolean


class InvalidResultID(Exception):
    pass


class ModularAction:
    def __init__(self, settings, logger, action_name="unknown"):
        self.settings = json.loads(settings)
        self.logger = logger
        self.session_key = self.settings.get("session_key")
        self.sid = self.settings.get("sid")
        ## if sid contains rt_scheduler with snapshot-sid; drop snapshot-sid
        ## sometimes self.sid may be an integer (1465593470.1228)
        try:
            rtsid = re.match(r"^(rt_scheduler.*)\.\d+$", self.sid)
            if rtsid:
                self.sid = rtsid.group(1)
        except:
            pass
        self.orig_sid = ""
        self.rid = ""
        self.orig_rid = ""
        self.results_file = self.settings.get("results_file")
        self.search_name = self.settings.get("search_name")
        self.app = self.settings.get("app")
        self.user = self.settings.get("user") or self.settings.get("owner")
        self.configuration = self.settings.get("configuration", {})
        ## enforce configuration is a 'dict'
        if not isinstance(self.configuration, dict):
            self.configuration = {}
        ## set loglevel to DEBUG if verbose
        if normalizeBoolean(self.configuration.get("verbose", "false")):
            self.logger.setLevel(logging.DEBUG)
            self.logger.debug("loglevel set to DEBUG")
        ## use | sendalert param.action_name=$action_name$
        self.action_name = self.configuration.get("action_name") or action_name
        ## use search_name to determine action_mode
        if self.search_name:
            self.action_mode = "saved"
        else:
            self.action_mode = "adhoc"

        self.action_status = ""
        ## Since we don't use the result object we get from settings it will be purged
        try:
            del self.settings["result"]
        except Exception:
            pass

    ## The purpose of this method is to populate the job variable with the contents from REST (/services/search/jobs/<sid>)
    ## SPL-112815 - sendalert - not all $job.<param>$ parameters come through
    def addjobinfo(self):
        self.job = {}
        if self.sid:
            try:
                response, content = rest.simpleRequest(
                    "search/jobs/%s" % self.sid,
                    sessionKey=self.session_key,
                    getargs={"output_mode": "json"},
                )
                if response.status == 200:
                    self.job = json.loads(content)["entry"][0]["content"]
                    self.logger.info(
                        self.message("Successfully retrieved search job info")
                    )
                    self.logger.debug(self.job)
                else:
                    self.logger.warn(self.message("Could not retrieve search job info"))
            except Exception as e:
                self.logger.warn(self.message("Could not retrieve search job info"))

    ## The purpose of this method is to provide a common messaging interface
    def message(self, signature, status=None):
        message = "sendmodaction - "
        message_params = {
            "signature": signature or "",
            "action_name": self.action_name or "",
            "search_name": self.search_name or "",
            "sid": self.sid or "",
            "orig_sid": self.orig_sid or "",
            "rid": self.rid or "",
            "orig_rid": self.orig_rid or "",
            "app": self.app or "",
            "user": self.user or "",
            "action_mode": self.action_mode or "",
            "action_status": status or self.action_status or "",
        }
        for k, v in message_params.items():
            # Do not include empty value params in the message.
            if v != "":
                message += f'{k}="{v}" '
        return message.rstrip()

    ## The purpose of this method is to update per-result ModAction attributes
    def update(self, result):
        ## This is for events/results that were created as the result of a previous action
        self.orig_sid = result.get("orig_sid", "")
        ## This is for events/results that were created as the result of a previous action
        self.orig_rid = result.get("orig_rid", "")
        if "rid" in result:
            self.rid = result["rid"]
        else:
            raise InvalidResultID("Result must have an ID")

    ## The purpose of this method is to generate per-result invocation messages
    def invoke(self):
        self.logger.info(self.message("Invoking modular action"))

    def dowork(self):
        return
