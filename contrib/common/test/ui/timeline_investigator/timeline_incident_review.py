'''
The test framework for Timeline Investigator on Incident Review UI.
'''

from splunkwebdriver.models.components import By

from ModalUtil import ModalUtil
import time

class AddToInvestigationModal(ModalUtil):
    '''
    A Modal on Incident Review that is opened on
    clicking "Add Selected to Investigation" link.
    '''
    def __init__(self, browser, logger, by=By.CSS_SELECTOR,
                 value="div#investigationPopupModal",
                 parent_instance=None, element=None):

        self.logger = logger
        self.value = value
        
        super(AddToInvestigationModal, self).__init__(
            browser=browser, logger=logger, by=by, value=value,
            parent_instance=parent_instance, element=element)
    
    def click_cancel_button(self):
        '''
        Click cancel button.
        '''
        self.click_button(by=By.CSS_SELECTOR, css_elem="button#inv_cancel")
        self.browser.wait_for_element_not_visible(by=By.CSS_SELECTOR, value=self.value)
    
    def click_create_new_investigation(self):
        '''
        Click Create New Investigation button.
        '''
        self.click_button(by=By.CSS_SELECTOR, css_elem="button#create_new_investigation")
        self.browser.wait_for_element_not_visible(by=By.CSS_SELECTOR, value=self.value)
        self.browser.wait_for_element_visible(by=By.CSS_SELECTOR, value="div#create_new_investigation_modal")
        time.sleep(2)
    
    def click_save_button(self):
        '''
        Click Save button.
        '''
        self.click_button(by=By.CSS_SELECTOR, css_elem="button#inv_save")
        self.browser.wait_for_element_visible(by=By.CSS_SELECTOR, value="div#investigationPopupModal div.show_on_success")
        time.sleep(2)
        self.click_close_this_dialog()
            
    def select_an_investigation(self, value=None):
        '''
        Select a value from the drop-down list.
        '''
        self.browser.wait_for_element_not_visible(by=By.CSS_SELECTOR, value="div.splunk-choice-input-message span")
        time.sleep(5)
        self.select_value_from_dropdown(by=By.CSS_SELECTOR, css_elem="div#investigationPopupModal div#investigations", value=value)

    def click_close_this_dialog(self):
        '''
        Click Close this dialog.
        '''
        self.click_anchor(by=By.CSS_SELECTOR, css_elem="div#close a")
        self.browser.wait_for_element_not_visible(by=By.CSS_SELECTOR, value=self.value)

class AddToInvestigationWorkFlowActionModal(ModalUtil):
    '''
    AModal on Incident Review that is opened on
    clicking workflow action "Add event to Investigation"
    '''
    def __init__(self, browser, logger, by=By.CSS_SELECTOR,
                 value="div.app-components-incidentreview-dialogs-investigationdialog",
                 parent_instance=None, element=None):

        self.logger = logger
        self.value = value
        
        super(AddToInvestigationWorkFlowActionModal, self).__init__(
            browser=browser, logger=logger, by=by, value=value,
            parent_instance=parent_instance, element=element)
    
    def click_cancel_button(self):
        '''
        Click cancel button.
        '''
        self.click_button(by=By.CSS_SELECTOR, css_elem="button#event_action_inv_cancel")
        self.browser.wait_for_element_not_visible(by=By.CSS_SELECTOR, value=self.value)
    
    def click_create_new_investigation(self):
        '''
        Click Create New Investigation button.
        '''
        self.click_button(by=By.CSS_SELECTOR, css_elem="button#event_action_create_new_investigation")
        self.browser.wait_for_element_visible(by=By.CSS_SELECTOR, value="div#event_action_create_new_investigation_modal")
        time.sleep(2)
    
    def click_save_button(self):
        '''
        Click Save button.
        '''
        self.browser.wait_for_element_not_visible(by=By.CSS_SELECTOR, value="div.splunk-choice-input-message span")

        self.click_button(by=By.CSS_SELECTOR, css_elem="button#event_action_inv_save")
        self.browser.wait_for_element_visible(by=By.CSS_SELECTOR, value="div.add-event-to-investigation #close a")
        time.sleep(2)
        
        self.click_anchor(css_elem="div.add-event-to-investigation #close a")
        self.browser.wait_for_element_not_visible(by=By.CSS_SELECTOR, value=self.value)
        time.sleep(2)
            
    def select_an_investigation(self, value=None):
        '''
        Select a value from the drop-down list.
        '''
        self.browser.wait_for_element_not_visible(by=By.CSS_SELECTOR, value="div.splunk-choice-input-message span")
        self.select_value_from_dropdown(by=By.CSS_SELECTOR, css_elem="div#event_action_investigations", value=value)
        time.sleep(2)

