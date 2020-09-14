define(
    [
        'jquery',
        'underscore',
        'backbone',
        'models/Base',
        'util/splunkd_utils'
    ],
    function(
        $,
        _,  
      Backbone,
      BaseModel,
      splunkdUtils
    ) {

        // Returns true iff "stanza" ends with "://"
        var isPrefixStanza = function(stanza) {
            var prefixMarkers = ["://",":","::"];

            return _.reduce(prefixMarkers, function(memo, marker) {
                return memo || (stanza.indexOf(marker) === 
                    stanza.length - marker.length);
            }, false);
        };

        var PROPS_FILENAME_PATCHES = [
            { stanza: 'source::', rawStanza: 'source::<source>'},
            { stanza: 'host::', rawStanza: 'host::<host>' },
            { stanza: 'rule::', rawStanza: 'rule::<rulename>' },
            { stanza: 'delayedrule::', rawStanza: 'delayedrule::<rulename>' }
        ];
        var DEFAULT_SETTINGS_PATCH = [
          {
            "name": "ANNOTATE_PUNCT",
            "placeholder": "[true|false]"
          },
          {
            "name": "AUTO_KV_JSON",
            "placeholder": "[true|false]"
          },
          {
            "name": "BREAK_ONLY_BEFORE",
            "placeholder": "<regular expression>"
          },
          {
            "name": "BREAK_ONLY_BEFORE_DATE",
            "placeholder": "[true|false]"
          },
          {
            "name": "CHARSET",
            "placeholder": "<string>"
          },
          {
            "name": "CHECK_FOR_HEADER",
            "placeholder": "[true|false]"
          },
          {
            "name": "CHECK_METHOD",
            "placeholder": "[endpoint_md5|entire_md5|modtime]"
          },
          {
            "name": "DATETIME_CONFIG",
            "placeholder": "<filename relative to $SPLUNK_HOME>"
          },
          {
            "name": "EVAL-<fieldname>",
            "placeholder": "<eval statement>"
          },
          {
            "name": "EVENT_BREAKER",
            "placeholder": "<regular expression>"
          },
          {
            "name": "EVENT_BREAKER_ENABLE",
            "placeholder": "[true|false]"
          },
          {
            "name": "EXTRACT-<class>",
            "placeholder": "[<regex>|<regex> in <src_field>]"
          },
          {
            "name": "Example 1:  LINE_BREAKER",
            "placeholder": "end(\\n)begin|end2(\\n)begin2|begin3"
          },
          {
            "name": "FIELDALIAS-<class>",
            "placeholder": "(<orig_field_name> AS <new_field_name>)+"
          },
          {
            "name": "FIELDALIAS-a",
            "placeholder": "a AS one"
          },
          {
            "name": "FIELDALIAS-b",
            "placeholder": "b AS two"
          },
          {
            "name": "FIELD_DELIMITER",
            "placeholder": "<character>"
          },
          {
            "name": "FIELD_HEADER_REGEX",
            "placeholder": "<regex>"
          },
          {
            "name": "FIELD_NAMES",
            "placeholder": "[ <string>,..., <string>]"
          },
          {
            "name": "FIELD_QUOTE",
            "placeholder": "<character>"
          },
          {
            "name": "HEADER_FIELD_DELIMITER",
            "placeholder": "<character>"
          },
          {
            "name": "HEADER_FIELD_LINE_NUMBER",
            "placeholder": "<integer>"
          },
          {
            "name": "HEADER_FIELD_QUOTE",
            "placeholder": "<character>"
          },
          {
            "name": "HEADER_MODE",
            "placeholder": "<empty> | always | firstline | none"
          },
          {
            "name": "INDEXED_EXTRACTIONS",
            "placeholder": "< CSV|W3C|TSV|PSV|JSON >"
          },
          {
            "name": "JSON_TRIM_BRACES_IN_ARRAY_NAMES",
            "placeholder": "<bool>"
          },
          {
            "name": "KV_MODE",
            "placeholder": "[none|auto|auto_escaped|multi|json|xml]"
          },
          {
            "name": "KV_TRIM_SPACES",
            "placeholder": "true|false"
          },
          {
            "name": "LEARN_MODEL",
            "placeholder": "[true|false]"
          },
          {
            "name": "LEARN_SOURCETYPE",
            "placeholder": "[true|false]"
          },
          {
            "name": "LESS_THAN<optional_unique_value>_<number>",
            "placeholder": "<regular expression> (empty)"
          },
          {
            "name": "LESS_THAN_70",
            "placeholder": "####"
          },
          {
            "name": "LINE_BREAKER",
            "placeholder": "<regular expression>"
          },
          {
            "name": "LINE_BREAKER_LOOKBEHIND",
            "placeholder": "<integer>"
          },
          {
            "name": "LOOKUP-<class>",
            "placeholder": "$TRANSFORM (<match_field> (AS <match_field_in_event>)?)+ (OUTPUT|OUTPUTNEW (<output_field> (AS <output_field_in_event>)? )+ )?"
          },
          {
            "name": "MAX_DAYS_AGO",
            "placeholder": "<integer>"
          },
          {
            "name": "MAX_DAYS_HENCE",
            "placeholder": "<integer>"
          },
          {
            "name": "MAX_DIFF_SECS_AGO",
            "placeholder": "<integer>"
          },
          {
            "name": "MAX_DIFF_SECS_HENCE",
            "placeholder": "<integer>"
          },
          {
            "name": "MAX_EVENTS",
            "placeholder": "<integer>"
          },
          {
            "name": "MAX_TIMESTAMP_LOOKAHEAD",
            "placeholder": "<integer>"
          },
          {
            "name": "MISSING_VALUE_REGEX",
            "placeholder": "<regex>"
          },
          {
            "name": "MORE_THAN<optional_unique_value>_<number>",
            "placeholder": "<regular expression> (empty)"
          },
          {
            "name": "MORE_THAN_80",
            "placeholder": "----"
          },
          {
            "name": "MUST_BREAK_AFTER",
            "placeholder": "<regular expression>"
          },
          {
            "name": "MUST_NOT_BREAK_AFTER",
            "placeholder": "<regular expression>"
          },
          {
            "name": "MUST_NOT_BREAK_BEFORE",
            "placeholder": "<regular expression>"
          },
          {
            "name": "NO_BINARY_CHECK",
            "placeholder": "[true|false]"
          },
          {
            "name": "PREAMBLE_REGEX",
            "placeholder": "<regex>"
          },
          {
            "name": "PREFIX_SOURCETYPE",
            "placeholder": "[true|false]"
          },
          {
            "name": "REPORT-<class>",
            "placeholder": "<transform_stanza_name>, <transform_stanza_name2>,..."
          },
          {
            "name": "SEDCMD-<class>",
            "placeholder": "<sed script>"
          },
          {
            "name": "SEGMENTATION",
            "placeholder": "<segmenter>"
          },
          {
            "name": "SEGMENTATION-<segment selection>",
            "placeholder": "<segmenter>"
          },
          {
            "name": "SHOULD_LINEMERGE",
            "placeholder": "[true|false]"
          },
          {
            "name": "TIMESTAMP_FIELDS",
            "placeholder": "[ <string>,..., <string>]"
          },
          {
            "name": "TIME_FORMAT",
            "placeholder": "<strptime-style format>"
          },
          {
            "name": "TIME_PREFIX",
            "placeholder": "<regular expression>"
          },
          {
            "name": "TRANSFORMS-<class>",
            "placeholder": "<transform_stanza_name>, <transform_stanza_name2>,..."
          },
          {
            "name": "TRUNCATE",
            "placeholder": "<non-negative integer>"
          },
          {
            "name": "TZ",
            "placeholder": "<timezone identifier>"
          },
          {
            "name": "TZ_ALIAS",
            "placeholder": "<key=value>[,<key=value>]..."
          },
          {
            "name": "_actions",
            "placeholder": "<string>"
          },
          {
            "name": "category",
            "placeholder": "<string>"
          },
          {
            "name": "description",
            "placeholder": "<string>"
          },
          {
            "name": "detect_trailing_nulls",
            "placeholder": "[auto|true|false]"
          },
          {
            "name": "given_type",
            "placeholder": "<string>"
          },
          {
            "name": "initCrcLength",
            "placeholder": "<integer>"
          },
          {
            "name": "invalid_cause",
            "placeholder": "<string>"
          },
          {
            "name": "is_valid",
            "placeholder": "[true|false]"
          },
          {
            "name": "maxDist",
            "placeholder": "<integer>"
          },
          {
            "name": "priority",
            "placeholder": "5"
          },
          {
            "name": "pulldown_type",
            "placeholder": "<bool>"
          },
          {
            "name": "rename",
            "placeholder": "<string>"
          },
          {
            "name": "sourcetype",
            "placeholder": "a"
          },
          {
            "name": "unarchive_cmd",
            "placeholder": "<string>"
          },
          {
            "name": "unarchive_sourcetype",
            "placeholder": "<string>"
          }
        ];

        // This is a BaseModel, not a SplunkdBaseModel
        // because this endpoint is not EAI-compatible
        return BaseModel.extend(
            {
            urlRoot: 'configs/spec',

            url: function() {
                return splunkdUtils.fullpath(this.urlRoot);
            },

            isKnownStanza: function(stanza) {
                // Implicit: returns false if no stanza information
                var stanzaNames = this.getStanzaNames();

                stanza = $.trim(stanza);

                return _.some(stanzaNames, function(stanzaName) {
                    // If it is a prefix stanza, then return true
                    // if the input stanza is a prefix of this stanza
                    if (isPrefixStanza(stanzaName)) {
                        return stanza.indexOf(stanzaName) === 0;
                    }
                    // If it's not a prefix stanza, then it is known
                    // iff it is an exact match 
                    else {
                        return stanza === stanzaName;
                    }
                });
            },

            getStanzaNames: function() {
                if (!this.hasStanzasInformation()) {
                    return [];
                }
                return _.pluck(this.get('stanzas'), 'stanza');
            },

            getPlaceholders: function() {
                if (!this.hasKeysInformation()) {
                    return [];
                }

                return _.object(_.map(this.get('settings'), function(setting) {
                    return _.values(setting);
                }));
            },

            getValidKeys: function() {
                if (!this.hasKeysInformation()) {
                    return [];
                }

                return _.pluck(this.get('settings'), 'name');
            },

            hasKeysInformation: function() {
                return this.has('settings');
            },

            hasStanzasInformation: function() {
                return this.has('stanzas');
            },

            findStanzaObject:  function(stanzaName) {
                var stanzas = this.get('stanzas') || [],
                    matches = [];
                
                stanzaName = stanzaName || '';

                matches = _.filter(stanzas, function(stanza) {
                    return (stanzaName.indexOf(stanza.stanza) === 0 &&
                        isPrefixStanza(stanza.stanza)) ||
                        (stanzaName === stanza.stanza);
                });

                if (matches.length > 0) {
                    return _.max(matches, function(match) {
                        return match.stanza.length;
                    });
                }
                else {
                    return null;
                }
            },

            parse: function(response) {
                this._applyParsePatches(response);
                // SPL-125490
                // As part of fixing SPL-125490 the endpoint needs to 
                // return some properties that are not relevant to this UI.
                // Filter out any of these properties that begin with
                // anything not: alphanumeric, underscore, or < sign.
                if (_.has(response, 'settings')) {
                    response.settings = _.filter(response.settings, function(setting) {
                        return /^[a-zA-z0-9_<]$/.test(setting.name.charAt(0));
                    });
                }
                return response;
            },

            _applyParsePatches: function(response) {
                this._applyFilenamePatches(response);
                this._applyStanzaPatches(response);
            },

            _applyFilenamePatches: function(response) {
                var stanzaNames = [];

                if (response.filename === 'props' &&
                    _.has(response, 'stanzas')) {

                    stanzaNames = _.pluck(response.stanzas, 'stanza');
                    _.each(PROPS_FILENAME_PATCHES, function(patch) {
                        if (!_.contains(stanzaNames, patch.stanza)) {
                            response.stanzas.push(patch);
                        }
                    });
                }
            },

            _applyStanzaPatches: function(response) {
                if (response.filename === 'props' &&
                    _.contains(_.pluck(PROPS_FILENAME_PATCHES, 'stanza'), response.stanza) &&
                    (!_.isArray(response.settings) ||
                        response.settings.length === 0)) {

                    response.settings = DEFAULT_SETTINGS_PATCH;
                }
            }
        });
    }
);