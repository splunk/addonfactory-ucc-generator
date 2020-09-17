define(function (require) {
    return {
        'backbone': require('backbone'),
        'jquery': require('jquery'),
        'jquery.cookie': require('jquery.cookie'), //required for online samples
        'underscore': require('underscore'),

        'splunkjs/ready': require('splunkjs/ready'),
        'splunkjs/splunk': require('splunkjs/splunk'),

        'splunkjs/mvc': require('splunkjs/mvc'),
        'splunkjs/mvc/basemanager': require('splunkjs/mvc/basemanager'),
        'splunkjs/mvc/basemodel': require('splunkjs/mvc/basemodel'),
        'splunkjs/mvc/basesplunkview': require('splunkjs/mvc/basesplunkview'),
        'splunkjs/mvc/chartview': require('splunkjs/mvc/chartview'),
        'splunkjs/mvc/checkboxgroupview': require('splunkjs/mvc/checkboxgroupview'),
        'splunkjs/mvc/checkboxview': require('splunkjs/mvc/checkboxview'),
        'splunkjs/mvc/datatemplateview': require('splunkjs/mvc/datatemplateview'),
        'splunkjs/mvc/dataview': require('splunkjs/mvc/dataview'),
        'splunkjs/mvc/drilldown': require('splunkjs/mvc/drilldown'),
        'splunkjs/mvc/dropdownview': require('splunkjs/mvc/dropdownview'),
        'splunkjs/mvc/eventsviewerview': require('splunkjs/mvc/eventsviewerview'),
        'splunkjs/mvc/linklistview': require('splunkjs/mvc/linklistview'),
        'splunkjs/mvc/messages': require('splunkjs/mvc/messages'),
        'splunkjs/mvc/multidropdownview': require('splunkjs/mvc/multidropdownview'),
        'splunkjs/mvc/multiselectview': require('splunkjs/mvc/multiselectview'),
        'splunkjs/mvc/mvc': require('splunkjs/mvc/mvc'),
        'splunkjs/mvc/paginatorview': require('splunkjs/mvc/paginatorview'),
        'splunkjs/mvc/postprocessmanager': require('splunkjs/mvc/postprocessmanager'),
        'splunkjs/mvc/progressbarview': require('splunkjs/mvc/progressbarview'),
        'splunkjs/mvc/radiogroupview': require('splunkjs/mvc/radiogroupview'),
        'splunkjs/mvc/registry': require('splunkjs/mvc/registry'),
        'splunkjs/mvc/savedsearchmanager': require('splunkjs/mvc/savedsearchmanager'),
        'splunkjs/mvc/searchbarview': require('splunkjs/mvc/searchbarview'),
        'splunkjs/mvc/searchcontrolsview': require('splunkjs/mvc/searchcontrolsview'),
        'splunkjs/mvc/searchmanager': require('splunkjs/mvc/searchmanager'),
        'splunkjs/mvc/selectview': require('splunkjs/mvc/selectview'),
        'splunkjs/mvc/sharedmodels': require('splunkjs/mvc/sharedmodels'),
        'splunkjs/mvc/simplesplunkview': require('splunkjs/mvc/simplesplunkview'),
        'splunkjs/mvc/singleview': require('splunkjs/mvc/singleview'),
        'splunkjs/mvc/splunkmapview': require('splunkjs/mvc/splunkmapview'),
        'splunkjs/mvc/tableview': require('splunkjs/mvc/tableview'),
        'splunkjs/mvc/textboxview': require('splunkjs/mvc/textboxview'),
        'splunkjs/mvc/textinputview': require('splunkjs/mvc/textinputview'),
        'splunkjs/mvc/timelineview': require('splunkjs/mvc/timelineview'),
        'splunkjs/mvc/timepickerview': require('splunkjs/mvc/timepickerview'),
        'splunkjs/mvc/timerangeview': require('splunkjs/mvc/timerangeview'),
        'splunkjs/mvc/tokenawaremodel': require('splunkjs/mvc/tokenawaremodel'),
        'splunkjs/mvc/tokenescapestring': require('splunkjs/mvc/tokenescapestring'),
        'splunkjs/mvc/tokenforwarder': require('splunkjs/mvc/tokenforwarder'),
        'splunkjs/mvc/tokensafestring': require('splunkjs/mvc/tokensafestring'),
        'splunkjs/mvc/tokenutils': require('splunkjs/mvc/tokenutils'),
        'splunkjs/mvc/utils': require('splunkjs/mvc/utils')

        //included but not exposed:
        //none at the moment
    };
});