from selenium.webdriver.common.by import By

TIMEOUT = 30

class EventsViewer():

    def __init__(self, browser, logger, by=By.CLASS_NAME, value="EventsViewer",
                 parent_by=None, parent_value=None, parent_instance=None):
        '''
        EventsViewer Init

        @type browser: WebDriver
        @param browser: WebDriver instance of a Browser driver.

        @type value: string
        @param value: Selector value for the selector type.

        @type by: By object type. from webdriver.commmon.by
        @param by: Selector type: By.ID, By.CLASS_NAME, etc
                   Default: By.ID

        @type parent_by: By object from the webdriver common libs
        @param parent_by: By which method is used to
                          locate the parent webelement

        @type parent_value: string
        @param parent_value: the value of the parent selector

        @type parent_instance: object
        @param parent_instance: a reference to the parent object.
                                for this to be useful, parent needs a
                                get_element() method that returns its
                                webelement from its parent's instance
        '''
        self.module = {'by': by, 'value': value}
        self.objects = {
            'item': {'by': By.CLASS_NAME, 'value': 'item'},
            'pos': {'by': By.CLASS_NAME, 'value': 'pos'},
            'actions': {'by': By.CLASS_NAME, 'value': 'actions'},
            'time': {'by': By.CLASS_NAME, 'value': 'time'},
            'event': {'by': By.CLASS_NAME, 'value': 'event'},
            'fields': {'by': By.CLASS_NAME, 'value': 'fields'}
        }

        self.helper_objects = {
            'key': {'by': By.CSS_SELECTOR, 'value': 'em.k'},
            'value': {'by': By.CLASS_NAME, 'value': 'v'},
            'option': {'by': By.CLASS_NAME, 'value': 'fm'},
            'highlight_text': {'by': By.CSS_SELECTOR, 'value': '.t.h'},
            'highlight_field_value': {'by': By.CLASS_NAME, 'value': 'h'},
            'highlight_value': {'by': By.CSS_SELECTOR, 'value': 'em.v.h'}
        }

        self.browser = browser
        self.logger = logger
        self._parent_by = parent_by
        self._parent_value = parent_value
        self._parent_instance = parent_instance

    def get_fields(self):
        '''
        Gets a list of objects with 'li' tags in the fields section.
        '''
        elem = self.find_elements(by=By.CLASS_NAME, value='additional_fields')
        return elem[0].find_elements(by=By.CLASS_NAME, value='fields')

    def get_event_fields(self):
        '''
        Gets a list of objects with 'li' tags in the fields section.

        '''
        return self.find_elements(by=By.CLASS_NAME, value='fields')

    def get_field_pairs(self):
        '''
        Gets a dictionary of fields and their values within the 'li' tags
        in the fields section.
        '''
        field_elems = self.get_fields()
        pairs = dict()
        for elem in field_elems:
            key = elem.find_element(
                **self.helper_objects['key']).get_attribute("innerHTML")
            value = elem.find_element(**self.helper_objects['value']).text
            pairs[key] = value
            self.logger.info(
                "Key Value Pairs in the get_field_pairs '%s'", key)
        return pairs

    def click_field_option(self, key):
        '''
        Clicks on the option menu for the field with the given key
        '''
        field_elems = self.get_fields()
        for elem in field_elems:
            key_elem = elem.find_elements(**self.helper_objects['key'])
            if key_elem and key_elem[0].get_attribute("innerHTML") == key:
                self.logger.info("Found the field '{h}', attempting to click "
                                 "on the option menu".format(h=key))
                opt_elem = elem.find_element(**self.helper_objects['option'])
                opt_elem.click()
                return None
        raise Exception("Invalid key '{k}' for the event item.".format(k=key))

    def click_event_action(self, index):
        '''
        Click the event action for an event item at a given index
        '''
        elem = self.get_event(index=index)
        event_action_elem = elem.find_element(**self.objects['actions'])
        event_action_elem.click()

    def get_events(self):
        '''
        Gets a list of items (event entry) in the events viewer.
        '''
        item_elems = self.find_elements(**self.objects['item'])
        elem_list = []
        for elem in item_elems:
            tr_elem = elem.find_element(by=By.TAG_NAME, value='tr')
            elem_list.append(tr_elem)
        self.logger.info("Found {c} events.".format(c=len(elem_list)))
        return elem_list

    def find_elements(self, by=By.ID, value=None):
        '''
        Return a WebElement within the module.


        @type by: By object type. from webdriver.commmon.by
        @param by: Selector type: By.ID, By.CLASS_NAME, etc
                   Default: By.ID

        @type value: string
        @param value: Selector value for the selector type
        '''
        mod_elem = self.get_module(wait=False)
        return mod_elem.find_elements(by=by, value=value)

    def get_event(self, index):
        '''
        Get item (event entry) in the events viewer with a given index
        '''
        item_elems = self.get_events()
        return item_elems[index]

    def get_object(self, obj):
        '''
        Return an object that is part of this module.

        @type obj: string
        @param obj: The string of the object name, specified in the objects
                    dictionary.

        @rtype: dictionary of WebElement objects.
        @return: Dictionary of the string representation and the WebElement
        '''
        mod_elem = self.get_module(False)
        elem = self.browser.wait_for_element_present(
            from_element=mod_elem, **self.objects[obj])
        return elem

    def get_module(self, wait=True, timeout=TIMEOUT,
                   frequency=5):
        '''
        Returns the WebElement of the module.

        @type wait: boolean
        @param wait: True to wait for the module element to appear before
                     getting it.

        @type timeout: int
        @param timeout: the time in second to wait for the module's WebElement
                        to appear if wait=True

        @type frequency: int
        @param frequency: the time in seconds to wait between polls for the
                          module's WebElement if wait=True

        @rtype: WebElement
        @return: the module's WebElement object
        '''
        parent_elem = None
        # checks for a parent instance if there is, get the webdriver
        # element by running get_element() on the instance if the instance
        # does not have the get_element method then it's ignored.
        if (self._parent_instance is not None and
                hasattr(self._parent_instance, 'get_element')):
            parent_elem = self._parent_instance.get_element()

        # else if there were specified parent_by/value, then use them to
        # find the element and search for our module element from that
        # parent element.
        elif self._parent_by is not None and self._parent_value is not None:
            parent_elem = self.browser.find_element(
                by=self._parent_by, value=self._parent_value)

        # if there are no other parent_by/value and parent_instance then
        # we will search the whole page for the module element.
        if wait:
            return self.browser.wait_for_element_present(
                from_element=parent_elem,
                timeout=timeout, frequency=frequency, **self.module)
        # if callable(parent_elem):
        #     parent_elem = parent_elem()
        parent_elem = self.browser if parent_elem is None else parent_elem
        return parent_elem.find_element(**self.module)

    def get_event_highlighted_value(self, index):
        '''
        Click the event action for an event item at a given index
        '''
        elem = self.get_event(index=index)
        highlight_value_list = []

        event_highlight_value_elems = elem.find_elements(
            **self.helper_objects['highlight_value'])

        for elem in event_highlight_value_elems:
            highlight_value_list.append(elem.text)

        self.logger.info("Highlighted value at index {i}: "
                         "{h}".format(i=index, h=highlight_value_list))
        return highlight_value_list
