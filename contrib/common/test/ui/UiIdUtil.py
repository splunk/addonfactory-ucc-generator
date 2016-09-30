class UiIdUtil(object):

    TIME_FORMAT_1 = "%m/%d/%Y %H:%M:%S"
    EVENT_VIEWER_PARENT_ELEMENT_ID = "div.layoutRow.withSidebar.resultsArea.splClearfix"
    EVENT_VIEWER_ID = "div.SplunkModule.Events.softWrap"
    EVENT_VIEWER_ID_1 = "ol.buffer.EventsViewerSoftWrap"

    SPLUNK_MODULE_TIMERANGE_PICKER_ID = "div.SplunkModule.TimeRangePicker"
    SPLUNK_PIVOT_TIMERANGE_PICKER_ID = 'div[data-field-type="timestamp"] div.clickable-label'
    SPLUNK_PIVOT_TIMERANGE_PARENT_ID = 'div[data-elem-type="filter"]'

    LOOKUP_EDITOR = "div.LookupEditorView div#item-data-table"

    ROW1 = "div.dashboard-row"
    ROW2 = ROW1 + "+div.dashboard-row"
    ROW3 = ROW2 + "+div.dashboard-row"
    ROW4 = ROW3 + "+div.dashboard-row"

    ROW1_CHART1 = ROW1 + " .splunk-chart"
    ROW2_CHART1 = ROW2 + " .splunk-chart"

    EVENTS_VIEWER_TABLE = "shared-eventsviewer"

    PAGINATION_CLASS_NAME = ".pagination.shared-collectionpaginator"
    IFRAME = "div.IFrameInclude"

    FIRST_ROW_DASHBOARD = "div.dashboard-row"
    FIRST_ROW_FIRST_DASHBOARD_CELL = FIRST_ROW_DASHBOARD + \
        " .dashboard-cell"
    FIRST_ROW_SECOND_DASHBOARD_CELL = FIRST_ROW_FIRST_DASHBOARD_CELL + \
        "+div.dashboard-cell"
    FIRST_ROW_THIRD_DASHBOARD_CELL = FIRST_ROW_SECOND_DASHBOARD_CELL + \
        "+div.dashboard-cell"

    ROW1_SIMPLERESULTSTABLE1 = FIRST_ROW_DASHBOARD + " .splunk-table"
    ROW1_SIMPLERESULTSTABLE2 = FIRST_ROW_SECOND_DASHBOARD_CELL + \
        " .splunk-table"
    ROW1_VIEW_RESULTS = FIRST_ROW_DASHBOARD + " .view-results"

    SECOND_ROW_DASHBOARD = FIRST_ROW_DASHBOARD + "+div.dashboard-row"
    SECOND_ROW_FIRST_DASHBOARD_CELL = SECOND_ROW_DASHBOARD + \
        " div.dashboard-cell"
    SECOND_ROW_SECOND_DASHBOARD_CELL = SECOND_ROW_FIRST_DASHBOARD_CELL + \
        "+div.dashboard-cell"
    SECOND_ROW_THIRD_DASHBOARD_CELL = SECOND_ROW_SECOND_DASHBOARD_CELL + \
        "+div.dashboard-cell"
    SECOND_ROW_FOURTH_DASHBOARD_CELL = SECOND_ROW_THIRD_DASHBOARD_CELL + \
        "+div.dashboard-cell"
    SECOND_ROW_FIFTH_DASHBOARD_CELL = SECOND_ROW_FOURTH_DASHBOARD_CELL + \
        "+div.dashboard-cell"
    SECOND_ROW_SIXTH_DASHBOARD_CELL = SECOND_ROW_FIFTH_DASHBOARD_CELL + \
        "+div.dashboard-cell"
    SECOND_ROW_FIRST_DASHBOARD_CELL_ELEMENT = SECOND_ROW_FIRST_DASHBOARD_CELL + \
        " .dashboard-element"
    SECOND_ROW_SECOND_DASHBOARD_CELL_ELEMENT = SECOND_ROW_SECOND_DASHBOARD_CELL + \
        " .dashboard-element"
    ROW2_SIMPLERESULTSTABLE1 = SECOND_ROW_DASHBOARD + " .splunk-table"
    ROW2_SIMPLERESULTSTABLE2 = SECOND_ROW_SECOND_DASHBOARD_CELL + \
        " .splunk-table"
    ROW2_VIEW_RESULTS = SECOND_ROW_DASHBOARD + " .view-results"
    ROW2_TABLE1 = SECOND_ROW_DASHBOARD + \
        " .shared-resultstable-resultstablemaster"
    ROW2_EVENTS_VIEWER_TABLE1 = SECOND_ROW_DASHBOARD + " .shared-eventsviewer"

    THIRD_ROW_DASHBOARD = SECOND_ROW_DASHBOARD + "+div.dashboard-row"
    THIRD_ROW_FIRST_DASHBOARD_CELL = THIRD_ROW_DASHBOARD + " .dashboard-cell"
    THIRD_ROW_SECOND_DASHBOARD_CELL = THIRD_ROW_FIRST_DASHBOARD_CELL + \
        "+div.dashboard-cell"
    THIRD_ROW_THIRD_DASHBOARD_CELL = THIRD_ROW_SECOND_DASHBOARD_CELL + \
        "+div.dashboard-cell"
    THIRD_ROW_FOURTH_DASHBOARD_CELL = THIRD_ROW_THIRD_DASHBOARD_CELL + \
        "+div.dashboard-cell"
    ROW3_SIMPLERESULTSTABLE1 = THIRD_ROW_DASHBOARD + " .splunk-table"
    ROW3_SIMPLERESULTSTABLE2 = THIRD_ROW_SECOND_DASHBOARD_CELL + \
        " .splunk-table"
    ROW3_VIEW_RESULTS = THIRD_ROW_DASHBOARD + " .view-results"
    ROW3_TABLE1 = THIRD_ROW_DASHBOARD + \
        " .shared-resultstable-resultstablemaster"
    ROW3_EVENTS_VIEWER_TABLE1 = THIRD_ROW_DASHBOARD + " .shared-eventsviewer"

    FOURTH_ROW_DASHBOARD = THIRD_ROW_DASHBOARD + "+div.dashboard-row"
    FOURTH_ROW_FIRST_DASHBOARD_CELL = FOURTH_ROW_DASHBOARD + " .dashboard-cell"
    FOURTH_ROW_SECOND_DASHBOARD_CELL = FOURTH_ROW_FIRST_DASHBOARD_CELL + \
        "+div.dashboard-cell"
    FOURTH_ROW_THIRD_DASHBOARD_CELL = FOURTH_ROW_SECOND_DASHBOARD_CELL + \
        "+div.dashboard-cell"
    FOURTH_ROW_FOURTH_DASHBOARD_CELL = FOURTH_ROW_THIRD_DASHBOARD_CELL + \
        "+div.dashboard-cell"
    ROW4_SIMPLERESULTSTABLE1 = FOURTH_ROW_DASHBOARD + " .splunk-table"

    FIFTH_ROW_DASHBOARD = FOURTH_ROW_DASHBOARD + "+div.dashboard-row"
    FIFTH_ROW_FIRST_DASHBOARD_CELL = FIFTH_ROW_DASHBOARD + " .dashboard-cell"
    FIFTH_ROW_SECOND_DASHBOARD_CELL = FIFTH_ROW_FIRST_DASHBOARD_CELL + \
        "+.dashboard-cell"
    FIFTH_ROW_THIRD_DASHBOARD_CELL = FIFTH_ROW_SECOND_DASHBOARD_CELL + \
        "+.dashboard-cell"
    FIFTH_ROW_FOURTH_DASHBOARD_CELL = FIFTH_ROW_THIRD_DASHBOARD_CELL + \
        "+.dashboard-cell"

    SIXTH_ROW_DASHBOARD = FIFTH_ROW_DASHBOARD + "+div.dashboard-row"
    SIXTH_ROW_FIRST_DASHBOARD_CELL = SIXTH_ROW_DASHBOARD + " .dashboard-cell"
    SEVENTH_ROW_DASHBOARD = SIXTH_ROW_DASHBOARD + "+div.dashboard-row"
    SEVENTH_ROW_FIRST_DASHBOARD_CELL = SEVENTH_ROW_DASHBOARD + \
        " .dashboard-cell"
    EIGHTH_ROW_DASHBOARD = SEVENTH_ROW_DASHBOARD + "+div.dashboard-row"
    EIGHTH_ROW_FIRST_DASHBOARD_CELL = EIGHTH_ROW_DASHBOARD + " .dashboard-cell"
    NINTH_ROW_DASHBOARD = EIGHTH_ROW_DASHBOARD + "+div.dashboard-row"
    NINTH_ROW_FIRST_DASHBOARD_CELL = NINTH_ROW_DASHBOARD + " .dashboard-cell"
    TENTH_ROW_DASHBOARD = NINTH_ROW_DASHBOARD + "+div.dashboard-row"
    TENTH_ROW_FIRST_DASHBOARD_CELL = TENTH_ROW_DASHBOARD + " .dashboard-cell"
    ELEVENTH_ROW_DASHBOARD = TENTH_ROW_DASHBOARD + "+div.dashboard-row"
    ELEVENTH_ROW_FIRST_DASHBOARD_CELL = ELEVENTH_ROW_DASHBOARD + \
        " .dashboard-cell"

    TEXTBOX_FILTER = "input"
    DROPDOWN_FILTER = ".splunk-dropdown"

    DATA_MODEL_GRID = "div.datamodels-datamodelgrid table.table-chrome tbody"
    OBJECT_GRID = "div.datamodelexplorer-objectgrid"
    OBJECT_FIELD_LIST = "div.shared-datamodel-objectfieldlist"
    OBJECT_FIELD_LIST_TBALE = "table.table.field-list"
    PIVOT_RESULTS_TABLE = "div.shared-resultstable-resultstablemaster"
    DATA_MODEL_CHECK_ICON = "div.shared-jobstatus i.icon-check"

    """ Field Picker """
    FIELD_PICKER_EDIT_LINK = "Edit"
    FIELD_PICKER_EDIT_PARENT = "div#MultiFieldViewer_0_22_2"
    FIELD_PICKER_POPUP_CONTAINER = "div.fpPopupContainer"
    FIELD_PICKER_POPUP_CONTENT = "div.popupContent"
    FIELD_PICKER_CLOSE_ID = "a.splIcon.splIcon-close"
    FIELD_PICKER_INPUT_TEXT_ID = "input.fpKeywordFilterField"
    FIELD_PICKER_TABLE_ID = "table.fpFieldList"

    """ Lookup Editor"""
    LOOKUP_EDITOR_TABLE_ID = "table.htCore"
    LOOKUP_EDITOR_CONTEXT_MENU_OPTION_1 = "Insert row above"
    LOOKUP_EDITOR_CONTEXT_MENU_OPTION_2 = "Insert row below"
    LOOKUP_EDITOR_CONTEXT_MENU_OPTION_3 = "Insert column on the left"
    LOOKUP_EDITOR_CONTEXT_MENU_OPTION_4 = "Insert column on the right"
    LOOKUP_EDITOR_CONTEXT_MENU_OPTION_5 = "Remove row"
    LOOKUP_EDITOR_CONTEXT_MENU_OPTION_6 = "Remove column"
    LOOKUP_EDITOR_CONTEXT_MENU_OPTION_7 = "Undo"
    LOOKUP_EDITOR_CONTEXT_MENU_OPTION_8 = "Redo"

    LOOKUP_LIST_EXPECTED_VIEWS = "Expected Views"
    LOOKUP_LIST_EXPECTED_ASSETS = "Assets"
    LOOKUP_LIST_EXPECTED_IDENTITIES = "Identities"

    FIRST_DROP_DOWN_FILTER = "div#input1 .splunk-dropdown"
    SECOND_DROP_DOWN_FILTER = "div#input2 .splunk-dropdown"
    THIRD_DROP_DOWN_FILTER = "div#input3 .splunk-dropdown"
    FOURTH_DROP_DOWN_FILTER = "div#input4 .splunk-dropdown"
    FIFTH_DROP_DOWN_FILTER = "div#input5 .splunk-dropdown"

    FIRST_TEXT_INPUT_FILTER_ID = "div#input1 .splunk-textinput input"
    SECOND_TEXT_INPUT_FILTER_ID = "div#input2 .splunk-textinput input"
    THIRD_TEXT_INPUT_FILTER_ID = "div#input3 .splunk-textinput input"
    FOURTH_TEXT_INPUT_FILTER_ID = "div#input4 .splunk-textinput input"
    FIFTH_TEXT_INPUT_FILTER_ID = "div#input5 .splunk-textinput input"
    SIXTH_TEXT_INPUT_FILTER_ID = "div#input6 .splunk-textinput input"

    """ Data Models """
    AUTHENTICATION_DATA_MODEL = "Authentication"
    NETWORK_TRAFFIC_DATA_MODEL = "Network Traffic"
    PERFORMANCE_DATA_MODEL = "Performance"
    RISK_DATA_MODEL = "Risk Analysis"
    SA_DATA_MODEL = "Splunk Audit Logs"
    TI_DATA_MODEL = "Threat Intelligence"
    UPDATES_DATA_MODEL = "Updates"
    VULNERABILITIES_DATA_MODEL = "Vulnerabilities"
    WEB_DATA_MODEL = "Web"
    DM_OBJECT_TABLE_CLASS = "scroll-table-wrapper"
