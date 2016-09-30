from splunkwebdriver.models.pages import BaseModel
from splunkwebdriver.models.components import BaseComponent
from selenium.webdriver.common.by import By
from splunkwebdriver.models.components.shared import splunkbar
from splunkwebdriver.models.components.shared import appbar
from splunkwebdriver.models.html_objects import Anchor


class ServiceAnalyzer(BaseModel):
    '''
    Model for Services page
    '''
    def __init__(self,browser,*args,**kwargs):
        '''
        ServicesPage Init

        @type browser: WebDriver
        @param browser: WebDriver instance of a Browser driver.
        '''

        super(ServiceAnalyzer, self).__init__(browser,*args,**kwargs)

        # nav bars
        self.splunkbar = splunkbar.Splunkbar(self.browser)
        self.appbar = appbar.AppBar(self.browser)

        # self.service_tile = ServiceTile(self.browser)
        self.severity_tiles_conf_btn = Anchor.Anchor(self.browser,By.CLASS_NAME,'severity-tiles-config')
        self.service_tile = ServiceTile(self.browser)




class ServiceTile(BaseComponent):
    '''
    Service tile for all existing services
    '''
    def __init__(self, browser, by=By.CLASS_NAME,value='severity-tile-view',parent_instance=None):
        '''
        ServiceTile Init

        @type browser: WebDriver
        @param browser: WebDriver instance of a Browser driver.

        @type by: By object type from webdriver.commmon.by
        @param by: Selector type: By.ID, By.CLASS_NAME, etc
                   Default: By.CLASS_NAME

        @type value: string
        @param value: Selector value for the selector type.

        @type parent_instance: object
        @param parent_instance: a reference to the parent object.
                                for this to be useful, parent needs a
                                get_element() method that returns its
                                webelement from its parent's instance.
        '''
        super(ServiceTile,self).__init__(browser=browser,by=by,value=value,parent_instance=parent_instance)


        # more ui elements to be added








