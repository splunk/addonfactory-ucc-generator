from splunkwebdriver.models.components import BaseComponent
from selenium.webdriver.common.by import By

class Accessibility(BaseComponent):
    """
    This module contains methods required to test Splunk dashboards for 
    508 compliance (accessibility). This module finds various elements
    that are of 'interest' to the AT's (Assisstive Technologies) and 
    determines if that have all the properties required to be 508
    compliant.
    INTERESTING_ELEMENTS = ['a', 'button', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                            'i', 'img', 'input', 'label', 'p', 'table']
    NON_INTERESTING_ELEMENTS = ['div', 'frame']
    """

    ## Checking if any of the below compliance properties set will suffice if the element is 508 
    ## compliant.
    COMPLIANCE_PROPERTIES = ['aria-hidden', 'aria-label', 'aria-labelledby', 'aria-disabled',
                             'aria-readonly', 'aria-describedby', 'alt']
    
    ## In general, even if any of the above the compliance properties are not set, AT's
    ## check for the text present in elements like links that makes them 508 compliant.
    ALT_COMPLIANCE_PROPERTIES = ['text', 'value']

    def __init__(self, browser, logger, by=By.CLASS_NAME, value=None, 
                 parent_instance=None, element=None):

        self.objects = {}
        super(Accessibility, self).__init__(browser=browser, by=by, value=value, objects=self.objects,
        parent_instance=parent_instance)

        self.browser = browser
        self.logger = logger

    def check_compliance(self):
        """
        Check 508 compliance of the page.
        """
        non_compliant_icons = self.check_icons_compliance()
        non_compliant_images = self.check_images_compliance()
        non_compliant_links = self.check_links_compliance()
        non_compliant_buttons = self.check_buttons_compliance()
        non_compliant_inputs = self.check_input_compliance()
        non_compliant_tables = self.check_table_compliance()

        assert len(non_compliant_icons) == 0 and len(non_compliant_images) == 0 and len(non_compliant_links) == 0 \
               and len(non_compliant_buttons) == 0 and len(non_compliant_inputs) == 0 and len(non_compliant_tables) == 0
    
    def check_input_compliance(self):
        """
        This method finds all the inputs and determines if they are 508 compliant. <input />
        """
        input_css_selector = '.dashboard-body input'
        non_compliant_input = self.check_compliance_by_css_selector(input_css_selector)
        return non_compliant_input

    def check_table_compliance(self):
        """
        This method finds all the tables and determines if they are 508 compliant. <table />
        """
        table_css_selector = '.dashboard-body table'
        non_compliant_table = self.check_compliance_by_css_selector(table_css_selector)
        return non_compliant_table
    
    def check_icons_compliance(self):
        """
        This method finds all the icons and determines if they are 508 compliant. <i> </i>
        """
        icons_css_selector = '.dashboard-body i'
        return self.check_compliance_by_css_selector(css_selector=icons_css_selector)

    def check_links_compliance(self):
        """
        This method finds all the links and determines if they are 508 compliant. <a> </a>
        """
        images_css_selector = '.dashboard-body a'
        non_compliant_links = self.check_compliance_by_css_selector(images_css_selector, False)

        ## In case of links, AT's generally get the text present and read them
        ## out. So alternatively check for text present.
        alt_compliance = [self.check_alternate_compliance_properties(i) for i in non_compliant_links]
        non_compliant_links = [e for (b,e) in alt_compliance if b==False]

        if len(non_compliant_links) == 0:
            self.logger.info("Links are all compliant.")
            print "Links are all compliant."
        else:
            self.logger.info("All links are not compliant.")
            print "All links are not compliant."

            for e in non_compliant_links:
                self.non_compliant_message(e)

        return non_compliant_links
    
    def check_images_compliance(self):
        """
        This method finds all the images and determines if they are 508 compliant. <img />
        """
        images_css_selector = '.dashboard-body img'
        return self.check_compliance_by_css_selector(css_selector=images_css_selector)
    
    def check_buttons_compliance(self):
        """
        This method finds all the buttons and determines if they are 508 compliant. <button />
        """
        buttons_css_selector = '.dashboard-body button'
        non_compliant_buttons = self.check_compliance_by_css_selector(buttons_css_selector, False)

        ## In case of buttons, AT's generally get the text present and read them
        ## out. So alternatively check for text present.
        alt_compliance = [self.check_alternate_compliance_properties(i) for i in non_compliant_buttons]
        non_compliant_buttons = [e for (b,e) in alt_compliance if b==False]

        if len(non_compliant_buttons) == 0:
            self.logger.info("Buttons are all compliant.")
            print "Buttons are all compliant."
        else:
            self.logger.info("All buttons are not compliant.")
            print "All buttons are not compliant."

            for e in non_compliant_buttons:
                self.non_compliant_message(e)

        return non_compliant_buttons

    def check_compliance_by_css_selector(self, css_selector=None, print_message=True):
        """
        Check if elements are compliant by CSS selector.
        :param css_selector: Valid CSS selector.
        :param print_message: Boolean.
        """
        assert css_selector is not None
        all_elements = self.browser.find_elements_by_css_selector(css_selector)

        elements_compliance = [self.is_element_compliant(i) for i in all_elements]
        non_compliant_elements = [e for (b,e) in elements_compliance if b==False]
        
        if print_message:
            if len(non_compliant_elements) == 0:
                self.logger.info("Elements %s are all compliant.", str(css_selector))
                print "Elements %s are all compliant." % (str(css_selector))
            else:
                self.logger.info("Elements %s are not compliant.", str(css_selector))
                print "Elements %s are not compliant." % (str(css_selector))
                for e in non_compliant_elements:
                    self.non_compliant_message(e)

        return non_compliant_elements

    def check_alternate_compliance_properties(self, element):
        """
        Checks if an element has alternate compliance set to 
        call it compliant.
        :param element: selenium WebElement object. 
        """
        is_compliant = False
        
        for prop in Accessibility.ALT_COMPLIANCE_PROPERTIES:
            prop_value = element.get_attribute(prop)
            if prop_value:
                is_compliant = True

        if is_compliant:
            return (True, None)
        else:
            return (False, element)

    def is_element_compliant(self, element):
        """
        Verifies if an element is non-compliant.
        :param element: selenium WebElement object. 
        """
        is_compliant = False
        
        ## First check if any of the properties are set on the element.
        for prop in Accessibility.COMPLIANCE_PROPERTIES:
            prop_value = element.get_attribute(prop)
            if prop_value:
                is_compliant = True
        
        if is_compliant:
            return (True, None)
        else:
            return (False, element)
    
    def non_compliant_message(self, element):
        """
        Print/Log the information about the elements that
        are not compliant
        
        :param element: selenium WebElement object.
        """
        class_info = element.get_attribute('class')
        id_info = element.get_attribute('id')

        print "Element with class name %s and id %s is non compliant" %(class_info, id_info)
        self.logger.info("Element with class name %s and id %s is non compliant",class_info, id_info)