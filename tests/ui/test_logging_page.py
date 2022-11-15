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

import pytest
from pytest_splunk_addon_ui_smartx.base_test import UccTester
from pytest_splunk_addon_ui_smartx.pages.logging import Logging


@pytest.fixture(autouse=True)
def reset_configuration(ucc_smartx_rest_helper, example_ta):
    yield
    logging = Logging(example_ta["name"], ucc_smartx_rest_helper=ucc_smartx_rest_helper)
    logging.backend_conf.update_parameters(
        {"loglevel": example_ta["default_log_level"]}
    )


class TestLogging(UccTester):
    @pytest.mark.default
    @pytest.mark.logging_page
    def test_logging_default_log_level(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper, example_ta
    ):
        logging = Logging(
            example_ta["name"],
            ucc_smartx_selenium_helper=ucc_smartx_selenium_helper,
            ucc_smartx_rest_helper=ucc_smartx_rest_helper,
        )
        self.assert_util(logging.backend_conf.get_parameter("disabled"), False)
        self.assert_util(logging.log_level.get_value, example_ta["default_log_level"])

    @pytest.mark.default
    @pytest.mark.logging_page
    def test_logging_list_log_levels(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper, example_ta
    ):
        logging = Logging(
            example_ta["name"],
            ucc_smartx_selenium_helper=ucc_smartx_selenium_helper,
            ucc_smartx_rest_helper=ucc_smartx_rest_helper,
        )
        expected_list = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
        self.assert_util(list(logging.log_level.list_of_values()), expected_list)

    @pytest.mark.logging_page
    @pytest.mark.xfail
    def test_logging_required_field_log_level(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper, example_ta
    ):
        logging = Logging(
            example_ta["name"],
            ucc_smartx_selenium_helper=ucc_smartx_selenium_helper,
            ucc_smartx_rest_helper=ucc_smartx_rest_helper,
        )
        logging.log_level.cancel_selected_value()
        self.assert_util(
            logging.save,
            "Field Log level is required",
            left_args={"expect_error": True},
        )

    @pytest.mark.logging_page
    def test_logging_select_random_log_level(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper, example_ta
    ):
        logging = Logging(
            example_ta["name"],
            ucc_smartx_selenium_helper=ucc_smartx_selenium_helper,
            ucc_smartx_rest_helper=ucc_smartx_rest_helper,
        )
        selection_log = set(logging.log_level.list_of_values())
        for log_level in selection_log:
            logging.log_level.select(log_level)
            logging.save()
            self.assert_util(logging.log_level.get_value, log_level)

    @pytest.mark.logging_page
    def test_logging_selected_log_level_frontend(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper, example_ta
    ):
        selection_log = "DEBUG"
        logging = Logging(
            example_ta["name"],
            ucc_smartx_selenium_helper=ucc_smartx_selenium_helper,
            ucc_smartx_rest_helper=ucc_smartx_rest_helper,
        )
        logging.log_level.select(selection_log)
        logging.save()
        self.assert_util(logging.log_level.get_value().lower(), selection_log.lower())

    @pytest.mark.logging_page
    def test_logging_selected_log_level_backend(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper, example_ta
    ):
        selection_log = "ERROR"
        logging = Logging(
            example_ta["name"],
            ucc_smartx_selenium_helper=ucc_smartx_selenium_helper,
            ucc_smartx_rest_helper=ucc_smartx_rest_helper,
        )
        logging.log_level.select(selection_log)
        logging.save()
        log_level = logging.backend_conf.get_parameter("loglevel")
        self.assert_util(log_level, selection_log)
