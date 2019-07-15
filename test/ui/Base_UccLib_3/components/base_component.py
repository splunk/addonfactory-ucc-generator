from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class BaseComponent(object):
    """
    Purpose:
    The base class for the component. A component is an UI component with which a user interacts with. 
    The component class will have all the interaction method which can be done to the component.

    Implementation: 
    - The component will have set of locators. Locators can be of type (ID, CSS_Selector, classname, Name, etc. whichever supported by selenium)
    - Each method will interact with theses locators directly.
    - The component should have a container, so that it does not have multiple confusing instances in a same page.
    - In a container, there should be only one component of the same type.
    """

    def __init__(self, browser, container):
        """
            :param browser: The instance of the selenium webdriver 
            :param container: The container in which the component is located at.
        """   
        self.elements = dict()
        self.browser = browser
        self.wait = WebDriverWait(self.browser, 120)
        self.elements["container"] = container

    def get_element(self, key):
        """
        Get the web-element. 
        Note: There is a wait in get_element.
            :param key: The key of the element mentioned in self.elements
        """
        element = self.elements[key]
        return self._get_element(element['by'], element['select'])

    def get_elements(self, key):
        """
        Get the list of web-elements. 
        Note: There is a wait in the method.        
            :param key: The key of the element mentioned in self.elements
        """   
        try:
            self.wait_for(key)
            element = self.elements[key]
            return self._get_elements(element['by'], element['select'])
        except:
            return list()

    def get_child_element(self, key):
        """
        Get the web-element located inside the container. 
        - It is more preferable to use get_child_element over get_element. 
        - get_element should only be used if the element is out of the container for some reason. For example, in case of some pop-up.
        Note: There is a wait in the method.        
            :param key: The key of the element mentioned in self.elements
        """   
        element = self.elements[key]
        return self._get_child_element(element['by'], element['select'])

    def get_child_elements(self, key):
        """
        Get the list of web-elements located inside the container. Returns empty list of no elements found.
        - It is more preferable to use get_child_elements over get_elements. 
        - get_elements should only be used if the element is out of the container for some reason. For example, in case of some pop-up.
        Note: There is a wait in the method.
            :param key: The key of the element mentioned in self.elements
        """
        try:
            self.wait_for(key)
            element = self.elements[key]
            return self._get_child_elements(element['by'], element['select'])
        except:
            return list()

    def get_tuple(self, key):
        """
        get the locator of the element in a tuple form.
            :param key: The key of the element mentioned in self.elements
        """
        return self.elements[key]["by"], self.elements[key]["select"]

    def wait_for(self, key, msg=None):
        """
        Wait for an web element to be visible. Raises TimeoutException if the element not found.
            :param key: The key of the element mentioned in self.elements
            :param msg: The error-msg which should be mentioned in the TimeoutException
        """
        if not msg:
            msg = "{} element is not present".format(key)
        return self.wait.until(EC.presence_of_element_located(self.get_tuple(key)), msg)

    def wait_until(self, key, msg=None):
        """
        Wait for an web element to be invisible. Raises TimeoutException if the element does not dissapear.
            :param key: The key of the element mentioned in self.elements
            :param msg: The error-msg which should be mentioned in the TimeoutException
        """
        if not msg:
            msg = "{} element did not disappear".format(key)
        self.wait.until(EC.invisibility_of_element_located(self.get_tuple(key)), msg)

    def wait_to_display(self):
        """
        Wait for the component container to be displayed
        """
        self.wait_for("container")

    def __getattr__(self, key):
        """
        Makes the web-elements to be accessible directly.
        - For example self.elements = {"textbox": {"by": ..., "select": ...}},
            Access the element by doing self.textbox directly. 
        - It also has implicit wait while finding the element.  
          :param key: The key of the element mentioned in self.elements
        """
        try:
            return self.get_element(key)
        except KeyError:
            raise


    def _get_element(self, by, select):
        """
        Find the element from the page.
            :param by: The type of the selenium locator  
            :param select: The selector text of type mentioned in by.
        """
        msg = "by={} select={} Element not found in the page".format(by, select)
        return self.wait.until(EC.presence_of_element_located((by, select)), msg)

    def _get_elements(self, by, select):
        """
        Find the list of elements from the page.
            :param by: The type of the selenium locator  
            :param select: The selector text of type mentioned in by.
        """
        return self.browser.find_elements(by, select)


    def _get_child_element(self, by, select):
        """
        Find the element from the container.
            :param by: The type of the selenium locator  
            :param select: The selector text of type mentioned in by.
        """
        return self.container.find_element(by, select)

    def _get_child_elements(self, by, select):
        """
        Find the list of elements from the container.
            :param by: The type of the selenium locator  
            :param select: The selector text of type mentioned in by.
        """
        return self.container.find_elements(by, select)