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


import copy
import logging
import threading

import solnlib.log as log
from alert_utils.alert_utils_common.metric_collector import metric_util

from . import builder_constant

LOGS = {
    "validation": "ta_builder_validation",
    "field_extraction_validator": "ta_builder_validation",
    "app_cert_validator": "ta_builder_validation",
    "meta_manager": "ta_builder",
    "sourcetype": "ta_builder",
    "utility": "ta_builder",
    "app": "ta_builder",
    "generator": "ta_builder",
    "cim_builder": "ta_builder",
    "input_builder": "ta_builder",
    "setup_builder": "ta_builder",
    "field_extraction_builder": "ta_builder",
    "alert_builder": "ta_builder",
    "global_settings_builder": "ta_builder",
    "modular_alert": "ta_builder",
    "modular_alert_testing": "ta_builder",
    "package_add_on": "package_add_on"
}

g_log_levels = {}
g_loggers = {}
g_logger_lock = threading.Lock()

DEFAULT_LOG_LEVEL = logging.INFO

# set the context of the log
log.Logs.set_context(namespace=builder_constant.ADDON_BUILDER_APP_NAME)

@metric_util.function_run_time(tags=['tab_logger'])
def get_package_add_on_logger(level=DEFAULT_LOG_LEVEL):
    return _get_logger(LOGS.get("package_add_on"), level)

@metric_util.function_run_time(tags=['tab_logger'])
def get_field_extraction_builder_logger(level=DEFAULT_LOG_LEVEL):
    return _get_logger(LOGS.get("field_extraction_builder"), level)


@metric_util.function_run_time(tags=['tab_logger'])
def get_builder_util_logger(level=DEFAULT_LOG_LEVEL):
    return _get_logger(LOGS.get("utility"), level)


@metric_util.function_run_time(tags=['tab_logger'])
def get_meta_manager_logger(level=DEFAULT_LOG_LEVEL):
    return _get_logger(LOGS.get("meta_manager"), level)


@metric_util.function_run_time(tags=['tab_logger'])
def get_validation_logger(level=DEFAULT_LOG_LEVEL):
    return _get_logger(LOGS.get("validation"), level)


@metric_util.function_run_time(tags=['tab_logger'])
def get_field_extraction_validator_logger(level=DEFAULT_LOG_LEVEL):
    return _get_logger(LOGS.get("field_extraction_validator"), level)


@metric_util.function_run_time(tags=['tab_logger'])
def get_app_cert_validator_logger(level=DEFAULT_LOG_LEVEL):
    return _get_logger(LOGS.get("app_cert_validator"), level)


@metric_util.function_run_time(tags=['tab_logger'])
def get_sourcetype_builder_logger(level=DEFAULT_LOG_LEVEL):
    return _get_logger(LOGS.get("sourcetype"), level)


@metric_util.function_run_time(tags=['tab_logger'])
def get_app_instance_logger(level=DEFAULT_LOG_LEVEL):
    return _get_logger(LOGS.get("app"), level)


@metric_util.function_run_time(tags=['tab_logger'])
def get_generator_logger(level=DEFAULT_LOG_LEVEL):
    return _get_logger(LOGS.get("generator"), level)


@metric_util.function_run_time(tags=['tab_logger'])
def get_cim_builder_logger(level=DEFAULT_LOG_LEVEL):
    return _get_logger(LOGS.get("cim_builder"), level)


@metric_util.function_run_time(tags=['tab_logger'])
def get_input_builder_logger(level=DEFAULT_LOG_LEVEL):
    return _get_logger(LOGS.get("input_builder"), level)


@metric_util.function_run_time(tags=['tab_logger'])
def get_setup_builder_logger(level=DEFAULT_LOG_LEVEL):
    return _get_logger(LOGS.get("setup_builder"), level)

@metric_util.function_run_time(tags=['tab_logger'])
def get_modular_alert_builder_logger(level=DEFAULT_LOG_LEVEL):
    return _get_logger(LOGS.get("modular_alert"), level)

@metric_util.function_run_time(tags=['tab_logger'])
def get_modular_alert_testing_logger(level=DEFAULT_LOG_LEVEL):
    return _get_logger(LOGS.get("modular_alert_testing"), level)

@metric_util.function_run_time(tags=['tab_logger'])
def set_log_level(level, name=None):
    if name:
        logger = _get_logger(name)
        logger.setLevel(level)
    else:
        for name in list(LOGS.values()):
            logger = _get_logger(name)
            logger.setLevel(level)


@metric_util.function_run_time(tags=['tab_logger'])
def _get_logger(name, level=logging.INFO):
    with g_logger_lock:
        l = None
        if name in g_loggers:
            l = g_loggers[name]
        else:
            l = log.Logs().get_logger(name)
            g_loggers[name] = l
        lv = g_log_levels.get(name, 10000)
        if level < lv:
            # logging.DEBUG < INFO < WARN < ERROR
            l.setLevel(level)
            g_log_levels[name] = level
        return l


@metric_util.function_run_time(tags=['tab_logger'])
def get_alert_builder_logger(level=DEFAULT_LOG_LEVEL):
    return _get_logger(LOGS.get("alert_builder"), level)


@metric_util.function_run_time(tags=['tab_logger'])
def get_global_settings_builder_logger(level=DEFAULT_LOG_LEVEL):
    return _get_logger(LOGS.get("global_settings_builder"), level)

HIDDEN_FIELDS = ['password', 'credential', 'value']
def hide_sensitive_field(raw):
    if isinstance(raw, dict):
        cloned = dict(raw)
        for k in list(raw.keys()):
            lower_key = k.lower()
            if any([i in lower_key for i in HIDDEN_FIELDS]):
                cloned[k] = '*******'
            else:
                cloned[k] = hide_sensitive_field(cloned[k])
        return cloned
    elif isinstance(raw, list) or isinstance(raw, tuple):
        cloned = [hide_sensitive_field(i) for i in raw]
        return cloned
    return raw
