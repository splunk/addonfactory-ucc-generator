'''
The test framework for adding Timeline Investigator Bar Overlay.
'''

from splunkwebdriver.models.components import By
from splunkwebdriver.models.html_objects import Input
from splunkwebdriver.models.html_objects import Table
from splunkwebdriver.models.html_objects import Button
from splunkwebdriver.models.components import BaseComponent


class InvestigationBarOverlay(BaseComponent):
    
    def __init__(self, browser, logger, by=By.ID,
                 value='all-investigations-overlay', parent_instance=None, element=None):
        
        self.logger     = logger
        self.browser    = browser
        self.objects = {}

        super(InvestigationBarOverlay, self).__init__(browser=browser, by=by, value=value,
                                          objects=self.objects, parent_instance=parent_instance)
        
        self.wait_for_overlay_visible()
        
        self.close_overlay          = Button.Button(self.browser, by=By.CSS_SELECTOR,
                                                    value=".overlay-header .close")
        self.search_investigation   = Input.Text(self.browser, by=By.CSS_SELECTOR,
                                                 value='.overlay-header input[type=text]', parent_instance=self)
        self.investigations_table   = Table.Table(self.browser, by=By.CSS_SELECTOR,
                                                  value=".overlay-body table.table", parent_instance=self)

    def wait_for_overlay_visible(self):
        '''
        Wait for overlay to be visible.
        '''
        self.browser.wait_for_element_visible(by=By.CSS_SELECTOR, value="span#all-investigations-overlay")
    
    def get_selected_timeline(self):
        '''
        Get the currently loaded timeline.
        The first row in table is the one checked and loaded.
        '''
        all_investigations = self.investigations_table.get_table_rows()
        assert len(all_investigations) > 0
        
        checked_investigation = {inv.find_element_by_css_selector('a.timeline-selection').text:inv.find_element_by_css_selector('a.timeline-selection') for inv in all_investigations[:-1] 
                                 if inv.find_element_by_css_selector('a.timeline-selection i.icon-check').is_displayed()}
        return checked_investigation
    
    def get_investigations_dict(self):
        '''
        Get a dictionary of Investigation and link to that investigation. 
        '''
        all_investigations = self.investigations_table.get_table_rows()
        print len(all_investigations)
        try:
            return {inv.find_element_by_css_selector('a.timeline-selection').text:inv.find_element_by_css_selector('a.timeline-selection') for inv in all_investigations[:-1]}
        except:
            return dict()
    
    def load_an_investigation(self, title=None):
        '''
        Load an investigation by clicking from Overlay.
        '''
        assert title is not None
        all_investigations = self.get_investigations_dict()
        
        assert title in all_investigations
        all_investigations[title].click()
        self.browser.wait_for_element_not_visible(by=By.CSS_SELECTOR, value="span#all-investigations-overlay")