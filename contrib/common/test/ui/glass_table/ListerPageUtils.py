import os
import time
import logging
from BasePage import BasePage
from selenium.webdriver.common.by  import By
from selenium.webdriver.common.keys import Keys



class ListerPageUtil(BasePage):
	'''
	This util can be used to provide common functionality of lister pages.
	For now, it will work for Glass Table and Deep Dive lister pages.
	In future, more functionality can be added to support other lister pages.
	'''

	#following xpaths can be used to access objects on lister page by giving the 'name of object' in place of '%s'
	xpath_edit_dropdown = "//tr[td/a = '%s']/td[@class='actions']//a[@class='dropdown-toggle']"
	xpath_row_elements = "//td[@class='title'][a[text()='%s']]/parent::tr/td"
	xpath_expand_icon_link = "//td[@class='title'][a[text()='%s']]/parent::tr/td[@class='expands']/a"

	#following xpaths can be used to get details of an object after expanding its row.
	xpath_expand_description = "//tr[contains(@class,'more-info')]//p[@class='page-description']"
	xpath_expand_left_side_values = "//tr[contains(@class,'more-info')]//dt"
	xpath_expand_right_side_values = "//tr[contains(@class,'more-info')]//dd"

	#following xpaths are for lister pages edit dropdown. can be used for every option inside the dropdown.
	#eg. '%s' : 'Delete', 'Edit Page', 'Edit Title or Description', 'Edit Permissions', 'Clone'.
	xpath_edit_dropdown_options = "//div[@class='dropdown-menu dropdown-menu-narrow open']//li/a[contains(text(),'%s')]"

	#can be used to select sharing options in edit permissions modal. '%s' can be 'Owner' or 'App'.
	xpath_permission_modal_sharing_option = "//div[@data-name='sharing']/button[contains(text(),'%s')]"
	xpath_permission_modal_alert="//div[contains(@class,'alert-error')]"

	#modal save, clone, delete or cancel link. '%s' could be 'Save', 'Clone Page',  'Delete', 'Done' or 'Cancel'
	xpath_modal_footer_links = "//div[@class='modal-footer']//a[contains(text(),'%s')]"
	xpath_modal_header = "//div[@class='modal-header']"

	#xpaths for elements in edit or create new modal.
	xpath_edit_create_modal_title_text = "//div[contains(@class, 'modal fade')]//input[@name='title']"
	xpath_edit_create_modal_desc_text = "//div[contains(@class, 'modal fade')]//textarea[@name='description']"

	#xpath to get the filter text box
    #xpath_filterbox_div = "//div[@class='table-caption table-caption-inner']"
	xpath_filter_text_box = "//div[contains(@class, 'table-caption-inner')]//form/input"

	#xpath to get number of DDs on lister page
	#xpath_number_of_objects="//h3[@class='app-common-savedpages-savedpagescountview'][div[@style='display: none;']]"
	xpath_all_elems = "//td//a[contains(text(),'%s')]"

	#xpath to get deep dive name
	xpath_object_name = "//tr[@class='expand app-common-savedpages-savedpagestablerowview even']//td[@class='title']//a"

	def __init__(self, browser):
		self.browser=browser
		self.logger = logging.getLogger("ListerPageUtil-logger.")
		super(ListerPageUtil, self).__init__(self.browser)

	def getRow(self, objectTitle):
		'''
		Given the object title, finds the rows on the lister page that match to the object title.
		@objectTitle : title of object
		If row found, returns list of elements in the row
		Else,raises exception if no object exists with that title.
		'''
		elements = self.getElements(By.XPATH, self.xpath_row_elements%objectTitle)
		if len(elements)>1:
			list = [objectTitle]
			for element in elements:
				if element.get_attribute("class") == "owner":
					list.append(element.text)
					self.logger.debug("object's owner is : "+element.text)
				if element.get_attribute("class") == "app":
					list.append(element.text)
					self.logger.debug("object's app is : "+element.text)
				if element.get_attribute("class") == "sharing":
					list.append(element.text)
					self.logger.debug("object is shared with : "+element.text)
			return list
		else:
			raise Exception

	def expandRowAndReturnDescription(self, objectTitle):
		'''
		Expands an object row given by 'objectTitle', to give details for the object.
		Returns list of details.
		eg. list: ['title', 'description', 'App itsi', 'Owner admin', 'Permissions Shared in App. Owned by admin.']
		'''
		elem_expand_icon = self.getElement(By.XPATH, self.xpath_expand_icon_link%objectTitle)
		elem_expand_icon.click()
		time.sleep(1)
		list = [objectTitle]
		desc = self.getElement(By.XPATH, self.xpath_expand_description, flag="visible").text
		list.append(desc.strip())
		expand_left_list = self.getElements(By.XPATH, self.xpath_expand_left_side_values)
		expand_right_list = self.getElements(By.XPATH, self.xpath_expand_right_side_values)
		for elem1, elem2 in zip(expand_left_list, expand_right_list):
			temp_string = elem1.text + " " + elem2.text
			list.append(temp_string.strip())
		self.logger.debug('expanded object row returns : '+ str(list))
		return list

	def selectEditDropdownOptions(self, option, objectTitle):
		'''
		Clicks on the edit dropdown of an object and selects the required option from it.
		@objectTitle : title of object
		@option : option to be selected from edit dropdown. can be 'Delete', 'Edit Page', 'Edit Title or Description', 'Edit Permissions', 'Clone'.
		'''
		elem_edit_dropdown = self.getElement(By.XPATH, self.xpath_edit_dropdown%objectTitle)
		elem_edit_dropdown.click()
		elem_edit_option = self.getElement(By.XPATH, self.xpath_edit_dropdown_options%option)
		elem_edit_option.click()
		self.logger.debug("selected %s option from edit dropdown for object %s.", option, objectTitle)

	def editPermissions(self, objectTitle, sharing):
		'''
		Edits the permission for given object.
		@objectTitle : title of object for which permissions to be edited.
		@sharing :  'Owner' or 'App'

		If permission is changed to App,
			returns True
		If alert is present while changing permission to Owner,
			returns True
		Else returns False
		'''
		self.selectEditDropdownOptions('Edit Permissions', objectTitle)
		if sharing == "App":
			elem_sharing_option = self.getElement(By.XPATH, self.xpath_permission_modal_sharing_option%sharing)
			elem_sharing_option.click()
			elem_save_btn = self.getElement(By.XPATH, self.xpath_modal_footer_links%'Save')
			elem_save_btn.click()
			return True
		else:
			elem_alert = self.getElement(By.XPATH, self.xpath_permission_modal_alert)
			alert_text = elem_alert.text.strip()
			elem_save_btn = self.getElement(By.XPATH, self.xpath_modal_footer_links%'Save')
			elem_save_btn.click()
			if alert_text == "To change permissions from App to Owner, please clone the object.":
				return True
		return False

	def editTitleDescription(self, objectTitle, newTitle=None, newDesc=None):
		'''
		Edits title or description of an object from lister page.
		'''
		self.selectEditDropdownOptions('Edit Title or Description', objectTitle)
		if newTitle != None:
			self.typeTitlePanel(newTitle)
			self.logger.debug("changed object title to: %s", newTitle)
		if newDesc != None:
			self.typeDescriptionPanel(newDesc)
			self.logger.debug("changed object description to: %s", newDesc)
		elem_modal_save = self.getElement(By.XPATH, self.xpath_modal_footer_links%'Save')
		elem_modal_save.click()

	def cloneObject(self, objectTitle, cloneObjectTitle, cloneObjectDesc=None):
		'''
		Method creates a clone of an object.
		'''
		self.selectEditDropdownOptions('Clone', objectTitle)
		self.typeTitlePanel(cloneObjectTitle)
		time.sleep(2)
		self.logger.debug("title of clone object is: %s", cloneObjectTitle)
		if cloneObjectDesc != None:
			self.typeDescriptionPanel(cloneObjectDesc)
			self.logger.debug("description of clone object is: %s", cloneObjectDesc)
		elem_modal_save = self.getElement(By.XPATH, self.xpath_modal_footer_links%'Clone Page')
		elem_modal_save.click()

	def typeTitlePanel(self, title):
		titleElem = self.getElement(By.XPATH, self.xpath_edit_create_modal_title_text)
		titleElem.clear()
		titleElem.send_keys(title)
		self.logger.debug("Entered title '%s' for object."%title)

	def typeDescriptionPanel(self, description):
		descriptionElem = self.getElement(By.XPATH, self.xpath_edit_create_modal_desc_text)
		descriptionElem.clear()
		descriptionElem.send_keys(description)
		self.logger.debug("Entered description '%s' for object."%description)


	def filter_from_listerpage(self, object):
		'''
		Method to filter deep dive or glass table from lister page
		'''
		filter_text_box = self.getElement(By.XPATH, self.xpath_filter_text_box)
		filter_text_box.clear()
		filter_text_box.send_keys(object)
		filter_text_box.send_keys(Keys.RETURN)
		self.logger.debug("filtered '%s'"%object)
		#time.sleep(3)
		all_elems = self.getElements(By.XPATH, self.xpath_all_elems%object)
		filter_text_box.clear()
		filter_text_box.send_keys(Keys.RETURN)
		return len(all_elems)