class CreateNewInvestigationModal(ModalUtil):
    '''
    Create a new Timeline Modal on Incident Review.
    '''

    def __init__(self, browser, logger, by=By.CSS_SELECTOR,
                 value="div#create_new_investigation_modal",
                 parent_instance=None, element=None):

        self.logger = logger

        super(CreateNewInvestigationModal, self).__init__(
            browser=browser, logger=logger, by=by, value=value,
            parent_instance=parent_instance, element=element)
    
    def create_new_timeline(self, title=None, description=None):
        '''
        Fill the title and description.
        '''
        assert title is not None
        
        self.input_text(by=By.CSS_SELECTOR, css_elem="div#create_new_investigation_modal input", value=title)
        if description is not None:
            self.input_textarea(by=By.CSS_SELECTOR, css_elem="div#create_new_investigation_modal textarea#new_investigation_description_input", value=description)
        
        self.click_anchor(by=By.CSS_SELECTOR, css_elem="div#create_new_investigation_modal a#save_new_investigation")
        self.browser.wait_for_element_not_visible(by=By.CSS_SELECTOR, value="div#create_new_investigation_modal")
        
        add_to_investigation_modal = AddToInvestigationModal(self.browser, self.logger)        
        add_to_investigation_modal.click_save_button()
        
class CreateNewInvestigationWorkFlowActionModal(ModalUtil):
    '''
    Create a new Timeline Modal from Workflow Actions.
    '''

    def __init__(self, browser, logger, by=By.CSS_SELECTOR,
                 value="div#event_action_create_new_investigation_modal",
                 parent_instance=None, element=None):

        self.logger = logger

        super(CreateNewInvestigationWorkFlowActionModal, self).__init__(
            browser=browser, logger=logger, by=by, value=value,
            parent_instance=parent_instance, element=element)
    
    def create_new_timeline(self, title=None, description=None):
        '''
        Fill the title and description.
        '''
        assert title is not None
        
        self.input_text(by=By.CSS_SELECTOR, css_elem="div#event_action_create_new_investigation_modal input", value=title)
        if description is not None:
            self.input_textarea(by=By.CSS_SELECTOR, css_elem="div#event_action_create_new_investigation_modal textarea", value=description)
        
        self.click_anchor(by=By.CSS_SELECTOR, css_elem="div#event_action_create_new_investigation_modal a#event_action_save_new_investigation")
        self.browser.wait_for_element_not_visible(by=By.CSS_SELECTOR, value="div#event_action_create_new_investigation_modal")
        
        add_to_investigation_modal = AddToInvestigationWorkFlowActionModal(self.browser, self.logger)        
        add_to_investigation_modal.click_save_button()
                
class SuccessModal(ModalUtil):
    '''
    Success Modal.
    '''
    def __init__(self, browser, logger, by=By.CSS_SELECTOR,
                 value="div#logReviewPopupSuccessModal",
                 parent_instance=None, element=None):

        self.logger = logger

        super(SuccessModal, self).__init__(
            browser=browser, logger=logger, by=by, value=value,
            parent_instance=parent_instance, element=element)
    
    def click_ok_button(self):
        '''
        Click Ok Button.
        '''
        self.click_anchor(by=By.CSS_SELECTOR, css_elem="a#cancel-timeline-entry-operation")
        self.browser.wait_for_element_not_visible(by=By.CSS_SELECTOR, value="div#logReviewPopupSuccessModal")