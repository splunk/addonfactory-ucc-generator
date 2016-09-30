import re
from splunkwebdriver.models.components import By
from splunkwebdriver.models.components import BaseComponent
from splunkwebdriver.models.html_objects import Anchor
from splunkwebdriver.models.splunkjs.mvc.simpleform.input import Dropdown

class Globalization(BaseComponent):
    '''
    # UI framework for testing globalization of splunk
    # dashboards.
    '''
    NAVIGATION_MENU_CSS         = 'div.splunk-header.splunk-view>div+div'
    NAVIGATION_MENU_ITEMS_CSS   = 'div.splunk-header.splunk-view>div+div a'
    DASHBOARD_HEADER_CSS        = 'div.dashboard-header'

    INPUT_TYPES = ['DropDown', 'Other', 'Text', 'Link']
    
    # We make an assumption that en-DEBUG only contains (victory icon) or special characters and
    # digits. If expected i8n string contains alphabets, it's not i8n'd.
    NON_GLOBALIZED_PATTERN      = r"[a-zA-Z]"
    NON_GLOBALIZED_RE           = re.compile(NON_GLOBALIZED_PATTERN)

    def __init__(self, browser, logger, by=By.CLASS_NAME, value=None,
                 parent_instance=None, element=None, i8n_lang='en-DEBUG'):

        self.objects = {}
        super(Globalization, self).__init__(browser=browser, by=by, value=value, objects=self.objects,
        parent_instance=parent_instance)

        self.logger     = logger
        self.i8n_lang   = i8n_lang
        self.browser    = browser
        self.url        = browser.current_url

        if not self.verify_url():
            self.logger.error("Language is in 'en-US'. For i8n try another language.")
            return

    def verify_url(self):
        '''
        # Verify that the URL does not have 'en-US'.
        '''
        return 'en-US' in self.url

    def verify_navigation_menu(self):
        '''
        Verify if the navigation menu is globalized.
        '''
        self.logger.info("Verifying Navigation Menu...")

        self.browser.wait_for_element_visible(By.CSS_SELECTOR, Globalization.NAVIGATION_MENU_CSS)
        self.contains_globalized_text(Globalization.NAVIGATION_MENU_ITEMS_CSS)
    
    def verify_dashboard_header(self):
        '''
        Verify if the dashboard header that contains label of the dashboard is i8n'd.
        '''
        self.logger.info("Verify Dashboard Header...")

        self.browser.wait_for_element_visible(By.CSS_SELECTOR, Globalization.DASHBOARD_HEADER_CSS)
        self.contains_globalized_text(Globalization.DASHBOARD_HEADER_CSS)
    
    def contains_globalized_text(self, css_selector=None):
        '''
        Get's all the text under css_selector and verifies if it's globalized.
        '''
        self.logger.info("In contains_globalized_text method...")
        
        if not css_selector:
            self.logger.error("No css_selector provided.")
            return
        
        script = 'return $("{}").text()'.format(css_selector)
        all_text = self.browser.browser.execute_script(script)
        all_text = all_text.split()

        for item in all_text:
            assert len(re.findall(Globalization.NON_GLOBALIZED_RE, item)) == 0
    
    def is_text_globalized(self, *text):
        '''
        Is the text globalized.
        '''
        
        self.logger.info("In is_text_globalized method...")
        for t in text:
            assert len(re.findall(Globalization.NON_GLOBALIZED_RE, t)) == 0
            
    def check_globalization_of_text(self, by=By.CSS_SELECTOR, css_elem=None):
        '''
        Get's the text at specified css element and verifies if it is globalized.
        '''
        filter_text = self.browser.wait_for_element_present(by, css_elem).text
        self.is_text_globalized(filter_text)
        
    def check_globalization_of_anchor_and_click(self, by=By.CSS_SELECTOR, css_elem=None):
        '''
        Get's the text of the anchor at specified css element, verifies if it is globalized, and clicks the anchor.
        '''
        filter_text = self.browser.wait_for_element_present(by, css_elem).text
        self.is_text_globalized(filter_text)
        self.link_elem = Anchor.Anchor(self.browser, by,
                                       css_elem)
        self.link_elem.click()
    
    def check_globalization_of_dropdown_values(self, by=By.CSS_SELECTOR, css_elem=None):
        '''
        Get's all dropdown options values, verifies they are all globalized, and clicks the last dropdown option 
        to close the expanded dropdown option list.
        '''
        self.select_elem = Dropdown(
            browser=self.browser, by=by, value=css_elem)
        for option in self.select_elem.options:
            self.is_text_globalized(option)
            value = option
        
        self.select_elem.select(value)

    def check_globalization_of_input_fields(self, **kwargs):
        '''
        Check if the input elements are globalized.
        kwargs : {CSS_SELECTOR:INPUT_TYPE}
        '''
        
        for (k,v) in kwargs.items():
            if k not in self.INPUT_TYPES:
                self.logger.error("Cannot find key %s in Input types", k)
                return

            if k == "DropDown":
                self.check_globalization_of_dropdown_values(css_elem=v)
            else:
                self.check_globalization_of_text(css_elem=v)