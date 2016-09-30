from splunkwebdriver.models.components import BaseComponent
from splunkwebdriver.models.html_objects import Anchor
from splunkwebdriver.models.html_objects import Button
from splunkwebdriver.models.html_objects import Input
from splunkwebdriver.models.html_objects import Textarea
from splunkwebdriver.models.html_objects import Select
from splunkwebdriver.models.components import By
from splunkwebdriver.models.splunkjs.mvc.simpleform.input import Dropdown
from splunkwebdriver.models.components.shared.drop_down_menu import DropDownMenu
from globalization import Globalization

import time


##########################################################################
# Used for Modal dialogs. Contains methods that can act on Modal dialogs.
##########################################################################


class ModalUtil(BaseComponent):
    '''
    Modal is used to set values in any modal dialog.
    It's used to get modal header, body, footer values.
    Set/Get values to controls in the modal dialog.
    '''

    def __init__(self, browser, logger, by=By.CSS_SELECTOR,
                 value=None, parent_instance=None, element=None, timeout=15):
        '''
        Constructor for Modal object.

        '''
        self.logger = logger
        self.browser = browser
        self.objects = {}

        super(ModalUtil, self).__init__(browser=browser, by=by, value=value,
                                          objects=self.objects, parent_instance=parent_instance)
        self.wait_for_component_visible(timeout=timeout)

    def click_anchor(self, by=By.CSS_SELECTOR, css_elem=None):
        '''
        Click a css_elem element.
        '''

        self.link_elem = Anchor.Anchor(self.browser, by,
                                       css_elem, parent_instance=self)
        self.link_elem.click()

    def wait_for_save_complete(self, by=By.CSS_SELECTOR, css_elem=None):
        '''
        Wait for Save to Complete after clicking save button.
        '''

        self.link_elem = Anchor.Anchor(self.browser, by,
                                       css_elem, parent_instance=self)
        self.link_elem.wait_to_not_be_visible()

    def click_button(self, by=By.CSS_SELECTOR, css_elem=None):
        '''
        Click a css_elem element.
        '''

        self.btn_elem = Button.Button(self.browser, by, css_elem, parent_instance=self)
        self.btn_elem.click()

    def get_modal_header_text(self, by=By.CSS_SELECTOR, css_elem="div.modal-header"):
        '''
        Modals contain a header, body and foot.
        This returns the text in modal header.
        '''

        element = self.find_element(by, css_elem)
        self.logger.info("The Modal Header text is %s", element.text)

        return element.text

    def get_modal_body_text(self, by=By.CSS_SELECTOR, css_elem="div.modal-body"):
        '''
        Modals contain a header, body and foot.
        This returns the text in modal body.
        '''

        element = self.find_element(by, css_elem)
        self.logger.info("The Modal Body text is %s", element.text)

        return element.text

    def get_modal_footer_text(self, by=By.CSS_SELECTOR, css_elem="div.modal-footer"):
        '''
        Modals contain a header, body and foot.
        This returns the text in modal footer.
        '''

        element = self.find_element(by, css_elem)
        self.logger.info("The Modal Footer text is %s", element.text)

        return element.text

    def input_text(self, by=By.CSS_SELECTOR, css_elem=None, value=None, append=False):
        '''
        Enter text into any textbox.
        '''

        self.text_elem = Input.Text(
            self.browser, by, css_elem, parent_instance=self)

        if append:
            self.text_elem.send_keys(value)
        else:
            self.text_elem.value = value
        time.sleep(2)

    def input_textarea(self, by=By.CSS_SELECTOR, css_elem=None, value=None, append=False):
        '''
        Enter text into any textbox.
        '''

        self.text_elem = Textarea.Textarea(
            self.browser, by, css_elem, parent_instance=self)

        if append:
            self.text_elem.send_keys(value)
        else:
            self.text_elem.value = value
        time.sleep(2)

    def get_input_text(self, by=By.CSS_SELECTOR, css_elem=None):
        '''
        Get text form any textbox.
        '''

        self.text_elem = Input.Text(
            self.browser, by, css_elem, parent_instance=self)
        return self.text_elem.value

    def select_by_value(self, by=By.CSS_SELECTOR, css_elem=None, value=None):
        '''
        Select by values from SELECT UI control.
        '''

        self.select_elem = Select.Select(
            self.browser, by, css_elem, parent_instance=self)
        self.select_elem.select(value)

    def select_by_option(self, by=By.CSS_SELECTOR, css_elem=None, value=None):
        '''
        Select by option from SELECT UI control.
        '''

        self.select_elem = Select.Select(
            self.browser, by, css_elem, parent_instance=self)
        self.select_elem.option = value

    def select_value_from_dropdown(self, by=By.CSS_SELECTOR, css_elem=None, value=None):
        '''
        Select value fromn DROPDOWN control by value.
        '''

        self.select_elem = Dropdown(
            browser=self.browser, by=by, value=css_elem)
        self.select_elem.select(value)

    def get_value_set_from_dropdown(self, by=By.CSS_SELECTOR, css_elem=None):
        '''
        Get the selected value from DROPDOWN control.
        '''

        self.select_elem = Dropdown(
            browser=self.browser, by=by, value=css_elem)
        return self.select_elem.value

    def get_all_values_from_dropdown(self, by=By.CSS_SELECTOR, css_elem=None):
        '''
        Get all the values from a DROPDOWN control.
        '''

        self.select_elem = Dropdown(
            browser=self.browser, by=by, value=css_elem)
        return self.select_elem.options

    def select_value_from_dropdownmenu(self, toggle_by=By.CSS_SELECTOR, toggle_css=None,
                                       dialog_by=By.CSS_SELECTOR, dialog_css=None, value=None,
                                       partial=True):
        '''
        Select value from DropDownMenu control by link text
        '''
        dropdownmenu = DropDownMenu(self.browser, toggle_by, toggle_css,
                                         dialog_by, dialog_css, parent_instance=self)
        dropdownmenu.select(value, partial)

    def is_header_globalized(self, by=By.CSS_SELECTOR, css_elem='div.modal-header'):
        '''
        Verify if the text in the modal header is globalized.
        '''
        
        header_text = self.get_modal_header_text(by, css_elem)
        
        header_globalization = Globalization(self.browser, self.logger)
        header_globalization.is_text_globalized(header_text)

    def is_footer_globalized(self, by=By.CSS_SELECTOR, css_elem='div.modal-footer'):
        '''
        Verify if the text in the modal body is globalized.
        '''
        
        footer_text = self.get_modal_footer_text(by, css_elem)

        footer_globalization = Globalization(self.browser, self.logger)
        footer_globalization.is_text_globalized(footer_text)
    
    def is_body_text_globalized(self, by=By.CSS_SELECTOR, css_elem='div.modal-body'):
        '''
        Verify if the body text is globalized.
        '''

        body_text = self.get_modal_body_text(by, css_elem)

        body_globalization = Globalization(self.browser, self.logger)
        body_globalization.is_text_globalized(body_text)