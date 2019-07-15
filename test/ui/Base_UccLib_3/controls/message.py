from ..components.base_component import BaseComponent
from selenium.webdriver.common.by import By
from ..controls.button import Button

class Message(BaseComponent):
    """
    Entity-Component: Message
    """
    def __init__(self, browser, container):
        """
            :param browser: The selenium webdriver
            :param container: The locator of the container where the control is located in. 
        """
        super(Message, self).__init__(browser, container)  
        self.elements.update({
            "msg_text": {
                "by": By.CSS_SELECTOR,
                "select": container["select"] + " .msg-text"
            },
            "msg_close":{
                "by": By.CSS_SELECTOR,
                "select": container["select"] + " .close"
            }

        })



    def get_msg(self):
        '''
        Returns the error message
        '''
        return self.msg_text.text

    def close_msg(self):
        """
        Cancel the error message 
        """
        self.msg_close.click()
        return True

    def wait_loading(self):
        """
        Wait till the message appears and then dissapears
        """
        try:
            text = self.container.text
            self.wait_until("container")
            return text
        except:
            pass

    def wait_to_display(self):
        """
        Wait till the message appears
        """
        return self.container.text
        
