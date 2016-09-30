import os
import logging
import time
from BasePage import BasePage
from selenium.common.exceptions import ElementNotVisibleException
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.keys import Keys
from selenium.webdriver import ActionChains
from selenium.webdriver.common.by  import By
from selenium.webdriver.common.alert import Alert
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from configure.ServiceDefPage import ServiceListerPage
from deep_dive.DeepDive import DeepDivePage

class Widget(BasePage):

	def __init__(self,browser, widget_type,label):
		'''
		Init finds the elem via its label. It then initialises all the xpaths we need from the widget
		like fill, stroke, data-value
		'''
		self.browser=browser
		self.logger = logging.getLogger("WidgetClass")
		super(Widget, self).__init__(self.browser)
		self.widget_type=widget_type
		self.right_click_menu_select = "//*[@class='context-menu-list context-menu-root']/li/span[text()='%s']"
		self.get_widget_from_data_value = "//div[@class='glass-table-editor-container']//*[local-name()='svg']//*[local-name()='tspan'][text()='%s']"
		#xpath for getting a specified label in a tspan- can be used with all widget types
		self.label_xpath = "//div[@class='glass-table-editor-container']//*[local-name()='svg']//*[local-name()='tspan'][text()='%s']"%label
		#following xpath is used to get the label. NOTE, we still need to provide part of label name. Used for determining order of widgets, usage in send to back
		self.get_label = "//div[@class='glass-table-editor-container']//*[local-name()='svg']//*[local-name()='tspan'][contains(text(),'%s')]"

		self.unit_xpath = "//*[local-name()='svg']/*[local-name()='text'][contains(@class,'Unit')]/*[local-name()='tspan']"

		#this xpath can be used to select next adjacent widget to current widget. it returns the list of all widget
		self.get_next_widget = "//*[local-name()='svg']//*[contains(@class,'draw2d_SetFigure') and @x  and @y]"
		if widget_type == "Noel":
			#you need a get attribute('stroke')on the foll xpath
			self.get_fill_or_stroke = "//div[@class='glass-table-editor-container']//*[local-name()='svg']//*[local-name()='tspan'][text( )='%s']/parent::*/preceding-sibling::*[name()='path'][1]"%label
			#.text on the following xpath
			self.get_data_value = "//div[@class='glass-table-editor-container']//*[local-name()='svg']//*[local-name()='tspan'][text( )='%s']/parent::*/following-sibling::*[name()='text'][1]/*[name()='tspan']"%label
			self.get_x_y= "//div[@class='glass-table-editor-container']//*[local-name()='svg']//*[local-name()='tspan'][text( )='%s']/parent::*/preceding-sibling::*[name()='rect'][@class='draw2d_SetFigure GaugeWidget'][1]"%label
		elif widget_type == "Sparkline":
			#use the foll xpath for fill, x and y
			self.get_fill_or_stroke="//div[@class='glass-table-editor-container']//*[local-name()='svg']//*[local-name()='tspan'][text( )='%s']/parent::*/preceding-sibling::*[name()='rect'][@class='draw2d_SetFigure SparklineWidget']"%label
			self.get_data_value ="//div[@class='glass-table-editor-container']//*[local-name()='svg']//*[local-name()='tspan'][text( )='%s']/parent::*/following-sibling::*[name()='text'][1]/*[name()='tspan']"%label

			self.select_widget_xy = "//div[@class='glass-table-editor-container']//*[local-name()='svg']//*[contains(@class,'draw2d_SetFigure SparklineWidget') and @x='%s' and @y='%s']"

		elif widget_type =="Svd":
			#use the foll xpath for x,y, and fill
			self.get_fill_or_stroke = "//div[@class='glass-table-editor-container']//*[local-name()='svg']//*[local-name()='tspan'][text( )='%s']/parent::*/following-sibling::*[name()='rect'][@class='draw2d_shape_basic_Rectangle SVDLayoutRect SingleValueDeltaWidgetChild'][1]"%label
			self.get_data_value = "//div[@class='glass-table-editor-container']//*[local-name()='svg']//*[local-name()='tspan'][text( )='%s']/parent::*/following-sibling::*[name()='text'][1]/*[name()='tspan']"%label

			self.select_widget_xy = "//div[@class='glass-table-editor-container']//*[local-name()='svg']//*[contains(@class,'draw2d_shape_basic_Rectangle SVDLayoutRect SingleValueDeltaWidgetChild') and @x='%s' and @y='%s']"

		elif widget_type == "SingleValueWidget":
			#use the following xpath for fill_stroke and x,y
			self.get_fill_or_stroke = "//div[@class='glass-table-editor-container']//*[local-name()='svg']//*[local-name()='tspan'][text( )='%s']/parent::*/preceding-sibling::*[name()='rect'][@class='draw2d_SetFigure SingleValueWidget'][1]"%label
			self.get_data_value= "//div[@class='glass-table-editor-container']//*[local-name()='svg']//*[local-name()='tspan'][text( )='%s']/parent::*/following-sibling::*[name()='text'][1]/*[name()='tspan']"%label

			self.select_widget_xy = "//div[@class='glass-table-editor-container']//*[local-name()='svg']//*[contains(@class,'draw2d_SetFigure SingleValueWidget') and @x='%s' and @y='%s']"

	def select(self, widget_number=1, locate_by='label'):
		'''
		Method clicks on the widget to make it active (selection)
		@widget_number:is the nth widget in case there are more than 1 with the same label
		by Default widget is 1 and choses the first widget found for that xpath/label
		@locate_by: 'label', looks for xpath that contains the label
		@locate_by: 'data-value' looks for xpath that contains data-value, used in cases where the widget has a hidden label
		'''

		time.sleep(3)
		actions = ActionChains(self.browser)
		if locate_by == 'label':
			widgets = self.browser.find_elements(By.XPATH, self.get_fill_or_stroke)
			#widgets[widget_number-1].click()
			actions.click(widgets[widget_number-1]).perform()
		elif locate_by == 'data-value':
			widgets = self.browser.find_elements(By.XPATH, self.get_widget_from_data_value%50)
			#widgets[widget_number-1].click()
			actions.click(widgets[widget_number-1]).perform()

	def selectByXY(self, x, y):
		'''
		Method clicks on the widget to make it active (selection)
		@x: x-coordinate inside widget dom element
		@y: y-coordinate inside widget dom element
		'''
		time.sleep(3)
		actions = ActionChains(self.browser)
		widget = self.getElement(By.XPATH, self.select_widget_xy%(x, y))
		actions.click(widget).perform()

	def getDataValue(self):
		'''
		Returns data-value for the widget
		'''
		return self.getElement(By.XPATH, self.get_data_value).text

	def getFill(self):
		'''
		Returns background color for the widget
		'''
		return self.getElement(By.XPATH, self.get_fill_or_stroke).get_attribute("fill")

	def getStroke(self):
		'''
		Returns Stroke
		NOTE: only applicable for Noel widget
		'''
		return self.getElement(By.XPATH, self.get_fill_or_stroke).get_attribute("stroke")

	def getXY(self):
		if self.widget_type=="Noel":
			return (self.getElement(By.XPATH, self.get_x_y).get_attribute("x"),
					self.getElement(By.XPATH, self.get_x_y).get_attribute("y"))

		else:
			return (self.getElement(By.XPATH, self.get_fill_or_stroke).get_attribute("x"),
					self.getElement(By.XPATH, self.get_fill_or_stroke).get_attribute("y"))

	def rightClickAndSelectOption(self, option, select_flag=True, locate_by="label"):
		'''
		Method is used to click on widget - if select flag = True,
		and then Right Click and Select provided option from context menu
		NOTE:There will be no clicking on the widget if select_flag= False. This is needed for operations like "Paste" after
		a "Cut" for eg.
		'''
		if select_flag == True:
			self.select(locate_by = locate_by)
		actions = ActionChains(self.browser)
		actions.context_click().perform()
		time.sleep(4)
		selection_elem = self.getElement(By.XPATH, self.right_click_menu_select%option)
		actions.click(selection_elem).perform()

	def isWidgetPresent(self, label=True, data_value=None):
		'''
			Method returns True if 1 or more widgets are found
			label = False when widget does not have a label
			data-value : needs to be provided when the label = False, widget will be searched with this value

		'''
		if label == True:
			data_value_elem_in_widget = self.browser.find_elements(By.XPATH, self.get_fill_or_stroke)
			if len(data_value_elem_in_widget) > 0:
				return True
			else:
				return False
		else:
			#If label = False, we cannot find by label. So finding directly by the data-value inside the widget
			#Note you should know the data-value
			data_value_elem_in_widget = self.browser.find_elements(By.XPATH, self.get_widget_from_data_value%data_value)
			if len(data_value_elem_in_widget) > 0:
				return True
			else:
				return False

	def countWidgetsPresent(self, label=True, data_value=None):
		'''
			Method returns count of widgets found
			label = False when widget does not have a label
			data-value : needs to be provided when the label = False, widget will be searched with this value

		'''
		if label == True:
			data_value_elem_in_widget = self.browser.find_elements(By.XPATH, self.get_fill_or_stroke)
			return len(data_value_elem_in_widget)
		else:
			#If label = False, we cannot find by label. So finding directly by the data-value inside the widget
			#Note you should know the data-value
			data_value_elem_in_widget = self.browser.find_elements(By.XPATH, self.get_widget_from_data_value%data_value)
			return len(data_value_elem_in_widget)

	def dragAndDrop(self, xoffset, yoffset):
		source_xy = self.getXY()
		self.logger.debug("Source x,y is :%s"%str(source_xy))
		self.select()
		actions = ActionChains(self.browser)
		elem = self.getElement(By.XPATH, self.get_data_value)
		actions.click_and_hold(elem).move_by_offset(xoffset, yoffset).release().perform()

	def isLabelVisible(self):
		'''
		Method returns True if label is visible, False if method is not visible
		'''
		try:
			label_elem = self.getElement(By.XPATH, self.label_xpath, flag='visible')
		except Exception:
			return False
		style = label_elem.get_attribute("style")
		if "display" in style:
			return False
		else:
			return True

	def getFirstMatchingLabel(self, match):
		'''
		Method returns the label on the widget that appears first in the DOM. == Label that is farthest back
		Typically used when you select by 'data-value' and want to find out the label on the element
		'''
		elem = self.getElement(By.XPATH, self.get_label%match)
		return str(elem.text)

	def getUnit(self):
		'''
		Method returns the unit prensent inside the widget. Will work for all widgets.
		'''
		count = 0
		while count < 3:
			try:
				elem_unit = self.getElement(By.XPATH, self.unit_xpath)
				unit = elem_unit.text
				break
			except Exception:
				count = count + 1
				if count == 3:
					raise
				time.sleep(1)
		return unit

	def drilldownToDeepDive(self, widget_number=1, locate_by='label'):
		'''
		Method drills down to deep dive by clicking on widget in view mode.
		@widget_number:is the nth widget in case there are more than 1 with the same label
		by Default widget is 1 and choses the first widget found for that xpath/label
		@locate_by: 'label', looks for xpath that contains the label
		@locate_by: 'data-value' looks for xpath that contains data-value, used in cases where the widget has a hidden label
		'''
		#self.select(widget_number, locate_by)
		if locate_by == 'label':
			widgets = self.browser.find_elements(By.XPATH, self.get_fill_or_stroke)
		elif locate_by == 'data-value':
			widgets = self.browser.find_elements(By.XPATH, self.get_widget_from_data_value%50)
		actions = ActionChains(self.browser)
		actions.click_and_hold(widgets[widget_number-1]).release().perform()
		while("deep_dive" not in self.getCurrentUrl()):
			time.sleep(1)
		return DeepDivePage(self.browser)

	def drilldownToCustomPages(self, widget_number=1, locate_by='label'):
		'''
		Method drills down to custom page provided by custom drilldown feature, by clicking on widget in view mode.
		@widget_number:is the nth widget in case there are more than 1 with the same label
		by Default widget is 1 and choses the first widget found for that xpath/label
		@locate_by: 'label', looks for xpath that contains the label
		@locate_by: 'data-value' looks for xpath that contains data-value, used in cases where the widget has a hidden label
		'''
		#self.select(widget_number, locate_by)
		if locate_by == 'label':
			widgets = self.browser.find_elements(By.XPATH, self.get_fill_or_stroke)
		elif locate_by == 'data-value':
			widgets = self.browser.find_elements(By.XPATH, self.get_widget_from_data_value%50)
		actions = ActionChains(self.browser)
		actions.click_and_hold(widgets[widget_number-1]).release().perform()
		time.sleep(2)

	def selectNextWidget(self):
		'''
		This method can be used to select next adjacent widget to current widget object.
		It should only be used when label is not set for a widget and therefore, you cannot access it with normal select method.
		for eg. in case of multi select drag and drop of KPIs. only first KPI widget is selected after dropping the KPIs.
		to select next KPI widget we can use this method as noraml method won't work because label is not set for next widget.
		'''
		time.sleep(2)
		elem_widgets = self.getElements(By.XPATH, self.get_next_widget)
		current_x, current_y = self.getXY()
		#sorting the list
		for i in range(len(elem_widgets)-1, 0 , -1):
			for j in range(0, i):
				if elem_widgets[j].get_attribute("x") > elem_widgets[j+1].get_attribute("x"):
					temp = elem_widgets[j]
					elem_widgets[j] = elem_widgets[j+1]
					elem_widgets[j+1] = temp
		#fetching next element to current element horizontally
		for i in range(len(elem_widgets)):
			if current_x == elem_widgets[i].get_attribute("x") and current_y == elem_widgets[i].get_attribute("y"):
				i = i + 1
				break
			i = i + 1
		actions = ActionChains(self.browser)
		actions.click(elem_widgets[i]).perform()

	def waitForData(self):
		'''
		Method can be used to wait for data to be populated on a widget.
		'''
		timeout=5
		while len(self.browser.find_elements(By.XPATH, self.get_data_value)) < 1:
			self.logger.debug('Waiting for data to load')
			time.sleep(1)
			timeout = timeout-1
			if timeout == 0:
				self.logger.debug("Reached timeout , data did not load. quitting function")
				return False
		return True

