import time
from ..components.base_component import BaseComponent
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys

class Slider(BaseComponent):


    def __init__(self, browser, container):
        super(Slider, self).__init__(browser, container)
        
    def slide(self):
        self.slide.click()
        return True
