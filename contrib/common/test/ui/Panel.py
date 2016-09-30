import sys
import time
from splunkwebdriver.models.components import By
from UIUtil import UIUtil
from UiIdUtil import UiIdUtil
from globalization import Globalization

class Panel(object):
    row_class = 'dashboard-row'
    panel_class = 'dashboard-panel'
    element_class = 'dashboard-element'
    css_ids = [[UiIdUtil.FIRST_ROW_FIRST_DASHBOARD_CELL, UiIdUtil.FIRST_ROW_SECOND_DASHBOARD_CELL,
                UiIdUtil.FIRST_ROW_THIRD_DASHBOARD_CELL],
                [UiIdUtil.SECOND_ROW_FIRST_DASHBOARD_CELL, UiIdUtil.SECOND_ROW_SECOND_DASHBOARD_CELL,
                UiIdUtil.SECOND_ROW_THIRD_DASHBOARD_CELL, UiIdUtil.SECOND_ROW_FOURTH_DASHBOARD_CELL,
                UiIdUtil.SECOND_ROW_FIFTH_DASHBOARD_CELL, UiIdUtil.SECOND_ROW_SIXTH_DASHBOARD_CELL],
                [UiIdUtil.THIRD_ROW_FIRST_DASHBOARD_CELL, UiIdUtil.THIRD_ROW_SECOND_DASHBOARD_CELL,
                UiIdUtil.THIRD_ROW_THIRD_DASHBOARD_CELL, UiIdUtil.THIRD_ROW_FOURTH_DASHBOARD_CELL],
                [UiIdUtil.FOURTH_ROW_FIRST_DASHBOARD_CELL, UiIdUtil.FOURTH_ROW_SECOND_DASHBOARD_CELL, 
                UiIdUtil.FOURTH_ROW_THIRD_DASHBOARD_CELL, UiIdUtil.FOURTH_ROW_FOURTH_DASHBOARD_CELL],
                [UiIdUtil.FIFTH_ROW_FIRST_DASHBOARD_CELL, UiIdUtil.FIFTH_ROW_SECOND_DASHBOARD_CELL, 
                UiIdUtil.FIFTH_ROW_THIRD_DASHBOARD_CELL, UiIdUtil.FIFTH_ROW_FOURTH_DASHBOARD_CELL], 
                [],
                [],
                [UiIdUtil.NINTH_ROW_FIRST_DASHBOARD_CELL],
                [UiIdUtil.TENTH_ROW_FIRST_DASHBOARD_CELL],
                [UiIdUtil.ELEVENTH_ROW_FIRST_DASHBOARD_CELL] ]

    def __init__(self, browser, logger, panel_title=None, row=-1, index=-1, panel_title_tag='h3'):
        self.panel_title = panel_title
        self.panel_row = row
        self.panel_index = index
        self.panel_title_tag = panel_title_tag

        self.browser = browser
        self.logger = logger
        self.uiutil = UIUtil(self.logger)

    def get_panel_element(self):
        '''
        Wait for this panel to load and return it
        '''
        return self.browser.wait_for_element_present(By.CSS_SELECTOR, self.get_css_id())

    def get_css_id(self, elementId=None):
        '''
        Returns the CSS id of this Panel
        '''
        row = self.get_row()
        index = self.get_index()

        if elementId:
            return self.css_ids[row][index] + " #" + elementId
        else:
            return self.css_ids[row][index]

    @staticmethod
    def get_panel_css_id(row=0, index=0):
        '''
        Returns the CSS id of a specified Panel
        '''
        return Panel.css_ids[row][index]

    def get_title(self):
        '''
        Get the title of this panel by using this panel's row/index if it wasn't initially specified
        @rtype: str
        @return: this panel's title
        '''
        if self.panel_title is None:
            # Calculate the panel_title using row/index and set it
            # May still be None after trying to look for it (Search pages don't have titles)
            # don't check for self.get_row() < 0, that will cause a loop
            if self.panel_row < 0 or self.panel_index < 0:
                self.logger.info("panel_row or panel_index was < 0")
            else:
                self.logger.info("Using row/index to find title of panel")
                # self.get_panel_element()
                self.browser.wait_for_element_present(
                    By.CSS_SELECTOR, self.get_css_id())
                rows = self.browser.find_elements(
                    By.CLASS_NAME, self.row_class)
                panels_in_row = rows[self.panel_row].find_elements(
                    By.CLASS_NAME, self.panel_class)
                self.panel_title = panels_in_row[self.panel_index].find_element(
                    By.TAG_NAME, self.panel_title_tag).text
                self.logger.info("Found title of panel: %s", self.panel_title)
        return self.panel_title

    def get_row(self):
        '''
        Finds the panel's row by using self.get_title()
        @rtype: int
        @return: this panel's row
        '''
        if self.panel_row is -1:
            time.sleep(10)
            # Calculate row and set it
            row_list = self.browser.find_elements(
                By.CLASS_NAME, self.row_class)
            for i, row in enumerate(row_list):
                panels_in_row = row.find_elements(
                    By.CLASS_NAME, self.panel_class)
                panel_index_in_row = self.title_index_in_panels(panels_in_row)
                if panel_index_in_row >= 0:
                    self.panel_index = panel_index_in_row
                    self.panel_row = i
                    break
        return self.panel_row

    def get_index(self):
        '''
        Finds the panel's index on its row by using self.get_title()
        @rtype: int
        @return: this panel's index
        '''
        if self.panel_index is -1:
            # Calculate index from within this panel's get_row()
            row_list = self.browser.find_elements(
                By.CLASS_NAME, self.row_class)
            panels_in_row = row_list[self.get_row()].find_elements(
                By.CLASS_NAME, self.panel_class)
            index = self.title_index_in_panels(panels_in_row)
            if index >= 0:
                self.panel_index = index
        return self.panel_index

    def title_index_in_panels(self, panels):
        '''
        Searches through a list of panels for the one with this panel's get_title()

        @type: list of elements
        @param: list of panel elements to search through

        @rtype: int
        @return: this panel's index in the given list of panels
        '''
        for i, panel in enumerate(panels):
            if len(panel.find_elements(By.TAG_NAME, self.panel_title_tag)) > 0:
                title = panel.find_element(
                    By.TAG_NAME, self.panel_title_tag).text
                if title == self.get_title():
                    return i
        return -1
    
    def is_title_globalized(self):
        '''
        Verify if title is globalized.
        '''
        panel_globalized = Globalization(self.browser, self.logger)
        panel_globalized.is_text_globalized(self.get_title())
        
    def wait_for_page_load(self, browser, all_panels):
        '''
        Verify all panels in the list of tuples are loaded
        '''
        for (row, index) in all_panels:
            self.uiutil.wait_for_event_viewer_table_load_complete2(browser, self.css_ids[row][index])