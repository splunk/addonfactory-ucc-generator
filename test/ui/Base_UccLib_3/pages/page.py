
class Page(object):
    """
    Instance of a Page class holds all the components inside the page. To access the component, just do page.component.action_method()
    The page class should not have any interaction method for any visible components. It is supposed to hold all the components only.
    """

    def __init__(self, browser, urls, open_page=True):
        """
            :param browser: The selenium webdriver
            :param urls: Splunk web & management url. {"web": , "mgmt": }
            :param session_key: session key to access the rest endpoints
        """

        self.browser = browser
        self.splunk_web_url = urls["web"]
        self.splunk_mgmt_url = urls["mgmt"]
        if open_page:
            self.open()

    def open(self):
        """
        Abstract Method. Open the page
        """
        self.browser.get(self.splunk_web_url)
