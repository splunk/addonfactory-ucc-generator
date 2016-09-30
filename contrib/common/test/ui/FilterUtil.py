import sys
import time
from customcontrols import ToggleInputView
from selenium.webdriver.common.by import By
from splunkwebdriver.models.html_objects.Textarea import Textarea
from splunkwebdriver.models.html_objects.Select import Select
from splunkwebdriver.models.html_objects.Input import Checkbox
from splunkwebdriver.models.modules.search.TimeRangePicker import TimeRangePicker
from splunkwebdriver.models.pages.search.dashboard import PanelElement
from splunkwebdriver.models.splunkjs.mvc.simpleform.input import Dropdown, Text
from UIUtil import UIUtil
from UiIdUtil import UiIdUtil


class FilterUtil(object):

    def __init__(self, logger):
        """
        Constructor of the FilterUtil object.
        """
        self.logger = logger

        self.logger.info("sys.path: " + str(sys.path))
        self.uiutil = UIUtil(logger)

    def select_timerange_picker(self, browser, parent_css_id, value):
        '''
        Select value from timerange picker.
        '''
        timerangepicker = TimeRangePicker(
            browser, by=By.CSS_SELECTOR, value=UiIdUtil.SPLUNK_MODULE_TIMERANGE_PICKER_ID, parent_by=By.CSS_SELECTOR, parent_value=parent_css_id)
        timerangepicker.select(value)

    def set_input_text_filter(self, browser, text_css_id, value):
        '''
        Set value of input text filter.
        '''
        text_filter = Textarea(browser.browser, By.CSS_SELECTOR, text_css_id)
        text_filter._set_value(value)

    def set_drop_down_filter(self, browser, drop_down_css_id, option_value, index=0, parent_value=None):
        '''
        Set value to a drop-down filter.
        '''
        self.logger.info("In set_drop_down_filter  '%s", option_value)
        select_elem = Dropdown(
            browser=browser, by=By.CSS_SELECTOR, value=drop_down_css_id)
        select_elem.select(option_value)
        time.sleep(1)

    def set_popup_drop_down_filter(self, browser, drop_down_css_id, option_value, index=0, parent_value=None):
        '''
        Set value of a popup drop-down filter.
        '''
        self.logger.info("In set_popup_drop_down_filter  '%s", option_value)

        drop_down = browser.wait_for_element_present(
            By.CSS_SELECTOR, drop_down_css_id, timeout=100)
        drop_down.click()

        time.sleep(5)
        expanded_results = browser.find_elements_by_css_selector(
            ".select2-drop-active .select2-results")
        self.logger.info(
            "length of expanded_results '%s' index is '%s'", len(expanded_results), index)
        option_list = expanded_results[
            len(expanded_results) - 1].find_elements_by_tag_name("li")
        self.logger.info("length of options '%s", len(option_list))

        for i in range(len(option_list)):
            if (option_value in option_list[i].text):
                option_list[i].click()
                break

    def set_toggle_input_view(self, browser, dropdown_css=None, dropdown_val=None, text_css=None, text=None):
        '''
        Set dropdown and text values of a ToggleInputView
        '''
        if dropdown_css and dropdown_val:
            toggle_dropdown = ToggleInputView.ToggleInputView(browser, by=By.CSS_SELECTOR, value=dropdown_css)
            toggle_dropdown.select(dropdown_val)
        if text_css and text:
            toggle_input = Text(browser, by=By.CSS_SELECTOR, value=text_css)
            toggle_input.value = text

    def get_filter_text(self, browser, filter_text_css_id):
        '''
        Returns the text of the specified filter. Requires the css_id to point to the filter text
        '''
        filter_text = browser.wait_for_element_present(
            By.CSS_SELECTOR, filter_text_css_id, timeout=100).text
        return filter_text

    def clear_drop_down_filter(self, browser, css_id):
        '''
        Cleaar value from a drop-down filter.
        '''
        self.logger.info("In clear_drop_down_filter ")

        drop_down = Dropdown(browser=browser, by=By.CSS_SELECTOR, value=css_id)
        drop_down.clear_selection()
        self.logger.info("Done clear_drop_down_filter ")

    def set_checkbox_filter(self, browser, checkbox_css_id):
        '''
        checks/unchecks the Checkbox
        '''
        checkbox_filter = Checkbox(
            browser.browser, By.CSS_SELECTOR, checkbox_css_id)
        checkbox_filter.check()

    def select_filter(self, browser, pull_down_css_id, value=None, index=0):
        '''
        Select value from a filter.
        '''
        drop_down_css_id = pull_down_css_id + " select"
        option_css_id = pull_down_css_id + " select "
        open_css_id = pull_down_css_id + " span.ui-combobox a span"
        expanded_menu_css_id = "ul.ui-autocomplete.ui-menu"

        select_filter = browser.wait_for_element_present(
            By.CSS_SELECTOR, open_css_id, timeout=20)
        select_filter.click()

        drop_down_list = browser.find_elements(
            By.CSS_SELECTOR, expanded_menu_css_id)
        option_list = drop_down_list[index].find_elements_by_tag_name("li")

        for i in range(len(option_list)):
            if (value in option_list[i].text):
                option_value = option_list[i].find_element(By.TAG_NAME, 'a')
                option_value.click()
                browser.wait_for_element_not_visible(
                    By.CSS_SELECTOR, expanded_menu_css_id, timeout=100)
                self.logger.info(
                    "option value selected '%s'", option_list[i].text)

    def select(self, browser, css_id, option_value):
        '''
        Select a value.
        '''
        pull_down_css_id = "div#" + css_id
        selector = Select(browser.browser, By.CSS_SELECTOR, pull_down_css_id)
        selector.select(option_value)

    def get_empty_results_message(self, browser, parent):
        '''
        Get message from empty filter.
        '''
        self.logger.info("In get_empty_results_message method")
        css_elem2 = parent + " .progress-animation"
        message_parent = browser.wait_for_element_present(
            By.CSS_SELECTOR, parent, timeout=200)

        i = 10
        while (i > 0):
            animation = message_parent.find_elements(
                By.CSS_SELECTOR, css_elem2)
            if len(animation) > 0:
                break
            else:
                i = i - 1
                time.sleep(5)

        browser.wait_for_element_not_visible(
            By.CSS_SELECTOR, css_elem2, timeout=200)
        message = browser.wait_for_element_present(
            By.CSS_SELECTOR, "div.splunk-message-container",  message_parent, timeout=50)
        self.logger.info(
            "In get_empty_results_message - message text '%s'", message.text)
        return message.text

    def get_empty_results_message_atd(self, browser, parent):
        '''
        Get message without results.
        '''
        message_parent = browser.wait_for_element_present(
            By.CSS_SELECTOR, parent, timeout=300)
        time.sleep(60)
        message = browser.wait_for_element_present(
            By.CSS_SELECTOR, "p.resultStatusMessage.empty_results",  message_parent, timeout=50)

        return message.text

    def click_search_btn(self, browser):
        '''
        Click search button.
        '''
        self.logger.info("In click_search_btn method")

        self.uiutil.click_link_by_css_selector(
            browser, "div.splunk-submit-button button.btn-primary")

        time.sleep(20)
        self.logger.info("Done click_search_btn method")

    def click_search_btn_old(self, browser):
        '''
        Click old search button.
        '''
        self.logger.info("In click_search_btn_old method")
        self.uiutil.click_link_by_css_selector(browser, "input.searchButton")
        time.sleep(60)
        self.logger.info("Done click_search_btn_old method")

    def click_ppf_update_btn(self, browser):
        '''
        Click Per-panel filtering update button.
        '''
        self.logger.info("In click_ppf_update_btn method")
        self.uiutil.click_link_by_css_selector(
            browser, "button.btn.btn-primary")
        self.logger.info("Done click_ppf_update_btn method")

    def click_open_in_search_panel_btn(self, browser, element):
        '''
        Click Open in search panel button.
        '''
        self.logger.info("In click_ppf_update_btn method")
        panel = PanelElement(
            browser, By.CSS_SELECTOR, value=element + " .dashboard-element ")
        panel.wait_to_finish_loading()

        panel.hover_over_search_button()
        panel.click_search_button()
        self.logger.info("Done click_ppf_update_btn method")
