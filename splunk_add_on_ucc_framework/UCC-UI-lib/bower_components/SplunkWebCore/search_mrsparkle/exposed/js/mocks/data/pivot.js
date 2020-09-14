define(function() {
    var MOCK_FILTER_ELEMENTS_UNSORTED = [
        {
            defaultLabel: 'field3',
            updatedTimestamp: 10
        },
        {
            defaultLabel: 'field1',
            updatedTimestamp: 30
        },
        {
            defaultLabel: 'field2',
            updatedTimestamp: 20
        }
    ];

    var MOCK_FILTER_ELEMENTS_SORTED = [
        {
            defaultLabel: 'field1',
            updatedTimestamp: 30
        },
        {
            defaultLabel: 'field2',
            updatedTimestamp: 20
        },
        {
            defaultLabel: 'field3',
            updatedTimestamp: 10
        }
    ];

    var MOCK_CELL_ELEMENTS_UNSORTED = [
        {
            defaultLabel: 'field3',
            updatedTimestamp: 100,
            fieldName: 'bbb'
        },
        {
            defaultLabel: 'field1',
            updatedTimestamp: 40,
            fieldName: 'aaa'
        },
        {
            defaultLabel: 'field2',
            updatedTimestamp: 30,
            fieldName: 'aaa'
        }
    ];

    var MOCK_CELL_ELEMENTS_SORTED = [
        {
            defaultLabel: 'field1',
            updatedTimestamp: 40,
            fieldName: 'aaa'
        },
        {
            defaultLabel: 'field2',
            updatedTimestamp: 30,
            fieldName: 'aaa'
        },
        {
            defaultLabel: 'field3',
            updatedTimestamp: 100,
            fieldName: 'bbb'
        }
    ];

    var MOCK_RECENT_CELLS = [
        {
            "fieldName": "Pageview",
            "type": "objectCount",
            "owner": "Pageview",
            "displayName": "Page View",
            "userDefinedLabel": "",
            "elementType": "cell",
            "limitType": "none",
            "limitAmount": "",
            "sparkline": true,
            "updatedTimestamp": 1343687564535,
            "value": "count"
        },
        {
            "fieldName": "_time",
            "type": "timestamp",
            "owner": "Pageview",
            "displayName": "time",
            "userDefinedLabel": "",
            "elementType": "cell",
            "limitType": "none",
            "limitAmount": "",
            "sparkline": false,
            "updatedTimestamp": 1343687550371,
            "value": "duration"
        },
        {
            "fieldName": "client_city",
            "type": "string",
            "owner": "Pageview",
            "displayName": "client city",
            "userDefinedLabel": "",
            "elementType": "cell",
            "limitType": "none",
            "limitAmount": "",
            "sparkline": false,
            "updatedTimestamp": 1343423999385,
            "value": "dc"
        },
        {
            "fieldName": "status",
            "type": "number",
            "owner": "Pageview",
            "displayName": "status code",
            "userDefinedLabel": "",
            "elementType": "cell",
            "limitType": "none",
            "limitAmount": "",
            "sparkline": false,
            "updatedTimestamp": 1343420838115,
            "value": "values"
        },
        {
            "fieldName": "useragent",
            "type": "string",
            "owner": "Pageview",
            "displayName": "user agent",
            "userDefinedLabel": "",
            "elementType": "cell",
            "limitType": "none",
            "limitAmount": "",
            "sparkline": false,
            "updatedTimestamp": 1343687586287,
            "value": "first"
        }
    ];

    var MOCK_REPORT_JSON = {
        "entry": [
            {
                "name": "Test-Report",
                "links": {
                    "alternate": "blah/blah/Test-Report"
                },
                "content": {
                    "display.statistics.overlay": "foo",
                    "display.visualizations.type": "bar",
                    "display.page.pivot.reportConfig": {
                        "filters": [
                            {
                                "elementType": "filter",
                                "ruleComparator": "doesNotContain",
                                "ruleCompareTo": "phpMyAdmin",
                                "fieldName": "uri_path",
                                "type": "string",
                                "owner": "HTTP_Request",
                                "displayName": "uri path",
                                "updatedTimestamp": 1349885979098
                            }
                        ],
                        "cells": [
                            {
                                "fieldName": "Pageview",
                                "elementType": "cell",
                                "sparkline": true,
                                "type": "objectCount",
                                "owner": "HTTP_Request.HTTP_Success.Pageview",
                                "displayName": "Page View",
                                "updatedTimestamp": 1349885912229
                            }
                        ],
                        "rows": [
                            {
                                "elementType": "row",
                                "showSummary": true,
                                "fieldName": "uri_path",
                                "type": "string",
                                "owner": "HTTP_Request",
                                "displayName": "uri path",
                                "updatedTimestamp": 1349885927403,
                                "label": "uri path"
                            }
                        ],
                        "columns": [
                            {
                                "elementType": "column",
                                "showSummary": true,
                                "fieldName": "useragent",
                                "type": "string",
                                "owner": "HTTP_Request",
                                "displayName": "user agent",
                                "updatedTimestamp": 1349885937442
                            }
                        ]
                    }
                }
            }
        ]
    };

    var MOCK_OTHER_REPORT_JSON = {
        "entry": [
            {
                "name": "Other-Test-Report",
                "links": {
                    "alternate": "blah/blah/Other-Test-Report"
                },
                "content": {
                    "display.statistics.overlay": "foo",
                    "display.visualizations.type": "bar",
                    "display.page.pivot.reportConfig": {
                        "filters": [
                            {
                                "elementType": "filter",
                                "ruleComparator": "doesNotContain",
                                "ruleCompareTo": "phpMyAdmin",
                                "fieldName": "uri_path",
                                "type": "string",
                                "owner": "Pageview",
                                "ownerName": "Pageview",
                                "updatedTimestamp": 1349885979098
                            }
                        ],
                        "cells": [
                            {
                                "elementType": "cell",
                                "sparkline": true,
                                "type": "objectCount",
                                "owner": "Pageview",
                                "ownerName": "Pageview",
                                "updatedTimestamp": 1349885912229
                            }
                        ],
                        "rows": [
                            {
                                "elementType": "row",
                                "showSummary": true,
                                "fieldName": "uri_path",
                                "type": "string",
                                "owner": "Pageview",
                                "ownerName": "Pageview",
                                "updatedTimestamp": 1349885927403,
                                "userDefinedLabel": "uri path"
                            }
                        ],
                        "columns": [
                            {
                                "elementType": "column",
                                "showSummary": true,
                                "fieldName": "useragent",
                                "type": "string",
                                "owner": "Pageview",
                                "ownerName": "Pageview",
                                "updatedTimestamp": 1349885937442
                            }
                        ]
                    }
                }
            }
        ]
    };

    var MOCK_URI_REPORT_CONFIG = JSON.stringify({
        "filters": [
            {
                "elementType": "filter",
                "ruleComparator": "doesNotContain",
                "ruleCompareTo": "phpMyAdmin",
                "fieldName": "uri_path",
                "type": "string",
                "owner": "HTTP_Request",
                "ownerName": "HTTP_Request",
                "updatedTimestamp": 1349885979098
            }
        ],
        "cells": [
            {
                "elementType": "cell",
                "sparkline": true,
                "type": "objectCount",
                "owner": "HTTP_Request.HTTP_Success.Pageview",
                "ownerName": "Pageview",
                "fieldName": "Pageview",
                "updatedTimestamp": 1349885912229
            }
        ],
        "rows": [
            {
                "elementType": "row",
                "showSummary": true,
                "fieldName": "uri_path",
                "type": "string",
                "owner": "HTTP_Request",
                "ownerName": "HTTP_Request",
                "updatedTimestamp": 1349885927403,
                "userDefinedLabel": "uri path"
            }
        ],
        "columns": [
            {
                "elementType": "column",
                "showSummary": true,
                "fieldName": "useragent",
                "type": "string",
                "owner": "HTTP_Request",
                "ownerName": "HTTP_Request",
                "updatedTimestamp": 1349885937442
            }
        ]
    });

    var MOCK_NEW_REPORT_JSON = {
        "entry": [
            {
                "id": 'foo/bar/_new',
                "content": {
                    "display.statistics.overlay": "foo",
                    "display.visualizations.type": "bar"
                },
                "links": {
                    "alternate": 'foo/bar/_new'
                }
            }
        ]
    };

    var MOCK_FILTER_LIST = [
        {
            id: 1,
            label: 'filter-label-1',
            type: 'number'
        }
    ];

    var MOCK_FILTER_LIST_WITH_TIMERANGE = [
        {
            id: 1,
            label: 'filter-label-1',
            type: 'timestamp'
        }
    ];

    var MOCK_FILTER_LIMIT_REPORT_FIELDS = [
        {
            fieldName: 'filter1',
            displayName: 'filter-label-1',
            type: 'number',
            owner: "Some Object"
        },
        {
            fieldName: 'filter2',
            displayName: 'filter-label-2',
            type: 'string',
            owner: "Some Object"
        },
        {
            fieldName: 'filter3',
            displayName: 'filter-label-3',
            type: 'objectCount',
            owner: "Some Object"
        }
    ];

    var MOCK_CELL_LIST = [
        {
            id: 2,
            label: 'cell-label-1',
            type: 'string'
        }
    ];

    var MOCK_ROW_LIST = [
        {
            id: 3,
            label: 'row-label-1',
            type: 'boolean'
        }
    ];

    var MOCK_COLUMN_LIST = [
        {
            id: 4,
            label: 'column-label-1',
            type: 'timestamp'
        }
    ];

    var MOCK_SAMPLE_VALUES = [ 'foo', 'bar', 'bazzz' ];

    var PANEL_CONFIG_FIXTURES = {

        noElementPanel: {
            description: 'test-no-element-panel',
            title: 'test-no-element-panel'
        },

        elementPanel: {
            description: 'test-panel-with-element',
            title: 'test-short-title',
            elementType: 'filter',
            formElements: [{ name: 'test-form-element-name' }]
        },

        elementPanelWithDataTypes: {
            description: 'test-panel-with-element',
            title: 'test-panel-with-element',
            elementType: 'filter',
            dataTypes: ['string', 'number']
        },

        elementPanelWithMaxLength: {
            description: 'test-panel-with-element',
            title: 'test-panel-with-element',
            elementType: 'filter',
            dataTypes: ['string', 'number'],
            maxLength: 1
        },

        elementPanelDisabledForAdd: {
            description: 'test-panel-with-element',
            elementType: 'filter',
            maxLength: 1,
            isEnabledForAdd: function() {
                return 'Message instead of add button.';
            }
        },

        elementPanelEnabledForAdd: {
            description: 'test-panel-with-element',
            elementType: 'filter',
            maxLength: 1,
            isEnabledForAdd: function() {
                return undefined;
            }
        }

    };

    var PANEL_LIST_FIXTURE = [PANEL_CONFIG_FIXTURES.noElementPanel, PANEL_CONFIG_FIXTURES.elementPanel];

    var FILTER_ELEMENT_FIXTURE = [
        {
            fieldName: 'test-filter-one',
            type: 'string',
            elementType: 'filter',
            owner: 'owner-one'
        },
        {
            fieldName: 'test-filter-two',
            type: 'boolean',
            elementType: 'filter',
            owner: 'owner-two'
        },
        {
            fieldName: 'test-filter-three',
            type: 'number',
            elementType: 'filter',
            owner: 'owner-three'
        }
    ];

    var REPORT_FIELDS_FIXTURE = [
        {
            fieldName: 'test-report-field-one',
            type: 'string',
            owner: 'test-owner-one',
            displayName: 'test-display-name-one'
        },
        {
            fieldName: 'test-report-field-two',
            type: 'boolean',
            owner: 'test-owner-two',
            displayName: 'test-display-name-two'
        }
    ];

    var REPORT_FIELDS_FIXTURE_2 = [
        {
            fieldName: 'test-report-field-one',
            type: 'string',
            owner: 'test-owner-one',
            displayName: 'test-display-name-one'
        },
        {
            fieldName: 'test-report-field-two',
            type: 'number',
            owner: 'test-owner-two',
            displayName: 'test-display-name-two'
        },
        {
            fieldName: 'test-report-field-three',
            type: 'boolean',
            owner: 'test-owner-three',
            displayName: 'test-display-name-three'
        }
    ];

    var REPORT_FIELDS_FIXTURE_3 = [
        {
            fieldName: 'test-report-field-one',
            type: 'string',
            owner: 'test-owner-one',
            displayName: 'test-display-name-one'
        },
        {
            fieldName: 'test-report-field-two',
            type: 'number',
            owner: 'test-owner-two',
            displayName: 'test-display-name-two'
        },
        {
            fieldName: 'test-report-field-three',
            type: 'boolean',
            owner: 'test-owner-three',
            displayName: 'test-display-name-three'
        },
        {
            fieldName: 'test-report-field-four',
            type: 'string',
            owner: 'test-owner-four',
            displayName: 'test-display-name-four'
        },
        {
            fieldName: 'test-report-field-five',
            type: 'number',
            owner: 'test-owner-five',
            displayName: 'test-display-name-five'
        },
        {
            fieldName: 'test-report-field-six',
            type: 'string',
            owner: 'test-owner-six',
            displayName: 'test-display-name-six'
        }
    ];

    var REPORT_VALUES = {
        "filters": [
            {
                "elementType": "filter",
                "fieldName": "uri_path",
                "type": "string",
                "owner": "HTTP_Request",
                "ownerName": "HTTP_Request"
            }
        ],
        "cells": [
            {
                "elementType": "cell",
                "type": "objectCount",
                "owner": "HTTP_Request.HTTP_Success.Pageview",
                "ownerName": "Pageview",
                "fieldName": "Pageview"
            }
        ],
        "rows": [
            {
                "elementType": "row",
                "fieldName": "uri_path",
                "type": "string",
                "owner": "HTTP_Request",
                "ownerName": "HTTP_Request"
            }
        ],
        "columns": [
            {
                "elementType": "column",
                "fieldName": "useragent",
                "type": "string",
                "owner": "HTTP_Request",
                "ownerName": "HTTP_Request"
            }
        ]
    };

    return {
        MOCK_FILTER_ELEMENTS_UNSORTED: MOCK_FILTER_ELEMENTS_UNSORTED,
        MOCK_FILTER_ELEMENTS_SORTED: MOCK_FILTER_ELEMENTS_SORTED,
        MOCK_CELL_ELEMENTS_UNSORTED: MOCK_CELL_ELEMENTS_UNSORTED,
        MOCK_CELL_ELEMENTS_SORTED: MOCK_CELL_ELEMENTS_SORTED,
        MOCK_RECENT_CELLS: MOCK_RECENT_CELLS,
        MOCK_REPORT_JSON: MOCK_REPORT_JSON,
        MOCK_OTHER_REPORT_JSON: MOCK_OTHER_REPORT_JSON,
        MOCK_URI_REPORT_CONFIG: MOCK_URI_REPORT_CONFIG,
        MOCK_NEW_REPORT_JSON: MOCK_NEW_REPORT_JSON,
        MOCK_FILTER_LIST: MOCK_FILTER_LIST,
        MOCK_FILTER_LIST_WITH_TIMERANGE: MOCK_FILTER_LIST_WITH_TIMERANGE,
        MOCK_FILTER_LIMIT_REPORT_FIELDS: MOCK_FILTER_LIMIT_REPORT_FIELDS,
        MOCK_CELL_LIST: MOCK_CELL_LIST,
        MOCK_ROW_LIST: MOCK_ROW_LIST,
        MOCK_COLUMN_LIST: MOCK_COLUMN_LIST,
        MOCK_SAMPLE_VALUES: MOCK_SAMPLE_VALUES,
        PANEL_CONFIG_FIXTURES: PANEL_CONFIG_FIXTURES,
        PANEL_LIST_FIXTURE: PANEL_LIST_FIXTURE,
        FILTER_ELEMENT_FIXTURE: FILTER_ELEMENT_FIXTURE,
        REPORT_FIELDS_FIXTURE: REPORT_FIELDS_FIXTURE,
        REPORT_FIELDS_FIXTURE_2: REPORT_FIELDS_FIXTURE_2,
        REPORT_FIELDS_FIXTURE_3: REPORT_FIELDS_FIXTURE_3,
        REPORT_VALUES: REPORT_VALUES
    };
});