import time
from base_component import BaseComponent
from selenium.webdriver.common.by import By

class Login(BaseComponent):
    """
    Component: Login
    To login into the Splunk instance
    """
    def __init__(self, browser, container={"by": By.CSS_SELECTOR,"select":"form.loginForm"}):
        """
            :param browser: The selenium webdriver
            :param container: Container in which the table is located. Of type dictionary: {"by":..., "select":...}
        """
        super(Login, self).__init__(browser, container)

        self.elements = {
            "username": {
                "by": By.ID,
                "select": "username"
            },
            "password": {
                "by": By.ID,
                "select": "password"
            }
        }

    def login(self, username, password):
        """
        Login into the Splunk instance
        """
        self.username.send_keys(username)
        self.password.send_keys(password)
        self.password.send_keys(u'\ue007')
        time.sleep(2)