class GlassTablePage(BasePage):
	'''
	This Classs represents the Page Object for the Glass Table Page
	'''

	#following two xpaths are for adhoc search to get single still value on glass table and it's corresponding threshold field respectively.
	#'%s' can be replaced with any number.
	adhoc_search = "index=_internal | eval  value=%s |  timechart avg(value) as value"
	adhoc_search_threshold_field = "value"

	xpath_app_nav_bar = "//div[@class='nav']"
	'''
	Xpaths of elements on glass table page.
	'''
	xpath_create_new_glass_table_button = "//div[@class='main-section-body']//a[text()='Create New Glass Table']"
	xpath_create_glass_table_panel_button = "//div[contains(@class, 'modal fade')]//a[text()='Create Glass Table']"

	#following xpaths can be used to get any glass table link on lister page by giving the 'name of glass table' in place of '%s'
	xpath_created_glass_table = "//a[text()='%s']"
	#'%s' is filter text enetered in filter box on lister page. this gives list of glass table after filtering
	xpath_filter_glass_table_list = "//a[contains(text(),'%s')]"
	xpath_glass_table_edit = "//tr[td/a = '%s']/td[@class='actions']//a[@class='dropdown-toggle']"
	xpath_row_elements = "//td[@class='title'][a[text()='%s']]/parent::tr/td"
	xpath_expand_icon_link = "//td[@class='title'][a[text()='%s']]/parent::tr/td[@class='expands']/a"

	#following xpaths are for glass table lister page edit dropdown. can be used for every option inside the dropdown.
	#eg. '%s' : 'Delete', 'Edit Page', 'Edit Title or Description', 'Edit Permissions', 'Clone'.
	xpath_edit_dropdown_options = "//div[@class='dropdown-menu dropdown-menu-narrow open']//li/a[contains(text(),'%s')]"


	#modal save, clone, delete or cancel link. '%s' could be 'Save', 'Clone Page',  'Delete', 'Done' or 'Cancel'
	xpath_modal_footer_links = "//div[@class='modal-footer']//a[contains(text(),'%s')]"
	xpath_modal_header = "//div[@class='modal-header']"

	#glass table editor edit dropdown options. '%s' can be 'Delete' or 'Edit Title or Decsription'
	xpath_glass_table_editor_delete_or_edit_title = "//div[contains(@class,'glass-table-edit-menu')]//a[contains(text(), '%s')]"

	xpath_glass_table_update_panel_save_button = "//a[contains(text(), 'Save')]"
	xpath_glass_table_editor_save_button = "//button[contains(text(),'Save')]"
	xpath_glass_table_editor_clear_button = "//a[contains(text(), 'Clear')]"
	xpath_glass_table_editor_edit_button = "//div[@class='btn-group edit-btn-grp']//a[contains(@class,'glass-table-edit-menu')]"
	xpath_glass_table_editor_revert_button = "//a[contains(text(), 'Revert')]"
	xpath_glass_table_view_edit_button = "//a[@class='gt-header-button btn gt-mode-button']"
	xpath_splunk_service_on_glass_table_editor = "//li[@title='Splunk Service']"
	xpath_glass_table_editor_view_button = "//a[contains(text(), 'View')]"
	xpath_glass_table_editor_service_panel = "//div[@class='editor-context-container']"
	xpath_glass_table_editor_canvas = "//div[@id='drawing_canvas']//*[local-name()='svg']"


	#xpath for buttons on glass table editor toolbar. Buttons such as rectangle, ellipse, line, adhoc search etc can be found using this xpath.
	#'%s' can be replaced by name of element to get the corresponding element.
	#'%s' : 'select', 'pan', 'background', 'rectangle', 'ellipse', 'line', 'connect', 'text', 'adhocSearch'
	xpath_toolbar_buttons = "//div[@class='toolbar-btn-group']/button[@id='%sButton']"

	#xpaths for elements in create new glass table panel.
	xpath_title_panel_text = "//div[contains(@class, 'modal fade')]//input[@name='title']"
	xpath_description_panel_text = "//div[contains(@class, 'modal fade')]//textarea[@name='description']"
	#xpaths for permission element in create new glass table panel.
	xpath_permission_button = "//div[contains(@class, 'modal fade')]//button[contains(text(), '%s')]"

	#xpath for links in navigation menu.
	xpath_configure_dropdown = "//div[@class='nav']//a[@title='Configure']"
	#xpaths for links inside configure dropdown. '%s' can be used for {Services, Entities, Correlation Searches}.
	xpath_services_in_configure_dropdown_link = "//div[@class='dropdown-menu open']//a[contains(text(), '%s')]"

	#can be used to find Single Value and Sparkline Widgets on canvas using the x-coordinate of the widget.
	#First '%s' can be replced with 'SingleValue' or 'Sparkline' for corresponding type of widget.
	#Second '%s' can be replaced with 'x-coordinate' to find the element.
	#you need to know the x-corrdinate of the widget to use this xpath.
	xpath_canvas_single_value_or_sparkline_widget = "//div[@class='glass-table-editor-container']//*[local-name()='svg']//*[contains(@class,'draw2d_SetFigure %sWidget') and @x='%s']"
	#can be used to find Gauge Widget on canvas using the 'stroke' color of the widget. '%s' can be replaced with 'color value' to find the element.
	#you need to know the stroke color of the widget to use this xpath.
	#this might not work if there are multiple gauge widgets on canvas with same color or we don't know the stroke color for gauge beforehand.
	xpath_canvas_gauge_widget = "//div[@class='glass-table-editor-container']//*[local-name()='svg']//*[contains(@class,'GaugeWidget') and @stroke='%s']"
	#can be used to find Sigle Value Delta Widget on canvas using the x-coordinate of the widget.
	#%s' can be replaced with 'x-coordinate' to find the element.
	xpath_canvas_svd_widget = "//div[@class='glass-table-editor-container']//*[local-name()='svg']//*[contains(@class,'draw2d_shape_basic_Rectangle SVDLayoutRect SingleValueDeltaWidgetChild') and @x='%s']"

	#This xpath can  work for ad hoc search single value, gauge, sparkline and svd widgets in which search generates single constant value.
	#Eg. search = "index=_internal | eval  value=50 |  stats avg(value) as value" will always generate 50 inside widget.
	#So, first '%s' should replaced by 'SingleValue', 'Gauge', 'Sparkline' or 'SingleValueDelta' for corresponding viz type.
	#Second '%s' should be replaced by 'constant value generated by search eg. '50' for above search, to get this element.
	xpath_text_inside_widgets = "//div[@class='glass-table-editor-container']//*[local-name()='svg']//*[contains(@class,'%sWidgetChild')]/*[text()='%s']"

	xpath_path_elements_inside_svg = "//div[@class='glass-table-editor-container']//*[local-name()='svg']/*[local-name()='path']"


	#xpaths for glass table editor config panel elements
	xpath_glass_table_editor_config_panel = "//div[@class='editor-config-container']"
	xpath_configure_panel_fillcolor_textarea = "//input[@name='bgColor']"
	xpath_configure_panel_bordercolor_textarea = "//input[@name='color']"
	xpath_configure_panel_borderwidth_textarea = "//input[@name='stroke']"
	#this xpath can be used to get both on or off threshold buttons on config panel.
	#replace '%s' by 'On' or 'Off' for respective button.
	xpath_config_panel_threshold_on_off_btn = "//button[@name='isThresholdEnabled' and contains(text(),'%s')]"
	xpath_config_panel_threshold_field_text = "//div[@class='threshold-container']//input[@class='config-threshold-field']"
	xpath_config_panel_threshold_edit_link = "//div[@class='threshold-container']//a[contains(@class,'btn')]"
	xpath_config_panel_adhoc_search_text = "//div[@class='search-controls-container adhoc-container']//textarea[@class='config-search']"

	#can be used fo both to access both update and delete buttons on config panel. '%s' can be 'Update' or 'Delete'
	xpath_config_panel_update_delete_btn = "//div[@class='config-footer']//button[contains(text(),'%s')]"
	#xpaths for selecting viz types from config panel.
	#'%s' can be replcaced by 'btn viz-button', 'gauge', 'sparkline' or 'svd', for single value, gauge, sparkline and single value delta viz types resp.
	xpath_config_panel_viz_type_btn = "//div[@data-name='vizType']/button[contains(@class,'%s')]"
	#can be used to find both width and height text areas. '%s' can be replaced by 'width' or 'height'
	xpath_config_panel_width_height_text = "//div[@class='config-content form-horizontal']//input[@name='%s']"
	xpath_config_panel_lock_unlock_btn = "//a[contains(@class,'config-lock btn')]"

	#can be used for input boxes on config panel. '%s' can be 'labelVal', 'unit', 'width', 'height' or 'dataModelWhereClause'.
	xpath_config_panel_input_boxes = "//input[@name='%s']"

	#xpaths for glass table editor context panel elements

	#'%s' can be replaced with name of service or 'Ad hoc Search' to get the desired service or adhoc search widget.
	xpath_service_panel_service_or_adhoc_search = "//div[@class='context-list hideable']//li[@title='%s']"
	#'%s' can be replaced with name of kpi to get dedired kpi
	xpath_service_panel_kpi = "//div[@class='context-list hideable']//li/ul[contains(@style,'block')]/li[@title='%s']"
	#can be used to check if a service is expanded or not. '%s' is service name
	xpath_service_panel_kpi_list_inside_service = "//div[@class='context-list hideable']//li[@title='%s']/ul[@class='context-inner-kpi-list']"
	xpath_check_icon_kpi_present = "//div[@class='context-list hideable']//li/ul[contains(@style,'block')]/li[@title='%s']/span[contains(@class,'context-item-present')]"
	#can be used to find number of services on service panel list.
	xpath_service_panel_service_list = "//div[@class='context-list hideable']//ul[@class='context-inner-list']/li[contains(@class,'item-service')]"


	#xpath for elements in 'Select KPI' modal which shows up while dragging and dropping a service on canvas.
	xpath_selectKPI_modal_kpi_dropdown_link = "//div[@class='form form-horizontal']//a[@class='dropdown-toggle btn']"
	#can be used to select different KPI dropdown options by replacing '%s' with corresponding option name in dropdown.
	xpath_selectKPI_modal_kpi_dropdown_options_link = "//div[@class='dropdown-menu dropdown-menu-selectable open']//span[text()='%s']/parent::a"
	xpath_selectKPI_modal_done_link = "//div[@class='modal-footer']/a[@class='btn btn-primary modal-btn-primary pull-right']"
	xpath_selectKPI_modal_footer = "//div[@class='modal-footer']"

	#can be used to get list of delete elements on threshold panel, to delete thresholds.
	#Then you can use specific element in the list to be deleted. For this you need to know the sequence of thresholds on threshold panel beforehand to delete the exact threshold.
	xpath_threshold_modal_delete_btn_list = "//div[@class='thresholdsetting-label-controls']//a[@class='delete-button']"
	xpath_threshold_modal_done_link = "//div[@class='modal-footer']/a[contains(@class,'btn')]"
	xpath_threshold_modal_footer = "//div[@class='modal-footer']"
	#'%s': 'min' or 'max'
	xpath_threshold_modal_min_max_input = "//input[@class='threshold-preview-render-boundary-%s']"
	xpath_threshold_modal_base_severity_link = "//div[@data-name='baseSeverityLabel']/a"
	xpath_threshold_modal_base_severity_span = "//div[@data-name='baseSeverityLabel']/a/span[@class='link-label']"
	xpath_threshold_modal_add_threshold_link = "//div[@class='thresholdsetting-add-control']/a"
	xpath_threshold_modal_severity_links = "//div[@data-name='severityLabel']/a"
	xpath_threshold_modal_severity_spans = "//div[@data-name='severityLabel']/a/span[@class='link-label']"
	xpath_threshold_modal_severity_value_input = "//div[@data-name='thresholdValue']/input"

	#xpaths for shaped on canvas
	#use x and y coordinates to find rect and ellipse shapes on canvas.
	#line shape has no x and y coordinate on canvas.
	xpath_canvas_rect_shape = "//div[@class='glass-table-editor-container']//*[local-name()='path' and contains(@class,'shape_basic_Polygon') and @x='%s']"
	xpath_canvas_ellipse_shape = "//div[@class='glass-table-editor-container']//*[local-name()='ellipse' and contains(@class,'shape_basic_Polygon') and @x='%s']"
	xpath_canvas_line_shape = "//div[@class='glass-table-editor-container']//*[local-name()='path' and contains(@class,'shape_basic_PolyLine')]"

	#xpath for opening colorpicker on config panel
	#'%s' : 'fill', 'color' or 'line' for fill color, border color and line color resp.
	xpath_colorpicker_open = "//div[contains(@class,'config-%s-color')]//div[@class='colorpicker_open']"
	xpath_colorpicker_colorbox = "//div[contains(@class,'config-%s-color')]//div[@class='colorpicker_colorBox']"

	#xpaths for colorpicker
	#xpath for both color and hue div. '%s' : 'color' or 'hue'
	xpath_colorpicker_color_or_hue = "//div[@class='colorpicker' and contains(@style,'display')]/div[@class='colorpicker_%s']"
	#xpath for both new color and current color div. '%s' : 'new' or 'current'
	#if multiple color pickers are on the page it finds multiple elements. use getElements and thes find resp. element in list.
	xpath_colorpicker_new_or_current_color = "//div[@class='colorpicker']/div[@class='colorpicker_%s_color']"
	xpath_colorpicker_hex_text = "//div[@class='colorpicker' and contains(@style,'display')]/div[@class='colorpicker_hex']/input"
	xpath_colorpicker_update_btn = "//div[@class='colorpicker' and contains(@style,'display')]/div[@class='colorpicker_submit btn']"

	#used to turn on or off using KPI summary for service kPI widget. '%s' : 'yes' or 'no'
	xpath_use_kpi_summary_on_off_btn = "//div[@data-name='useKPISummary']//button[@data-value='%s']"

	#xpath to get the button that is clicked for 'use KPI summary'
	xpath_kpi_summary_button = "//div[@data-name='useKPISummary']/button[contains(@class,'active')]"

	#can be used to select sharing options in edit permissions modal in glass table. '%s' can be 'Owner' or 'App'.
	xpath_permission_modal_sharing_option = "//div[@data-name='sharing']/button[contains(text(),'%s')]"

	#following xpaths can be used to get details of glass table after expanding the glass table row.
	xpath_expand_description = "//tr[contains(@class,'more-info')]//p[@class='page-description']"
	xpath_expand_left_side_values = "//tr[contains(@class,'more-info')]//dt"
	xpath_expand_right_side_values = "//tr[contains(@class,'more-info')]//dd"

	xpath_filter_input = "//input[@placeholder='filter']"

	xpath_service_panel_filter_input = "//div[@class='editor-context-container']//input[@placeholder='filter']"


	#can be used to select search type for adhoc search widget. '%s' : 'Ad hoc' or 'Data Model'.
	xpath_config_panel_search_type_btn = "//div[@data-name='searchSource']/button[contains(text(),'%s')]"
	xpath_config_panel_edit_datamodel_link = "//div[contains(@class,'datamodel-selector-container')]//div[label[contains(text(),'Data Model')]]//a"
	xpath_config_panel_aggregation_link = "//div[contains(@class,'datamodel-selector-container')]//div[label[contains(text(),'Aggregation')]]//a"
	#'%s' can be 'Count', 'Average', 'Distinct Count' etc.
	xpath_config_panel_aggregation_dropdown_option = "//ul[@class='dropdown-menu-main']//span[text()='%s']/parent::a"
	xpath_config_panel_uneditable_search = "//div[contains(@class,'search-controls-container')][contains(@style,'display: block')]//span[contains(@class,'config-search')]"
	xpath_config_panel_adhoc_run_search_link = "//div[contains(@class,'search-controls-container')][contains(@style,'display: block')]//a[@class='run-search']"
	xpath_config_panel_kpi_run_search_link = "//a[@class='run-search']"

	#xpaths for edit data model modal
	xpath_datamodel_modal_dropdown_link = "//div[contains(@class,'data-model-selector')]//div[@data-name='datamodel']/a"
	xpath_datamodel_modal_object_dropdown_link = "//div[contains(@class,'data-model-selector')]//div[@data-name='object']/a"
	xpath_datamodel_modal_field_dropdown_link = "//div[contains(@class,'data-model-selector')]//div[@data-name='field']/a"
	#'%s' can be any data model like 'Alerts', 'Application State' etc.
	xpath_datamodel_object_field_dropdown_option = "//div[contains(@class,'dropdown-menu-selectable')][contains(@style,'display: block')]//ul/li//span[contains(text(),'%s')]/parent::a"


	xpath_time_picker_dropdown_link = "//div[@class='glass-table-bar']//a[contains(@class,'time-instant-picker')]"
	#'%s' can be 'Now', 'Yesterday', '60 minutes ago' etc.
	xpath_time_picker_preset_link = "//div[@class='time-instant-picker-content']//a[@data-time-preset='%s']"

	xpath_edit_link_in_view_mode = "//a[contains(@class,'gt-mode-button')]"

	xpath_glass_table_editor_bar = "//div[@class='glass-table-bar']"

	xpath_service_panel_create_service_link = "//div[@class='context-create-service hideable']/a[@class='create-service-link']"

	#these xpaths should be used when no figure is selected on canvas, as these elements are only present when now figure is selected
	xpath_config_panel_description = "//div[@class='config-panel-content']/div[@class='config-description']"
	xpath_config_panel_position_control_row = "//div[contains(@class,'config-body')]/div[contains(@class,'position-control-row')]"

	#'%s' can be 'config' or 'context' for config or context panel resp.
	xpath_context_config_panel_collapse_icon = "//div[@class='%s-hide hide-icon']/i"
	xpath_context_config_panel_collapsed_title = "//div[@class='%s-collapsed-title']"
	xpath_context_config_panel_expand_icon = "//div[@class='%s-hide show-icon']/i"
	xpath_context_panel_expanded_title = "//li[@class='gt-nav-active service-tab']/div"
	xpath_config_panel_expanded_title = "//h3[@class='config-title']"

	#'%s' can be 'On' or 'Off'
	xpath_config_panel_custom_drilldown_on_off_btn = "//div[contains(@class,'custom-drilldown-toggle')]//button[contains(text(),'%s')]"
	xpath_config_panel_custom_drilldown_object_type_dropdown_link = "//div[contains(@class,'custom-drilldown-object-type')]//a"
	xpath_config_panel_custom_drilldown_object_dropdown_link = "//div[contains(@class,'custom-drilldown-object-list')]//a"
	xpath_config_panel_custom_drilldown_custom_url_input = "//div[@data-name='customUrl']/input[contains(@class,'custom-url')]"
	#'%s' can be replaced with object name. e.g. 'Saved Deep Dive' for custom drilldown dropdown option
	xpath_config_panel_custom_drilldown_object_type_list = "//ul[@class='dropdown-menu-main']//a[span[text()='%s']]"
	xpath_config_panel_custom_drilldown_object_list = "//ul[@class='select2-results']//div[text()='%s']"
	#'%s' should be the string enetered in search text box for finding the required object
	xpath_config_panel_custom_drilldown_object_list_by_search = "//ul[@class='select2-results']//div"
	xpath_config_panel_custom_drilldown_object_search_input = "//div[@class='select2-search']/input"

	xpath_view_mode_glass_table_title_header = "//div[@class='glass-table-title']/h2"
	#xpaths fo view mode view type of a glass table
	xpath_view_mode_view_type_link = "//div[@data-name='viewType']/a"
	xpath_view_mode_view_type_span = "//div[@data-name='viewType']/a/span[@class='link-label']"
	#'%s' can be 'Standard View' or 'Full Screen View'.
	xpath_view_type_dropdown_options = "//div[contains(@class,'dropdown-menu-selectable')][contains(@style,'display: block')]//ul/li//span[contains(text(),'%s')]/parent::a"

	xpath_config_panel_header_kpi_title = "//div[@class='config-body-title-value']"
	xpath_config_panel_header_service_title = "//div[@class='config-body-subtitle-value']"
	xpath_config_panel_header_adhoc_search_title = "//div[@class='config-body-title-adhoc']"

	xpath_permission_modal_alert="//div[contains(@class,'alert-error')]"

	xpath_config_panel_earliest_time_link = "//div[contains(@class,'config-earliest-time-picker')]/a"
	#select earliest time from dropdown. '%s' can be '30 minutes ago', '2 hours ago', etc.
	xpath_config_panel_earliest_time_dropdown = "//div[contains(@class,'dropdown-menu-selectable')]//a[span[text()='%s']]"

	#xpath can be used for a common dropdown which is used at multiple places in glass table. '%s' : name of option.
	xpath_common_dropdown_option_link = "//div[contains(@class,'dropdown-menu-selectable')][contains(@style,'display: block')]//span[contains(text(),'%s')]/parent::a"

	def __init__(self, browser):
		self.browser=browser
		self.logger = logging.getLogger("GlassTablePage")
		super(GlassTablePage, self).__init__(self.browser)

	def gotoServiceViewer(self):
		'''
            This method redirects to ServiceLister page by clicking on 'Services' link
            in 'Configure' dropdown link.
        '''
		service_link = "Services"
		elem_conf = self.getElement(By.XPATH, self.xpath_configure_dropdown)
		elem.click()
		elem = self.getElement(By.XPATH, self.xpath_services_in_configure_dropdown_link%service_link)
		elem.click()
		return ServiceListerPage(self.browser)

	def create_new_glass_table(self, dict):
		'''
			Creates new glass table with title "glassTableTitle" and description glassTableDescription.
			Creates new glass table with the fields value given by dictionary, which contains values for fields like name, description, etc.
			@dict =
				{
		           'Title' : 'title',

		           'Description' : 'description',

		           'Permissions' : 'Shared' or 'Private'
		        }
 		'''
		self.logger.debug("Creating new glass table...")
		elem_create_gt = self.getElement(By.XPATH, self.xpath_create_new_glass_table_button)
		self.click(elem_create_gt)
		#time.sleep(2)
		self.typeTitlePanel(dict['Title'])
		#time.sleep(1)
		self.typeDescriptionPanel(dict['Description'])
		self.selectPermission(dict['Permissions'])
		#time.sleep(1)
		elem_create_gt_panel = self.getElement(By.XPATH, self.xpath_create_glass_table_panel_button)
		elem_create_gt_panel.click()
		self.navigateToItsiPage("Glass Tables")
		#time.sleep(2)
		#self.browser.wait_for_element_not_visible(By.XPATH, "//div[@class='modal-header']")
		self.logger.debug("New glass table '%s' created."%dict['Title'])

	def typeTitlePanel(self, title):
		titleElem = self.getElement(By.XPATH, self.xpath_title_panel_text)
		titleElem.click()
		titleElem = self.getElement(By.XPATH, self.xpath_title_panel_text)
		titleElem.clear()
		titleElem = self.getElement(By.XPATH, self.xpath_title_panel_text)
		titleElem.send_keys(title)
		self.logger.debug("Entered title '%s' for new glass table."%title)

	def typeDescriptionPanel(self, description):
		descriptionElem = self.getElement(By.XPATH, self.xpath_description_panel_text)
		descriptionElem.click()
		descriptionElem = self.getElement(By.XPATH, self.xpath_description_panel_text)
		descriptionElem.clear()
		descriptionElem = self.getElement(By.XPATH, self.xpath_description_panel_text)
		descriptionElem.send_keys(description)
		self.logger.debug("Entered description '%s' for new glass table."%description)

	def selectPermission(self, permissionType):
		'''
		Can be used to select the permission for glass table.
		@permissionType = 'Shared' or 'Private'
		'''
		elem_permission = self.getElement(By.XPATH, self.xpath_permission_button%permissionType)
		elem_permission.click()
		self.logger.debug("Selected permission '%s' for new glass table."%permissionType)

	def setLabel(self,label):
		'''
		Method assumes that the widget is in selection.It will add the label provided and click Update
		'''
		self.getElement(By.XPATH, self.xpath_config_panel_input_boxes%'labelVal').click()
		self.getElement(By.XPATH, self.xpath_config_panel_input_boxes%'labelVal').clear()
		self.getElement(By.XPATH, self.xpath_config_panel_input_boxes%'labelVal').send_keys(label)
		self.update_glass_table_widget()


	def delete_glass_table(self, glassTableTitle="Test_Glass_Table"):
		'''
        	Delete a Glass Table from glass table lister page.
		'''
		edit_elems = self.getElements(By.XPATH, self.xpath_glass_table_edit%glassTableTitle)
		while(len(edit_elems) > 0):
			edit_elems[0].click()
			delete_elem = self.getElement(By.XPATH, self.xpath_edit_dropdown_options%'Delete')
			delete_elem.click()
			confirm = self.getElement(By.XPATH, self.xpath_modal_footer_links%'Delete')
			confirm.click()
			while len(self.getElements(By.XPATH, self.xpath_modal_header)) != 0:
				time.sleep(1)
			#self.browser.wait_for_element_not_visible(By.XPATH, "//div[@id='modal_delete']/div[@class='modal-header']", refresh=True)
			self.navigateToItsiPage('Glass Tables')
			edit_elems=self.getElements(By.XPATH, self.xpath_glass_table_edit%glassTableTitle)
			self.logger.info("Number of %s found on the Lister Page:"%glassTableTitle + str(len(edit_elems)))
			if len(edit_elems)==0:
				self.logger.info("In Break for while")
				break

		deleted_elem = self.getElements(By.XPATH, self.xpath_glass_table_edit%glassTableTitle)
		if len(deleted_elem)>0:
			return False
		else:
			return True

	def deleteGlassTableFromEditorPage(self, glassTableTitle):
		'''
		Deletes glass table from editor page and verifies if glass table is deleted.
		if deleted, returns True
		else, returns False.
		'''
		elem_edit_dropdown = self.getElement(By.XPATH, self.xpath_glass_table_editor_edit_button)
		elem_edit_dropdown.click()
		elem_delete = self.getElement(By.XPATH, self.xpath_glass_table_editor_delete_or_edit_title%'Delete')
		elem_delete.click()
		elem_modal_delete = self.getElement(By.XPATH, self.xpath_modal_footer_links%'Delete')
		elem_modal_delete.click()
		self.browser.wait_for_element_present(By.XPATH, self.xpath_create_new_glass_table_button)
		deleted_elem = self.getElements(By.XPATH, self.xpath_glass_table_edit%glassTableTitle)
		if len(deleted_elem)>0:
			return False
		else:
			return True

	def getRow(self, glassTableTitle):
		'''
		Given the glass table title, finds the rows on the lister page that match to the glass table title.
		@glassTableTitle : name of glass table
		If row found, returns list of elements in the row
		Else,raises exception if no glass table exists with that name.
		'''
		elements = self.getElements(By.XPATH, self.xpath_row_elements%glassTableTitle)
		if len(elements)>1:
			list = [glassTableTitle]
			for element in elements:
				if element.get_attribute("class") == "owner":
					list.append(element.text)
					self.logger.debug("glass table's owner is : "+element.text)
				if element.get_attribute("class") == "app":
					list.append(element.text)
					self.logger.debug("glass table's app is : "+element.text)
				if element.get_attribute("class") == "sharing":
					list.append(element.text)
					self.logger.debug("glass table is shared with : "+element.text)
			return list
		else:
			raise Exception

	def expandRowAndReturnDescription(self, glassTableTitle):
		'''
		Expands a glass table row given by 'glassTableTitle', to give details for the glass table.
		Returns list of details.
		eg. list: ['title', 'description', 'App itsi', 'Owner admin', 'Permissions Shared in App. Owned by admin.']
		'''
		elem_expand_icon = self.getElement(By.XPATH, self.xpath_expand_icon_link%glassTableTitle)
		elem_expand_icon.click()
		time.sleep(1)
		list = [glassTableTitle]
		desc = self.getElement(By.XPATH, self.xpath_expand_description, flag="visible").text
		list.append(desc.strip())
		expand_left_list = self.getElements(By.XPATH, self.xpath_expand_left_side_values)
		expand_right_list = self.getElements(By.XPATH, self.xpath_expand_right_side_values)
		for elem1, elem2 in zip(expand_left_list, expand_right_list):
			temp_string = elem1.text + " " + elem2.text
			list.append(temp_string.strip())
		self.logger.debug('expanded glass table row returns : '+ str(list))
		return list

	def selectEditDropdownOptions(self, option, glassTableTitle='Test_Glass_Table'):
		'''
		Clicks on the edit dropdown of a glass table and selects the required option from it.
		@glassTableTitle : title of glass table
		@option : option to be selected from edit dropdown. can be 'Delete', 'Edit Page', 'Edit Title or Description', 'Edit Permissions', 'Clone'.
		'''
		elem_edit_dropdown = self.getElement(By.XPATH, self.xpath_glass_table_edit%glassTableTitle)
		elem_edit_dropdown.click()
		elem_edit_option = self.getElement(By.XPATH, self.xpath_edit_dropdown_options%option)
		elem_edit_option.click()
		self.logger.debug("selected %s option from edit dropdown for glass table %s.", option, glassTableTitle)

	def editPermissions(self, glassTableTitle, sharing):
		'''
		Edits the permission for given glass table.
		@glassTableTitle : title of glass table for which permissions to be edited.
		@sharing :  'Owner' or 'App'

		If permission is changed to App,
			returns True
		If alert is present while changing permission to Owner,
			returns True
		Else returns False
		'''
		self.selectEditDropdownOptions('Edit Permissions', glassTableTitle)
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
		'''try:
			WebDriverWait(self.browser, 2).until(EC.alert_is_present())
			alert = self.browser.switch_to_alert()
			alert.accept()
			self.logger.debug("alert accepted.")
			return False
		except Exception:
			self.logger.debug("alert not present.")
			return True
		'''

	def editTitleDescription(self, glassTableTitle, newTitle=None, newDesc=None):
		'''
		Edits title or description of a glass table from lister page.
		'''
		self.selectEditDropdownOptions('Edit Title or Description', glassTableTitle)
		if newTitle != None:
			self.typeTitlePanel(newTitle)
			self.logger.debug("changed glass table title to: %s", newTitle)
		if newDesc != None:
			self.typeDescriptionPanel(newDesc)
			self.logger.debug("changed glass table description to: %s", newDesc)
		elem_modal_save = self.getElement(By.XPATH, self.xpath_modal_footer_links%'Save')
		elem_modal_save.click()

	def editTitleDescriptionFromEditorPage(self, newTitle=None, newDesc=None):
		'''
		Edits title or description of a glass table from editor page.
		'''
		elem_edit_dropdown = self.getElement(By.XPATH, self.xpath_glass_table_editor_edit_button)
		elem_edit_dropdown.click()
		elem_edit_title_desc = self.getElement(By.XPATH, self.xpath_glass_table_editor_delete_or_edit_title%'Edit Title or Description')
		elem_edit_title_desc.click()
		if newTitle != None:
			self.typeTitlePanel(newTitle)
			self.logger.debug("changed glass table title to: %s", newTitle)
		if newDesc != None:
			self.typeDescriptionPanel(newDesc)
			self.logger.debug("changed glass table description to: %s", newDesc)
		elem_modal_save = self.getElement(By.XPATH, self.xpath_modal_footer_links%'Save')
		elem_modal_save.click()

	def cloneGlassTable(self, glassTableTitle, cloneGlassTableTitle, cloneGlassTableDesc=None):
		'''
		Methods creates a clone of a glass table.
		'''
		self.selectEditDropdownOptions('Clone', glassTableTitle)
		self.typeTitlePanel(cloneGlassTableTitle)
		self.logger.debug("title of clone glass table is: %s", cloneGlassTableTitle)
		if cloneGlassTableDesc != None:
			self.typeDescriptionPanel(cloneGlassTableDesc)
			self.logger.debug("description of clone glass table is: %s", cloneGlassTableDesc)
		elem_modal_save = self.getElement(By.XPATH, self.xpath_modal_footer_links%'Clone Page')
		elem_modal_save.click()

	def clear_and_fill_textarea(self, xpath, text):
		'''
			Clears and fills a textarea.
		'''
		element = self.getElement(By.XPATH, xpath)
		element.click()
		element = self.getElement(By.XPATH, xpath)
		element.clear()
		element = self.getElement(By.XPATH, xpath)
		element.send_keys(text)

	def should_see_text_in(self, text, xpath):
		'''
			Check text in textarea.
		'''
		element = self.getElement(By.XPATH, xpath)
		value = element.get_attribute("value")
		if value == text:
			return True
		else:
			return False

	def drag_drop_offset(self, sx, sy, cx, cy):
		'''
	     	A unique way to get xpath for svg element.You can also do this "//*[local-name()='svg' and namespace-uri()='http://www.w3.org/2000/svg']nd namespace-uri()='http://www.w3.org/2000/svg'" but IE does not support and.
    		canvas= self.browser.browser.find_element_by_xpath("//*[local-name()='svg']")
    	 	Use CSS Selector to get to canvas svg. DASH breaks selection by XPATH.
   		'''
		canvas = self.browser.browser.find_element_by_css_selector("div#drawing_canvas.ui-droppable svg")
		# Javascript for simulating Drag and Drop. Helps us to test across browsers and not rely on Native Selenium commands which may or may not work.
		dnd="function simulate(f,c,d,e){var b,a=null;for(b in eventMatchers)if(eventMatchers[b].test(c)){a=b;break}if(!a)return!1;document.createEvent?(b=document.createEvent(a),a==\"HTMLEvents\"?b.initEvent(c,!0,!0):b.initMouseEvent(c,!0,!0,document.defaultView,0,d,e,d,e,!1,!1,!1,!1,0,null),f.dispatchEvent(b)):(a=document.createEventObject(),a.detail=0,a.screenX=d,a.screenY=e,a.clientX=d,a.clientY=e,a.ctrlKey=!1,a.altKey=!1,a.shiftKey=!1,a.metaKey=!1,a.button=1,f.fireEvent(\"on\"+c,a));return!0} var eventMatchers={HTMLEvents:/^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,MouseEvents:/^(?:click|dblclick|mouse(?:down|up|over|move|out))$/}; " + 	"simulate(arguments[0],\"mousedown\",arguments[1],arguments[2]); simulate(arguments[0],\"mousemove\",arguments[3],arguments[4]); simulate(arguments[0],\"mouseup\",arguments[3],arguments[4]);"
		self.browser.browser.execute_script(dnd,canvas,int(sx),int(sy),int(cx),int(cy))

	def saveGlassTable(self):
		'''
		Saves a glass table and navigates to Glass Table Lister Page.
		'''
		elem_save_button = self.getElement(By.XPATH, self.xpath_glass_table_editor_save_button)
		elem_save_button.click()

	def exitGlassTableEditor(self):
		'''
		Navigates to glass table lister page from editor page. Accepts pop-up if glass table is not saved and then leaves editor page.
		'''
		self.navigateToItsiPage("Glass Tables")
		try:
			WebDriverWait(self.browser, 3).until(EC.alert_is_present())
			alert = self.browser.switch_to_alert()
			alert.accept()
			self.logger.debug("alert accepted")
		except Exception:
			self.logger.debug("alert not present")
		self.logger.debug("saved glass table and navigated to glass table lister page")


	def enter_adhoc_search(self, search):
		'''
		Enters the search in adhoc search field and clicks on update button.
		@search : adhoc search string
		'''
		elem_adhoc_search = self.getElement(By.XPATH, self.xpath_config_panel_adhoc_search_text)
		elem_adhoc_search.clear()
		elem_adhoc_search.send_keys(search)
		self.update_glass_table_widget()
		self.logger.debug("enetered search '%s' into adhoc search field"%search)

	def select_viz_type(self, vizType, searchType, thresholdField="value"):
		'''
		For any search(adhoc or KPI) running on canvas, we can change viz type by selecting it from config panel.
		Viz type options are single value, gauge, sparkline, single value delta.
		This function selects the viz type and clicks on update button.

		If vizType selected is not 'single value', then this function also sets 'Threshold Field' for that vizType before updating

		@vizType : 'singlevalue' or 'gauge' or 'sparkline' or 'svd'
		@searchType : 'adhoc' or 'kpi'
		@thresholdField : threshold field for the search

		NOTE:1. It assumes the widget you want to change viz type for, is already selected.
		'''
		if vizType == "singlevalue":
			elem_viz_type = self.getElement(By.XPATH, self.xpath_config_panel_viz_type_btn%"btn viz-button")
		else:
			elem_viz_type = self.getElement(By.XPATH, self.xpath_config_panel_viz_type_btn%vizType)
		elem_viz_type.click()
		if vizType != 'singlevalue' and searchType == 'adhoc':
			elem_threshold_field = self.getElement(By.XPATH, self.xpath_config_panel_threshold_field_text)
			elem_threshold_field.clear()
			elem_threshold_field.send_keys(thresholdField)
		self.update_glass_table_widget()
		self.logger.debug("selected viz type '%s'"%vizType)

	def update_glass_table_widget(self):
		'''
		Updates a glass table widget on canvas by clicking on update button on config panel.

		NOTE: widget on canvas to be updated should be selected before calling this function
		'''
		elem_update_btn = self.getElement(By.XPATH, self.xpath_config_panel_update_delete_btn%'Update')
		elem_update_btn.click()
		self.logger.debug("updated glass table widget")

	def delete_glass_table_widget(self):
		'''
		Deletes a glass table widget on canvas by clicking on delete button on config panel.

		NOTE: widget on canvas to be updated should be selected before calling this function
		'''
		elem_delete_btn = self.getElement(By.XPATH, self.xpath_config_panel_update_delete_btn%'Delete')
		elem_delete_btn.click()
		self.logger.debug("deleted glass table widget")

	def goToGlassTableEditorPage(self, glassTableTitle):
		'''
		Clicks on glass table name link on Glass Table Lister Page and navigates to Glass Table Editor.
		'''
		elem_created_gt = self.getElement(By.XPATH, self.xpath_created_glass_table%glassTableTitle)
		elem_created_gt.click()
		#self.browser.wait_for_element_visible(By.XPATH, self.xpath_toolbar_buttons%'adhocSearch')
		self.browser.wait_for_element_visible(By.XPATH, self.xpath_glass_table_editor_bar, timeout=20)
		#time.sleep(2)

	def selectAndDropTool(self, toolType, xy_list, label=""):
		'''
		Selects a tool from a toolbar and drops it on canvas.
		Works for Rectangle, Ellipse, Line and Text.
		@toolType : 'rectangle', 'ellipse', 'line' or 'text'
		@xy_list : list of coordinates.

		#NOTE: @label not required anymore as adhoc search widget cannot be added on canvas using this method.
		#NOTE : for rectangle, ellipse and line, @xy_list is [x1, y1, x2, y2]
				for text, @xy_list is [x1, y1]
		'''
		elem_tool = self.getElement(By.XPATH, self.xpath_toolbar_buttons%toolType)
		elem_tool.click()
		#if toolType != "text" and toolType != "adhocSearch":
		if toolType != "text":
			self.drag_drop_offset(xy_list[0], xy_list[1], xy_list[2], xy_list[3])
			if toolType == "rectangle":
				self.browser.wait_for_element_visible(By.XPATH, self.xpath_canvas_rect_shape%xy_list[0])
			elif toolType == "ellipse":
				self.browser.wait_for_element_visible(By.XPATH, self.xpath_canvas_ellipse_shape%xy_list[0])
			else:
				self.browser.wait_for_element_visible(By.XPATH, self.xpath_canvas_line_shape)
		else:
			self.drag_drop_offset(0, 0, xy_list[0], xy_list[1])
			'''if toolType == "adhocSearch":
				self.setWidth("100")
				self.setHeight("100")
				self.setLabel(label)
				return Widget(self.browser, "SingleValueWidget", label)
			'''

	def dragAndDropServiceOnCanvas(self, dict, x=200, y=200):
		'''
		Drags a service from service panel and drops it to the canvas.
		@x and @y: x-y corrdinates where the object will be dropped
		eg:
		dict = {'Type' : 'Ad hoc Search',
				'Label' : 'adhoc widget'}
		or
		dict = {'Type' : 'Service',
				'Service' : 'Service1_NE',
				'KPI' : [Service1_KPI_Adhoc']}
		or
		dict = {'Type' : 'Service',
				'Service' : 'Service1_NE',
				'KPI' : ['ServiceHealthScore', 'Service1_KPI_Adhoc'],
				'Key' : 'SHIFT'}

		#NOTE: All KPIs should be from same service.
			   Label can be set for only adhoc search widget. In case of adhoc search widget, method returns object of Widget class.
		'''
		actions = ActionChains(self.browser)
		if dict['Type'] == 'Ad hoc Search':
			elem_service_panel_object = self.getElement(By.XPATH, self.xpath_service_panel_service_or_adhoc_search%dict['Type'])
			actions.drag_and_drop_by_offset(elem_service_panel_object, x, y).perform()
			self.setWidthHeight(width=100, height=100)
			#self.setWidth("100")
			#self.setHeight("100")
			label = ""
			if 'Label' in dict:
				label = dict['Label']
				self.setLabel(label)
			return Widget(self.browser, "SingleValueWidget", label)
		elif dict['Type'] == 'Service':
			#expand service
			elem_service_panel_service = self.getElement(By.XPATH, self.xpath_service_panel_service_or_adhoc_search%dict['Service'])
			elem_service_panel_service.click()
			#actions = ActionChains(self.browser)
			if len(dict['KPI']) == 1 and 'Key' not in dict:
				elem_service_panel_object = self.getElement(By.XPATH, self.xpath_service_panel_kpi%dict['KPI'][0])
				#actions.drag_and_drop_by_offset(elem_service_panel_object, x, y).perform()
			else:
				if dict['Key'] == 'COMMAND':
					actions.key_down(Keys.COMMAND)
				elif dict['Key'] == 'SHIFT':
					actions.key_down(Keys.SHIFT)
				for element in dict['KPI']:
					elem_service_panel_object = self.getElement(By.XPATH, self.xpath_service_panel_kpi%element)
					actions.move_to_element(elem_service_panel_object).click(elem_service_panel_object)
				if dict['Key'] == 'COMMAND':
					actions.key_up(Keys.COMMAND).perform()
				elif dict['Key'] == 'SHIFT':
					actions.key_up(Keys.SHIFT).perform()
			actions.drag_and_drop_by_offset(elem_service_panel_object, x, y).perform()

	def enableOrDisableUseKPISummaryOption(self, enable=True):
		'''
		Enables or disables using KPI summary for a service KPI widget.
		@enable : 'True' or "False"
		'''
		if enable == True:
			elem_enable_btn = self.getElement(By.XPATH, self.xpath_use_kpi_summary_on_off_btn%'yes')
			elem_enable_btn.click()
		else:
			elem_disable_btn = self.getElement(By.XPATH, self.xpath_use_kpi_summary_on_off_btn%'no')
			elem_disable_btn.click()

	def isUseKPISummaryButtonClickable(self):
		'''
		Checks if Use KPI Summary option on config panel is disabled for a widget on canvas.
		'''
		elem_enable_btn = self.getElement(By.XPATH, self.xpath_use_kpi_summary_on_off_btn%'yes')
		enable_class = elem_enable_btn.get_attribute("class")
		elem_disable_btn = self.getElement(By.XPATH, self.xpath_use_kpi_summary_on_off_btn%'no')
		disable_class = elem_disable_btn.get_attribute("class")
		if "disabled" in enable_class and "disabled" in disable_class:
			return False
		else:
			return True

	def isUseKPISummaryButtonPresent(self):
		'''
		Checks if 'Use KPI Summary' button is present on config panel for a widget on canvas.
		'''
		elem_kpi_summary_btn = self.getElements(By.XPATH, self.xpath_use_kpi_summary_on_off_btn%'yes')
		if len(elem_kpi_summary_btn) == 0:
			return False
		else:
			return True

	def isUseKPISummaryIndexEnabled(self):
		'''
		Checks if the search on the widget is using KPI summary
		'''
		elem_kpi_summary = self.getElement(By.XPATH, self.xpath_kpi_summary_button).text
		if "Yes" in elem_kpi_summary:
			return True
		else:
			return False

	def waitForWidgetToPopulate(self, vizType, value):
		'''
		Wait for data to appear insides widgets.
		@vizType : 'Gauge', 'SingleValue', 'Sparkline' or 'SingleValueDelta'
		@value :  value to be present inside widget.

		Returns element containing text.
		#NOTE: This method will only work for static value inside widgets.
		'''
		elem_text_inside_graph = self.browser.wait_for_element_present(By.XPATH, self.xpath_text_inside_widgets%(vizType,value), timeout=100)
		return elem_text_inside_graph

	def enableOrDisableThresholdOption(self, type, dict):
		'''
		Enables or disables the thrshold option for a widget.
		@type : 'adhoc' or 'kpi'
		if type='kpi' then,
			@dict : {'Thresholds' : 'On' or 'Off'}

		if type='adhoc' then,
			eg: dict : {'Thresholds' : 'On',
					 'Threshold Field' : 'mem_used',
					 'Edit Thresholds' : 'True',
					 'Threshold Values' : {'Max' : '100',
					 						'Min' : '0',
										 	'Base Severity' : 'Normal',
					 						'Add Thresholds' : [('Low',10), ('Critical',50)],
											'Method' : 'Slider'}
					}
				dict : {'Thresholds' : 'On',
					 'Threshold Field' : 'mem_used',
					 'Edit Thresholds' : 'True',
					 'Threshold Values' : {'Max' : '100',
					 					'Min' : '0',
										'Base Severity' : 'Normal',
										'Add Thresholds' : [('Medium',40), ('High',70)],
					 					'Method' : 'Textbox'}
					}
				dict : {'Thresholds' : 'On',
					 'Threshold Field' : 'mem_used',
					 'Edit Thresholds' : 'False'}
		'''
		#if type == "kpi" or dict['Thresholds'] == "Off":
		result_dict = {}
		elem_threshold = self.getElement(By.XPATH, self.xpath_config_panel_threshold_on_off_btn%dict['Thresholds'])
		elem_threshold.click()
		if type == "adhoc" and dict['Thresholds'] == "On":
			if 'Threshold Field' in dict:
				self.setThresholdField(dict['Threshold Field'])
			if dict['Edit Thresholds']:
				result_dict = self.editThresholds(dict['Threshold Values'])
		return result_dict

	def editThresholds(self, dict):
		'''
		This modal clicks on Edit threshold on config panel and lets you edit thresholds for a widget.
		Valid only for adhoc search widgets.
		Returns a result_dict.
		eg: result_dict: {'Max': '100',
						 'Min': '0',
						 'Base Severity': 'Low',
						  'Severities': [('Medium', '11'), ('High', '23'), ('Critical', '57')]}

		eg dict : {'Max' : '100',
					'Min' : '0',
					'Base Severity' : 'Normal',
					'Add Thresholds' : [('Medium',40), ('High',70)],
					'Method' : 'Textbox'}

		#TODO: Adding severity labels value using slider (dict['Method'] = 'Slider')
		'''
		if 'Add Thresholds' in dict:
			result_dict = {'Max' : '100',
							'Min' : '0',
							'Severities' : [()]*len(dict['Add Thresholds']),
							'Base Severity' : 'Normal'}
		else:
			result_dict = {'Max' : '100',
							'Min' : '0',
							'Base Severity' : 'Normal'}
		elem_edit_link = self.getElement(By.XPATH, self.xpath_config_panel_threshold_edit_link)
		elem_edit_link.click()
		if "Min" in dict:
			self.clear_and_fill_textarea(self.xpath_threshold_modal_min_max_input%'min', dict['Min'])
			result_dict['Min'] = self.getElement(By.XPATH, self.xpath_threshold_modal_min_max_input%'min').get_attribute('value')
		if "Max" in dict:
			self.clear_and_fill_textarea(self.xpath_threshold_modal_min_max_input%'max', dict['Max'])
			result_dict['Max'] = self.getElement(By.XPATH, self.xpath_threshold_modal_min_max_input%'max').get_attribute('value')
		if "Base Severity" in dict:
			elem_base_severity = self.getElement(By.XPATH, self.xpath_threshold_modal_base_severity_link)
			elem_base_severity.click()
			elem_dropdown_option = self.getElement(By.XPATH, self.xpath_common_dropdown_option_link%dict['Base Severity'])
			elem_dropdown_option.click()
			result_dict['Base Severity'] = self.getElement(By.XPATH, self.xpath_threshold_modal_base_severity_span).text
		self.browser.wait_for_element_visible(By.XPATH, self.xpath_threshold_modal_delete_btn_list)
		elems_del_threshold_link = self.getElements(By.XPATH, self.xpath_threshold_modal_delete_btn_list)
		for elem in elems_del_threshold_link:
			elem.click()
		if "Add Thresholds" in dict:
			count = 0
			for severity in dict['Add Thresholds']:
				elem_add_threshold_link = self.getElement(By.XPATH, self.xpath_threshold_modal_add_threshold_link)
				elem_add_threshold_link.click()
				elem_severity_label = self.getElement(By.XPATH, self.xpath_threshold_modal_severity_links)
				elem_severity_label.click()
				elem_dropdown_option = self.getElement(By.XPATH, self.xpath_common_dropdown_option_link%severity[0])
				elem_dropdown_option.click()
				if dict['Method'] == "Textbox":
					#self.clear_and_fill_textarea(self.xpath_threshold_modal_severity_value_input, severity[1])
					element = self.getElement(By.XPATH, self.xpath_threshold_modal_severity_value_input)
					element.click()
					element.clear()
					element.send_keys(severity[1])
				result_dict['Severities'][count] = (self.getElement(By.XPATH, self.xpath_threshold_modal_severity_spans).text, self.getElement(By.XPATH, self.xpath_threshold_modal_severity_value_input).get_attribute('value')[1:])
				count = count + 1
		elem_threshold_done = self.getElement(By.XPATH, self.xpath_threshold_modal_done_link)
		elem_threshold_done.click()
		self.browser.wait_for_element_not_visible(By.XPATH, self.xpath_modal_header)
		return result_dict

	def setThresholdField(self, field):
		'''
		Sets threshold field for adhoc search widget.
		'''
		elem_threshold_field = self.getElement(By.XPATH, self.xpath_config_panel_threshold_field_text)
		elem_threshold_field.click()
		elem_threshold_field.clear()
		elem_threshold_field.send_keys(field)

	def getThresholdField(self):
		'''
		Returns threshold field for adhoc search widget.
		'''
		elem_threshold_field = self.getElement(By.XPATH, self.xpath_config_panel_threshold_field_text)
		return elem_threshold_field.get_attribute('value')

	def isSaveButtonEnabled(self):
		'''
		Checks if Save button on editor page is enabvled or not.
		if enabled, returns True.
		else, returns False.
		'''
		elem_save_button = self.getElement(By.XPATH, self.xpath_glass_table_editor_save_button)
		btn_class= elem_save_button.get_attribute("class")
		if "disabled" in btn_class:
			return False
		else:
			return True

	def lockOrUnlockWidget(self):
		'''
		Locks or unlocks a widget on canvas.
		If widget is in unlocked stage, then it gets locked.
		If it is in locked stage, then it gets unlocked.

		#NOTE: select widget befor using this method.
		'''
		elem_lock_unlock_btn = self.getElement(By.XPATH, self.xpath_config_panel_lock_unlock_btn)
		elem_lock_unlock_btn.click()
		self.logger.debug("widget locked/unlocked")

	def setUnit(self, unit):
		'''
		Method adds unit to a widget from config panel. It assumes that the widget is in selection.
		Clicks on updates after typing unit in textbox.

		#NOTE: Unit should have max lenght of 4 characters.
		'''
		elem_unit_input = self.getElement(By.XPATH, self.xpath_config_panel_input_boxes%'unit')
		elem_unit_input.click()
		elem_unit_input.clear()
		elem_unit_input.send_keys(unit)
		self.update_glass_table_widget()

	def setWidthHeight(self, width=None, height=None):
		'''
		Method enters the width and the height in the input area on config panel for a widget and then clicks on update.
		'''
		if width != None:
			elem_width_input = self.getElement(By.XPATH, self.xpath_config_panel_input_boxes%'width')
			elem_width_input.click()
			time.sleep(2)
			elem_width_input = self.getElement(By.XPATH, self.xpath_config_panel_input_boxes%'width')
			elem_width_input.clear()
			time.sleep(2)
			elem_width_input = self.getElement(By.XPATH, self.xpath_config_panel_input_boxes%'width')
			elem_width_input.send_keys(width)
			#time.sleep(2)

		if height != None:
			elem_height_input = self.getElement(By.XPATH, self.xpath_config_panel_input_boxes%'height')
			elem_height_input.click()
			time.sleep(2)
			elem_height_input = self.getElement(By.XPATH, self.xpath_config_panel_input_boxes%'height')
			elem_height_input.clear()
			time.sleep(2)
			elem_height_input = self.getElement(By.XPATH, self.xpath_config_panel_input_boxes%'height')
			elem_height_input.send_keys(height)
			#time.sleep(2)

		self.update_glass_table_widget()

	def isServicePanelPresent(self):
		'''
		Checks if service panel is present on editor page of a glass table.
		If present, returns True.
		Else, returns False.
		'''
		self.browser.wait_for_element_present(By.XPATH, self.xpath_glass_table_editor_service_panel)
		elem_service_panel = self.getElements(By.XPATH, self.xpath_glass_table_editor_service_panel)
		if len(elem_service_panel) == 1:
			return True
		return False

	def isConfigPanelPresent(self):
		'''
		Checks if config panel is present on editor page of a glass table.
		If present, returns True.
		Else, returns False.
		'''
		self.browser.wait_for_element_present(By.XPATH, self.xpath_glass_table_editor_config_panel)
		elem_config_panel = self.getElements(By.XPATH, self.xpath_glass_table_editor_config_panel)
		if len(elem_config_panel) == 1:
			return True
		return False

	def filterListOnListerPage(self, filterText):
		'''
		Method filters the glass table list on lister page using the 'filterText' entered into the filter text box.
		Returns number of glass tables in list after filtering it.
		'''
		elem_filter_input = self.getElement(By.XPATH, self.xpath_filter_input)
		elem_filter_input.click()
		elem_filter_input.clear()
		elem_filter_input.send_keys(filterText)
		elem_gt = self.getElements(By.XPATH, self.xpath_filter_glass_table_list%filterText)
		return len(elem_gt)

	def filterServiceListOnServicePanel(self, filterText):
		'''
		Method filters the service list on service panel using the 'filterText' entered into the filter text box.
		Returns number of services in list after filtering it.
		'''
		elem_filter_input = self.getElement(By.XPATH, self.xpath_service_panel_filter_input)
		elem_filter_input.click()
		elem_filter_input.clear()
		elem_filter_input.send_keys(filterText)
		time.sleep(2)
		elem_service = self.getElements(By.XPATH, self.xpath_service_panel_service_list)
		return len(elem_service)

	def switchToViewMode(self):
		'''
		Method switches glass table editor from edit mode to view mode.
		#NOTE: Should only be used if editor is in edit mode.
		'''
		elem_view_link = self.getElement(By.XPATH, self.xpath_glass_table_editor_view_button)
		elem_view_link.click()
		try:
			#self.getElement(By.XPATH, self.xpath_glass_table_editor_config_panel)
			self.browser.wait_for_element_not_visible(By.XPATH, self.xpath_glass_table_editor_config_panel)
			return True
		except Exception:
			return False

	def switchViewType(self):
		'''
		This method can be used to switch between different views of view mode: Standard View and Full Screen View.
		if Standard View, then switches to Full Screen View and vice versa.
		'''
		elem_view_type_span = self.getElement(By.XPATH, self.xpath_view_mode_view_type_span)
		current_view = elem_view_type_span.text.strip()
		elem_view_type_link = self.getElement(By.XPATH, self.xpath_view_mode_view_type_link)
		elem_view_type_link.click()
		if current_view == "Standard View":
			elem_view_type_option = self.getElement(By.XPATH, self.xpath_view_type_dropdown_options%"Full Screen View")
			elem_view_type_option.click()
			return self.waitForFullScreenView()
		else:
			elem_view_type_option = self.getElement(By.XPATH, self.xpath_view_type_dropdown_options%"Standard View")
			elem_view_type_option.click()
			return self.waitForStandardView()

	def waitForFullScreenView(self):
		'''
		Waits for navigation bar to go away which happens in full screen view of view mode.
		'''
		try:
			#elem_nav_bar = self.getElement(By.XPATH, self.xpath_app_nav_bar)
			self.browser.wait_for_element_not_visible(By.XPATH, self.xpath_app_nav_bar)
			self.logger.debug("view mode did not switch to full screen view type")
			return  True
		except Exception:
			self.logger.debug("view mode switched to full screen view type")
			return False

	def waitForStandardView(self):
		'''
		Waits for navigation bar to appear which happens in standard view of view mode.
		'''
		try:
			#elem_nav_bar = self.getElement(By.XPATH, self.xpath_app_nav_bar)
			self.browser.wait_for_element_visible(By.XPATH, self.xpath_app_nav_bar)
			self.logger.debug("view mode did not switch to full screen view type")
			return  True
		except Exception:
			self.logger.debug("view mode switched to full screen view type")
			return False

	def switchToEditMode(self):
		'''
		Method switches glass table editor from view mode to edit mode.
		#NOTE: Should only be used if editor is in view mode.
		'''
		elem_edit_link = self.getElement(By.XPATH, self.xpath_edit_link_in_view_mode)
		elem_edit_link.click()
		try:
			#self.getElement(By.XPATH, self.xpath_glass_table_editor_config_panel)
			self.browser.wait_for_element_visible(By.XPATH, self.xpath_glass_table_editor_config_panel)
			return True
		except Exception:
			return False

	def createSearchForAdhocWdiget(self, dict):
		'''
		Method creates search for an adhoc search widget (both adhoc and datamodel).
		@dict: contains all the required fields needed to create a search.
		eg1.
		dict = {'Search Type' : 'Ad hoc',
				'Search' : 'index=_internal | timechart count'
				}

		eg2.
		dict =	{'Search Type' : 'Data Model',
				 'Data Model' : {'Data Model' : 'Application State',
				 				 'Objects' : 'Processes',
				 				 'Fields' : 'cpu_load_percent'
				 				},
				 'Aggregation' : 'Average',
				 'Where' : 'dest=abcd'
				}
		'''
		elem_search_type_btn = self.getElement(By.XPATH, self.xpath_config_panel_search_type_btn%dict['Search Type'])
		elem_search_type_btn.click()
		if dict['Search Type'] == "Ad hoc":
			self.enter_adhoc_search(dict['Search'])

		elif dict['Search Type'] == "Data Model":
			elem_edit_link = self.getElement(By.XPATH, self.xpath_config_panel_edit_datamodel_link)
			elem_edit_link.click()
			elem_datamodel_dropdown = self.getElement(By.XPATH, self.xpath_datamodel_modal_dropdown_link)
			elem_datamodel_dropdown.click()
			elem_dropdown_option = self.getElement(By.XPATH, self.xpath_datamodel_object_field_dropdown_option%dict['Data Model']['Data Model'])
			elem_dropdown_option.click()
			elem_object_dropdown = self.getElement(By.XPATH, self.xpath_datamodel_modal_object_dropdown_link)
			elem_object_dropdown.click()
			elem_dropdown_option = self.getElement(By.XPATH, self.xpath_datamodel_object_field_dropdown_option%dict['Data Model']['Objects'])
			elem_dropdown_option.click()
			elem_field_dropdown = self.getElement(By.XPATH, self.xpath_datamodel_modal_field_dropdown_link)
			elem_field_dropdown.click()
			elem_dropdown_option = self.getElement(By.XPATH, self.xpath_datamodel_object_field_dropdown_option%dict['Data Model']['Fields'])
			elem_dropdown_option.click()
			elem_done = self.getElement(By.XPATH, self.xpath_modal_footer_links%'Done')
			elem_done.click()
			self.browser.wait_for_element_not_visible(By.XPATH, self.xpath_modal_header)
			elem_aggregation = self.getElement(By.XPATH, self.xpath_config_panel_aggregation_link)
			elem_aggregation.click()
			elem_dropdown_option = self.getElement(By.XPATH, self.xpath_config_panel_aggregation_dropdown_option%dict['Aggregation'])
			elem_dropdown_option.click()
			if "Where" in dict:
				self.setWhereField(dict['Where'])
		self.update_glass_table_widget()

	def setWhereField(self, whereCondition):
		'''
		Method assumes that the widget is in selection.It will add the where condition into the where field.
		'''
		self.getElement(By.XPATH, self.xpath_config_panel_input_boxes%'dataModelWhereClause').click()
		self.getElement(By.XPATH, self.xpath_config_panel_input_boxes%'dataModelWhereClause').clear()
		self.getElement(By.XPATH, self.xpath_config_panel_input_boxes%'dataModelWhereClause').send_keys(whereCondition)

	def getSearch(self):
		'''
		Method returns search for a widget from uneditable Search field on config panel.
		'''
		elem_uneditable_search = self.getElement(By.XPATH, self.xpath_config_panel_uneditable_search)
		search = elem_uneditable_search.text.strip()
		return search

	def pickEndDateAndTime(self, option):
		'''
		Method selects the end date and time for glass table editor.
		@option: 'Now', '60 minutes ago', 'Last week' etc.

		#TODO: add support for custom date-time.
		'''
		elem_time_picker = self.getElement(By.XPATH, self.xpath_time_picker_dropdown_link)
		elem_time_picker.click()
		elem_time_preset = self.getElement(By.XPATH, self.xpath_time_picker_preset_link%option)
		elem_time_preset.click()
		time.sleep(3)

	def runSearch(self, widgetType):
		'''
		Method clicks on run search link on config panel which opens search in new tab.
		@widgetType: 'adhoc' or 'kpi'
		'''
		xpath_run_search = self.xpath_config_panel_adhoc_run_search_link
		if widgetType == "kpi":
			xpath_run_search = self.xpath_config_panel_kpi_run_search_link
		elem_run_search = self.getElement(By.XPATH, xpath_run_search)
		elem_run_search.click()

	def getSearchPageDetails(self):
		'''
        Switches window context to search page (New tab opens)
        Waits for search page to load
        Returns search, time
        Prividing xpaths in the function itself. these will not be used anywhere else. These should be in the SearchPageObject, but we dont have
        one for now.
		'''
		time.sleep(2)
		self.browser.switch_to_window(self.browser.window_handles[1])
		xpath = "//textarea[@name='q']"
		time_xpath = "//span[@class='time-label']"
		self.browser.wait_for_element_present(By.XPATH, xpath)
		url = self.browser.current_url
		assert 'search' in url
		search = self.getElement(By.XPATH, xpath).text.strip()
		timerange = self.getElement(By.XPATH, time_xpath).text
		return (search, timerange)

	def expandServiceOnServicePanel(self, service_name):
		'''
		Expands a service on service panel to show KPIs inside that service.
		'''
		elem_service_panel_service = self.getElement(By.XPATH, self.xpath_service_panel_service_or_adhoc_search%service_name)
		elem_service_panel_service.click()
		if self.isServiceExpanded(service_name) == True:
			return True
		else:
			return False

	def isServiceExpanded(self, service_name):
		'''
		Checks if a service is expanded.
		'''
		elem_kpi_list = self.browser.wait_for_element_present(By.XPATH, self.xpath_service_panel_kpi_list_inside_service%service_name)
		attr_style = elem_kpi_list.get_attribute("style")
		if "none" not in attr_style:
			return True
		else:
			return False

	def isCheckIconPresentForKPIOnCanvas(self, kpi_name):
		'''
		Checks is check icon is present on service panel for a KPI on canvas.
		#NOTE: service should be expanded before checking for check icon.
		'''
		elem_check_icon = self.browser.wait_for_element_present(By.XPATH, self.xpath_check_icon_kpi_present%kpi_name)
		attr_style = elem_check_icon.get_attribute("style")
		if "none" not in attr_style:
			return True
		else:
			return False

	def getLabelFromConfigPanel(self):
		'''
		#NOTE: widget should be selected before calling this method.
		Gets label from text area on config panel for a widget.
		'''
		label_text = self.getElement(By.XPATH, self.xpath_config_panel_input_boxes%'labelVal')
		return label_text.get_attribute("value").strip()

	def createNewServiceContextPanel(self):
		'''
		Clicks on create new service link on context panel which opens service definition page in new tab.

		#NOTE: context panel should not be collapsed while calling this method
			   switches to new tab too.
		'''
		elem_create_service_link = self.getElement(By.XPATH, self.xpath_service_panel_create_service_link)
		elem_create_service_link.click()
		#switch to service difinition tab
		handles = self.browser.window_handles
		self.browser.switch_to_window(handles[1])

	def isNoFigureSelectedTextPresent(self):
		'''
		Returns description on config panel while no widget is selected on canvas.

		#NOTE: no figure on canvas should be in selection mode before using this method
		'''
		self.browser.wait_for_element_present(By.XPATH, self.xpath_config_panel_description)
		elem_panel_text = self.getElements(By.XPATH, self.xpath_config_panel_description)
		if len(elem_panel_text) == 0:
			return False
		else:
			return True

	def isPositionControlRowPresentOnConfigPanel(self):
		'''
		Returns True, if position control row is visible on config panel.
		Returns False, if it is not visible.
		'''
		elem_position_row = self.browser.wait_for_element_present(By.XPATH, self.xpath_config_panel_position_control_row)
		if('display: none;' in elem_position_row.get_attribute("style")):
			return False
		else:
			return True

	def collapseContextOrConfigPanel(self, panel):
		'''
		Collapses context or config panel depending on parameter 'panel'.
		@panel: 'context' or 'config'
		'''
		elem_collapse_icon = self.getElement(By.XPATH, self.xpath_context_config_panel_collapse_icon%panel)
		elem_collapse_icon.click()
		elem_panel_title = self.getElement(By.XPATH, self.xpath_context_config_panel_collapsed_title%panel)
		return elem_panel_title.text.strip()

	def expandContextOrConfigPanel(self, panel):
		'''
		Expands context or config panel depending on parameter 'panel'.
		@panel: 'context' or 'config'
		'''
		elem_expand_icon = self.getElement(By.XPATH, self.xpath_context_config_panel_expand_icon%panel)
		elem_expand_icon.click()
		if panel == "context":
			elem_panel_title = self.getElement(By.XPATH, self.xpath_context_panel_expanded_title)
		else:
			elem_panel_title = self.getElement(By.XPATH, self.xpath_config_panel_expanded_title)
		return elem_panel_title.text.strip()

	def enableOrDisableCustomDrilldownOption(self, option):
		'''
		Enables or disables custom drilldown option depending on parameter 'option'.
		@option: 'On' or 'Off'
		'''
		elem_on_off_btn = self.getElement(By.XPATH, self.xpath_config_panel_custom_drilldown_on_off_btn%option)
		elem_on_off_btn.click()
		self.update_glass_table_widget()

	def selectCustomDrilldownOption(self, dict):
		'''
		Select different drilldown options for a widget using 'dict'
		eg:
		dict = {'Object Type' : 'Saved Glass Table',
				'Object Name' : 'Splunk Service Glass Table'}

		OR
		dict = {'Object Type' : 'Saved Glass Table',
				'Select By' : 'Search',
				'Search String' : 'splunk'}
		Above example shows selection of object BY entering text into search box and then selecting the object from results.
		#NOTE: 'Search String' should only return one object in list for this method to work. Means, 'Search String' should uniquely identify the object.

		OR
		dict = {'Object Type' : 'Default'}

		OR
		dict = {'Object Type' : 'Custom URL',
				'URL' : 'http://www.google.com'}

		#NOTE: custom drilldown option should be enabled first before using this method
		'''
		elem_object_type_dropdown = self.getElement(By.XPATH, self.xpath_config_panel_custom_drilldown_object_type_dropdown_link)
		elem_object_type_dropdown.click()
		elem_object_type = self.getElement(By.XPATH, self.xpath_config_panel_custom_drilldown_object_type_list%dict['Object Type'])
		elem_object_type.click()
		if "Saved" in dict['Object Type']:
			elem_object_dropdown = self.getElement(By.XPATH, self.xpath_config_panel_custom_drilldown_object_dropdown_link)
			elem_object_dropdown.click()
			if 'Select By' not in dict:
				elem_object = self.getElement(By.XPATH, self.xpath_config_panel_custom_drilldown_object_list%dict['Object Name'])
				elem_object.click()
			else:
				elem_search_input = self.getElement(By.XPATH, self.xpath_config_panel_custom_drilldown_object_search_input)
				elem_search_input.click()
				elem_search_input.clear()
				elem_search_input.send_keys(dict['Search String'])
				elem_object = self.getElement(By.XPATH, self.xpath_config_panel_custom_drilldown_object_list_by_search)
				elem_object.click()
		if dict['Object Type'] == "Custom URL":
			elem_custom_url_input = self.getElement(By.XPATH, self.xpath_config_panel_custom_drilldown_custom_url_input)
			elem_custom_url_input.click()
			elem_custom_url_input.clear()
			elem_custom_url_input.send_keys(dict['URL'])
		self.update_glass_table_widget()

	def getGlassTableTitleInViewMode(self):
		'''
		Returns title of glass table written on header in View Mode.
		'''
		elem_title_header = self.getElement(By.XPATH, self.xpath_view_mode_glass_table_title_header)
		return elem_title_header.text.strip()

	def isViewButtonPresentOnBar(self):
		'''
		Checks if view button is present on glass table bar at the top.
		This method can be used to find if glass table is in view mode or edit mode.
		returns True, if button is present
		returns False, if button is not present
		'''
		elem_view_button = self.getElements(By.XPATH, self.xpath_glass_table_editor_view_button)
		if len(elem_view_button) == 0:
			return False
		else:
			return True

	def getServiceAndKPIPoweringWidget(self):
		'''
		Gets KPI and service title for a widget from config panel and returns.
		#NOTE: Widget should be powered by KPI and should be selected before calling this method.
		'''
		elem_kpi_title = self.getElement(By.XPATH, self.xpath_config_panel_header_kpi_title)
		kpi_title = elem_kpi_title.text.strip()
		elem_service_title = self.getElement(By.XPATH, self.xpath_config_panel_header_service_title)
		service_title = elem_service_title.text.strip()
		return(kpi_title, service_title)

	def getTitleForAdhocSearchWidget(self):
		'''
		Gets title for an adhoc search widget from config panel and returns.
		#NOTE: Widget should be selected before calling this method.
		'''
		elem_adhoc_title = self.getElement(By.XPATH, self.xpath_config_panel_header_adhoc_search_title)
		adhoc_title = elem_adhoc_title.text.strip()
		return adhoc_title

	def pickEarliestTimeForWidget(self, option):
		'''
		Set earliest time for an adhoc or a KPI widget.
		@option: '30 minutes ago', '60 minutes ago', '2 hours ago', '4 hours ago', '12 hours ago', 'Yesterday' or '2 days ago'
		'''
		elem_earliest_time_link = self.getElement(By.XPATH, self.xpath_config_panel_earliest_time_link)
		elem_earliest_time_link.click()
		elem_dropdown =  self.getElement(By.XPATH, self.xpath_config_panel_earliest_time_dropdown%option)
		elem_dropdown.click()
		self.update_glass_table_widget()

