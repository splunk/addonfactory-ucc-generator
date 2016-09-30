from splunkwebdriver.models.pages import BaseModel
from selenium.webdriver.common.by import By
from splunkwebdriver.models.components.shared import splunkbar
from splunkwebdriver.models.components.shared import appbar
from splunkwebdriver.models.components.shared import drop_down_menu
from splunkwebdriver.models.components.shared import tablecaption
from splunkwebdriver.models.html_objects import Table
from splunkwebdriver.models.html_objects import Input
from splunkwebdriver.models.html_objects import Anchor
from modals import ModuleModal
from selenium.webdriver.support import wait as webdriver_wait
from selenium.common.exceptions import TimeoutException

TIMEOUT = 120


class ListerBasePage(BaseModel):
    '''
    Model for Services page
    '''

    def __init__(self, browser, *args, **kwargs):
        '''
        ListerBasePage Init

        @type browser: WebDriver
        @param browser: WebDriver instance of a Browser driver.
        '''

        super(ListerBasePage, self).__init__(browser, *args, **kwargs)

        # nav bars
        self.splunkbar = splunkbar.Splunkbar(self.browser)
        self.appbar = appbar.AppBar(self.browser)

        # ui element
        self.create_obj_btn = drop_down_menu.DropDownMenu(
            self.browser, By.CSS_SELECTOR, "div.createObjectButton>a")
        self.filter_box = tablecaption.TableCaption(self.browser)
        self.bulk_action_dropdown = drop_down_menu.DropDownMenu(
            self.browser, By.CLASS_NAME, 'bulk-dropdown')
        self.objects_tbl = Table.Table(
            self.browser, By.XPATH, "//tbody[@class = 'pages-listings']/parent::table")
        self.objects = {
            'obj_count_label': {'by': By.CSS_SELECTOR, 'value': '.table-caption-inner'},
            'section_title': {'by': By.CSS_SELECTOR, 'value': '.section-title'}
                       }

    def obj_created(self, serviceName, timeout=TIMEOUT, frequency=webdriver_wait.POLL_FREQUENCY):
        '''
        Method to check for existing services

        @type timeout: int
        @param timeout: the time in second to wait for the module's WebElement
                        to appear

        @type frequency: int
        @param frequency: the time in seconds to wait between polls for the
                          module's WebElement

        @rtype: boolean
        @return: True if services has been created
                 Flase if no services has been created
        '''

        # helper method to check for service_count_label to see if it has been
        # loaded

        def _check_service_count_label(driver):
            service_count_label = self.get_obj_count_label()
            return service_count_label != 'Loading'
        # wait for service_count_label to be fully loaded and then return the
        # boolean flag
        try:
            webdriver_wait.WebDriverWait(
                self.browser, timeout, frequency).until(
                    _check_service_count_label)
            service_count = int(self.get_obj_count_label())
            selected_service_created = len(self.browser.find_elements(By.XPATH, '//*[text() = "%s"]' % serviceName)) == 1
            return service_count > 0 and selected_service_created

        except TimeoutException as err:
            self.browser.capture_screenshot()
            msg = ("Component still not rendered after {t} seconds"
                   "".format(t=timeout))
            self.logger.error(msg)
            raise TimeoutException("{m} {e}".format(m=msg, e=err))

    def get_obj_count_label(self):
        '''
        Method to get actual content of the web element

        @rtype: unicode
        @return: number of services created
        '''
        self.browser.wait_for_element_visible(**self.objects['section_title'])
        label = self.browser.find_element(**self.objects['obj_count_label']).text.strip().split()[0]
        return label

    def delete_selected_obj(self, objName):
        self.obj_row = self._get_obj_row(objName)
        self.select_obj_btn = self.obj_row.get_table_data_for_column(1)
        self.select_obj_btn.click()
        self.bulk_action_dropdown.open()
        self.bulk_action_dropdown.select('Delete selected')
        self.delete_service_modal = ModuleModal.ModuleModal(
            self.browser, self.logger, By.ID, 'modal_bulk_delete')
        self.delete_service_modal.click_anchor(By.CLASS_NAME, 'btn-dialog-primary')
        Anchor.Anchor(self.browser, By.CLASS_NAME, 'btn-dialog-primary').wait_to_not_be_present()

    def view_health_page(self, objName):
        self.obj_row = self._get_obj_row(objName)
        self.view_health_btn = self.obj_row.get_table_data_for_column(5).find_element_by_tag_name('a').click()

    def _get_obj_row(self, objName):
        return Table.TableRow(self.browser, By.XPATH, '//tr//a[text() = "%s"]/../..' % objName)
