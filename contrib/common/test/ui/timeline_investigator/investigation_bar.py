'''
The test framework for adding Timeline Investigator Bar.
'''

from splunkwebdriver.models.components import By
from splunkwebdriver.models.html_objects import Input
from splunkwebdriver.models.html_objects import Button
from splunkwebdriver.models.html_objects import Anchor
from splunkwebdriver.models.components import BaseComponent
from investigation_overlay import InvestigationBarOverlay
from timeline import Timeline
from notes_modal import NotesEditModal, NotesTimelineModal
import time

class InvestigationBar(BaseComponent):
    
    def __init__(self, browser, logger, by=By.ID,
                 value='investigator-bar', parent_instance=None, element=None):
        
        self.logger     = logger
        self.browser    = browser
        self.objects = {}

        super(InvestigationBar, self).__init__(browser=browser, by=by, value=value,
                                          objects=self.objects, parent_instance=parent_instance)
        
        self.wait_for_investigatorbar_load()

        self.investigator_list_button           = Anchor.Anchor(self.browser, by=By.CSS_SELECTOR,
                                                                value="a#investigator-list-button", parent_instance=self)
        self.create_new_investigation           = Anchor.Anchor(self.browser, by=By.CSS_SELECTOR,
                                                                value="a#investigator-add-button", parent_instance=self)
        self.investigator_note_button           = Anchor.Anchor(self.browser, by=By.CSS_SELECTOR,
                                                                value="a#investigator-note-button", parent_instance=self)
        self.investigator_action_history_button = Anchor.Anchor(self.browser, by=By.CSS_SELECTOR,
                                                                value="a#investigator-action-history-button", parent_instance=self)        
        self.timeline_title                     = Input.Text(self.browser, by=By.CSS_SELECTOR,
                                                            value = 'div.editable-input input[type=text]', parent_instance=self)        
        self.submit_button                      = Button.Button(self.browser, by=By.CSS_SELECTOR,
                                                                value="div.editable-buttons button.editable-submit")
        self.cancel_button                      = Button.Button(self.browser, by=By.CSS_SELECTOR, 
                                                                value="div.editable-buttons button.editable-cancel")

    def wait_for_investigatorbar_load(self):
        '''
        Wait for the Investigation Bar to load.
        '''
        self.browser.wait_for_element_visible(by=By.CSS_SELECTOR, value="div#investigator-bar")
        self.browser.wait_for_element_visible(by=By.CSS_SELECTOR, value="div#investigator-bar #investigator-creation-selection")
        self.browser.wait_for_element_visible(by=By.CSS_SELECTOR, value="div#investigator-bar #investigator-bar-title-control")
        self.browser.wait_for_element_visible(by=By.CSS_SELECTOR, value="div#investigator-bar #investigator-entry")
    
    def get_timeline_loaded_text(self):
        '''
        Get the current timeline loaded text.
        '''
        loaded_timeline_link = Anchor.Anchor(self.browser, by=By.CSS_SELECTOR,
                                            value="span#investigator-bar-title-control a", parent_instance=self)
        
        return loaded_timeline_link.text
    
    def click_timeline_loaded(self):
        '''
        Click the timeline loaded.
        '''
        loaded_timeline_text = self.get_timeline_loaded_text()
        loaded_timeline_link = Anchor.Anchor(self.browser, by=By.CSS_SELECTOR,
                                            value="span#investigator-bar-title-control a", parent_instance=self)
        loaded_timeline_link.click()
        time.sleep(10)
        handles = self.browser.window_handles    
        self.browser.switch_to_window(handles[1])

        timeline = Timeline(self.browser, self.logger)
        assert timeline.get_title() == loaded_timeline_text

    def create_new_timeline_investigation(self, value=None):
        '''
        Click '+' and fill in the value.
        If value is none default title is used.
        '''
        self.create_new_investigation.click()
        self.browser.wait_for_element_visible(by=By.CSS_SELECTOR, value="div.editable-input input[type=text]")
        
        if value is not None:
            self.timeline_title.value = value
        
        self.submit_button.click()
        self.browser.wait_for_element_not_visible(by=By.CSS_SELECTOR, value="div.editable-input input[type=text]")

        if value is not None:
            assert value == self.get_timeline_loaded_text()
        else:
            assert self.get_timeline_loaded_text().startswith("My Investigation Timeline")
    
    def edit_investigation(self, value=None):
        '''
        Change the title of the new investigation.
        If value is none, click edit button and then click undo.
        '''
        old_title = self.get_timeline_loaded_text()
        
        self.browser.execute_script('$("a#investigator-edit-button").click()')
        self.browser.wait_for_element_visible(by=By.CSS_SELECTOR, value="div.editable-input input[type=text]")

        if value is not None:
            self.timeline_title.value = value
            self.submit_button.click()
        else:
            self.cancel_button.click()

        self.browser.wait_for_element_not_visible(by=By.CSS_SELECTOR, value="div.editable-input input[type=text]")
        
        if value is not None:
            assert value == self.get_timeline_loaded_text()
        else:
            assert self.get_timeline_loaded_text() == old_title
    
    def load_a_new_investigation(self, value=None):
        '''
        Open Overlay and select an investigation.
        '''
        assert value is not None
        self.investigator_list_button.click()
        
        overlay = InvestigationBarOverlay(self.browser, self.logger)
        all_investigations = overlay.get_investigations_dict()
        
        investigation = all_investigations.get(value, None)
        assert investigation is not None
        
        investigation.click()
        self.browser.wait_for_element_not_visible(by=By.CSS_SELECTOR, value="#all-investigations-overlay")
    
    def add_a_new_note(self, title=None, time=None, description=None):
        '''
        Add a new note to an investigation and 
        verify if it is on the canvas.
        '''
        self.investigator_note_button.click()
        try:
            notesmodal = NotesTimelineModal(self.browser, self.logger)
            notesmodal.click_create_a_new_note()
        except Exception:
            pass
        notes_edit_modal = NotesEditModal(self.browser, self.logger)
        notes_edit_modal.fill_edit_entry_modal(title=title, time=time, description=description)
        notes_edit_modal.click_add_to_investigation()
        
        #Now click on the Investigation created and verify if the note is present.
        self.click_timeline_loaded()
        timeline = Timeline(self.browser, self.logger)
        timeline.show_timeline_list_items()
        assert title in timeline.get_timeline_list_table_titles()
        all_types = timeline.get_timeline_list_table_types()
        assert "Note" in set(all_types)