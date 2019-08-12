from __future__ import absolute_import
from .page import Page
from ..components.login import Login
from selenium.webdriver.common.by import By

class LoginPage(Page):
    """
    Page: Login page
    """
    def __init__(self, browser, urls):
        super(LoginPage, self).__init__(browser, urls)
        self.login = Login(browser)
