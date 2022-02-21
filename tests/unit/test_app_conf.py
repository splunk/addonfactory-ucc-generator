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
import io
from unittest import mock

from splunk_add_on_ucc_framework import app_conf
from tests.unit.helpers import get_testdata_file, get_testdata_file_path


@mock.patch("time.time", mock.MagicMock(return_value=12345))
def test_update():
    app_config = app_conf.AppConf()
    app_config.read(get_testdata_file_path("app.conf"))
    app_config.update(
        "1.0.0",
        "Splunk_TA_UCCExample",
        "Description for Splunk_TA_UCCExample",
        "Title for Splunk_TA_UCCExample",
    )
    app_conf_output = io.StringIO()
    app_config.write(app_conf_output)
    app_conf_expected = get_testdata_file("app.conf.updated")
    assert app_conf_expected == app_conf_output.getvalue()


@mock.patch("time.time", mock.MagicMock(return_value=12345))
def test_update_when_minimal_app_conf():
    app_config = app_conf.AppConf()
    app_config.read(get_testdata_file_path("app.conf.minimal"))
    app_config.update(
        "1.0.0",
        "Splunk_TA_UCCExample",
        "Description for Splunk_TA_UCCExample",
        "Title for Splunk_TA_UCCExample",
    )
    app_conf_output = io.StringIO()
    app_config.write(app_conf_output)
    app_conf_expected = get_testdata_file("app.conf.minimal.updated")
    assert app_conf_expected == app_conf_output.getvalue()
