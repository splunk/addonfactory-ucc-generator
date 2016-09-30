from Lister_Base import ListerBasePage
from selenium.webdriver.common.by import By
from splunkwebdriver.models.html_objects import Input
from splunkwebdriver.models.html_objects import Anchor
from modals import ModuleModal

TIMEOUT = 120


class ServicesPage(ListerBasePage):
    '''
    Model for Services page
    '''

    def create_single_service_from_module(self, serviceName, description):
        '''
        Method to create a single service from OS module

        '''
        # open create single module modal dialog
        self.create_obj_btn.open()
        self.create_obj_btn.select('Create Single Service')
        self.create_service_modal = ModuleModal.ModuleModal(
            self.browser, self.logger, By.CSS_SELECTOR, '.new-service-modal')
        # set service name and description
        self.create_service_modal.set_title(serviceName)
        self.create_service_modal.set_description(description)
        # select service and default kpis
        self.module_item = self.create_service_modal.get_module_item(serviceName)
        self.module_item.wait_to_be_visible()
        self.module_item.check()
        # click create btn and wait for service to be created
        self.create_service_modal.click_anchor(By.CSS_SELECTOR, '.modal-btn-primary')
        assert self.create_service_modal.has_error_message() is False
        self.create_service_modal.title_input.wait_to_not_be_present()
