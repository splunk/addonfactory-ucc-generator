define(function() {
    var _NEW = {
        "entry": [
            {
                "name": "_new",
                "links": {
                    "alternate": "/servicesNS/admin/search/data/props/extractions/_new"
                },
                "fields": {
                    "required": [
                        "name",
                        "stanza",
                        "type",
                        "value"
                    ],
                    "optional": [],
                    "wildcard": []
                }
            }
        ]
    };

    var INLINE_EXTRACTION = {
        "entry": [
            {
                "name": "splunk_web_service : EXTRACT-baz",
                "links": {
                    "alternate": "/servicesNS/nobody/search/data/props/extractions/splunk_web_service%20%3A%20EXTRACT-baz"
                },
                "content": {
                    "attribute": "EXTRACT-baz",
                    "eai:acl": null,
                    "stanza": "splunk_web_service",
                    "type": "Inline",
                    "value": "baz=(?P<baz>[A-Z]+)"
                },
                "fields": {
                    "required": [
                        "value"
                    ],
                    "optional": [],
                    "wildcard": []
                }
            }
        ]
    };

    var TRANSFORM_EXTRACTION = {
        "links": {
            "create": "/servicesNS/nobody/system/data/props/extractions/_new"
        },
        "origin": "https://localhost:8789/servicesNS/nobody/system/data/props/extractions",
        "updated": "2014-05-27T21:00:02-07:00",
        "generator": {
            "build": "207322",
            "version": "20140506"
        },
        "entry": [
            {
                "name": "access_combined_wcookie : REPORT-access",
                "links": {
                    "alternate": "/servicesNS/nobody/system/data/props/extractions/access_combined_wcookie%20%3A%20REPORT-access"
                },
                "fields": {
                    "required": [
                        "value"
                    ],
                    "optional": [],
                    "wildcard": []
                },
                "content": {
                    "attribute": "REPORT-access",
                    "eai:acl": null,
                    "stanza": "access_combined_wcookie",
                    "type": "Uses transform",
                    "value": "access-extractions"
                }
            }
        ]
    };

    var THREE_INLINE_EXTRACTIONS = {
        "entry": [
            {
                "name": "splunk_web_service : EXTRACT-baz",
                "links": {
                    "alternate": "/servicesNS/nobody/search/data/props/extractions/splunk_web_service%20%3A%20EXTRACT-baz"
                },
                "content": {
                    "attribute": "EXTRACT-baz",
                    "eai:acl": null,
                    "stanza": "splunk_web_service",
                    "type": "Inline",
                    "value": "baz=(?P<baz>[A-Z]+)"
                }
            },
            {
                "name": "splunk_web_service : EXTRACT-foo,bar",
                "links": {
                    "alternate": "/servicesNS/nobody/search/data/props/extractions/splunk_web_service%20%3A%20EXTRACT-foo%2Cbar"
                },
                "content": {
                    "attribute": "EXTRACT-foo,bar",
                    "eai:acl": null,
                    "stanza": "splunk_web_service",
                    "type": "Inline",
                    "value": "(?P<foo>[a-z]+)(?P<bar>[0-9]+)"
                }
            },
            {
                "name": "splunk_web_service : EXTRACT-useragent",
                "links": {
                    "alternate": "/servicesNS/nobody/search/data/props/extractions/splunk_web_service%20%3A%20EXTRACT-useragent"
                },
                "content": {
                    "attribute": "EXTRACT-useragent",
                    "eai:acl": null,
                    "stanza": "splunk_web_service",
                    "type": "Inline",
                    "value": "userAgent=(?P<browser>[^ (]+)"
                }
            }
        ]
    };

    var THREE_INLINE_EXTRACTIONS_PLUS_ONE_NOT_FROM_RAW = {
        "entry": [
            {
                "name": "splunk_web_service : EXTRACT-baz",
                "links": {
                    "alternate": "/servicesNS/nobody/search/data/props/extractions/splunk_web_service%20%3A%20EXTRACT-baz"
                },
                "content": {
                    "attribute": "EXTRACT-baz",
                    "eai:acl": null,
                    "stanza": "splunk_web_service",
                    "type": "Inline",
                    "value": "baz=(?P<baz>[A-Z]+)"
                }
            },
            {
                "name": "splunk_web_service : EXTRACT-foo,bar",
                "links": {
                    "alternate": "/servicesNS/nobody/search/data/props/extractions/splunk_web_service%20%3A%20EXTRACT-foo%2Cbar"
                },
                "content": {
                    "attribute": "EXTRACT-foo,bar",
                    "eai:acl": null,
                    "stanza": "splunk_web_service",
                    "type": "Inline",
                    "value": "(?P<foo>[a-z]+)(?P<bar>[0-9]+)"
                }
            },
            {
                "name": "splunk_web_service : EXTRACT-useragent",
                "links": {
                    "alternate": "/servicesNS/nobody/search/data/props/extractions/splunk_web_service%20%3A%20EXTRACT-useragent"
                },
                "content": {
                    "attribute": "EXTRACT-useragent",
                    "eai:acl": null,
                    "stanza": "splunk_web_service",
                    "type": "Inline",
                    "value": "userAgent=(?P<browser>[^ (]+)"
                }
            },
            {
                "name": "splunk_web_service : EXTRACT-not-from-raw",
                "links": {
                    "alternate": "/servicesNS/nobody/search/data/props/extractions/splunk_web_service%20%3A%20EXTRACT-not-from-raw"
                },
                "content": {
                    "attribute": "EXTRACT-not-from-raw",
                    "eai:acl": null,
                    "stanza": "splunk_web_service",
                    "type": "Inline",
                    "value": "userAgent=(?P<browser>[^ (]+) in foo"
                }
            }
        ]
    };

    return {
        _NEW: _NEW,
        INLINE_EXTRACTION: INLINE_EXTRACTION,
        TRANSFORM_EXTRACTION: TRANSFORM_EXTRACTION,
        THREE_INLINE_EXTRACTIONS: THREE_INLINE_EXTRACTIONS,
        THREE_INLINE_EXTRACTIONS_PLUS_ONE_NOT_FROM_RAW: THREE_INLINE_EXTRACTIONS_PLUS_ONE_NOT_FROM_RAW
    };
});