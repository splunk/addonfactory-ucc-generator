from ModalUtil import ModalUtil
from selenium.webdriver.common.by import By
from splunkwebdriver.models.html_objects import Table
from splunkwebdriver.models.html_objects import Textarea
from splunkwebdriver.models.html_objects import Input


class ModuleModal(ModalUtil):

    def __init__(self, browser, logger, by=By.CSS_SELECTOR,
                 value=None, parent_instance=None, element=None, timeout=60):
        '''
        Constructor for Modal object.

        '''
        self.logger = logger

        super(ModuleModal, self).__init__(browser=browser, logger=logger, by=by, value=value,
                                          element=element, timeout=timeout, parent_instance=parent_instance)

        self.entity_table = Table.Table(
            self.browser, By.CLASS_NAME, 'table-chrome')
        self.tab_title_input = Input.Input(self.browser, By.ID, 'tab-title')
        self.description = Textarea.Textarea(self.browser, By.CSS_SELECTOR, 'textarea[name=description]', parent_instance=self)
        self.modal_err_message = Input.Input(
            self.browser, By.CLASS_NAME, 'alert-error')
        self.title_input = Input.Input(
            self.browser, By.CSS_SELECTOR, '.serviceinfo-basic-controls input')

    def has_error_message(self):
        return self.modal_err_message.is_displayed()

    def set_new_tab_title(self, value):
        self.tab_title_input.wait_to_be_visible()
        self.tab_title_input.value = value

    def get_new_tab_title(self):
        self.tab_title_input.wait_to_be_visible()
        return self.tab_title_input.value

    def set_title(self, value):
        self.title_input.wait_to_be_visible()
        self.title_input.value = value

    def get_title(self):
        self.title_input.wait_to_be_visible()
        return self.title_input.value

    def set_description(self, value):
        self.description.wait_to_be_visible()
        self.description.value = value

    def get_description(self):
        self.description.wait_to_be_visible()
        return self.description.value

    def get_module_item(self, serviceName):
        self.module_checkbox = Input.Checkbox(
            self.browser, By.XPATH, "//span[text()='" + serviceName + "']/preceding-sibling::label/a")
        self.module_checkbox.wait_to_be_visible()
        return self.module_checkbox

    def select_entity_from_table(self, row, col=1):
        self.table.wait_to_be_visible()
        selector = self.table.get_table_data_at(row, col)
        selector.click()
