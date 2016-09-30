import sys
import time
from selenium.common.exceptions import StaleElementReferenceException

from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from splunkwebdriver.models.components.shared.jschart import JSChart
from splunkwebdriver.models.components.shared.splunkbar import Splunkbar
from selenium.webdriver.common.action_chains import ActionChains


class UIUtil:

    '''
    UI Util Class.
    '''

    def __init__(self, logger):
        """
        Constructor of the UIUtil object.
        """
        self.logger = logger

        self.logger.info("sys.path: " + str(sys.path))

    ##########################################################################

    def navigate_to_db(self, browser, name="access_flashtimeline", i8n=False, i8n_lang='en-DEBUG'):
        '''
        Navigate to a dashboard.
        '''

        self.logger.info("In navigate_to_db '%s'", name)
        i8nlang = 'en-US'
        
        if i8n:
            i8nlang = i8n_lang

        url_list = browser.browser.current_url.split(i8nlang, 1)
        self.logger.debug("url_list Logging in..." + url_list[0])
        browser.browser.get(
            url_list[0] + i8nlang +'/app/SplunkEnterpriseSecuritySuite/' + name)

    ##########################################################################

    def navigate_to_url(self, browser, url, i8n=False, i8n_lang='en-DEBUG'):
        '''
        Navigate to any Splunk URL.
        '''
        self.logger.info("in navigate_to_url..." + browser.browser.current_url)
        driver = browser.browser
        current_url = driver.current_url
        to_url = url
        i8nlang = 'en-US'

        if i8n:
            """
            1. Replace en-US with en-DEBUG.
            2. Navigate to en-DEBUG URL.
            """
            current_url = current_url.replace('en-US', i8n_lang)
            i8nlang = i8n_lang
            driver.get(current_url)
            to_url = to_url.replace('en-US', i8n_lang)

        self.logger.info("currentl_url..." + driver.current_url)
        url_list = driver.current_url.split(i8nlang, 1)
        self.logger.info("url_list Logging in..." + url_list[0] + to_url)
        driver.get(url_list[0] + to_url)
        browser.maximize_window()

    ##########################################################################

    def click_link_by_link_text(self, browser, link_text, from_css=None):
        '''
        Click a Link be link text.
        '''

        self.logger.info("In click_link_by_link_text method, '%s'", link_text)

        # Click on Select All link
        if (from_css == None):
            link = browser.wait_for_element_present(
                By.LINK_TEXT, link_text, timeout=30)
        else:
            parent = browser.wait_for_element_present(
                By.CSS_SELECTOR, from_css, timeout=30)
            link = browser.wait_for_element_present(
                By.LINK_TEXT, link_text, parent, timeout=15)

        link.click()
        self.logger.info("Done click_link_by_link_text method")

    ##########################################################################

    def get_href_by_link_text(self, browser, link_text):
        '''
        Get the linked URL from a link text.
        '''

        self.logger.info("In get_link_by_link_text method, '%s'", link_text)

        # Click on Select All link
        link = browser.wait_for_element_present(
            By.LINK_TEXT, link_text, timeout=100)
        href_value = link.get_attribute("href")
        self.logger.info("Done get_link_by_link_text method '%s'", href_value)
        return href_value

    ##########################################################################

    def click_link_by_partial_link_text(self, browser, link_text):
        '''
        Click a link by partial link text.
        '''

        self.logger.info(
            "In click_link_by_partial_link_text method, '%s'", link_text)

        # Click on Select All link
        link = browser.wait_for_element_present(
            By.PARTIAL_LINK_TEXT, link_text, timeout=100)
        link.click()
        self.logger.info("Done click_link_by_partial_link_text method")

    ##########################################################################

    def click_link_by_css_selector(self, browser, css_selector):
        '''
        Click any Link using css selector.
        '''

        self.logger.info(
            "In click_link_by_css_selector method, '%s'", css_selector)

        # Click on Select All link
        link = browser.wait_for_element_present(
            By.CSS_SELECTOR, css_selector, timeout=60)
        check = browser.wait_for_element_visible(
            By.CSS_SELECTOR, css_selector, timeout=60)
        link.click()

        self.logger.info("Done click_link_by_css_selector method")

    ##########################################################################

    def submit_button_by_css_selector(self, browser, css_selector):
        '''
        Click on submit role button using css selector. 
        '''

        self.logger.info(
            "In submit_button_by_css_selector method, '%s'", css_selector)
        btn = browser.wait_for_element_present(
            By.CSS_SELECTOR, css_selector, timeout=100)
        btn.submit()
        self.logger.info("Done submit_button_by_css_selector method")

    ##########################################################################

    def input_click_by_css_selector(self, browser, css_selector):
        '''
        Click on a Text Box using css selector.
        '''

        self.logger.info(
            "In input_click_by_css_selector method, '%s'", css_selector)
        input = browser.wait_for_element_present(
            By.CSS_SELECTOR, css_selector, 100)
        input.send_keys(Keys.RETURN)
        self.logger.info("Done input_click_by_css_selector method")

    ##########################################################################

    def input_text_by_css_selector(self, browser, css_selector, value):
        '''
        Input text into a text box using css selector.
        '''

        self.logger.info(
            "In input_text_by_css_selector method, '%s'", css_selector)
        input = browser.wait_for_element_present(
            By.CSS_SELECTOR, css_selector, timeout=100)
        input.send_keys(value)
        self.logger.info("Done input_text_by_css_selector method")

    ##########################################################################

    def input_text_by_css_selector_click_enter(self, browser, css_selector, value):
        '''
        Input text into a text box and press enter.
        '''

        self.logger.info(
            "In input_text_by_css_selector_click_enter method, '%s'", css_selector)
        input = browser.wait_for_element_present(
            By.CSS_SELECTOR, css_selector, timeout=100)
        input.clear()
        input.send_keys(value)
        input.send_keys(Keys.RETURN)
        time.sleep(2)
        self.logger.info("Done input_text_by_css_selector_click_enter method")

    ##########################################################################

    def get_text_by_css_selector(self, browser, css_selector, parent_elem=None):
        '''
        Get text from any text box having css selector.
        '''

        self.logger.info(
            "In get_text_by_css_selector method, '%s'", css_selector)
        if (parent_elem == None):
            input = browser.wait_for_element_present(
                By.CSS_SELECTOR, css_selector, timeout=200)
        else:
            parent = browser.wait_for_element_present(
                By.CSS_SELECTOR, parent_elem, timeout=100)
            input = browser.wait_for_element_present(
                By.CSS_SELECTOR, css_selector, parent, timeout=200)

        content = input.text
        self.logger.info("Done get_text_by_css_selector method '%s'", content)
        return content

    ##########################################################################

    def get_color_by_css_selector(self, browser, css_selector, parent_elem=None):
        '''
        Get color of an element of css selector.
        '''

        self.logger.info(
            "In get_color_by_css_selector method, '%s'", css_selector)
        if (parent_elem == None):
            input = browser.wait_for_element_present(
                By.CSS_SELECTOR, css_selector, timeout=200)
        else:
            parent = browser.wait_for_element_present(
                By.CSS_SELECTOR, parent_elem, timeout=100)
            input = browser.wait_for_element_present(
                By.CSS_SELECTOR, css_selector, parent, timeout=200)

        color = input.value_of_css_property('color')
        self.logger.info("Done get_color_by_css_selector method '%s'", color)
        return color

    ##########################################################################

    def is_element_present_by_partial_link_text(self, browser, link_text):
        '''
        Find if an element is present on UI by css selector.
        '''

        self.logger.info("In is_element_present_by_partial_link_text method")
        result = browser.is_element_present(By.PARTIAL_LINK_TEXT, link_text)

        self.logger.info("Done is_element_present_by_partial_link_text method")
        return result

    ##########################################################################

    def get_pager_links(self, browser, css_selector):
        '''
        Get the links of a pagination control.
        '''

        parent = browser.wait_for_element_present(
            By.CSS_SELECTOR, css_selector, timeout=100)

        browser.wait_for_element_present(
            By.TAG_NAME, "li", parent, timeout=100)
        links = parent.find_elements_by_tag_name("a")
        return links

    ##########################################################################

    def navigate_to_pagex(self, browser, value):
        '''
        Click page x of a pagination.
        '''

        self.click_link_by_link_text(browser, value)

    ##########################################################################

    def get_table_rows(self, browser, table_name):
        '''
        Get Rows of table.
        '''

        browser.wait_for_element_visible(
            By.CSS_SELECTOR, table_name, timeout=200)
        table = browser.wait_for_element_present(
            By.CSS_SELECTOR, table_name, timeout=200)

        browser.wait_for_element_present(By.TAG_NAME, "tr", table, timeout=100)
        rows = table.find_elements_by_tag_name("tr")
        return rows

    ##########################################################################

    def is_text_in_table(self, browser, table, text, td_no=0, column_text=None):
        '''
        Find if text exists in table.
        '''

        rows = self.get_table_rows(browser, table)
        self.logger.info("No of rows '%s'", len(rows))
        for i in range(len(rows)):

            columns = rows[i].find_elements_by_tag_name("td")
            if (len(columns) > 0):

                column_value = columns[td_no].text

                if ((td_no > 0) and (column_text is not None)):
                    self.logger.info("No of columns '%s'", len(columns))
                    column_value = columns[0].text
                    if ((text in column_value) and (column_text in columns[td_no].text)):
                        self.logger.info("Text is present in the table")
                        return True

                elif(text in column_value):
                    self.logger.info("Text is present in the table")
                    return True

        return False

    ##########################################################################

    def is_column_header_in_table(self, browser, table, column_header):
        '''
        Find if column header is in table.
        '''

        rows = self.get_table_rows(browser, table)
        self.logger.info("No of rows '%s'", len(rows))
        header_list = rows[0].find_elements_by_tag_name("th")
        for i in range(len(header_list)):
            if (column_header in header_list[i].text):
                return True

        return False

    ##########################################################################

    def click_row_in_table(self, browser, table, status_name, column_text=None, td_no=0):
        '''
        Click a row in a table.
        '''

        rows = self.get_table_rows(browser, table)
        self.logger.info("No of rows '%s'", len(rows))
        for i in range(len(rows)):

            columns = rows[i].find_elements_by_tag_name("td")
            if (len(columns) > 0):
                column_value = columns[0].text
                if (status_name in column_value):
                    if column_text is None:
                        column_text = status_name

                    """ Some times the td element is not a link text, then use css selector"""
                    try:
                        link = browser.wait_for_element_present(
                            By.LINK_TEXT, column_text, columns[td_no], timeout=20)

                    except:
                        link = browser.wait_for_element_present(
                            By.CSS_SELECTOR, column_text, timeout=20)

                    link.click()
                    return True

        return False

    ##########################################################################

    def click_first_row_in_table(self, browser, table, td_no=0):
        '''
        Click the first row in a table.
        '''

        rows = self.get_table_rows(browser, table)
        self.logger.info("No of rows '%s'", len(rows))
        for i in range(len(rows)):

            columns = rows[i].find_elements_by_tag_name("td")
            if (len(columns) > 0):
                self.logger.info("Click on row='%s' ", i)
                columns[td_no].click()
                return

    ##########################################################################

    def select_first_row_in_table(self, browser, table, input_no=0):
        '''
        Select the first row in a table.
        '''

        rows = self.get_table_rows(browser, table)
        self.logger.info("No of rows '%s'", len(rows))
        for i in range(len(rows)):

            inputs = rows[i].find_elements_by_tag_name("input")
            if (len(inputs) > 0):
                self.logger.info("Click on row='%s' ", i)
                inputs[input_no].click()
                return

    ##########################################################################

    def select_first_two_rows_in_table(self, browser, table, input_no=0):
        '''
        Select the first two rows in a table.
        '''

        rows = self.get_table_rows(browser, table)
        self.logger.info("No of rows '%s'", len(rows))
        count = 0
        for i in range(len(rows)):

            inputs = rows[i].find_elements_by_tag_name("input")
            if (len(inputs) > 0):
                self.logger.info("Click on row='%s' ", i)
                inputs[input_no].click()
                count = count + 1
                if (count == 2):
                    return

    ##########################################################################

    def click_row_column_in_table(self, browser, table, row_no=0, column_no=0):
        '''
        Click a row and a column in a table.
        '''

        rows = self.get_table_rows(browser, table)
        self.logger.info("No of rows '%s'", len(rows))
        columns = rows[row_no].find_elements_by_tag_name("td")
        if (len(columns) > 0):
            columns[column_no].click()
            return

    ##########################################################################

    def get_text_from_table(self, browser, table, row_no=0, column_no=0):
        '''
        Get text from a particular row and column of a table.
        '''

        rows = self.get_table_rows(browser, table)
        self.logger.info("No of rows '%s'", len(rows))
        columns = rows[row_no].find_elements_by_tag_name("td")
        if (len(columns) > 0):
            self.logger.info("column text '%s'", columns[column_no].text)
            return columns[column_no].text

    ##########################################################################

    def switch_window(self, driver, title):
        '''
        Switch to the given window of Title = title.
        '''

        self.logger.info("In switch_window - Title '%s'", title)

        handles = driver.window_handles
        self.logger.info(
            "In switch_window - length of handles '%s'",  len(handles))

        if (len(handles) == 1):
            driver.switch_to_window(handles[0])
            self.logger.info(
                "One window hanble to switch to: '%s'", driver.title)
        else:
            self.logger.info("No Of Handles: '%s'", len(handles))
            i = 0
            for i in range(len(handles)):
                given_title = title.split("|")[0].replace(" ", "")
                driver_title = driver.title.split("|")[0].replace(" ", "")
                self.logger.info(
                    "given_title: '%s'  driver_title: '%s'", given_title, driver_title)
                if given_title != driver_title:
                    driver.switch_to_window(handles[i])
                    self.logger.info("Switched to - Title '%s'", driver.title)

        self.logger.info("Switched to Browser Window: '%s'", driver.title)

    ##########################################################################

    def switch_tab(self, driver):
        '''
        Switch to the given tab of a browser.
        '''

        self.logger.info("In switch_tab - index")

        ActionChains(driver).key_down(Keys.CONTROL).send_keys(
            Keys.TAB).key_up(Keys.CONTROL).perform()

        self.logger.info("Switched to Browser Tab: ")

    ##########################################################################

    def switch_to_iframe(self, browser):
        '''
        Switch to an iframe in the webpage. 
        '''

        self.logger.info("In switch_to_iframe ")

        browser.wait_for_element_visible(
            By.TAG_NAME, "iframe", timeout=150)
        driver = browser.browser
        driver.switch_to_frame(driver.find_element_by_tag_name("iframe"))
        self.logger.info("Done switch_to_iframe ")

    ##########################################################################

    def get_notification_message_from_splunk_menu(self, browser):
        '''
        Get the notification messages from Splunk.
        '''

        Splunkbar(browser).messages.open()
        self.logger.info("Done wait_for_load_complete method")
        text = Splunkbar(browser).messages.get_messages()
        return text

    ##########################################################################

    def get_notification_message(self, browser, parent="div#Message_0_0_0"):
        '''
        Get notification message.
        '''

        message_parent = browser.wait_for_element_present(By.CSS_SELECTOR, parent, timeout=120)

        message = browser.wait_for_element_present(
            By.CSS_SELECTOR, "ol.MessageList", message_parent, timeout=50)

        return message.text

    ##########################################################################

    def get_notification_message2(self, browser, parent="div.Message li"):
        '''
        Get notification message.
        '''

        message = browser.wait_for_element_present(
            By.CSS_SELECTOR, parent, timeout=300)

        return message.text

    ##########################################################################

    def select_option(self, browser, css_selector, option, by=By.CSS_SELECTOR):
        dropdown_menu = browser.wait_for_element_present(
            by, css_selector, timeout=100)
        dropdown_menu.click()
        option_list = dropdown_menu.find_elements_by_tag_name("option")

        for i in range(len(option_list)):
            if option in option_list[i].text:
                self.logger.info(
                    "In option_list[i].text '%s'", option_list[i].text)
                option_list[i].click()
                text = browser.browser.execute_script(
                    "return navigator.userAgent", "")
                self.logger.info("browser infor '%s'", text)
                if ('Chrome' not in text):
                    ActionChains(browser.browser).key_down(
                        Keys.ENTER).perform()
                break

    ##########################################################################

    def wait_for_load_complete(self, browser, element_css):
        '''
        Wait for an element to complete loading.
        '''

        self.logger.info("In wait_for_load_complete method")
        browser.wait_for_element_present(
            By.CSS_SELECTOR, element_css, timeout=200)
        browser.wait_for_element_visible(
            By.CSS_SELECTOR, element_css, timeout=200)
        self.logger.info("Done wait_for_load_complete method")

    ##########################################################################

    def wait_for_chart_visible(self, browser, chart_css_id):
        '''
        Wait for chart element to be visible.
        '''

        self.logger.info("In wait_for_chart_visisble method")
        jschart = JSChart(browser, By.CSS_SELECTOR, chart_css_id)
        jschart.wait_for_chart_visible()
        self.logger.info("Done wait_for_chart_visisble method")

    ##########################################################################

    def wait_for_full_chart_load(self, browser, parent):
        '''
        Wait for full chart to complete loading.
        '''

        self.logger.info("In wait_for_full_chart_load method")
        self.wait_for_chart_load_complete(browser, parent)
        self.logger.info("Done wait_for_full_chart_load method")

    ##########################################################################

    def wait_for_full_table_load(self, browser, parent):
        '''
        Wait for full table to complete loading.
        '''

        self.logger.info("In wait_for_full_table_load method")
        self.wait_for_table_load_complete(browser, parent)
        self.logger.info("Done wait_for_full_table_load method")

    ##########################################################################

    def wait_for_table_load_complete(self, browser, parent):
        '''
        Wait for a table to complete loading.
        '''
        time.sleep(2)
        self.logger.info("In wait_for_table_load_complete method")
        try:
            self.click_submit_button(browser)
        except:
            self.logger.info(" submit_button not found")

        css_elem2 = parent + " .progress-animation"
        css_elem1 = parent + " .splunk-table"
        self.logger.info("Waiting for '%s'", css_elem1)
        browser.wait_for_element_visible(
            By.CSS_SELECTOR, css_elem1, timeout=100)
        browser.wait_for_element_not_visible(
            By.CSS_SELECTOR, css_elem2, timeout=100)
        message_elem = parent + " .splunk-message-container"
        browser.wait_for_element_not_visible(
            By.CSS_SELECTOR, css_elem2, timeout=100)
        browser.wait_for_element_not_present(
            By.CSS_SELECTOR, message_elem, timeout=30)

        self.logger.info("In wait_for_table_load_complete method")

    ##########################################################################

    def wait_for_partial_table_load(self, browser, parent):
        '''
        Wait for partial table to complete loading.
        '''

        self.logger.info("In wait_for_partial_table_load method")
        css_elem = parent + " .shared-resultstable-resultstableheader"
        css_elem1 = parent + " .splunk-timeindicator"
        css_elem2 = parent + " .progress-animation"
        self.logger.info("Waiting for '%s'", css_elem)
        browser.wait_for_element_visible(
            By.CSS_SELECTOR, css_elem, timeout=300)
        self.logger.info("In wait_for_partial_table_load method")

    ##########################################################################

    def wait_for_chart_load_complete(self, browser, parent):
        '''
        Wait for chart to complete loading.
        '''

        self.logger.info("In wait_for_chart_load_complete method")

        self.logger.info("in wait_for_chart_load_complete parent " + parent)
        css_elem2 = parent + " .progress-animation"
        message_elem = parent + " .splunk-message-container"
        browser.wait_for_element_present(
            By.CSS_SELECTOR, css_elem2, timeout=60)
        self.logger.info("After element present  .progress-animation")
        browser.wait_for_element_not_visible(
            By.CSS_SELECTOR, css_elem2, timeout=200)

        results_truncated_text = parent + " div.alert"
        try:
            if (browser.is_element_present(By.CSS_SELECTOR, results_truncated_text)):
                if ("These results may be truncated" in browser.find_element_by_css_selector(results_truncated_text).text):
                    self.logger.info("Waiting for chart to load completely")
                    time.sleep(60)
        except StaleElementReferenceException, NoSuchElementException:
            pass

        assert not 'No results found' in \
                   browser.wait_for_element_present(
                       By.CSS_SELECTOR, message_elem, timeout=20).text
        self.logger.info("Done wait_for_chart_load_complete method")

    ##########################################################################

    def wait_for_full_table_load_with_no_results(self, browser, parent):
        '''
        Wait for table with no results to load.
        '''
        self.logger.info("In wait_for_full_load method")
        self.click_submit_button(browser)
        css_elem = parent + " .splunk-table"
        css_elem2 = parent + " .progress-animation"
        self.logger.info("Waiting for '%s'", css_elem)
        browser.wait_for_element_visible(
            By.CSS_SELECTOR, css_elem, timeout=200)
        browser.wait_for_element_not_visible(
            By.CSS_SELECTOR, css_elem2, timeout=300)
        time.sleep(10)
        self.logger.info("Done wait_for_full_load method")

    ##########################################################################

    def wait_for_full_chart_load_with_no_results(self, browser, parent):
        '''
        Wait for full chart with no results to load.
        '''

        self.logger.info("In wait_for_full_chart_load_with_no_results method")
        css_elem = parent + " .splunk-chart"

        css_elem2 = parent + " .progress-animation"
        browser.wait_for_element_visible(
            By.CSS_SELECTOR, css_elem, timeout=200)
        browser.wait_for_element_not_visible(
            By.CSS_SELECTOR, css_elem2, timeout=300)
        time.sleep(10)
        self.logger.info(
            "Done wait_for_full_chart_load_with_no_results method")

    ##########################################################################

    def wait_for_full_event_viewer_table_load_with_no_results(self, browser, parent):
        '''
        Wait for events viewer table with no results to load.
        '''

        self.logger.info(
            "In wait_for_full_event_viewer_table_load_with_no_results method")
        self.click_submit_button(browser)
        css_elem = parent + " .splunk-events-viewer"
        css_elem2 = parent + " .progress-animation"
        self.logger.info("Waiting for '%s'", css_elem)
        browser.wait_for_element_visible(
            By.CSS_SELECTOR, css_elem, timeout=200)
        browser.wait_for_element_not_visible(
            By.CSS_SELECTOR, css_elem2, timeout=300)
        time.sleep(10)
        self.logger.info(
            "Done wait_for_full_event_viewer_table_load_with_no_results method")

    ##########################################################################

    def wait_for_full_event_viewer_table_load(self, browser, parent):
        '''
        Wait for full event viewer table to load.
        '''

        self.logger.info("In wait_for_full_event_viewer_table_load method")
        self.wait_for_event_viewer_table_load_complete(browser, parent)
        self.logger.info("Done wait_for_full_event_viewer_table_load method")

    ##########################################################################

    def wait_for_event_viewer_table_load_complete(self, browser, parent):
        '''
        Wait for  event viewer table to complete loading.
        '''

        self.logger.info("In wait_for_event_viewer_table_load_complete method")
        try:
            self.click_submit_button(browser)
        except:
            self.logger.info(" submit_button not found")
        css_elem = parent + " .shared-eventsviewer"

        css_elem2 = parent + " .progress-animation"
        self.logger.info("Waiting for '%s'", css_elem)
        try:
            browser.wait_for_element_visible(
                By.CSS_SELECTOR, css_elem, timeout=60)
        except:
            browser.wait_for_element_visible(
                By.CSS_SELECTOR, css_elem2, timeout=60)
            self.logger.info(
                "Progress animation present, Event Viewer table takes long time to load")

        try:
            browser.wait_for_element_not_visible(
                By.CSS_SELECTOR, css_elem2, timeout=60)
        except:
            self.logger.info("Event Viewer table takes long time to load")

        self.logger.info("In wait_for_event_viewer_table_load_complete method")

    ##########################################################################

    def wait_for_event_viewer_table_load_complete2(self, browser, parent, elementid=None):
        '''
        Wait for  event viewer table to complete loading.
        '''

        self.logger.info("In wait_for_event_viewer_table_load_complete method")
        try:
            self.click_submit_button(browser)
        except:
            self.logger.info(" submit_button not found")

        if elementid:
            css_elem = parent + " #" + elementid
        else:
            css_elem = parent + " .splunk-view"

        css_elem1 = parent + " .splunk-timeindicator"
        css_elem2 = parent + " .progress-animation"
        self.logger.info("Waiting for '%s'", css_elem)
        browser.wait_for_element_present(
            By.CSS_SELECTOR, css_elem, timeout=200)

        try:
            browser.wait_for_element_not_present(
                By.CSS_SELECTOR, css_elem2, timeout=60)
        except:
            self.logger.info("Event Viewer table takes long time to load")

        self.logger.info("In wait_for_event_viewer_table_load_complete method")

    ##########################################################################

    def wait_for_full_results_table_load(self, browser, parent):
        '''
        Wait for full results table to complete loading.
        '''

        self.logger.info("In wait_for_full_results_table_load method")

        css_elem = parent + " .wrapped-results"
        css_elem1 = parent + " .splunk-timeindicator"
        css_elem2 = parent + " .progress-animation"
        browser.wait_for_element_visible(
            By.CSS_SELECTOR, css_elem, timeout=200)
        browser.wait_for_element_not_visible(
            By.CSS_SELECTOR, css_elem2, timeout=300)
        time.sleep(10)
        self.logger.info("Done wait_for_full_results_table_load method")

    ##########################################################################

    def click_submit_button(self, browser):
        '''
        Click Submit button.
        '''

        self.logger.info("In click_submit_button method")
        time.sleep(3)
        browser.wait_for_element_visible(
            By.CSS_SELECTOR, ".form-submit .btn-primary", timeout=20)
        ui_submit_button = browser.find_element(
            By.CSS_SELECTOR, ".form-submit .btn-primary")
        ui_submit_button.click()
        time.sleep(5)
        self.logger.info("Done click_submit_button method")

    ##########################################################################

    def click_search_button(self, browser):
        '''
        Click search button.
        '''

        self.logger.info("In click_search_button method")
        browser.wait_for_element_visible(
            By.CSS_SELECTOR, "input.searchButton", timeout=20)
        ui_search_button = browser.find_element(
            By.CSS_SELECTOR, "input.searchButton")
        ui_search_button.click()
        time.sleep(10)
        self.logger.info("Done click_search_button method")

    ##########################################################################

    def is_disabled(self, browser, css_selector, from_css=None):
        '''
        Find if an element is disabled.
        '''

        self.logger.info("In is_disabled method")

        if (from_css == None):
            elem = browser.wait_for_element_visible(
                By.CSS_SELECTOR, css_selector, timeout=100)
        else:
            parent = browser.wait_for_element_visible(
                By.CSS_SELECTOR, from_css, timeout=100)
            elem = browser.wait_for_element_visible(
                By.CSS_SELECTOR, css_selector, parent, timeout=60)

        if "disabled" in elem.get_attribute("className"):
            return True
        else:
            return False

    ##########################################################################
