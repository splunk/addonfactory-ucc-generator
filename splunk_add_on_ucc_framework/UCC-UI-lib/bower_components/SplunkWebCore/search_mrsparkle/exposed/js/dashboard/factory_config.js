define(['splunkjs/mvc/utils'], function(utils) {
    return {
        "typeMap": {
            "dashboard": {
                "getModule": function() { return require("views/dashboard/Master"); },
                "class": "container",
                "autoId": "dashboard",
                "state": {
                    "getModule": function() { return require("dashboard/state/DashboardHeaderState"); }
                }
            },
            "row-column": {
                "getModule": function() { return require("views/dashboard/layout/row_column/RowColumnLayout"); },
                "class": "container",
                "autoId": "layout",
                "state": {
                    "getModule": function() { return require("dashboard/state/LayoutState"); }
                }
            },
            "row": {
                "getModule": function() { return require("views/dashboard/layout/row_column/Row"); },
                "class": "container",
                "autoId": "row",
                "state": {
                    "getModule": function() { return require("dashboard/state/RowState"); }
                }
            },
            "panel": {
                "getModule": function() { return require("views/dashboard/layout/Panel"); },
                "class": "container",
                "settingsOptions": {
                    "tokens": true
                },
                "autoId": "panel",
                "state": {
                    "getModule": function() { return require("dashboard/state/PanelState"); }
                }
            },
            "fieldset": {
                "getModule": function() { return require("views/dashboard/form/GlobalFieldset"); },
                "class": "container",
                "autoId": "fieldset",
                "state": {
                    "getModule": function() { return require("dashboard/state/FieldsetState"); }
                }
            },
            "panelref": {
                "getModule": function() { return require("views/dashboard/layout/PanelRef"); },
                "class": "container",
                "settingsOptions": {
                    "tokens": true
                },
                "autoId": "panel",
                "state": {
                    "getModule": function() { return require("dashboard/state/PanelState"); }
                }
            },
            "chart": {
                "getModule": function() { return require("views/dashboard/element/DashboardElement"); },
                "class": "viz",
                "reportContent": {
                    "display.general.type": "visualizations",
                    "display.visualizations.type": "charting"
                }
            },
            "table": {
                "getModule": function() { return require("views/dashboard/element/DashboardElement"); },
                "class": "viz",
                "reportContent": {
                    "display.general.type": "statistics"
                }
            },
            "single": {
                "getModule": function() { return require("views/dashboard/element/DashboardElement"); },
                "class": "viz",
                "reportContent": {
                    "display.general.type": "visualizations",
                    "display.visualizations.type": "singlevalue"
                }
            },
            "map": {
                "getModule": function() { return require("views/dashboard/element/DashboardElement"); },
                "class": "viz",
                "reportContent": {
                    "display.general.type": "visualizations",
                    "display.visualizations.type": "mapping"
                }
            },
            "event": {
                "getModule": function() { return require("views/dashboard/element/DashboardElement"); },
                "class": "viz",
                "reportContent": {
                    "display.general.type": "events"
                }
            },
            "viz": {
                "getModule": function() { return require("views/dashboard/element/DashboardElement"); },
                "class": "viz",
                "reportContent": {
                    "display.general.type": "visualizations",
                    "display.visualizations.type": "custom"
                }
            },
            "html": {
                "getModule": function() { return require("views/dashboard/element/Html"); },
                "class": "content",
                "renameSettings": {
                    "content": "html"
                }
            },
            "text-input": {
                "getModule": function() { return require("views/dashboard/form/Input"); },
                "class": "input",
                "settingsToCreate": {
                    "blankIsUndefined": true,
                    "type": "text",
                    "getView": function() { return require("splunkjs/mvc/textinputview"); }
                }
            },
            "dropdown-input": {
                "getModule": function() { return require("views/dashboard/form/Input"); },
                "class": "input",
                "settingsToCreate": {
                    "type": "dropdown",
                    "getView": function() { return require("splunkjs/mvc/dropdownview"); }
                }
            },
            "radio-input": {
                "getModule": function() { return require("views/dashboard/form/Input"); },
                "class": "input",
                "settingsToCreate": {
                    "multiValue": false,
                    "type": "radio",
                    "getView": function() { return require("splunkjs/mvc/radiogroupview"); }
                }
            },
            "link-input": {
                "getModule": function() { return require("views/dashboard/form/Input"); },
                "class": "input",
                "settingsToCreate": {
                    "type": "link",
                    "getView": function() { return require("splunkjs/mvc/linklistview"); }
                }
            },
            "multiselect-input": {
                "getModule": function() { return require("views/dashboard/form/Input"); },
                "class": "input",
                "settingsToCreate": {
                    "multiValue": true,
                    "type": "multiselect",
                    "getView": function() { return require("splunkjs/mvc/multidropdownview"); }
                }
            },
            "checkbox-input": {
                "getModule": function() { return require("views/dashboard/form/Input"); },
                "class": "input",
                "settingsToCreate": {
                    "multiValue": true,
                    "type": "checkbox",
                    "getView": function() { return require("splunkjs/mvc/checkboxgroupview"); }
                }
            },
            "time-input": {
                "getModule": function() { return require("views/dashboard/form/Input"); },
                "settingsToCreate": {
                    "type": "time",
                    "getView": function() { return require("splunkjs/mvc/timerangeview"); }
                },
                "class": "input"
            },
            "drilldown": {
                "getModule": function() { return require("splunkjs/mvc/simplexml/eventhandler"); },
                "class": "event",
                "settingsToCreate": {
                    "event": "drilldown"
                }
            },
            "selection": {
                "getModule": function() { return require("splunkjs/mvc/simplexml/eventhandler"); },
                "class": "event",
                "settingsToCreate": {
                    "event": "selection"
                }
            },
            "input-change": {
                "getModule": function() { return require("splunkjs/mvc/simplexml/eventhandler"); },
                "class": "event",
                "settingsToCreate": {
                    "event": "valueChange"
                }
            },
            "init-event-handler": {
                "class": "event",
                "getModule": function() { return require("splunkjs/mvc/simplexml/dashboardeventhandler"); }
            },
            "inline-search": {
                "getModule": function() { return require("splunkjs/mvc/searchmanager"); },
                "class": "manager",
                "settingsToCreate": {
                    "status_buckets": 0,
                    "cancelOnUnload": true,
                    "auto_cancel": 90,
                    "preview": true,
                    "runWhenTimeIsUndefined": false,
                    "defaultsToGlobalTimerange": true,
                    "replaceTabsInSearch": true,
                    "provenance": function(){
                        return "UI:Dashboard:" + utils.getPageInfo().page;
                    }
                },
                "renameSettings": {
                    "query": "search",
                    "earliest": "earliest_time",
                    "latest": "latest_time",
                    "sampleRatio": "sample_ratio"
                }
            },
            "saved-search": {
                "getModule": function() { return require("splunkjs/mvc/savedsearchmanager"); },
                "class": "manager",
                "settingsToCreate": {
                    "status_buckets": 0,
                    "cancelOnUnload": true,
                    "auto_cancel": 90,
                    "preview": true,
                    "runWhenTimeIsUndefined": false,
                    "provenance": function(){
                        return "UI:Dashboard:" + utils.getPageInfo().page;
                    }
                },
                "renameSettings": {
                    "ref": "searchname",
                    "name": "searchname",
                    "earliest": "earliest_time",
                    "latest": "latest_time"
                }
            },
            "postprocess-search": {
                "getModule": function() { return require("splunkjs/mvc/postprocessmanager"); },
                "settingsToCreate": {
                    "replaceTabsInSearch": true
                },
                "renameSettings": {
                    "base": "managerid",
                    "query": "search",
                    "postprocess": "search"
                },
                "class": "manager"
            },
            "search-eventhandler": {
                "getModule": function() { return require("splunkjs/mvc/simplexml/searcheventhandler"); },
                "class": "event"
            }
        },
        "classes": {
            "container": {
                "dom": true
            },
            "content": {
                "settingsOptions": {
                    "tokens": true
                },
                "autoId": "content",
                "dom": true,
                "state": {
                    "getModule": function() { return require("dashboard/state/ElementState"); }
                }
            },
            "viz": {
                "settingsOptions": {
                    "tokens": true
                },
                "autoId": "element",
                "dom": true,
                "state": {
                    "getModule": function() { return require("dashboard/state/ElementState"); }
                }
            },
            "input": {
                "settingsToCreate": {
                    "handleValueChange": true
                },
                "settingsOptions": {
                    "tokens": true
                },
                "autoId": "input",
                "dom": true,
                "state": {
                    "getModule": function() { return require("dashboard/state/InputState"); }
                }
            },
            "manager": {
                "settingsToCreate": {
                    "auto_cancel": 90,
                    "preview": true,
                    "runWhenTimeIsUndefined": false
                },
                "settingsOptions": {
                    "tokens": true,
                    "tokenNamespace": "submitted"
                },
                "autoId": "search",
                "state": {
                    "getModule": function() { return require("dashboard/state/SearchState"); }
                }
            },
            "event": {
                "autoId": "evt"
            }
        }
    };
});
