from splunkwebdriver.models.pages import BaseModel
from selenium.webdriver.common.by import By
from splunkwebdriver.models.components.shared import splunkbar
from splunkwebdriver.models.components.shared import appbar
from splunkwebdriver.models.components.shared import drop_down_menu
from splunkwebdriver.models.components import BaseComponent
from splunkwebdriver.models.html_objects import Anchor
from selenium.webdriver.support import wait as webdriver_wait
from selenium.common.exceptions import TimeoutException
from selenium.common.exceptions import NoSuchElementException
import pytest

CONFIG = pytest.config


class DeepDive(BaseModel):
    '''
    Model for Services page
    '''

    def __init__(self, browser, num_kpi_to_render, *args, **kwargs):
        '''
        ServicesPage Init

        @type browser: WebDriver
        @param browser: WebDriver instance of a Browser driver.
        '''

        super(DeepDive, self).__init__(browser, *args, **kwargs)

        # nav bars
        self.splunkbar = splunkbar.Splunkbar(self.browser)
        self.appbar = appbar.AppBar(self.browser)
        self.wait_for_chart_to_render(num_kpi_to_render)
        self.deep_dive_lane_containers = DeepDiveLaneContainers(self.browser)

    def wait_for_chart_to_render(self, num_kpi_to_render, timeout=120, frequency=webdriver_wait.POLL_FREQUENCY,):

        def _check_svg_rendered(driver):
            '''
            Helper method to get the component element and check if it's
            displayed.

            @type driver: WebDriver
            @param driver: a webdriver instance to find elements with
            '''

            svg_list = self.browser.find_elements(
                by=By.CSS_SELECTOR, value='.deep-dive-lane-chart-primary')
            sparkline_list = self.browser.find_elements(
                by=By.CSS_SELECTOR, value='svg.deep-dive-severity-tile-sparkline-stage')
            alert_div = self.browser.find_elements(by=By.CSS_SELECTOR, value='div.alert-info')
            return len(svg_list) == num_kpi_to_render+1 and len(sparkline_list) > 0 and len(alert_div) == 1 and \
                bool([self.browser.is_webelement_present(svg) for svg in svg_list]) and \
                bool([self.browser.is_webelement_present(sparkline) for sparkline in sparkline_list])

        try:
            self.browser.wait(2)
            webdriver_wait.WebDriverWait(
                self.browser, timeout, frequency).until(
                    _check_svg_rendered)
            self.browser.wait_for_element_visible(
                by=By.CSS_SELECTOR, value='.deep-dive-lane-chart-primary')
            self.browser.wait_for_element_visible(
                by=By.CSS_SELECTOR, value='svg.deep-dive-severity-tile-sparkline-stage')

        except TimeoutException as err:
            self.browser.capture_screenshot()
            msg = ("Component still visible after {t} seconds"
                   "".format(t=timeout))
            self.logger.error(msg)
            raise TimeoutException("{m} {e}".format(m=msg, e=err))


class DeepDiveLaneContainers(BaseComponent):

    def __init__(self, browser, index=0, *args, **kwargs):
        '''
        DeepDiveLaneContainer Init

        @type browser: WebDriver
        @param browser: WebDriver instance of a Browser driver.
        '''
        self.objects = {
            # 'lane-container':{'by':By.CLASS_NAME, 'value':'deep-dive-lane-container'},
        }

        super(DeepDiveLaneContainers, self).__init__(browser, *args, **kwargs)

        self.container = self.browser.find_elements(
            By.CLASS_NAME, "deep-dive-lane-container")[index]
        self.lane_settings_dropdown = drop_down_menu.DropDownMenu(
            self.browser, toggle_by=By.CSS_SELECTOR, toggle_value="a.dropdown-toggle.deep-dive-actions-toggle.active")
        self.lane_body = self.container.find_element(
            By.CLASS_NAME, 'deep-dive-lane-body')

    def get_lane_title_obj(self):
        return self.container.find_element(By.CLASS_NAME, "deep-dive-lane-title")

    def get_lane_title_label(self):
        return self.container.find_element(By.CLASS_NAME, "deep-dive-lane-title").text.strip()

    def click_settings_btn(self):
        self.lane_setting_btn = self.container.find_element(
            By.CSS_SELECTOR, "a.dropdown-toggle.deep-dive-actions-toggle")
        self.lane_setting_btn.click()

    def select_drill_down_option(self, option_dict):
        '''
        Method used to select drill down option from the dropdown
        menu when clicked on a kpi with overlay added
        '''
        self.deep_dive_page = DeepDive(self.browser, CONFIG.num_kpi)
        self.options = option_dict.keys()
        self.deep_dive_page.wait_for_chart_to_render(CONFIG.num_kpi)
        self.dropdown_is_opened = self.browser.is_element_present(By.CSS_SELECTOR, "ul.deep-dive-lane-drilldown-actions")
        if not self.dropdown_is_opened:
            self.browser.hover_over_element(self.lane_body)
            self.lane_body.click()
        self.browser.wait_for_element_visible(
            By.CSS_SELECTOR, "ul.deep-dive-lane-drilldown-actions")
        self.browser.wait_for_text_not_present("Fetching entity drilldowns from server", By.CSS_SELECTOR, "li.deep_dive_action")
        self.drill_down_opts = self.browser.find_elements(By.CSS_SELECTOR, "ul.deep-dive-lane-drilldown-actions li")
        self.drill_down_opts_label_lst = [opt.text.strip() for opt in self.drill_down_opts]
        # Go through each drill down page option defined in deep_dive_drilldowns.conf
        # and find the one that matches the label in the dropdown
        for option in self.options:
            if option in self.drill_down_opts_label_lst:
                self.drill_down_opt = Anchor.Anchor(self.browser, By.XPATH, "//a/span[contains(text(),'" + option + "')]")
                self.drill_down_opt.wait_to_be_visible()
                self.drill_down_opt.click()
                CONFIG.DRILL_DOWN_TITLE = option_dict[option]

    def check_overlay_added(self):
        '''
        Method used to check if lane overlay has been added 
        to current kpi
        '''
        self.browser.hover_over_element(self.lane_body)
        self.lane_body.click()

        try:
            self.no_drilldown_dropdown = self.browser.find_element(
                By.CSS_SELECTOR, '.popdown-dialog-padded')
            self.is_present = self.browser.is_webelement_present(
                self.no_drilldown_dropdown)
            return not(self.is_present)

        except NoSuchElementException as err:
            self.logger.error(err)
            return True
