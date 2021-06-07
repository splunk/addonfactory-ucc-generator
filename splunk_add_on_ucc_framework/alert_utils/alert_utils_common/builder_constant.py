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

# encoding = utf-8
from solnlib.splunkenv import make_splunkhome_path

ADDON_BUILDER_APP_NAME = "splunk_app_addon-builder"
ADDON_BUILDER_APP_CATEGORY = "Splunk App Add-on Builder"

# can not use common_util.make_splunk_path here. cylic import
BUILDER_WORKSPACE_ROOT = make_splunkhome_path(
    ['etc', 'apps', ADDON_BUILDER_APP_NAME, 'local', 'builder_workspace'])

# cookie related keys
TA_NAME = 'ta_builder_current_ta_name'
TA_DISPLAY_NAME = 'ta_builder_current_ta_display_name'
TA_WIZARD_STEP = "ta_builder_wizard"
BUILT_FLAG = 'built_by_tabuilder'
COOKIE_KEYS = [TA_NAME, TA_WIZARD_STEP, BUILT_FLAG, TA_DISPLAY_NAME]
COOKIE_EXPIRES_DAY = 30

# data inputs
FIELD_EXTRACTION_MI = "field_extraction_mi"
FIELD_EXTRACTION_MONITOR_MI = "_tab_internal_monitor_inputs_"
VALIDATION_MI = "validation_mi"
VALIDATION_MONITOR_MI = "_tab_internal_monitor_inputs_"

# app inspect
GLOBAL_SETTING_CONF_NAME = "settings"
APP_CERT_STANZA = "app_cert"

# global settings
USR_CREDENTIAL_SETTING = 'credential_settings'
PROXY_SETTING = 'proxy_settings'
LOG_SETTINGS = 'log_settings'
CUSTOMIZED_SETTINGS = 'customized_settings'
CREDENTIAL_SCHEMA = 'default_account'
LOG_SCHEMA = 'default_logging'
PROXY_SCHEMA = 'default_proxy'
CUSTOMIZED_BOOL_SCHEMA = 'bool'
CUSTOMIZED_TEXT_SCHEMA = 'text'
CUSTOMIZED_PASSWORD_SCHEMA = 'password'

CUSTOMIZED_TYPE_MAP = {
    "text": "text",
    "checkbox": "bool",
    "password": "password"
}

# cim mapping settings
CONF_MODELS = "aob_models"
CONF_EVAL_FUNC = "aob_eval_functions"
CONF_CIM_RELATED = ("props.conf", "transforms.conf", "eventtypes.conf", "tags.conf")
CONF_FE_RELATED = ("props.conf", "transforms.conf")

TAB_KO_PREFIX = "aob_gen"

RESERVED_SOURCETYPES = ("splunk:tabuilder:validation",)
