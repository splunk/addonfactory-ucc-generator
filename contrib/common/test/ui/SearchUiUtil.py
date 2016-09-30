
import sys
import time
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.by import By
from splunkwebdriver.models.components.shared.results_table import ResultsTable
from splunkwebdriver.models.pages.search import search
from UIUtil import UIUtil
from ModalUtil import ModalUtil
from UiIdUtil import UiIdUtil


class FirstTimeTourModal(ModalUtil):
    '''
    This handles the first time tour modal that opens on search page.
    '''

    def __init__(self, browser, logger, by=By.CSS_SELECTOR,
                 value="div.shared-tour-firsttimetourmodal",
                 parent_instance=None, element=None):

        self.logger = logger

        super(FirstTimeTourModal, self).__init__(
            browser=browser, logger=logger, by=by, value=value,
            parent_instance=parent_instance, element=element, timeout=10)

    def click_skip(self):
        '''
        Click the Skip Button.
        '''
        self.click_anchor(
            by=By.CSS_SELECTOR, css_elem="div.shared-tour-firsttimetourmodal a.modal-btn-skip")
        self.browser.wait_for_element_not_visible(
            by=By.CSS_SELECTOR, value="div.shared-tour-firsttimetourmodal", timeout=5)


class SearchUiUtil:

    def __init__(self, logger, browser):
        """
        Constructor of the ESSearchUtil object.
        """
        self.logger = logger
        self.browser = browser

        self.logger.info("sys.path: " + str(sys.path))
        self.uiutil = UIUtil(logger)
        self.search_page = search.Search(
            browser, app="SplunkEnterpriseSecuritySuite")

    def close_tour_modal(self):
        '''
        Skip the Tour Modal.
        '''
        try:
            tour_modal = FirstTimeTourModal(self.browser, self.logger)
            tour_modal.click_skip()
        except:
            pass

    def navigate_to_search(self, browser):

        self.close_tour_modal()
        self.logger.info("In navigate_to_search method")
        """ Click on Search tab"""
        self.uiutil.navigate_to_db(browser, "search")

        self.logger.info("Done navigate_to_search method")

    def input_search_text_and_submit(self, browser, value, timerange=None, timeout=120):
        '''
        Input search text and click submit button.
        '''

        self.close_tour_modal()
        self.logger.info("In enter_search_text method")
        """ Click on Search tab"""
        self.search_page.searchbar.set_value(value)
        if timerange:
            self.search_page.searchbar.timerangepicker.select_preset(timerange)
        self.search_page.searchbar.submit.click()
        try:
            self.search_page.jobstatus.wait_for_job_complete(timeout=timeout)
        except TimeoutException:
            self.search_page.jobstatus.stop.click()
            time.sleep(10)
            self.search_page.jobstatus.wait_for_job_complete()
        self.logger.info("Done enter_search_text method")

    def get_search_text(self, browser):
        '''
        Get the search text.
        '''

        self.close_tour_modal()
        self.logger.info("In get_search_text method")
        """ Click on Search tab"""
        search_string = self.search_page.searchbar.get_value()
        self.logger.info("Done get_search_text method")
        return search_string

    def parse_search_statistics(self, browser):
        '''
        Parse search stats.
        '''

        self.close_tour_modal()
        self.logger.info("In parse_search_results method")
        self.search_page.jobstatus.wait_for_job_complete()
        time.sleep(10)
        try:
            table_text = self.search_page.stats_pane.results_table.get_table_data_matrix()
        except:
            list = self.search_page.statistics_tab.text.split("(")
            self.logger.info(
                "statistics_tab text is '%s'", self.search_page.statistics_tab.text)

            self.logger.info("After first split '%s'", list[1])
            sub_list = list[1].split(')')
            self.logger.info("After Second split '%s'", sub_list[0])
            count = int(sub_list[0].replace(',', ''))
            return count
        return table_text

    def parse_search_events(self, browser, time_out=120, close_tour=True):
        '''
        Parse search events.
        '''

        if close_tour:
            self.close_tour_modal()
        self.logger.info("In parse_search_results method")
        self.search_page.jobstatus.wait_for_job_complete(timeout=time_out)

        try:
            table_text = self.search_page.events_pane.eventsviewer.list.get_table_rows()
        except:
            list = self.search_page.events_tab.text.split("(")
            self.logger.info(
                "events_tab text is '%s'", self.search_page.events_tab.text)
            self.logger.info("After first split '%s'", list[1])
            sub_list = list[1].split(')')
            self.logger.info("After Second split '%s'", sub_list[0])
            count = int(sub_list[0].replace(',', ''))
            return count
        return table_text

    def expand_events(self, browser, index=0):
        '''
        Expand events.
        '''
        return self.search_page.events_pane.eventsviewer.list.get_row(index).expand()

    def select_workflow_actions(self, browser, index=0, workflow_action="Show Source"):
        '''
        Select workflow actions.
        '''

        self.close_tour_modal()
        time.sleep(10)
        self.expand_events(browser, index)
        self.search_page.events_pane.eventsviewer.list.get_row(
            index).eventfield.event_actions.select(workflow_action)

    def select_workflow_field_actions(self, browser, index=1, field_name="src", workflow_action="Show Source"):
        '''
        Select workflow field actions.
        '''

        self.close_tour_modal()
        self.expand_events(browser, index)
        time.sleep(10)

        value = self.search_page.events_pane.eventsviewer.list.get_row(
            index).eventfield.get_field(field_name)['values'][0]
        self.logger.info("Value is  is '%s'", value)

        self.search_page.events_pane.eventsviewer.list.get_row(
            index).eventfield.get_field(field_name)['actions'][0].values()[0].open()
        self.logger.info("Actions menu is opened")
        self.search_page.events_pane.eventsviewer.list.get_row(index).eventfield.get_field(
            field_name)['actions'][0].values()[0].select(workflow_action)

        return value

    def verify_result_count(self, browser, count):
        '''
        Verfiy result count.
        '''

        self.close_tour_modal()
        """ Verify no of events is greater than or equal to count"""
        event_count = self.get_result_count(browser)
        assert event_count >= count

    def verify_search_drill_down(self, browser, search_string=None):
        '''
        Verify search drill down.
        '''

        self.close_tour_modal()
        self.logger.info("In verify_search_drill_down method ")

        count = self.get_search_results_count(browser)
        assert count >= 1

        if (search_string):
            assert search_string in self.search_page.searchbar.value

        return count
        self.logger.info("Done verify_search_drill_down method")

    def verify_auto_pause(self, auto_pause=True, click_do_not_pause_link=False):
        '''
        Auto pause is set to 120 by default, if set to 120 verify the text message
        if auto pause is false, verify the message will not appear. 
        Also check the do not pause link 
        @param auto_pause: True 
        @param click_do_not_pause_link: False 
        '''

        self.close_tour_modal()
        self.logger.info("In verify_auto_pause method ")
        auto_pause_elem = "div.shared-jobstatus div.shared-jobstatus-autopause"
        if not auto_pause:
            self.logger.info("auto pause is false ")
            self.browser.wait_for_element_not_visible(
                By.CSS_SELECTOR, auto_pause_elem, timeout=60)
        else:
            self.logger.info("auto pause is true ")
            self.browser.wait_for_element_visible(
                By.CSS_SELECTOR, auto_pause_elem, timeout=120)
            element = self.browser.find_element_by_css_selector(
                auto_pause_elem)
            assert "Your search will automatically pause" in element.text
            # Click Do Not Pause below the search bar
            if click_do_not_pause_link:
                self.logger.info("click on do not pause ")
                i = 0
                while i < 5:
                    # Wrapping this in a while loop because the pause element changes every second.
                    # Sometimes causes a race condition
                    try:
                        element = self.browser.find_element_by_css_selector(
                            auto_pause_elem)
                        element.find_element_by_tag_name("a").click()
                        break
                    except:
                        i += 1
                time.sleep(30)
                self.browser.wait_for_element_not_visible(
                    By.CSS_SELECTOR, auto_pause_elem, timeout=60)
                assert True

        self.logger.info(" Done verify_auto_pause method ")

    def get_time_to_pause(self):
        ''' 
        Gets the time remaining to pause
        '''
        # self.close_tour_modal()
        self.logger.info("In get_time_to_pause method ")
        auto_pause_elem = "div.shared-jobstatus div.shared-jobstatus-autopause"

        self.browser.wait_for_element_visible(
            By.CSS_SELECTOR, auto_pause_elem, timeout=120)
        element = self.browser.find_element_by_css_selector(
            auto_pause_elem)
        self.logger.info("element text '%s'", element.text)
        time_to_pause = element.text.split(" ")
        self.logger.info("time_to_pause '%s'", time_to_pause[6])
        return time_to_pause[6]
        self.logger.info("Done get_time_to_pause method ")

    def verify_if_paused(self, error_given=None):
        '''
        Check if paused
        '''
        self.close_tour_modal()
        self.logger.info("In verify_if_paused method ")
        if 'assert 0 >= 1' in error_given or error_given == None:
            pause_elem = "div.shared-jobstatus div.shared-jobstatus-count"
            self.browser.wait_for_element_visible(By.CSS_SELECTOR, pause_elem, timeout=140)
            elemen = self.browser.find_element_by_css_selector(pause_elem)
            self.logger.info("element text '%s'", elemen.text)
            assert 'paused' in elemen.text
        else:
            raise

    def get_search_results_count(self, browser, timeout=120, pause=True):
        '''
        Get the search results count.
        '''

        self.close_tour_modal()
        driver = browser.browser
        self.uiutil.switch_window(driver, "Search")
        self.search_page.searchbar.wait_for_component_visible(timeout=120)

        if pause:
            # Handling the case where search is complete before auto-pause
            try:
                self.search_page.jobstatus.wait_for_job_complete(timeout)
            except:
                self.search_page.jobstatus.wait_for_job_pause(timeout)
        else:
            try:
                self.search_page.jobstatus.wait_for_job_complete(timeout)
            except TimeoutException:
                pass

        # Check the tab text contains any number
        time.sleep(2)
        events_tab_text = self.search_page.events_tab.text
        if "(" in events_tab_text:
            list = events_tab_text.split("(")
            self.logger.info(
                "events_tab text is '%s'", events_tab_text)
        else:
            statistics_tab_text = self.search_page.statistics_tab.text
            list = statistics_tab_text.split("(")
            self.logger.info(
                "statistics_tab text is '%s'", statistics_tab_text)

        self.logger.info("After first split '%s'", list[1])
        sub_list = list[1].split(')')
        self.logger.info("After Second split '%s'", sub_list[0])
        count = int(sub_list[0].replace(',', ''))
        return count

    def verify_drill_across(self, browser, search_string,  row_no=1, column_no=1, name="Access Search", value=None):
        '''
        Verify drill cross.
        '''

        self.close_tour_modal()
        self.logger.info("In verify_drill_across method ")
        driver = browser.browser
        time.sleep(10)

        self.uiutil.switch_window(driver, name)

        try:
            self.uiutil.wait_for_full_table_load(browser, '.dashboard-row1')
            self.uiutil.wait_for_full_event_viewer_table_load(
                browser, '.dashboard-row2')
            rows = ResultsTable(
                browser, By.CSS_SELECTOR, UiIdUtil.ROW1_SIMPLERESULTSTABLE1).get_table_data_matrix()
            if (value):
                assert value.lower() in rows[row_no][column_no].text.lower()
        except:
            url = browser.browser.current_url
            self.logger.info("URL '%s'", url)
            assert search_string in url

        self.logger.info("Done verify_drill_across method")

    def get_result_count(self, browser):

        self.close_tour_modal()
        self.logger.info("In get_result_count method")
        no_of_events = browser.wait_for_element_present(
            By.CSS_SELECTOR, "div.JobStatus .splClearfix .complete h2", timeout=100)
        self.logger.info("No Of Events: '%s'", no_of_events.text)
        event_list = no_of_events.text.split(" ")
        event_count = event_list[0].replace(',', '')
        self.logger.info("Done get_result_count method")
        return int(event_count)

    def verify_search_results_grater_than_zero(self, browser, search_string):

        self.close_tour_modal()
        self.input_search_text_and_submit(browser, search_string)
        results = self.parse_search_events(browser)
        if (results):
            try:
                assert len(results) > 0
                self.logger.info("Parsed Event Count: '%s'", len(results))
            except:
                assert results > 0
                self.logger.info("Parsed Result Count: '%s'", results)
