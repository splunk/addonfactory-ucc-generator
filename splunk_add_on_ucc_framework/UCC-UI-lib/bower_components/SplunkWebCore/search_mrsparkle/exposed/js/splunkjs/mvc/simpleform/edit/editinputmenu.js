define(function(require, exports, module) {

    var _ = require('underscore');
    var $ = require('jquery');
    var console = require('util/console');
    var mvc = require('../../../mvc');
    var PopTartView = require('views/shared/PopTart');
    var Settings = require('../inputsettings');
    var ConcertinaSettingsEditor = require('./concertinasettingseditor');
    var SavedSearchManager = require('../../savedsearchmanager');
    var SearchManager = require('../../searchmanager');
    var utils = require('../../utils');
    var StaticOptionsControl = require('./staticoptionscontrol');
    var DynamicOptionsControl = require('./dynamicoptionscontrol');
    var DefaultControl = require('./defaultcontrol');
    var TokenPreviewControl = require('./tokenpreviewcontrol');
    var RadioInput = require('../../radiogroupview');
    var LinkListInput = require('../../linklistview');
    var DropdownInput = require('../../dropdownview');
    var CheckboxInput = require('../../checkboxgroupview');
    var MultiSelectInput = require('../../multidropdownview');
    var TimeInput = require('../../timerangeview');
    var FlashMessages = require('views/shared/FlashMessages');

    var EditInputMenuView = PopTartView.extend({

        moduleId: module.id,

        initialize: function() {
            this.options.ignoreClasses = ["select2-drop-mask", "dropdown-menu", "ui-datepicker"];

            PopTartView.prototype.initialize.apply(this, arguments);

            this.workingSettings = new Settings(this.model.toJSON({ tokens: true }), {
                applyTokensByDefault: true,
                retrieveTokensByDefault: true
            });
            this.on("shown", this.onShown, this);
            this.children.flashMessage = new FlashMessages({ model: this.workingSettings });
        },

        events: {
            'click a.input-editor-toggle': function(e) {
                e.preventDefault();
                var label = $(e.currentTarget).data("label");
                if (label) {
                    this.toggleEditType(label);
                }
            },
            'click .input-editor-apply': function(e) {
                e.preventDefault();
                this.applyChanges();
            },
            'click .input-editor-cancel': function(e) {
                e.preventDefault();
                this.hide();
            },
            'keypress .input-editor-apply': function(e) {
                e.preventDefault();
                this.applyChanges();
            },
            'keypress .input-editor-cancel': function(e) {
                e.preventDefault();
                this.hide();
            }
        },

        toggleEditType: function(type) {
            if (this._currentToggle) {
                this._currentToggle.removeClass("selected");
            }
            if (this._currentEditor) {
                this._currentEditor.remove();
                this._currentEditor = null;
            }
            var fromType = this.workingSettings.get("type");
            if (fromType === 'time') {
                // clear default and initialValue properties when switch from time input
                this.workingSettings.unset('default');
            }
            this.workingSettings.set("type", type);
            this._currentToggle = this.$("[data-label='" + type + "']");
            this._currentToggle.addClass("selected");

            var inputOptions = _INPUT_OPTIONS_MAP[type];
            if (inputOptions) {
                this._currentEditor = new ConcertinaSettingsEditor({
                    model:  this.workingSettings,
                    panels: inputOptions
                });
                this.$(".input-editor-format").append(this._currentEditor.render().$el);
                this._currentEditor.activate();
            }
        },

        onShown: function(){
            //Hack since poptart will do this.
            _.defer(_.bind(this._currentToggle.focus, this._currentToggle));
            if (this._currentEditor) {
                this._currentEditor.activate();
            }
        },
        remove: function() {
            if (this._currentEditor) {
                this._currentEditor.remove();
                this._currentEditor = null;
            }
            PopTartView.prototype.remove.apply(this, arguments);
        },

        applyChanges: function() {
            this.workingSettings.validate();
            if (this.workingSettings.isValid()) {
                var previousSearch = this.model.get('search'),
                    previousEarliest = this.model.get('populating_earliest_time'),
                    previousLatest = this.model.get('populating_latest_time'),
                    previousSearchName = this.model.get('searchName');
                this.model.set(this.workingSettings.toJSON({ tokens: true}), { tokens: true });
                this.model.save().done(_.bind(function(){
                    //If the search settings change we need to update the manager
                    var type = this.model.get('searchType');
                    this.model.set('managerid', this.model.get('managerid') || _.uniqueId());
                    if ((!type || type === 'inline') && this.model.get('search')) {
                        if (previousSearch != this.model.get('search')
                            || previousEarliest != this.model.get('populating_earliest_time')
                            || previousLatest != this.model.get('populating_latest_time')) {
                            new SearchManager({
                                "id": this.model.get('managerid'),
                                "latest_time": this.model.get('populating_latest_time'),
                                "earliest_time": this.model.get('populating_earliest_time'),
                                "search": this.model.get('search'),
                                "app": utils.getCurrentApp(),
                                "auto_cancel": 90,
                                "status_buckets": 0,
                                "preview": true,
                                "timeFormat": "%s.%Q",
                                "wait": 0
                            }, { replace: true });
                        }
                    } else if (type === 'saved' && this.model.get('searchName')) {
                        if (previousSearchName != this.model.get('searchName')) {
                            new SavedSearchManager({
                                "id": this.model.get('managerid'),
                                "searchname": this.model.get("searchName"),
                                "app": utils.getCurrentApp(),
                                "auto_cancel": 90,
                                "status_buckets": 0,
                                "preview": true,
                                "timeFormat": "%s.%Q",
                                "wait": 0
                            }, { replace: true });
                        }
                    }
                    this.hide();
                },this));
            }
        },

        render: function() {
            var renderModel = {
                _: _
            };
            this.$el.html(PopTartView.prototype.template);
            this.$('.popdown-dialog-body').append($(this.compiledTemplate(renderModel)));
            // ghetto hack to override default padding on poptart ;_;
            this.$('.popdown-dialog-body').removeClass('popdown-dialog-padded');
            $('.flash-messages-placeholder', this.$el).append(this.children.flashMessage.render().el);
            this.toggleEditType(this.workingSettings.get("type"));

            return this;
        },

        template: '\
            <div class="input-editor-body">\
                <ul class="input-editor-type">\
                    <li><a class="edit-text input-editor-toggle" href="#" data-label="text"><i class="icon-text"></i> <%- _("Text").t() %></a></li>\
                    <li><a class="edit-radio input-editor-toggle" href="#" data-label="radio"><i class="icon-boolean"></i> <%- _("Radio").t() %></a></li>\
                    <li><a class="edit-dropdown input-editor-toggle" href="#" data-label="dropdown"><i class="icon-triangle-down-small"></i> <%- _("Dropdown").t() %></a></li>\
                    <li><a class="edit-checkbox input-editor-toggle" href="#" data-label="checkbox"><i class="icon-box-checked"></i> <%- _("Checkbox").t() %></a></li>\
                    <li><a class="edit-multiselect input-editor-toggle" href="#" data-label="multiselect"><i class="icon-triangle-down-small"></i> <%- _("Multiselect").t() %></a></li>\
                    <li><a class="edit-link input-editor-toggle" href="#" data-label="link"><i class="icon-link"></i> <%- _("Link List").t() %></a></li>\
                    <li><a class="edit-trp input-editor-toggle" href="#" data-label="time"><i class="icon-clock"></i> <%- _("Time").t() %></a></li>\
                </ul>\
                <div class="input-editor-format"></div>\
                <div class="flash-messages-placeholder"></div>\
            </div>\
            <a class="input-editor-cancel btn pull-left" tabindex="0">'+_("Cancel").t()+'</a>\
            <a class="input-editor-apply btn btn-primary pull-right" tabindex="0"> '+_("Apply").t()+'</a>\
        '

    });

    // Controls Config

    var _LABEL_CONTROL = {
        label: _("Label").t(),
        controlType: "Text",
        controlOptions: {
            modelAttribute: "label"
        }
    };

    var _SEARCH_ON_CHANGE_CONTROL = {
        label: _("Search on Change").t(),
        controlType: "SyntheticCheckbox",
        controlOptions: {
            modelAttribute: "searchWhenChanged"
        },
        className: 'editcheckbox'
    };

    var _TOKEN_CONTROL = {
        label: _("Token").t(),
        controlType: "Text",
        controlOptions: {
            modelAttribute: "token"
        },
        tooltip: _("ID to reference the selected value in search (reference as $token$)").t()
    };

    var _DEFAULT_CONTROL_TEXT = {
        label: _("Default").t(),
        controlType: "Text",
        controlClass: 'default_control',
        controlOptions: {
            modelAttribute: "default"
        },
        tooltip: _("The default value of the input.").t()
    };

    var _DEFAULT_CONTROL_RADIO = {
        label: _("Default").t(),
        controlTypeClass: DefaultControl,
        inputTypeClass: RadioInput,
        controlClass: 'default_control',
        enableClearSelection: true,
        controlOptions: {
            modelAttribute: "default"
        },
        tooltip: _("The default value of the input.").t()
    };

    var _DEFAULT_CONTROL_LINK = {
        label: _("Default").t(),
        controlTypeClass: DefaultControl,
        inputTypeClass: LinkListInput,
        controlClass: 'default_control',
        enableClearSelection: true,
        controlOptions: {
            modelAttribute: "default"
        },
        tooltip: _("The default value of the input.").t()
    };

    var _DEFAULT_CONTROL_DROPDOWN = {
        label: _("Default").t(),
        controlTypeClass: DefaultControl,
        inputTypeClass: DropdownInput,
        controlClass: 'default_control',
        enableClearSelection: true,
        controlOptions: {
            modelAttribute: "default"
        },
        tooltip: _("The default value of the input.").t()
    };

    var _DEFAULT_CONTROL_CHECKBOX = {
        label: _("Default").t(),
        controlTypeClass: DefaultControl,
        inputTypeClass: CheckboxInput,
        controlClass: 'default_control',
        controlOptions: {
            modelAttribute: "default"
        },
        tooltip: _("The default value of the input.").t(),
        className: 'editcheckbox'
    };

    var _DEFAULT_CONTROL_MULTISELECT = {
        label: _("Default").t(),
        controlTypeClass: DefaultControl,
        inputTypeClass: MultiSelectInput,
        controlClass: 'default_control',
        controlOptions: {
            modelAttribute: "default"
        },
        tooltip: _("The default value of the input.").t()
    };

    var _DEFAULT_CONTROL_TIME = {
        label: _("Default").t(),
        controlTypeClass: DefaultControl,
        inputTypeClass: TimeInput,
        controlClass: 'default_control',
        controlOptions: {
            modelAttribute: "default",
            popdownOptions: {
                attachDialogTo: '.popdown-dialog.open',
                scrollContainer: '.popdown-dialog.open .concertina-body'
            }
        },
        tooltip: _("The default value of the input.").t()
    };

    var _SEED_CONTROL_TEXT = {
        label: _("Initial Value").t(),
        controlType: "Text",
        controlClass: 'seed_control',
        controlOptions: {
            modelAttribute: "initialValue"
        },
        tooltip: _("Initial value on page load. Ignored when Default is specified.").t()
    };

    var _SEED_CONTROL_RADIO = {
        label: _("Initial Value").t(),
        controlTypeClass: DefaultControl,
        inputTypeClass: RadioInput,
        controlClass: 'seed_control',
        enableClearSelection: true,
        controlOptions: {
            modelAttribute: "initialValue"
        },
        tooltip: _("Initial value on page load. Ignored when Default is specified.").t()
    };

    var _SEED_CONTROL_LINK = {
        label: _("Initial Value").t(),
        controlTypeClass: DefaultControl,
        inputTypeClass: LinkListInput,
        controlClass: 'seed_control',
        enableClearSelection: true,
        controlOptions: {
            modelAttribute: "initialValue"
        },
        tooltip: _("Initial value on page load. Ignored when Default is specified.").t()
    };

    var _SEED_CONTROL_DROPDOWN = {
        label: _("Initial Value").t(),
        controlTypeClass: DefaultControl,
        inputTypeClass: DropdownInput,
        controlClass: 'seed_control',
        enableClearSelection: true,
        controlOptions: {
            modelAttribute: "initialValue"
        },
        tooltip: _("Initial value on page load. Ignored when Default is specified.").t()
    };

    var _SEED_CONTROL_CHECKBOX = {
        label: _("Initial Value").t(),
        controlTypeClass: DefaultControl,
        inputTypeClass: CheckboxInput,
        controlClass: 'seed_control',
        controlOptions: {
            modelAttribute: "initialValue"
        },
        tooltip: _("Initial value on page load. Ignored when Default is specified.").t(),
        className: 'editcheckbox'
    };

    var _SEED_CONTROL_MULTISELECT = {
        label: _("Initial Value").t(),
        controlTypeClass: DefaultControl,
        inputTypeClass: MultiSelectInput,
        controlClass: 'seed_control',
        controlOptions: {
            modelAttribute: "initialValue"
        },
        tooltip: _("Initial value on page load. Ignored when Default is specified.").t()
    };

    var _TOKEN_PREFIX_CONTROL = {
        label: _("Token Prefix").t(),
        controlType: "Text",
        controlOptions: {
            modelAttribute: "prefix",
            trimLeadingSpace: false,
            trimTrailingSpace: false,
            updateOnKeyUp: true
        },
        tooltip: _("String prefixed to the value retrieved by the token").t()
    };

    var _TOKEN_SUFFIX_CONTROL = {
        label: _("Token Suffix").t(),
        controlType: "Text",
        controlOptions: {
            modelAttribute: "suffix",
            trimLeadingSpace: false,
            trimTrailingSpace: false,
            updateOnKeyUp: true
        },
        tooltip: _("String appended to the value retrieved by the token").t()
    };

    var _TOKEN_VALUE_PREFIX_CONTROL = {
        label: _("Token Value Prefix").t(),
        controlType: "Text",
        controlOptions: {
            modelAttribute: "valuePrefix",
            updateOnKeyUp: true
        },
        tooltip: _("String prefixed to each specified value of a multiple selection input").t()
    };

    var _TOKEN_VALUE_SUFFIX_CONTROL = {
        label: _("Token Value Suffix").t(),
        controlType: "Text",
        controlOptions: {
            modelAttribute: "valueSuffix",
            updateOnKeyUp: true
        },
        tooltip: _("String appended to each specified value of a multiple selection input").t()
    };

    var _DELIMITER_CONTROL = {
        label: _("Delimiter").t(),
        controlType: "Text",
        controlOptions: {
            modelAttribute: "delimiter",
            trimLeadingSpace: false,
            trimTrailingSpace: false,
            updateOnKeyUp: true
        },
        tooltip: _("String inserted between each value (typical values: AND,OR). Specify a leading and trailing space in the string.").t()
    };

    var _PREVIEW_CONTROL = {
        label: _("Preview").t(),
        controlTypeClass: TokenPreviewControl,
        controlOptions: {
            modelAttribute: "TEMP"
        }
    };

    var _STATIC_CONTROL = {
        controlTypeClass: StaticOptionsControl,
        controlOptions: {
            modelAttribute: "choices"
        }
    };

    var _DYNAMIC_CONTROL = {
        controlTypeClass: DynamicOptionsControl,
        controlOptions: {
            modelAttribute: "TEMP"
        }
    };

    var _FIELD_FOR_LABEL_CONTROL = {
        label: _("Field For Label").t(),
        controlType: "Text",
        controlOptions: {
            modelAttribute: "labelField"
        },
        tooltip: _("Field returned from the search to use as the option label").t()
    };

    var _FIELD_FOR_VALUE_CONTROL = {
        label: _("Field For Value").t(),
        controlType: "Text",
        controlOptions: {
            modelAttribute: "valueField"
        },
        tooltip: _("Field returned from the search to use as the option value").t()
    };

    // Options Config

    var _GENERAL_OPTIONS = {
        headingClassName: "general-input-settings",
        title: _("General").t(),
        controls: [
            _LABEL_CONTROL,
            _SEARCH_ON_CHANGE_CONTROL
        ]
    };

    var _TOKEN_OPTIONS_TEXT = {
        headingClassName: "token-input-settings",
        title: _("Token Options").t(),
        controls: [
            _TOKEN_CONTROL,
            _DEFAULT_CONTROL_TEXT,
            _SEED_CONTROL_TEXT,
            _TOKEN_PREFIX_CONTROL,
            _TOKEN_SUFFIX_CONTROL
        ]
    };

    var _TOKEN_OPTIONS_RADIO = {
        headingClassName: "token-input-settings",
        title: _("Token Options").t(),
        controls: [
            _TOKEN_CONTROL,
            _DEFAULT_CONTROL_RADIO,
            _SEED_CONTROL_RADIO,
            _TOKEN_PREFIX_CONTROL,
            _TOKEN_SUFFIX_CONTROL
        ]
    };

    var _TOKEN_OPTIONS_LINK = {
        headingClassName: "token-input-settings",
        title: _("Token Options").t(),
        controls: [
            _TOKEN_CONTROL,
            _DEFAULT_CONTROL_LINK,
            _SEED_CONTROL_LINK,
            _TOKEN_PREFIX_CONTROL,
            _TOKEN_SUFFIX_CONTROL
        ]
    };

    var _TOKEN_OPTIONS_DROPDOWN = {
        headingClassName: "token-input-settings",
        title: _("Token Options").t(),
        controls: [
            _TOKEN_CONTROL,
            _DEFAULT_CONTROL_DROPDOWN,
            _SEED_CONTROL_DROPDOWN,
            _TOKEN_PREFIX_CONTROL,
            _TOKEN_SUFFIX_CONTROL
        ]
    };

    var _TOKEN_OPTIONS_CHECKBOX = {
        headingClassName: "token-input-settings",
        title: _("Token Options").t(),
        controls: [
            _TOKEN_CONTROL,
            _DEFAULT_CONTROL_CHECKBOX,
            _SEED_CONTROL_CHECKBOX,
            _TOKEN_PREFIX_CONTROL,
            _TOKEN_SUFFIX_CONTROL,
            _TOKEN_VALUE_PREFIX_CONTROL,
            _TOKEN_VALUE_SUFFIX_CONTROL,
            _DELIMITER_CONTROL,
            _PREVIEW_CONTROL
        ]
    };

    var _TOKEN_OPTIONS_MULTISELECT = {
        headingClassName: "token-input-settings",
        title: _("Token Options").t(),
        controls: [
            _TOKEN_CONTROL,
            _DEFAULT_CONTROL_MULTISELECT,
            _SEED_CONTROL_MULTISELECT,
            _TOKEN_PREFIX_CONTROL,
            _TOKEN_SUFFIX_CONTROL,
            _TOKEN_VALUE_PREFIX_CONTROL,
            _TOKEN_VALUE_SUFFIX_CONTROL,
            _DELIMITER_CONTROL,
            _PREVIEW_CONTROL
        ]
    };

    var _TOKEN_OPTIONS_TIME = {
        headingClassName: "token-input-settings",
        title: _("Token Options").t(),
        controls: [
            _TOKEN_CONTROL,
            _DEFAULT_CONTROL_TIME
        ]
    };

    var _STATIC_OPTIONS = {
        headingClassName: "static-input-settings",
        title: _("Static Options").t(),
        controls: [
            _STATIC_CONTROL
        ]
    };

    var _DYNAMIC_OPTIONS = {
        headingClassName: "dynamic-input-settings",
        title: _("Dynamic Options").t(),
        controls: [
            _DYNAMIC_CONTROL,
            _FIELD_FOR_LABEL_CONTROL,
            _FIELD_FOR_VALUE_CONTROL
        ]
    };

    // Options Map

    var _INPUT_OPTIONS_MAP = {

        "text": [
            _GENERAL_OPTIONS,
            _TOKEN_OPTIONS_TEXT
        ],

        "radio": [
            _GENERAL_OPTIONS,
            _TOKEN_OPTIONS_RADIO,
            _STATIC_OPTIONS,
            _DYNAMIC_OPTIONS
        ],

        "dropdown": [
            _GENERAL_OPTIONS,
            _TOKEN_OPTIONS_DROPDOWN,
            _STATIC_OPTIONS,
            _DYNAMIC_OPTIONS
        ],

        "checkbox": [
            _GENERAL_OPTIONS,
            _TOKEN_OPTIONS_CHECKBOX,
            _STATIC_OPTIONS,
            _DYNAMIC_OPTIONS
        ],

        "multiselect": [
            _GENERAL_OPTIONS,
            _TOKEN_OPTIONS_MULTISELECT,
            _STATIC_OPTIONS,
            _DYNAMIC_OPTIONS
        ],

        "link": [
            _GENERAL_OPTIONS,
            _TOKEN_OPTIONS_LINK,
            _STATIC_OPTIONS,
            _DYNAMIC_OPTIONS
        ],

        "time": [
            _GENERAL_OPTIONS,
            _TOKEN_OPTIONS_TIME
        ]

    };

    return EditInputMenuView;

});
