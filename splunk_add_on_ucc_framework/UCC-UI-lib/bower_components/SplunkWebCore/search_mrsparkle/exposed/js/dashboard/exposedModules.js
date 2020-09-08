/**
 * This defines the modules to be exposed by webpack to requirejs so that they 
 * can be required by requirejs without loading them a second time. These are 
 * used by dashboard extensions and escaped dashboards.
 */
define(['splunkjs/mvc/exposedModulesBase.js', 'underscore'], function(splunkjsMvcModules, _) {
    return _.extend({
        'splunkjs/mvc/simplexml/dashboardview': require('splunkjs/mvc/simplexml/dashboardview'),
        'splunkjs/mvc/simplexml/dashboard/panel': require('splunkjs/mvc/simplexml/dashboard/panel'),
        'splunkjs/mvc/simplexml/dashboard/panelref': require('splunkjs/mvc/simplexml/dashboard/panelref'),
        'splunkjs/mvc/simplexml/element/chart': require('splunkjs/mvc/simplexml/element/chart'),
        'splunkjs/mvc/simplexml/element/event': require('splunkjs/mvc/simplexml/element/event'),
        'splunkjs/mvc/simplexml/element/html': require('splunkjs/mvc/simplexml/element/html'),
        'splunkjs/mvc/simplexml/element/list': require('splunkjs/mvc/simplexml/element/list'),
        'splunkjs/mvc/simplexml/element/map': require('splunkjs/mvc/simplexml/element/map'),
        'splunkjs/mvc/simplexml/element/single': require('splunkjs/mvc/simplexml/element/single'),
        'splunkjs/mvc/simplexml/element/table': require('splunkjs/mvc/simplexml/element/table'),
        'splunkjs/mvc/simplexml/element/visualization': require('splunkjs/mvc/simplexml/element/visualization'),
        'splunkjs/mvc/simpleform/formutils': require('splunkjs/mvc/simpleform/formutils'),
        'splunkjs/mvc/simplexml/eventhandler': require('splunkjs/mvc/simplexml/eventhandler'),
        'splunkjs/mvc/simplexml/searcheventhandler': require('splunkjs/mvc/simplexml/searcheventhandler'),
        'splunkjs/mvc/simpleform/input/dropdown': require('splunkjs/mvc/simpleform/input/dropdown'),
        'splunkjs/mvc/simpleform/input/radiogroup': require('splunkjs/mvc/simpleform/input/radiogroup'),
        'splunkjs/mvc/simpleform/input/linklist': require('splunkjs/mvc/simpleform/input/linklist'),
        'splunkjs/mvc/simpleform/input/multiselect': require('splunkjs/mvc/simpleform/input/multiselect'),
        'splunkjs/mvc/simpleform/input/checkboxgroup': require('splunkjs/mvc/simpleform/input/checkboxgroup'),
        'splunkjs/mvc/simpleform/input/text': require('splunkjs/mvc/simpleform/input/text'),
        'splunkjs/mvc/simpleform/input/timerange': require('splunkjs/mvc/simpleform/input/timerange'),
        'splunkjs/mvc/simpleform/input/submit': require('splunkjs/mvc/simpleform/input/submit'),
        'splunkjs/mvc/simplexml/urltokenmodel': require('splunkjs/mvc/simplexml/urltokenmodel'),
        'splunk.util': require('splunk.util'),
        'uri/route': require('uri/route'),
        'splunkjs/mvc/simplexml/ready': require('splunkjs/mvc/simplexml/ready'),
        'views/shared/results_table/renderers/BaseCellRenderer': require('views/shared/results_table/renderers/BaseCellRenderer'),
        'collections/services/saved/Searches': require('collections/services/saved/Searches') // required by dmc dashboard extension
    }, splunkjsMvcModules);
});
