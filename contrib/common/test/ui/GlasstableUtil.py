from splunkwebdriver.models.components import BaseComponent
from splunkwebdriver.models.components import By
from splunkwebdriver.models.components import htmllogging
from splunkwebdriver.models.html_objects import Anchor
from splunkwebdriver.models.html_objects import Button
from splunkwebdriver.models.html_objects import Input
from splunkwebdriver.models.html_objects import Textarea
from splunkwebdriver.models.components.shared.drop_down_menu import DropDownMenu


class GlassTableEditor(BaseComponent):
    """
    Model that represents the Glasstable editor page
    """

    @htmllogging
    def __init__(self, browser, logger, by=By.CLASS_NAME, value="gt-body",
                 parent_instance=None):
        self.driver = browser
        self.logger = logger
        self.objects = {'gt_title': {'by': By.CLASS_NAME, 'value': 'glass-table-heading'}}

        super(GlassTableEditor, self).__init__(browser=browser, by=by, value=value,
                                               objects=self.objects,
                                               parent_instance=parent_instance)
        self.edit_mode_toggle = Anchor.Anchor(self.driver, By.CSS_SELECTOR,
                                              "a.gt-header-button.gt-mode-button",
                                              parent_instance=self)
        self.edit_dropdown = DropDownMenu(self.driver, By.CSS_SELECTOR,
                                          "a.btn.edit-btn.dropdown-toggle",
                                          parent_instance=self)
        self.clear_button = Anchor.Anchor(self.driver, By.CSS_SELECTOR,
                                          "a.btn.gt-clear-button",
                                          parent_instance=self)
        self.revert_button = Anchor.Anchor(self.driver, By.CSS_SELECTOR,
                                           "a.btn.gt-cancel-button",
                                           parent_instance=self)
        self.save_button = Button.Button(self.driver, By.CSS_SELECTOR,
                                         "button.btn.btn-primary.submit",
                                         parent_instance=self)

    @property
    def edit_title_desc_modal(self):
        """
        We return the Modal object at the time when this property is called, instead of at init
        @return: TitleDescriptionModal object
        """
        return GlassTableEditor.TitleDescriptionModal(self.driver, self.logger)

    def get_title(self):
        """
        Gets the name of the glasstable
        @return: title of glasstable
        """
        return self.get_object('gt_title').text.strip()

    class TitleDescriptionModal(BaseComponent):
        """
        Model object for the edit title description modal
        """
        @htmllogging
        def __init__(self, browser, logger, by=By.CSS_SELECTOR,
                     value="div.modal.fade",
                     parent_instance=None, element=None):
            self.driver = browser
            self.logger = logger
            self.objects = {}
            self.element = element

            super(GlassTableEditor.TitleDescriptionModal, self).__init__(browser=self.driver, by=by, value=value,
                                                                         objects=self.objects,
                                                                         parent_instance=parent_instance)
            self.title = Input.Text(self.browser, By.CSS_SELECTOR,
                                    "input",
                                    parent_instance=self)
            self.description = Textarea.Textarea(self.driver, By.CSS_SELECTOR,
                                                 "textarea",
                                                 parent_instance=self)
            self.save_button = Anchor.Anchor(self.driver, By.CSS_SELECTOR,
                                             "a.btn.btn-primary.modal-btn-primary",
                                             parent_instance=self)
            self.clear_button = Anchor.Anchor(self.driver, By.CSS_SELECTOR,
                                              "a.btn.cancel",
                                              parent_instance=self)
            self.wait_for_component_visible()

        def wait_for_element_visible(self):
            self.wait_for_component_visible()
