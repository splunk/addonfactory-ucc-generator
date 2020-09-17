/**
 *
 * This is an enriched model for Sourcetype which extends the bare metal model services/saved/Sourcetype.
 * It provides:
 *  - transposition between ui human-readable attributes and splunkd props.conf attributes
 *
 */
define(
    [
        'jquery',
        'underscore',
        'models/services/saved/Sourcetype',
        'splunk.util',
        'util/splunkd_utils'
    ],
    function($, _, SourcetypeModel, splunkUtils, splunkdUtils, undefined) {
        var Model = SourcetypeModel.extend({
            initialize: function() {
                SourcetypeModel.prototype.initialize.apply(this, arguments);

                this.uiAttrsRegex = /^ui\./;
                this._parsing = false;

                // populate defaults attributes (UI namespace) to entry props
                this.populateFromEntry();

                // turn on all listeners to keep these 2 entities in sync:
                // - UI: model own ui namespace attributes
                // - Entry: model.entry.content props
                this.populateListenersOn();
            },
            defaults: {
                'ui.misc.process_binary_files': true,   // NO_BINARY_CHECK = true
                'ui.timestamp.mode': 'auto',            // possible values: auto/current/advanced
                'ui.timestamp.format': undefined,
                'ui.timestamp.prefix': undefined,
                'ui.timestamp.timezone': undefined,
                'ui.timestamp.lookahead': 128,
                'ui.eventbreak.mode': 'auto',           // possible values: auto/everyline/regex
                'ui.eventbreak.regexmode': 'before',    // possible values: before/after/exclude
                'ui.eventbreak.regex': undefined,
                'ui.structured.file_format': undefined, // possible values: CSV,W3C,TSV,PSV,JSON
                'ui.structured.preamble_pattern': undefined,
                'ui.structured.header_mode': 'auto',
                'ui.structured.header_line_prefix': undefined,
                'ui.structured.header_line_number': undefined,
                'ui.structured.header_field_delimiter': undefined,
                'ui.structured.header_field_quote': undefined,
                'ui.structured.header_fields': undefined,
                'ui.structured.event_field_delimiter': undefined,
                'ui.structured.event_field_quote': undefined,
                'ui.structured.timestamp_fields': undefined,
                'name': ''
            },
            validation: {
                'name': [
                    {
                        required: true,
                        msg: _('Source type name is required').t()
                    },
                    {
                        pattern: /^[^#?&]*$/,
                        msg: _('Source type name does not allow ? or # or &.').t()
                    }
                ]
            },
            isStructuredDataFormat: function() {
                return !!this.entry.content.get('INDEXED_EXTRACTIONS');
            },
            isParsing: function() {
                return this._parsing;
            },
            getDataFormat: function() {
                var format = this.entry.content.get('INDEXED_EXTRACTIONS'),
                    type;

                if(typeof format === 'string'){
                    format = format.toLowerCase();
                }

                switch(format)
                {
                    case 'csv':
                    case 'tsv':
                    case 'psv':
                        type = this.constructor.TABULAR;
                        break;
                    case 'json':
                    case 'xml':
                        type = this.constructor.HIERARCHICAL;
                        break;
                    default:
                        type = this.constructor.UNSTRUCTURED;
                        break;
                }
                return type;
            },
            getExplicitProps: function() {
                // get reference to default sourcetype
                var defaultSourcetype = this.constructor.DefaultSourcetype;

                // clone model props
                var props = $.extend(true, {}, this.entry.content.attributes),
                    propsDefault = defaultSourcetype.entry.content.attributes;

                _.each(props, function(value, key) {
                    // ignore prop if same value as a default prop
                    // always leave SHOULD_LINEMERGE key due to SPL-90612
                    // Always leave CHARSET key due to SPL-102706
                    if (key !== 'SHOULD_LINEMERGE' && key !== 'CHARSET' &&
                        _.has(propsDefault, key) && propsDefault[key] === value) {
                        delete props[key];
                    }
                });
                return props;
            },
            changedAttributesUI: function() {
                if (!this.changedAttributes()) { return false; }
                var uiRegex = this.uiAttrsRegex,
                    uiAttrs = _.chain(this.changedAttributes())
                        .reduce(function(memo, value, key) {
                            if (uiRegex.test(key)) { memo[key] = value; }
                            return memo;
                        }, {})
                        .value();

                return uiAttrs;
            },
            parse: function() {
                this._parsing = true;
                var response = SourcetypeModel.prototype.parse.apply(this, arguments);
                this._parsing = false;
                return response;
            },
            // override save to abstract away logic from model consumer in case
            // of a sync Patch only: revert the setting of passed-in attrs on the model
            save: function(key, val, options) {
                //TODO this is superfluous. this entire function can be removed.
                var attrs, modelAttrs, xhr;

                // Handle both `"key", value` and `{key: value}` -style arguments.
                if (key == null || typeof key === 'object') {
                  attrs = key;
                  options = val;
                } else {
                  (attrs = {})[key] = val;
                }

                if (options && options.patch && !_.isEmpty(attrs)) {
                    // get copy of model attributes with same keys as passed-in attributes
                    modelAttrs = this.filterByKeys(_.keys(attrs), {allowEmpty: true});
                    // set passed-in attrs on model.entry.content vs model
                    this.entry.content.set(attrs);
                }

                // call backbone model save with same arguments
                xhr = SourcetypeModel.prototype.save.apply(this, arguments);

                if (options && options.patch && !_.isEmpty(attrs)) {
                    // revert the setting of passed-in attributes on the model
                    // which is done by backbone model save(attrs, {patch:true})
                    _.each(attrs, function(value, key) {
                        if (modelAttrs.hasOwnProperty(key)) {
                            // revert to original value if attribute existed pre-save
                            this.set(key, value);
                        } else {
                            // unset if attribute did not exist pre-save
                            this.unset(key);
                        }
                    }.bind(this));
                }

                return xhr;
            },
            /*
             * Combined on/off for listeners to keep UI & Entry in sync
             ****************************************************************
             */
            populateListenersOn: function() {
                // listener to synchronize changes from ui attributes
                this.on('change', this.populateFromUI, this);
                // listener to synchronize changes from entry props
                this.entry.content.on('change', this.populateFromEntry, this);
            },
            populateListenersOff: function() {
                // turn off listener for changes from ui attributes
                this.off('change', this.populateFromUI, this);
                // turn off listener for changes from entry props
                this.entry.content.off('change', this.populateFromEntry, this);
            },
            /*
             * Populate methods from each of UI & Entry to each other
             ****************************************************************
             */
            // UI Attrs -> Entry Props
            populateFromUI: function(model, options) {

                //if we see success, then this update was a result of a fetch, and we dont need to populateFromUi
                if(options && options.success){
                    return;
                }

                // turn off all listeners to avoid circular reference
                this.populateListenersOff();
                // get changed ui attributes
                var uiAttrs = (options && options.changedAttributesOnly)
                            ? this.changedAttributesUI()
                            : this.attributes;
                // convert ui attributes to props
                var props =  this.transposeFromUIToProps(uiAttrs);
                if (!_.isEmpty(props)) {
                    // set content directly from props
                    this.entry.content.set(props);
                }
                // turn back on all listeners
                this.populateListenersOn();
            },
            // Entry Props -> UI Attrs
            populateFromEntry: function(model, options) {
                // turn off all listeners to avoid circular reference
                this.populateListenersOff();
                // get changed props from content entry
                var props = (options && options.changedAttributesOnly)
                          ? this.entry.content.changedAttributes()
                          : this.entry.content.attributes;
                if (!_.isEmpty(props)) {
                    // convert entry props to ui attributes
                    this.set(this.transposeFromPropsToUI(props));
                }
                // turn back on all listeners
                this.populateListenersOn();
            },
            /*
             * Transposition helper methods to convert from/to ui namespace
             ****************************************************************
             */
            transposeFromPropsToUI: function(props) {
                var attr = {};

                if (!props || _.isEmpty(props)) { return attr; }

                // 1) set timestamp related ui settings
                if (props.DATETIME_CONFIG === 'CURRENT') {
                    attr['ui.timestamp.mode'] = 'current';
                } else {
                    if (props.TIME_FORMAT || props.TIME_PREFIX || props.TZ || props.TIMESTAMP_FIELDS ||
                        (props.MAX_TIMESTAMP_LOOKAHEAD && props.MAX_TIMESTAMP_LOOKAHEAD !== this.defaults['ui.timestamp.lookahead'])) {
                        attr['ui.timestamp.mode'] = 'advanced';
                        if (props.TIME_FORMAT || props.TIME_FORMAT === '') { attr['ui.timestamp.format'] = props.TIME_FORMAT; }
                        if (props.TIMESTAMP_FIELDS || props.TIMESTAMP_FIELDS === '') { attr['ui.timestamp.fields'] = props.TIMESTAMP_FIELDS; }
                        if (props.TIME_PREFIX || props.TIME_PREFIX === '') { attr['ui.timestamp.prefix'] = props.TIME_PREFIX; }
                        if (props.TZ || props.TZ === '') { attr['ui.timestamp.timezone'] = props.TZ; }
                        if (props.MAX_TIMESTAMP_LOOKAHEAD && props.MAX_TIMESTAMP_LOOKAHEAD !== this.defaults['ui.timestamp.lookahead']) {
                            attr['ui.timestamp.lookahead'] = props.MAX_TIMESTAMP_LOOKAHEAD;
                        }
                    } else {
                        attr['ui.timestamp.mode'] = 'auto';
                    }
                }

                // 2) set event break related ui settings
                 if (props.SHOULD_LINEMERGE === false || (props.SHOULD_LINEMERGE+''||'').toLowerCase() === 'false') {
                    if (props.LINE_BREAKER) {
                        attr['ui.eventbreak.mode'] = 'regex';
                        attr['ui.eventbreak.regexmode'] = 'exclude';
                        attr['ui.eventbreak.regex'] = props.LINE_BREAKER;
                    } else {
                        attr['ui.eventbreak.mode'] = 'everyline';
                    }
                } else if (props.BREAK_ONLY_BEFORE) {
                    attr['ui.eventbreak.mode'] = 'regex';
                    attr['ui.eventbreak.regexmode'] = 'before';
                    attr['ui.eventbreak.regex'] = props.BREAK_ONLY_BEFORE;
                } else if (props.MUST_BREAK_AFTER) {
                    attr['ui.eventbreak.mode'] = 'regex';
                    attr['ui.eventbreak.regexmode'] = 'after';
                    attr['ui.eventbreak.regex'] = props.MUST_BREAK_AFTER;
                } else {
                    attr['ui.eventbreak.mode'] = 'auto';
                }

                // 3) set structured data headers related ui settings
                // the desc order of precedence is FIELD_NAMES > HEADER_FIELD_LINE_NUMBER > FIELD_HEADER_REGEX
                // (see assigning of header_mode value, which is not the HEADER_MODE prop)
                if ('INDEXED_EXTRACTIONS' in props)
                    attr['ui.structured.file_format'] = props.INDEXED_EXTRACTIONS;
                if ('PREAMBLE_REGEX' in props)
                    attr['ui.structured.preamble_pattern'] = props.PREAMBLE_REGEX;
                if ('FIELD_HEADER_REGEX' in props){
                    attr['ui.structured.header_line_prefix'] = props.FIELD_HEADER_REGEX;
                    if(!_.isEmpty(props.FIELD_HEADER_REGEX)) {
                        attr['ui.structured.header_mode'] = 'regex';
                    }
                }
                if ('HEADER_FIELD_LINE_NUMBER' in props) {
                    attr['ui.structured.header_line_number'] = props.HEADER_FIELD_LINE_NUMBER;
                    if(!_.isEmpty(props.HEADER_FIELD_LINE_NUMBER)) {
                        attr['ui.structured.header_mode'] = 'line';
                    }
                }
                if ('HEADER_FIELD_DELIMITER' in props)
                    attr['ui.structured.header_field_delimiter'] = props.HEADER_FIELD_DELIMITER;
                if ('HEADER_FIELD_QUOTE' in props)
                    attr['ui.structured.header_field_quote'] = props.HEADER_FIELD_QUOTE;
                if ('FIELD_NAMES' in props) {
                    attr['ui.structured.header_fields'] = props.FIELD_NAMES;
                    if(!_.isEmpty(props.FIELD_NAMES)) {
                        attr['ui.structured.header_mode'] = 'custom';
                    }
                }
                if ('FIELD_DELIMITER' in props)
                    attr['ui.structured.event_field_delimiter'] = props.FIELD_DELIMITER;
                if ('FIELD_QUOTE' in props)
                    attr['ui.structured.event_field_quote'] = props.FIELD_QUOTE;

                // 4) misc
                if ('NO_BINARY_CHECK' in props)
                    attr['ui.misc.process_binary_files'] = props.NO_BINARY_CHECK;

                return attr;
            },
            transposeFromUIToProps: function(uiAttrs) {
                var self = this;
                var props = {};

                if (!uiAttrs || _.isEmpty(uiAttrs)) { return props; }

                //splunkd does not support the ability to delete a prop. we must set to empty string instead.
                //but only if the prop is defined already on backend. otherwise we will be adding blank strings to a bunch of props we dont need to.
                function fakeDelete(prop){
                    var deleteProp = self.entry.content.get(prop);
                    if(typeof deleteProp !== 'undefined' && deleteProp !== null){
                        props[prop] = '';
                    }
                }

                function deleteTimestampProps(){
                    fakeDelete('TZ');
                    fakeDelete('TIME_FORMAT');
                    fakeDelete('TIME_PREFIX');
                    fakeDelete('TIMESTAMP_FIELDS');
                    //need extra check before deleting timestamp, and make sure its not the default (dont need to delete default).
                    if(self.defaults['ui.timestamp.lookahead'] !== self.entry.content.get('MAX_TIMESTAMP_LOOKAHEAD')) {
                        fakeDelete('MAX_TIMESTAMP_LOOKAHEAD');
                    }
                }

                // 1) set timestamp props
                if ('ui.timestamp.mode' in uiAttrs) {
                    if (uiAttrs['ui.timestamp.mode'] === 'current') {
                        props.DATETIME_CONFIG = 'CURRENT';
                        deleteTimestampProps();
                    } else if (uiAttrs['ui.timestamp.mode'] === 'advanced') {
                        props.DATETIME_CONFIG = '';
                        props.TIME_FORMAT = uiAttrs['ui.timestamp.format'];
                        props.TIME_PREFIX = uiAttrs['ui.timestamp.prefix'];
                        props.TZ = uiAttrs['ui.timestamp.timezone'];
                        props.MAX_TIMESTAMP_LOOKAHEAD = uiAttrs['ui.timestamp.lookahead'];
                        props.TIMESTAMP_FIELDS = uiAttrs['ui.timestamp.fields'];
                    } else if (uiAttrs['ui.timestamp.mode'] === 'auto') {
                        props.DATETIME_CONFIG = '';
                        deleteTimestampProps();
                    }
                }

                // 2) set event break props
                if ('ui.eventbreak.mode' in uiAttrs) {
                    if (uiAttrs['ui.eventbreak.mode'] === 'everyline') {
                        props.SHOULD_LINEMERGE = false;
                        fakeDelete('BREAK_ONLY_BEFORE');
                    } else if(uiAttrs['ui.eventbreak.mode'] === 'regex') {
                        props.SHOULD_LINEMERGE = true;
                        props.BREAK_ONLY_BEFORE = uiAttrs['ui.eventbreak.regex'];
                    }else{
                        props.SHOULD_LINEMERGE = true;
                        fakeDelete('BREAK_ONLY_BEFORE');
                    }
                }

                // 3) set structured data headers props
                if ('ui.structured.file_format' in uiAttrs && !_.isUndefined(uiAttrs['ui.structured.file_format']))
                    props.INDEXED_EXTRACTIONS = uiAttrs['ui.structured.file_format'];
                if ('ui.structured.preamble_pattern' in uiAttrs && !_.isUndefined(uiAttrs['ui.structured.preamble_pattern']))
                    props.PREAMBLE_REGEX = uiAttrs['ui.structured.preamble_pattern'];
                if ('ui.structured.header_line_prefix' in uiAttrs && !_.isUndefined(uiAttrs['ui.structured.header_line_prefix']))
                    props.FIELD_HEADER_REGEX = uiAttrs['ui.structured.header_line_prefix'];
                if ('ui.structured.header_line_number' in uiAttrs && !_.isUndefined(uiAttrs['ui.structured.header_line_number']))
                    props.HEADER_FIELD_LINE_NUMBER = uiAttrs['ui.structured.header_line_number'];
                if ('ui.structured.header_fields' in uiAttrs && !_.isUndefined(uiAttrs['ui.structured.header_fields']))
                    props.FIELD_NAMES = uiAttrs['ui.structured.header_fields'];
                if ('ui.structured.header_field_delimiter' in uiAttrs && !_.isUndefined(uiAttrs['ui.structured.header_field_delimiter']))
                    props.HEADER_FIELD_DELIMITER = uiAttrs['ui.structured.header_field_delimiter'];
                if ('ui.structured.header_field_quote' in uiAttrs && !_.isUndefined(uiAttrs['ui.structured.header_field_quote']))
                    props.HEADER_FIELD_QUOTE = uiAttrs['ui.structured.header_field_quote'];
                if ('ui.structured.event_field_delimiter' in uiAttrs && !_.isUndefined(uiAttrs['ui.structured.event_field_delimiter']))
                    props.FIELD_DELIMITER = uiAttrs['ui.structured.event_field_delimiter'];
                if ('ui.structured.event_field_quote' in uiAttrs && !_.isUndefined(uiAttrs['ui.structured.event_field_quote']))
                    props.FIELD_QUOTE = uiAttrs['ui.structured.event_field_quote'];

                // 4) misc
                if ('ui.misc.process_binary_files' in uiAttrs && !_.isUndefined(uiAttrs['ui.misc.process_binary_files']))
                    props.NO_BINARY_CHECK = uiAttrs['ui.misc.process_binary_files'];

                return props;
            },
            shouldUiExposeTimestampFieldSetting: function(){
                var format = this.getDataFormat();
                if(format === this.constructor.TABULAR
                || format === this.constructor.HIERARCHICAL){
                    return true;
                }
                return false;
            }
        },
        {
            // constants
            TABULAR: 'tabular',
            HIERARCHICAL: 'hierarchical',
            UNSTRUCTURED: 'unstructured',
            // singleton: sourcetype model for dictionary of all default props
            DefaultSourcetype: new SourcetypeModel()
        });

        // fetch singleton default sourcetype as class property available to all sourcetype instances
        Model.DefaultSourcetype.fetch();

        return Model;
    }
);