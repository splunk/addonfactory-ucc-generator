from splunkwebdriver.models.pages import BaseModel
from selenium.webdriver.common.by import By
from splunkwebdriver.models.components.shared import splunkbar
from splunkwebdriver.models.components.shared import appbar
from splunkwebdriver.models.components.shared import drop_down_menu
from splunkwebdriver.models.components.shared import timerangepicker
from splunkwebdriver.models.pages.search import dashboard
from selenium.webdriver.support import wait as webdriver_wait
from selenium.common.exceptions import TimeoutException
from selenium.common.exceptions import NoSuchElementException
from ui import conftest
import pytest

CONFIG = pytest.config


class DrillDownPage(BaseModel):
    '''
    Model for OS Detail page
    '''

    def __init__(self, browser, *args, **kwargs):
        '''
        OSDetailPage Init

        @type browser: WebDriver
        @param browser: WebDriver instance of a Browser driver.
        '''

        super(DrillDownPage, self).__init__(browser, *args, **kwargs)

        # nav bars
        self.splunkbar = splunkbar.Splunkbar(self.browser)
        self.appbar = appbar.AppBar(self.browser)

        self.entity_selector = drop_down_menu.DropDownMenu(
            browser, By.ID, 'entity-context-panel-entity-picker')

        # tabs
        self.objects = {
            'tab_container': {'by': By.ID,
                              'value': 'tabs-container'},
            'section_title': {'by': By.CLASS_NAME,
                              'value': 'section-title'}
        }

        self.timerangepicker = timerangepicker.TimeRangePicker(self.browser)

    def get_tab_label_list(self):
        '''
        Method to get list of existing tabs on UI
        @return type: list
        '''
        self.tab_container = self.browser.find_element(
            **self.objects['tab_container'])
        self.tabs = self.tab_container.find_elements(By.TAG_NAME, 'span')
        return [tab.text for tab in self.tabs]

    def select_entity(self, entity):
        '''
        Method to select entity from dropdown
        @type entity: string
        @param entity: entity name
        '''
        self.entity_selector.open()
        self.browser.find_element(
            By.XPATH, "//ul[@class='select2-results']//div[text()='%x']" % entity).click()

    def wait_for_charts_load_under_tab(self, tab_name, timeout=300, frequency=webdriver_wait.POLL_FREQUENCY):
        '''
        Method to wait for minicharts, panels, tables to render and make sure no alerts present on the page
        @param timeout: time in seconds
        '''

        def _check_elements_rendered(driver):
            '''
            Helper method to get the component element and check if it's
            displayed.

            @type driver: WebDriver
            @param driver: a webdriver instance to find elements with
            '''
            self.key = "_".join((tab_name, CONFIG.DRILL_DOWN_TITLE))
            self.tab_token = conftest.get_info_from_conf("control_token")[self.key]
            elementsToCheck = []
            # check UI elements from the page to determine whether all panels have been rendered
            isAlertsNotPresent = self.is_alerts_and_errors_not_present(self.browser, By.CSS_SELECTOR, "div[data-depends*=%s] div.alert.alert-info" % self.tab_token)
            isErrorsNotPresent = self.is_alerts_and_errors_not_present(self.browser, By.CSS_SELECTOR, "div[data-depends*=%s] div.alert.alert-error" % self.tab_token)
            isMinichartsRendered = self.is_element_rendered(self.browser, By.CSS_SELECTOR, "div#context-panel svg>g.highcharts-series-group")
            isSVGchartsRendered = self.is_element_rendered(self.browser, By.CSS_SELECTOR, "div[data-depends*=%s] svg>g.highcharts-series-group" % self.tab_token)
            isTablesRendered = self.is_element_rendered(self.browser, By.CSS_SELECTOR, "div[data-depends*=%s] .table-chrome" % self.tab_token)
            elementsToCheck.extend((isSVGchartsRendered, isMinichartsRendered, isTablesRendered, isAlertsNotPresent, isErrorsNotPresent))
            return all([elementToCheck is True for elementToCheck in elementsToCheck])

        try:
            self.browser.wait(2)
            webdriver_wait.WebDriverWait(
                self.browser, timeout, frequency).until(
                    _check_elements_rendered)
        except TimeoutException as err:
            self.browser.capture_screenshot()
            msg = ("Panels not rendered after {t} seconds"
                   "".format(t=timeout))
            self.logger.error(msg)
            raise TimeoutException("{m} {e}".format(m=msg, e=err))

    def is_element_rendered(self, browser, by, value):
        '''
        Method used to check if a web element is rendered
        @type browser: WebDriver object
        @param browser: WebDriver object like instance

        @type by: By object from the webdriver common libs
        @param by: By which method is used to locate the webelement

        @type value: string
        @param value: the value of the selector

        @type return: bool
        @param return: True if web element is rendered
                       False if web element is not rendered
        '''
        elements = browser.find_elements(by, value)
        check_results = []
        if elements and len(elements) > 0:
            for element in elements:
                # if is_displayed() raises an error, set result to false
                try:
                    check_results.append(element.is_displayed())
                except:
                    check_results.append(False)
                    continue
            return all([result is True for result in check_results])
        else:
            return True

    def is_alerts_and_errors_not_present(self, browser, by, value):
        '''
        Method used to check if alert web element is not rendered,
        which means charts have been rendered correctly

        @type browser: WebDriver object
        @param browser: WebDriver object like instance

        @type by: By object from the webdriver common libs
        @param by: By which method is used to locate the webelement

        @type value: string
        @param value: the value of the selector

        @type return: bool
        @param return: True if alerts is not rendered
                       False if alerts is rendered
        '''
        elements = browser.find_elements(by, value)
        return bool(len(elements) == 0)
