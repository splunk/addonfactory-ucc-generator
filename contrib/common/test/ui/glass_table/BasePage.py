from selenium.common.exceptions import ElementNotVisibleException
from selenium.common.exceptions import NoSuchElementException
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.keys import Keys
from selenium.webdriver import ActionChains
from selenium.webdriver.common.by  import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import logging

class BasePage(object):
    '''This is the Base Page Object. Methods / Attributes that will be useful for all PageObjects will go here'''

    def __init__(self, browser):
        self.browser = browser
        self.browser.implicitly_wait(3)
        self.logger = logging.getLogger("BasePage-Test")

    def getCurrentUrl(self):
        return self.browser.current_url

    def navigateToItsiPage(self, page_name, page_url=None):
        '''
        @page_name as given in the UI. for example, 'Glass Tables'
        @page_url : Optional argument, if specifying use full path after custom-root end point
                    eg : '/en-US/app/itsi/homeview'
        @user_workflow: //TODO
                        If this is set to False, we redirect based on URL after splunk login.
                        If this is set to True, we follow Users workslow, i.e.:
                        First click on ITSI icon on launcher/home, then click on the menu bar in ITSI app
        '''
        #if i am on the splunk home page , do not wait for itsi nav bar
        itsi_app_icon = self.browser.find_elements(By.XPATH, "//*[@data-appid='itsi']")
        if len(itsi_app_icon) == 0:
            self.browser.wait_for_element_visible(By.XPATH, "//div[@class='nav']", timeout = 20)

        currenturl = self.getCurrentUrl()

        host = currenturl.split('en-US')
        host = host[0]
        dict = {'Overview':'/en-US/app/itsi/homeview',
                'Notable Events Review':'/en-US/app/itsi/gs_incident_review',
                'Glass Tables' : '/en-US/app/itsi/glass_tables_lister',
                'Deep Dives' : '/en-US/app/itsi/saved_deep_dive_lister',
                'Multi KPI Alerts' : '/en-US/app/itsi/alarm_console',
                'Services' : '/en-US/app/itsi/services_lister',
                'Entities' : '/en-US/app/itsi/entities_lister',
                'Correlation Searches' : '/en-US/app/itsi/correlation_searches_lister'
                }
        if page_url==None:
            dest_url = host+dict[page_name]
        else:
            dest_url = host + page_url
        self.browser.get(dest_url)
        if len(itsi_app_icon) == 0:
            self.browser.wait_for_element_visible(By.XPATH, "//div[@class='nav']", timeout = 20)


        try:
            WebDriverWait(self.browser, 3).until(EC.alert_is_present(),
                                   'Timed out waiting for Saved Page creation ' +
                                   'confirmation popup to appear.')

            alert = self.browser.switch_to_alert()
            alert.accept()
            self.logger.debug("Alert Accepted")
        except TimeoutException:
            self.logger.debug("No Alert Found")

    def getElement(self,method,locator,time=10,flag="clickable"):
        '''This function uses an explicit wait on the element to be clickable and then returns it, searches by all selenium supported By.*'''
        if flag=="clickable":
            elem = WebDriverWait(self.browser,time).until(EC.element_to_be_clickable((method, locator)))
        else:

            elem = WebDriverWait(self.browser,time).until(EC.visibility_of_element_located((method, locator)))
        return elem

    def getElements(self, method,locator):
        return self.browser.find_elements(method, locator)

    def click(self, webElement):
        '''Cross browser click
        NOTE:Function does move_to_element for else case'''
        if self.browser.name == 'safari':
            ejs="var evt = document.createEvent('MouseEvents');" + "evt.initMouseEvent('click',true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0,null);" + "arguments[0].dispatchEvent(evt);"
            self.browser.execute_script(ejs, webElement)
        else:
            actions = ActionChains(self.browser)
            actions.move_to_element(webElement).click(webElement).perform()
