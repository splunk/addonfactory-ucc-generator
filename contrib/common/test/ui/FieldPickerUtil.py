import sys
from UIUtil import UIUtil
from UiIdUtil import UiIdUtil


class FieldPickerUtil:

    def __init__(self, logger):
        """
        Constructor of the FieldPicker object.
        """
        self.logger = logger

        self.logger.info("sys.path: " + str(sys.path))
        self.uiutil = UIUtil(logger)

    def open(self, browser):
        self.uiutil.click_link_by_link_text(
            browser, UiIdUtil.FIELD_PICKER_EDIT_LINK, UiIdUtil.FIELD_PICKER_EDIT_PARENT)

    def search(self, browser, str):
        self.uiutil.input_text_by_css_selector(
            browser, UiIdUtil.FIELD_PICKER_INPUT_TEXT_ID, str)

    def select(self, browser,  table_id):
        self.uiutil.click_first_row_in_table(browser, table_id)

    def save(self, browser):
        self.uiutil.click_link_by_css_selector(
            browser, "button.splButton-primary")
