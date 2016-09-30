from UIUtil import UIUtil
from splunkwebdriver.models.html_objects import Anchor
from pages import Deep_Dive
from modals import ModuleModal
from selenium.webdriver.common.by import By
import random
import pytest
from ui import conftest
from splunkwebdriver.models.html_objects import Table
from pages.Lister_Base import ListerBasePage
CONFIG = pytest.config


class ModuleUIUtils(UIUtil):
    '''
    UI Utils Class for ITSI Modules
    '''

    SERVICE_NAME             = conftest.get_info_from_conf("service_name")
    DRILL_DOWN_OPT_DICT      = conftest.get_info_from_conf("drill_down_opt_dict")

    def __init__(self, logger):
        """
        Constructor of the ModuleUIUtils object.
        """
        self.logger = logger

        UIUtil.__init__(self, logger)

    def navigate_to_service_detail_from_service_analyzer(self, browser, serviceName):
        '''
        Function to simulate workflow to navigate to service detail from service analyzer 

        @type browser: WebDriver object
        @param browser: WebDriver object instance

        @type serviceName: string
        @param module: name of the service to run against

        '''
        browser.wait_for_element_visible(
            By.XPATH, "//div[@class='service-health-tiles']//span[text()='%s']" % serviceName)
        CONFIG.num_kpi = self.filter_kpis_based_on_service_name(browser, serviceName)
        service_tile = browser.find_element(By.XPATH, "//div[@class='service-health-tiles']//span[text()='%s']" % serviceName)
        service_tile.click()

    def navigate_to_deep_dive_from_service_analyzer(self, browser, serviceName):
        '''
        Function to simulate workflow to navigate to deep dive from service analyzer 

        @type browser: WebDriver object
        @param browser: WebDriver object instance

        @type serviceName: string
        @param module: name of the service to run against

        '''
        browser.wait_for_element_visible(
            By.XPATH, "//div[@class='service-health-tiles']//span[text()='%s']" % serviceName)
        CONFIG.num_kpi = self.filter_kpis_based_on_service_name(browser, serviceName)
        service_tile = browser.find_element(By.XPATH, "//div[@class='service-health-tiles']//span[text()='%s']" % serviceName)
        service_icon = browser.find_element(
            By.XPATH, "//div[contains(@class,'service-health-tiles')]//span[text()='%s']/../../../preceding-sibling::*/i" % serviceName)
        browser.hover_over_element(service_tile)
        service_icon.click()
        drill_btn = Anchor.Anchor(
            browser, By.CLASS_NAME, 'severity-tiles-selection-drilldown')
        drill_btn.click()

    def add_lane_overlay(self, browser, parent_instance):
        '''
        Function to add lane overlay on a specific KPI in deep dive page 

        @type browser: WebDriver object
        @param browser: WebDriver object instance

        @type parent_instance: webelement object
        @param parent_instance: a reference to the parent object.
                                for this to be useful, parent needs to be
                                a webelement object

        '''
        lane_title_obj = parent_instance.get_lane_title_obj()
        browser.hover_over_element(lane_title_obj)
        parent_instance.click_settings_btn()
        lane_settings_dropdown = parent_instance.lane_settings_dropdown
        lane_settings_dropdown.select("Lane Overlay Options")
        self._enable_overlay(browser, True, parent_instance)

    def _enable_overlay(self, browser, value, parent_instance):
        '''
        Private function to interact with add lane overlay modal from UI

        @type browser: WebDriver object
        @param browser: WebDriver object instance
        
        @type value: boolean
        @param value: True -- enable, False -- disable

        @type parent_instance: webelement object
        @param parent_instance: a reference to the parent object.
                                for this to be useful, parent needs to be
                                a webelement object

        '''
        laneOverlayOpts_modal = ModuleModal.ModuleModal(browser, self.logger, By.ID,
                                                        'undefinedlane_overlay_options_modal')
        browser.wait(3)
        browser.wait_for_element_visible(
            By.CSS_SELECTOR, '.btn[data-value=no]')
        browser.wait_for_element_visible(
            By.CSS_SELECTOR, '.btn[data-value=yes]')

        if value is True:
            laneOverlayOpts_modal.click_button(
                By.CSS_SELECTOR, '.btn[data-value=yes]')

        else:
            laneOverlayOpts_modal.click_button(
                By.CSS_SELECTOR, '.btn[data-value=no]')

        laneOverlayOpts_modal.entity_table.wait_to_be_visible()

        laneOverlayOpts_modal.click_button(By.CLASS_NAME, 'modal-btn-primary')

        browser.wait_for_element_not_visible(By.CLASS_NAME, 'modal-btn-primary')

        self.navigate_to_drill_down(browser, parent_instance)

    def navigate_to_drill_down(self, browser, parent_instance):
        '''
        Function to click on deep dive drilldowns option

        @type browser: WebDriver object
        @param browser: WebDriver object instance

        @type parent_instance: webelement object
        @param parent_instance: a reference to the parent object.
                                for this to be useful, parent needs to be
                                a webelement object

        '''
        browser.wait_for_element_not_visible(By.CLASS_NAME, 'icon-alert')
        parent_instance.select_drill_down_option(self.DRILL_DOWN_OPT_DICT)

    def get_url(self, browser, nav_option='deep_dive'):
        '''
        Function to navigate to drill down page and return the url of drill down page
        to be used by other test cases

        @type browser: WebDriver object
        @param browser: WebDriver object instance

        @type nav_option: string
        @param nav_option: 'deep_dive'     -- navigate to drill down through deep dive page
                           'entity_health' -- navigate to drill down through entity health page
        '''
        if nav_option == 'deep_dive':
            self.navigate_to_url(browser, 'app/itsi')
            self.main_window = browser.current_window_handle
            self.navigate_to_deep_dive_from_service_analyzer(browser, self.SERVICE_NAME)
            self.navigate_to_drill_down_from_deep_dive(browser)
            self.switch_window(browser, CONFIG.DRILL_DOWN_TITLE)
        elif nav_option == 'entity_health':
            self.navigate_to_url(browser, 'app/itsi/entities_lister')
            self.main_window = browser.current_window_handle
            self.navigate_to_entity_health(browser, self.SERVICE_NAME)
            self.navigate_to_drill_down_from_entity_health(browser)
            self.switch_window(browser, CONFIG.DRILL_DOWN_TITLE)
        else:
            raise 'Invalid nav_option. Please specify nav_option to either deep_dive or entity_health'
        browser.wait(3)
        current_url = browser.current_url
        return current_url.replace(current_url.split('app')[0], '')

    def filter_kpis_based_on_service_name(self, browser, serviceName):
        '''
        Function to only show kpis under a specific service in Service Analyzer page

        @type browser: WebDriver object
        @param browser: WebDriver object instance

        @type serviceName: string
        @param module: name of the service to run against

        '''
        kpi_setting_btn = Anchor.Anchor(browser, By.CSS_SELECTOR, '.kpi-health-container a.severity-tiles-config')
        kpi_setting_btn.click()
        kpi_filter_modal = ModuleModal.ModuleModal(browser, self.logger, By.XPATH, "//*[contains(@class, 'kpifiltermodalview')]")
        service_checkbox = Anchor.Anchor(browser, By.XPATH, "//*[text() = '%s']/..//a" % serviceName)
        service_checkbox.wait_to_be_visible()
        service_checkbox.click()
        kpi_table = Table.Table(browser, By.CSS_SELECTOR, "table.table-chrome tbody")
        kpi_table.wait_to_be_visible()
        num_kpi = len(kpi_table.get_table_rows())
        kpi_filter_modal.click_button(By.CLASS_NAME, 'modal-btn-primary')
        browser.wait_for_element_not_visible(By.CLASS_NAME, 'modal-btn-primary')
        
        def _verify_kpi_tiles():
            '''
            helper function to verify kpi tiles are actually displayed
            '''
            element = browser.find_element(By.CSS_SELECTOR, "div.kpi-health-data div.total-btn")
            return element.is_displayed()

        browser.wait_for_condition(_verify_kpi_tiles)
        return num_kpi

    def navigate_to_deep_dive_from_service_detail(self, browser):
        '''
        Function to simulate workflow to navigate to deep dive from service detail page 

        @type browser: WebDriver object
        @param browser: WebDriver object instance

        @type serviceName: string
        @param module: name of the service to run against

        '''
        open_depp_dive_btn = Anchor.Anchor(browser, By.CLASS_NAME, "service-detail-kpi-table-deep-dive-drilldown")
        open_depp_dive_btn.wait_to_be_visible()
        open_depp_dive_btn.click()

    def navigate_to_drill_down_from_deep_dive(self, browser):
        '''
        Function to simulate workflow to navigate to drill down from deep dive page

        @type browser: WebDriver object
        @param browser: WebDriver object instance

        '''
        deep_dive_page = Deep_Dive.DeepDive(browser, CONFIG.num_kpi)
        deep_dive_page.wait_for_chart_to_render(CONFIG.num_kpi)
        browser.wait(3)
        kpi_index = random.randint(1, CONFIG.num_kpi)
        deep_dive_lane_container = Deep_Dive.DeepDiveLaneContainers(browser, index=kpi_index)
        browser.scroll_element_into_view(deep_dive_lane_container.container)
        CONFIG.current_kpi = deep_dive_lane_container.get_lane_title_label()
        if deep_dive_lane_container.check_overlay_added() is True:

            self.navigate_to_drill_down(browser, deep_dive_lane_container)

        else:
            self.add_lane_overlay(browser, deep_dive_lane_container)

    def navigate_to_entity_health(self, browser, serviceName):
        '''
        Function to simulate workflow to navigate to entity health page

        @type browser: WebDriver object
        @param browser: WebDriver object instance

        @type serviceName: string
        @param module: name of the service to run against

        '''
        entity_name = self._get_entity_name_by_service(browser, serviceName)
        entity_lister_page = ListerBasePage(browser)
        entity_lister_page.view_health_page(entity_name)

    def navigate_to_drill_down_from_entity_health(self, browser):
        '''
        Function to simulate workflow to navigate to drill down from entity health page

        @type browser: WebDriver object
        @param browser: WebDriver object instance

        '''
        drill_down_link = Anchor.Anchor(browser, By.CSS_SELECTOR, "div.entity-detail-links-view a")
        drill_down_link.wait_to_be_visible()
        CONFIG.DRILL_DOWN_TITLE = drill_down_link.text
        drill_down_link.click()

    def _get_entity_name_by_service(self, browser, serviceName):
        '''
        Helper function to get the first entity's name assigned to the specified service 

        @type browser: WebDriver object
        @param browser: WebDriver object instance

        @type serviceName: string
        @param module: name of the service to run against

        '''
        entity_row = Table.TableRow(browser, By.XPATH, "//tr//td[contains(text(),'%s')]/.." % serviceName)
        # print "entity health on entity: %s" % entity_row.get_table_data_for_column(2).text
        return entity_row.get_table_data_for_column(2).text
    