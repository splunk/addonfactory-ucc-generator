import sys
import time
from selenium.webdriver.common.by import By
from selenium.common.exceptions import TimeoutException
from splunkwebdriver.models.components.data_models import DataModelGrid
from splunkwebdriver.models.components.data_model_explorer import ObjectGrid
from splunkwebdriver.models.components.shared.jobstatus import JobStatus
from splunkwebdriver.models.components.shared.results_table import ResultsTable
from splunkwebdriver.models.components.shared.results_table import ResultsTableHeader
from splunkwebdriver.models.components.shared import CollectionPaginator
from splunkwebdriver.models.components.shared.timerangepicker import TimeRangePicker
from splunkwebdriver.models.pages.search.report import Report
from UiIdUtil import UiIdUtil
from UIUtil import UIUtil


class DmUtil:

    def __init__(self, logger):
        """
        Constructor of the ESSUtil object.
        """
        self.logger = logger
        self.uiutil = UIUtil(logger)
        self.logger.info("sys.path: " + str(sys.path))

    def navigate_to_dm(self, browser, name=UiIdUtil.AUTHENTICATION_DATA_MODEL):
        '''
        Navigate to Data Model.
        '''
        self.logger.info("In navigate_to_dm '%s'", name)

        self.uiutil.wait_for_load_complete(browser, UiIdUtil.DATA_MODEL_GRID)
        if (name > UiIdUtil.NETWORK_TRAFFIC_DATA_MODEL):
            # if the datamodel comes alphabetically after "Network Traffic" go to page 2
            paginator = CollectionPaginator(browser)
            paginator.click_page(2)
            try:
                browser.wait_for_element_visible(
                    By.CSS_SELECTOR, UiIdUtil.DATA_MODEL_GRID, timeout=5)
                time.sleep(2)
            except:
                # If the page click really didn't happen, the error will be caught when
                # we click on the datamodel
                pass

        dm = DataModelGrid(browser)
        dm.click_on_datamodel(name)

        self.uiutil.wait_for_load_complete(browser, UiIdUtil.OBJECT_GRID)

    def expand_object(self, browser, name=UiIdUtil.AUTHENTICATION_DATA_MODEL):
        '''
        Expand data model object.
        '''
        dm_auth_obj = ObjectGrid(browser)
        dm_auth_obj.expand_object(name)
        self.uiutil.wait_for_load_complete(browser, UiIdUtil.OBJECT_FIELD_LIST)

    def collpase_object(self, browser, name=UiIdUtil.AUTHENTICATION_DATA_MODEL):
        '''
        Collapse data model object.
        '''
        dm_auth_obj = ObjectGrid(browser)
        dm_auth_obj.collapse_object(name)

    def click_object(self, browser, obj_id=0, timerange="Last 60 minutes"):
        '''
        Click on data model UI object
        '''
        dm_auth_obj = ObjectGrid(browser)
        dm_auth_obj.wait_for_component_visible()
        obj_id_list = dm_auth_obj.get_object_ids()
        dm_auth_obj.click_object(obj_id_list[obj_id])
        self.logger.info(" Object list : '%s'", obj_id_list[obj_id])

        try:
            if timerange:
                browser.wait_for_element_present(
                    By.CSS_SELECTOR, UiIdUtil.SPLUNK_PIVOT_TIMERANGE_PARENT_ID)
                self.select_timerange_picker(browser, value=timerange)
            JobStatus(browser).wait_for_job_complete(240)
        except TimeoutException as err:
            JobStatus(browser).stop.click()
            browser.capture_screenshot()
            self.logger.info(
                "Object 'complete_label' not visible within 300 seconds Message")

        time.sleep(2)
        self.uiutil.wait_for_load_complete(
            browser, UiIdUtil.DATA_MODEL_CHECK_ICON)
        time.sleep(5)

    def select_timerange_picker(self, browser, value):
        '''
        Select Time range picker.
        '''
        timerangepicker = TimeRangePicker(browser, by=By.CSS_SELECTOR,
                                          value=UiIdUtil.SPLUNK_PIVOT_TIMERANGE_PARENT_ID,
                                          toggle_by=By.CSS_SELECTOR, toggle_value=UiIdUtil.SPLUNK_PIVOT_TIMERANGE_PICKER_ID)
        timerangepicker.select_preset(value)

    def verify_dm_object_results_table(self, browser, column_name):
        '''
        Verify data model results table.
        '''
        header = ResultsTable(
            browser, value=UiIdUtil.DM_OBJECT_TABLE_CLASS).get_table_header_row()
        self.logger.info(" header: '%s'", header.get_attribute('textContent'))
        assert column_name in header.get_attribute('textContent')

        matrix = ResultsTable(
            browser, value=UiIdUtil.DM_OBJECT_TABLE_CLASS).get_table_data_matrix()
        self.logger.info(" matrix length : '%s'", len(matrix))
        self.logger.info(" matrix length : '%s'", matrix[1][0].text)
        # Sometimes untagged data is 0 and sometimes its not
        if ("Untagged" in column_name or "Missing Extractions" in column_name
                or "Missing Uptime Extractions" in column_name
                or "Count of Multimedia" in column_name or "Count of Text" in column_name
                or "Count of DELETE" in column_name or "Count of HEAD" in column_name
                or "Count of Informational" in column_name or "Count of Client Error" in column_name
                or "Count of Server Error" in column_name or "Count of Network" in column_name
                or "Medium Vulnerabilities" in column_name or "Missing Time Synchronization" in column_name
                or "Count of Redirection" in column_name or "Count of Image" in column_name
                or "Count of Update Errors" in column_name or "Count of Untagged Updates" in column_name
                or "Count of Missing Extractions (S.o.S)" in column_name
                or "Count of Untagged Malware Attacks (S.o.S)" in column_name
                or "Count of Facilities" in column_name or "Count of Other Traffic" in column_name
                or "Count of Endpoint Restarts" in column_name):
            assert True
        else:
            assert int(matrix[1][0].text) > 0
        return matrix

    def verify_report_results_table(self, browser, is_events_table=False, header1=None, header2=None, header3=None):
        '''
        old results table verification, use verify_report_results_header
        keeping for backwards compatability
        '''

        # Verify Results Table
        if(is_events_table):
            table_text = ResultsTable(
                browser, value="shared-eventsviewer").get_table_data_matrix()
            assert "Time" in table_text[0][2].text
            assert "Event" in table_text[0][3].text
        else:
            table_text = ResultsTable(
                browser, value="shared-resultstable-lazyresultstable").get_table_data_matrix()
            self.logger.info(" table_text length: '%s'", len(table_text))
            if (header1):
                assert header1 in table_text[0][0].text

            self.logger.info(" header2: '%s'", header2)
            if (header2):
                assert header2 in table_text[0][1].text

            if (header3):
                assert header3 in table_text[0][2].text

        return table_text

    def verify_report_results_header(self, browser, is_events_table=False, expected_header=[]):
        '''
        Verify Results Table
        '''
        if(is_events_table):
            header_row = ResultsTableHeader(browser, by=By.CSS_SELECTOR,
                                            value=".shared-eventsviewer-list > table .shared-eventsviewer-shared-tablehead").get_headers()
            header_row = filter(None, header_row)
            self.logger.info(" header_row: '%s'", header_row)
            assert "Time" in header_row[0]
            assert "Event" in header_row[1]
        else:
            header_row = ResultsTableHeader(browser, by=By.CSS_SELECTOR,
                                            value=".results-table > .table-chrome .shared-resultstable-resultstableheader").get_headers()
            self.logger.info(" header_row: '%s'", header_row)
            fail_message = "Fail: actual header is {actual} while expected header is {exp}"
            assert self._relaxed_string_issubset(expected_header, header_row), fail_message.format(
                actual=header_row, exp=expected_header)

        return header_row

    def verify_report_timerange_picker(self, browser, report, previous_event_count):
        '''
        Verify Timerange Picker
        '''
        self.logger.info(
            " In verify_report_timerange_picker : '%s'", report.timerangepicker)

        def has_results_changed(old_results):
            refreshed_report = Report(browser)
            refreshed_results = refreshed_report.jobstatus.event_count
            self.logger.info(
                "old_results: %d, refreshed_results: %d", old_results, refreshed_results)
            if old_results != refreshed_results:
                return refreshed_results
            else:
                return None

        try:
            old_results = report.jobstatus.event_count
            report.timerangepicker.select_preset("Last 60 minutes")
            self.logger.info("event status: %s", report.jobstatus.event_status)
            browser.wait_for_condition(
                has_results_changed, [old_results], timeout=15)

            event_count_for_60min = report.jobstatus.event_count
            self.logger.info(" event_count : '%d'", event_count_for_60min)
            if (event_count_for_60min is 0):
                event_count_for_60min = self.esutil.get_report_result_count(
                    browser)
                assert event_count_for_60min > 0
            else:
                assert event_count_for_60min < previous_event_count
        except Exception, err:
            self.logger.error(
                "verify_report_timerange_picker exception: '%s'", err)
            assert True

    def _relaxed_string_issubset(self, subset, superset):
        '''
        compares that items in list subset are contained in list superset. Tolerates omitted
        characters (ie ...)
        '''
        subset = list(subset)
        superset = list(superset)
        for target_word in subset:
            if target_word in superset:
                superset.remove(target_word)
                continue
            if '...' in target_word:
                word_splits = self._all_splits('...', target_word)
                found = False
                for dict_word in superset:
                    for split_word in word_splits:
                        if dict_word.startswith(split_word[0]) and dict_word.endswith(split_word[1]):
                            superset.remove(dict_word)
                            found = True
                            break
                    if found:
                        break
                if found:
                    continue
            return False

        return True

    def _all_splits(self, sep, string):
        '''
        returns a list of tuples that contain every possible single split in the string by sep

        >>> all_splits('...', 'a.....b')
        [('a', '..b'), ('a.', '.b'), ('a..', 'b')]
        '''

        index = string.find(sep, 0)
        results = []
        while (index != -1):
            results.append((string[0:index], string[index + 3:]))
            index = string.find(sep, index + 1)
        return results
