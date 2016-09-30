'''
The test framework for adding a new timeline from the UI.
'''
import base64
from splunkwebdriver.models.components import By
from splunkwebdriver.models.html_objects import Input
from splunkwebdriver.models.html_objects import Table
from splunkwebdriver.models.html_objects import Button
from splunkwebdriver.models.html_objects import Anchor
from splunkwebdriver.models.components import BaseComponent
from splunkwebdriver.models.components.shared.drop_down_menu import DropDownMenu

from timeline_investigator.notes_modal import NotesEditModal
import time

class Timeline(BaseComponent):
    
    def __init__(self, browser, logger, by=By.ID,
                 value='timeline', parent_instance=None, element=None):
        
        self.logger     = logger
        self.browser    = browser
        self.objects = {}

        super(Timeline, self).__init__(browser=browser, by=by, value=value,
                                          objects=self.objects, parent_instance=parent_instance)
        
        self.wait_for_timeline_page_load()
        
        self.create_new_entry = DropDownMenu(self.browser,toggle_by=By.CSS_SELECTOR, toggle_value="#new-entry .dropdown-toggle",
                                             dialog_value="#new-entry .dropdown-menu")
        
        self.type_selector = DropDownMenu(self.browser,toggle_by=By.CSS_SELECTOR, toggle_value=".timeline-controls .dropdown-toggle",
                                          dialog_value=".timeline-controls .dropdown-menu")

    def wait_for_timeline_page_load(self):
        '''
        Wait for the Timeline page to load.
        '''
        self.logger.info("Waiting for Timeline page to Load....")
        self.browser.wait_for_element_visible(by=By.CSS_SELECTOR, value="div#title")
        self.browser.wait_for_element_visible(by=By.CSS_SELECTOR, value="div#description")
        self.browser.wait_for_element_not_visible(by=By.CSS_SELECTOR, value="div#loading")
        self.browser.wait_for_element_visible(by=By.CSS_SELECTOR, value="div#timeline-tab")
    
    def set_title(self, title=None):
        '''
        To add the title, we need to click the title h1 control that displays the title input control.
        '''
        if title is None:
            return
        
        title_click = self.find_element(by=By.CSS_SELECTOR, value="div#title")
        title_click.click()
        time.sleep(2)
        
        self.browser.wait_for_element_visible(by=By.CSS_SELECTOR, value="div.editable-input input[type=text]")
        self.title = Input.Text(self.browser, by=By.CSS_SELECTOR,
                                        value = 'div.editable-input input[type=text]', parent_instance=self)

        self.title.value = title
        time.sleep(2)
        self.click_editable_submit()
        self.browser.wait_for_element_not_visible(by=By.CSS_SELECTOR, value="div.editable-input input[type=text]")
        
        assert title == self.get_title()
    
    def get_title(self):
        '''
        Get the title.
        '''
        title_element = self.find_element(by=By.CSS_SELECTOR, value="div#title")
        
        if title_element.text == "(no name defined)":
            return None
        
        return title_element.text
    
    def set_description(self, description=None):
        '''
        To add the description, we need to click the h2 control the displays
        the description input control.
        '''
        if description is None:
            return
        
        description_click = self.find_element(by=By.CSS_SELECTOR, value="div#description")
        description_click.click()
        time.sleep(2)
        
        self.browser.wait_for_element_visible(by=By.CSS_SELECTOR, value="div.editable-input input.editable-input-large")
        self.description = Input.Text(self.browser, by=By.CSS_SELECTOR,
                                        value = 'div.editable-input input.editable-input-large', parent_instance=self)
        
        self.description.value = description
        time.sleep(2)
        self.click_editable_submit()
        self.browser.wait_for_element_not_visible(by=By.CSS_SELECTOR, value="div.editable-input input.editable-input-large")
        
        assert description == self.get_description()

    def get_description(self):
        '''
        Get the description.
        '''
        description_element = self.find_element(by=By.CSS_SELECTOR, value="div#description")
        
        if description_element.text == "(no description defined)":
            return None
        return description_element.text
    
    def click_editable_submit(self):
        '''
        Click the Ok button after entering text into
        title/description.
        '''
        self.submit_button = Button.Button(
            self.browser, by=By.CSS_SELECTOR, value="div.editable-buttons button.editable-submit")
        self.submit_button.click()
    
    def click_editable_cancel(self):
        '''
        Click the cancel icon in 
        title/description.
        '''
        self.cancel_button = Button.Button(
            self.browser, by=By.CSS_SELECTOR, value="div.editable-buttons button.editable-cancel")
        self.cancel_button.click()  

    def add_new_timeline(self, title=None, description=None):
        '''
        Create a new timeline with title and description.
        '''
        self.set_title(title)
        self.set_description(description)
        
        assert title == self.get_title() and description == self.get_description()
    
    def click_back_to_investigation_management(self):
        '''
        Click Back to Investigation Management link.
        '''
        investigation_management_link = Anchor.Anchor(self.browser, by=By.CSS_SELECTOR,
                                                      value="a#list-link", parent_instance=self)
        investigation_management_link.click()
    
    def click_create_new_entry_note(self):
        '''
        Click Create New Entry -> Note.
        '''
        self.create_new_entry.select("Note")
        time.sleep(3)

    def click_create_new_entry_action_history(self):
        '''
        Click Create New Entry -> Action History.
        '''
        self.create_new_entry.select("Action History")
        time.sleep(3)
    
    def show_timeline_canvas(self):
        '''
        Click in the Timeline Button.
        '''
        timeline_tab = Button.Button(self.browser, by=By.CSS_SELECTOR, value="#show-timeline")
        timeline_tab.click()
        self.browser.wait_for_element_visible(by=By.CSS_SELECTOR, value="div#timeline-tab")

    def show_timeline_list_items(self):
        '''
        Click in the Timeline List Button.
        '''
        timeline_items_tab = Button.Button(self.browser, by=By.CSS_SELECTOR, value="#show-list")
        timeline_items_tab.click()

        self.browser.wait_for_element_visible(by=By.CSS_SELECTOR, value="div#items-tab")
        self.browser.wait_for_element_visible(by=By.CSS_SELECTOR, value="div#items-tab div#timeline-entries-table")

    def select_timeline_item_type(self, value):
        '''
        Select the Timeline Item Type option
        from SropDown.
        '''
        self.type_selector.select(value)
        
    def get_investigation_owner(self):
        '''
        Get the investigation owner.
        '''
        show_owner_tool_tip = self.browser.execute_script('$("div#collaborators div#investigation-owner").mouseenter()')
        return self.get_collaborator_tool_tip_text()
    
    def add_collaborator(self, name=None, search=None):
        '''
        Add a collaborator.
        '''
        assert name is not None
        
        old_collab_count = self.get_collaborators_count()
        add_collaborator_button = self.browser.find_element_by_css_selector("div#collaborators div#add-collaborators")
        add_collaborator_button.click()
        
        self.browser.wait_for_element_visible(by=By.CSS_SELECTOR, value="div#analyst-dropdown")
        if search:
            collab_search = Input.Text(self.browser, By.CSS_SELECTOR,
                                        "div#analyst-dropdown input", parent_instance=self)
            collab_search.value = search
        try:
            #Changed in Apollo
            matching_name = self.browser.find_element_by_css_selector('div#analyst-dropdown ul#analyst-list a[data-key="'+base64.b64encode(name)+'"]')
            matching_name.click()
            time.sleep(3)
            
            assert self.get_collaborators_count() == old_collab_count + 1
        except:
            #Before Apollo
            matching_name = self.browser.find_element_by_css_selector('div#analyst-dropdown ul#analyst-list li#'+name+' a')
            matching_name.click()
            time.sleep(3)
            
            assert self.get_collaborators_count() == old_collab_count + 1
    
    def remove_collaborator(self, name=None):
        '''
        Remove a Collaborator.
        '''
        assert name is not None
        old_collab_count = self.get_collaborators_count()
        
        try:
            #Changed in Apollo
            remove_element = self.browser.find_element_by_css_selector('div#collaborators div#collab-list div[data-key="'+base64.b64encode(name)+'"]')
            remove_element.click()
            time.sleep(3)
            
            assert self.get_collaborators_count() == old_collab_count - 1
        except:
            #Before Apollo
            remove_element = self.browser.find_element_by_css_selector('div#collaborators div#collab-list div#'+name)
            remove_element.click()
            time.sleep(3)
            
            assert self.get_collaborators_count() == old_collab_count - 1
    
    def get_collaborators_count(self):
        '''
        Get a count of the collaborators (leaving Owner)
        '''
        try:
            return len(self.browser.find_elements_by_css_selector("div#collaborators div#collab-list .collaborator"))
        except:
            return 0
    
    def get_collaborator_tool_tip_text(self):
        '''
        Once the Tool-Tip is visible, get the Text.
        '''
        tool_tip_text = self.browser.find_element_by_css_selector('div#collab-tooltip').text
        return tool_tip_text
        
    def get_timeline_list_table_count(self):
        '''
        Get a count of the Timeline items in the table.
        '''
        try:
            self.show_timeline_list_items()
            timeline_items_table = Table.Table(self.browser, by=By.CSS_SELECTOR, value="div#timeline-entries-table table.table", parent_instance=self)
            return len(timeline_items_table.get_table_rows()) - 1
        except:
            return 0

    def get_timeline_list_table_times(self):
        '''
        Returns a list of all the Times of entries in the Timeline List table.
        '''
        timeline_list_table = Table.Table(self.browser, by=By.CSS_SELECTOR, value="div#timeline-entries-table table.table", parent_instance=self)
        table_data = timeline_list_table.get_table_data_matrix()
        
        return [item[1].text for item in table_data][1:] if (len(table_data) > 0) else None
        
    def get_timeline_list_table_titles(self):
        '''
        Returns a list of all the titles of entries in the Timeline List table.
        '''
        timeline_list_table = Table.Table(self.browser, by=By.CSS_SELECTOR, value="div#timeline-entries-table table.table", parent_instance=self)
        table_data = timeline_list_table.get_table_data_matrix()
        
        return [item[2].text for item in table_data][1:] if (len(table_data) > 0) else None

    def get_timeline_list_table_types(self):
        '''
        Returns a list of all the Types of entries in the Timeline List table.
        '''
        timeline_list_table = Table.Table(self.browser, by=By.CSS_SELECTOR, value="div#timeline-entries-table table.table", parent_instance=self)
        table_data = timeline_list_table.get_table_data_matrix()
        
        return [item[3].text for item in table_data][1:] if (len(table_data) > 0) else None

    def remove_timeline_entry_by_index(self, index=1):
        '''
        Remove a timeline Item from Table.
        '''
        timeline_items_table = Table.Table(self.browser, by=By.CSS_SELECTOR, value="div#timeline-entries-table table.table", parent_instance=self)
        
        all_rows = timeline_items_table.get_table_rows()
        old_row_count = self.get_timeline_list_table_count()
        
        #Make sure the index is not greater than the number of rows present and adding 1 for the header.
        assert len(all_rows) > 0 and len(all_rows) >= index+1
                
        remove_link = all_rows[index].find_element_by_link_text("Remove")
        remove_link.click()
        time.sleep(2)
        
        #Now make sure the entry has been deleted.
        if len(all_rows) == 1:
            assert bool(self.browser.find_element_by_css_selector("div#timeline-entries-table .alert")) == True
        else:
            all_rows_after_deletion = self.get_timeline_list_table_count()
            assert old_row_count - 1 == all_rows_after_deletion
    
    def edit_timeline_entry_by_index(self, index=1, title=None, time=None, description=None):
        '''
        Edit a Timeline Entry Item by Index
        '''
        timeline_items_table = Table.Table(self.browser, by=By.CSS_SELECTOR, value="div#timeline-entries-table table.table", parent_instance=self)
        
        all_rows = timeline_items_table.get_table_rows()
        
        #Make sure the index is not greater than the number of rows present and adding 1 for the header.
        assert len(all_rows) > 0 and len(all_rows) >= index+1
                
        edit_link = all_rows[index].find_element_by_link_text("Edit")
        edit_link.click()
        
        #Wait for the Modal to show-up
        notes_edit_modal = NotesEditModal(self.browser, self.logger)
        notes_edit_modal.fill_edit_entry_modal(title=title, time=time, description=description)
        notes_edit_modal.click_save()

        if title is not None:        
            #Now verify if the Title has changed.
            all_titles = self.get_timeline_list_table_titles()
        
            assert all_titles is not None and all_titles[index-1] == title
        
        if time is not None:
            #Verify if time has changed.
            times = self.get_timeline_list_table_times()
            
            assert times is not None and times[index-1] == time
        
        all_types = self.get_timeline_list_table_types()
        assert "Note" in set(all_types)

        ################################################################################################
        #The Methods below are for the timeline Canvas.                                                #
        #This is after the Timeline items are created.                                                 #
        #                                                                                              #
        #                                                                                              #
        ################################################################################################
    
    def get_slider_canvas_count(self):
        '''
        Get all the Slider Items in the Timeline canvas.
        '''
        self.navigate_to_timeline_tab()
        
        try:
            all_slider_items = self.browser.find_elements_by_css_selector("div.slider-item")
            if self.get_title() == "(no name defined)" or self.get_description() == "(no description defined)":
                return len(all_slider_items)
            else:
                return len(all_slider_items) - 1
        except:
            return 0
        
    def click_nav_next(self):
        '''
        Click next button to goto next Slider.
        '''
        try:
            next_button = self.browser.find_element_by_css_selector("div.nav-next")
            next_button.click()
            time.sleep(3)
            return True
        except:
            return False

    def click_nav_previous(self):
        '''
        Click next button to goto next Slider.
        '''
        try:
            prev_button = self.browser.find_element_by_css_selector("div.nav-previous")
            prev_button.click()
            time.sleep(3)
            return True
        except:
            return False
    
    def navigate_to_canvas(self, index=1):
        '''
        Navigate to a Canvas of index.
        '''
        self.navigate_to_timeline_tab()
        time.sleep(2)
        
        if self.get_title() == "(no name defined)" or self.get_description() == "(no description defined)":
        #This means that there is no Title Canvas.
            canvas_number = 1
        else:
            canvas_number = 0
        
        while canvas_number < index:
            if self.click_nav_next() == True:
                canvas_number += 1
            else:
                break

    def render_all_canvas(self):
        '''
        By default all the canvas are not rendered. 
        We need to navigate to them to render them and go back to home screen
        '''
        canvas_count = self.get_slider_canvas_count()
        self.navigate_to_canvas(index=canvas_count)
        self.navigate_to_timeline_items_tab()
        self.navigate_to_timeline_tab()
    
    def get_canvas_title(self, index=1):
        '''
        We get all the canvas title and find the one with not 
        empty title.
        If Index is none we get the current canvas title.
        '''
        self.render_all_canvas()
        self.navigate_to_canvas(index)
        all_slider_items = self.browser.find_elements_by_css_selector("div.slider-item")
        
        if self.get_title() == "(no name defined)" or self.get_description() == "(no description defined)":        
            return [item.find_element_by_css_selector(".container h3").text for item in all_slider_items if item.find_element_by_css_selector(".container h3").text != ''][0]
        else:
            return [item.find_element_by_css_selector(".container h3").text for item in all_slider_items[1:] if item.find_element_by_css_selector(".container h3").text != ''][0]
            
    def get_canvas_description(self, index=1):
        '''
        Get a particular canvas description.
        If Index is none we get the current canvas description.
        '''
        self.render_all_canvas()
        self.navigate_to_canvas(index)
        all_slider_items = self.browser.find_elements_by_css_selector("div.slider-item")
        
        return [item.find_element_by_css_selector(".container p").text for item in all_slider_items if item.find_element_by_css_selector(".container p").text != ''][0]

    def get_canvas_date(self, index=1):
        '''
        Get a particular canvas date.
        If Index is none we get the current canvas date.
        '''
        self.render_all_canvas()
        self.navigate_to_canvas(index)
        all_slider_items = self.browser.find_elements_by_css_selector("div.slider-item")
        
        date = [item.find_element_by_css_selector(".container h2").text for item in all_slider_items if item.find_element_by_css_selector(".container h2").text != ''][0]
        return date
    
    def get_active_flag_title(self):
        '''
        Get the current active flag.
        '''
        self.browser.wait_for_element_visible(by=By.CSS_SELECTOR, value=".timenav-background")
        active_flag = self.browser.find_element_by_css_selector(".marker.active .flag-content h3")
        return active_flag.text