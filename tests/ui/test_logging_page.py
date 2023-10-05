import pytest
from pytest_splunk_addon_ui_smartx.base_test import UccTester
from pytest_splunk_addon_ui_smartx.pages.logging import Logging

from tests.ui import constants as C

DEFAULT_LOG_LEVEL = "INFO"


@pytest.fixture
def reset_configuration(ucc_smartx_rest_helper):
    yield
    logging = Logging(C.ADDON_NAME, ucc_smartx_rest_helper=ucc_smartx_rest_helper)
    logging.backend_conf.update_parameters({"loglevel": DEFAULT_LOG_LEVEL})


class TestLoggingPage(UccTester):
    @pytest.mark.logging
    def test_logging_default_log_level(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        logging = Logging(
            C.ADDON_NAME,
            ucc_smartx_selenium_helper=ucc_smartx_selenium_helper,
            ucc_smartx_rest_helper=ucc_smartx_rest_helper,
        )
        self.assert_util(logging.backend_conf.get_parameter("disabled"), False)
        self.assert_util(logging.log_level.get_value, DEFAULT_LOG_LEVEL)

    @pytest.mark.logging
    def test_logging_list_log_levels(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        logging = Logging(
            C.ADDON_NAME,
            ucc_smartx_selenium_helper=ucc_smartx_selenium_helper,
            ucc_smartx_rest_helper=ucc_smartx_rest_helper,
        )
        expected_list = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
        self.assert_util(list(logging.log_level.list_of_values()), expected_list)

    @pytest.mark.logging
    def test_logging_select_random_log_level(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper, reset_configuration
    ):
        logging = Logging(
            C.ADDON_NAME,
            ucc_smartx_selenium_helper=ucc_smartx_selenium_helper,
            ucc_smartx_rest_helper=ucc_smartx_rest_helper,
        )
        selection_log = set(logging.log_level.list_of_values())
        for log_level in selection_log:
            logging.log_level.select(log_level)
            logging.save()
            self.assert_util(logging.log_level.get_value, log_level)

    @pytest.mark.logging
    def test_logging_selected_log_level_frontend_backend(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper, reset_configuration
    ):
        selection_log = "DEBUG"
        logging = Logging(
            C.ADDON_NAME,
            ucc_smartx_selenium_helper=ucc_smartx_selenium_helper,
            ucc_smartx_rest_helper=ucc_smartx_rest_helper,
        )
        logging.log_level.select(selection_log)
        logging.save()
        self.assert_util(logging.log_level.get_value().lower(), selection_log.lower())
        log_level = logging.backend_conf.get_parameter("loglevel")
        self.assert_util(log_level, selection_log)

    @pytest.mark.logging
    def test_logging_label_log_level(
        self,
        ucc_smartx_selenium_helper,
        ucc_smartx_rest_helper,
    ):
        """
        Verifies the label of log level
        """
        logging = Logging(  # noqa: F811
            C.ADDON_NAME,
            ucc_smartx_selenium_helper=ucc_smartx_selenium_helper,
            ucc_smartx_rest_helper=ucc_smartx_rest_helper,
        )
        self.assert_util(logging.log_level.get_input_label, "Log level")
