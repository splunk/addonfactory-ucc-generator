/**
 * @author lbudchenko, jszeto
 *
 * Main view for adding or editing a virtual index
 *
 * INPUTS:
 *
 * model: {
 *     index {models/services/data/vix/Index},
 *     application {models/Application}
 * },
 * collection: {
 *     providers {collections/services/data/vix/Providers}
 * }
 *
 */

define(
    [
        'jquery',
        'underscore',
        'backbone',
        'module',
        './forms/ProviderAdditionalSettings',
        './forms/ProviderNewSettings',
        'views/Base',
        'collections/shared/TimeZones',
        'views/shared/controls/TimeZone',
        'views/virtual_indexes/custom_controls/TimeSecondsControl',
        'views/shared/controls/ControlGroup',
        'views/shared/controls/Section',
        'views/shared/FlashMessages',
        'contrib/text!views/virtual_indexes/config/IndexSetup.html',
        'uri/route',
        'util/splunkd_utils',
        'util/string_utils',
        '../shared.pcss',
        './IndexSetup.pcss'
    ],
    function(
        $,
        _,
        Backbone,
        module,
        ProviderAdditionalSettings,
        ProviderNewSettings,
        BaseView,
        TimeZoneTable,
        TimeZoneControl,
        TimeSecondsControl,
        ControlGroup,
        Section,
        FlashMessagesView,
        Template,
        route,
        splunkdUtils,
        utils,
        cssShared,
        css
        ){
        return BaseView.extend({
            moduleId: module.id,
            template: Template,

            events: {
                'click .btn-primary': function(e) {
                    e.preventDefault();

                    // Set the additional settings and new settings back into the index model
                    this.model.index.entry.content.set(this.model.additionalSettings.attributes);

                    // Display error instead of saving when a new key doesn't have the 'vix.' prefix.
                    var filteredKeys = this.model.newSettings.keys().filter(function(key) {
                        return key.indexOf('vix.') !== 0;
                    });
                    if (filteredKeys.length) {
                        this.children.flashMessages.flashMsgHelper.addGeneralMessage(this.noVixPrefixErrorMessageId, {
                            type: splunkdUtils.ERROR,
                            html: _("Keys that do not start with 'vix.' are invalid. Invalid keys are: ").t() + filteredKeys
                        });
                    } else {
                        this.children.flashMessages.flashMsgHelper.removeGeneralMessage(this.noVixPrefixErrorMessageId);
                    }

                    // Display error instead of saving if there are duplicate keys.
                    var duplicates = _.intersection(this.model.newSettings.keys(), this.model.additionalSettings.keys());
                    if (duplicates.length) {
                        this.children.flashMessages.flashMsgHelper.addGeneralMessage(this.duplicateKeyErrorMessageId, {
                            type: splunkdUtils.ERROR,
                            html: _('Adding duplicate keys is not allowed. Duplicate keys are: ').t() + duplicates
                        });
                    } else {
                        this.children.flashMessages.flashMsgHelper.removeGeneralMessage(this.duplicateKeyErrorMessageId);
                    }

                    if (filteredKeys.length || duplicates.length) {
                        $('html, body').animate({ scrollTop: 0 }, 'fast');
                        return;
                    }

                    this.model.index.entry.content.set(this.model.newSettings.attributes);
                    // name is in entry when we're getting its value and it should be in entry.content for saving it
                    this.model.index.entry.content.set({'name': this.model.index.entry.get('name')}, {silent: true});

                    // smart append ellipsis to the path when process recursively checkbox is checked
                    var inputPath = this.model.index.entry.content.get('vix.input.1.path');
                    var recursiveProcess = this.formModel.get('recursiveProcess');
                    var inputPathChanged = false;
                    if (inputPath) {
                        if (recursiveProcess) {
                            if (utils.strEndsWith(inputPath, '/')) {
                                inputPath += '...';
                                inputPathChanged = true;
                            } else if (!utils.strEndsWith(inputPath, '...')) {
                                inputPath += '/...';
                                inputPathChanged = true;
                            }
                        } else if (utils.strEndsWith(inputPath, '...')) {  // Strip the ending ellipsis
                            inputPath = inputPath.substring(0, inputPath.length-3);
                            inputPathChanged = true;
                        }
                        if (inputPathChanged)
                            this.model.index.entry.content.set({'vix.input.1.path': inputPath}, {silent: true});
                    }
                    if (!this.formModel.get('customizeTimestamp')) {
                        // if extended form is hidden, clear its values
                        this.sections.time.clear();
                    }

                    var validContent = this.model.index.entry.content.set({}, {validate: true});
                    var validEntry = this.model.index.entry.set({}, {validate: true});

                    if (validContent && validEntry) {
                        this.model.index.save({}, {silent: true}).done(function(){
                            window.location.href = this._getVirtualIndexesRoute();
                        }.bind(this));
                        $('html, body').animate({ scrollTop: 0 }, 'fast');
                    }
                },
                'click .cancel': function(e) {
                    e.preventDefault();
                    window.location.href = this._getVirtualIndexesRoute();
                }
            },

            /**
             * @param {Object} options {
             *
             * }
             */
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.formModel = new Backbone.Model();

                this.sections = {};

                this.children.flashMessages = new FlashMessagesView({ model: {index: this.model.index,
                                                                              indexEntry: this.model.index.entry,
                                                                              indexContent: this.model.index.entry.content}});
                this.noVixPrefixErrorMessageId = _.uniqueId('no-vix-prefix-error-');
                this.duplicateKeyErrorMessageId = _.uniqueId('dup-key-error-');

                var that = this;

                if (this.isEditMode()) {
                    // set the process recursively checkbox if ellipsis is found in the input path
                    var hdfsPath = this.model.index.entry.content.get('vix.input.1.path');
                    if (utils.strEndsWith(hdfsPath, '/...')) {
                        // If path == /..., then strip out the ...
                        if (hdfsPath.length == 4) {
                            hdfsPath = '/';
                        } else {
                            hdfsPath = hdfsPath.slice(0, hdfsPath.lastIndexOf('/'));
                        }
                        this.model.index.entry.content.set({'vix.input.1.path': hdfsPath});
                        this.formModel.set({recursiveProcess: true});
                    } else {
                        this.formModel.set({recursiveProcess: false});
                    }
                } else {
                    this.model.index.entry.set('name','');
                    this.formModel.set({recursiveProcess: true});
                }

                this.children.name = new ControlGroup({
                    className: 'index-name control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'name',
                        model: this.model.index.entry,
                        save: false
                    },
                    label: _('Name').t()
                });

                this.providerNames = this.collection.providers.map(function(model) {
                    return {label:model.entry.get('name'), value:model.entry.get('name')};
                });
                this.children.provider = new ControlGroup({
                    className: 'index-provider control-group',
                    controlType: 'SyntheticSelect',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'vix.provider',
                        model: this.model.index.entry.content,
                        items: this.providerNames,
                        className: 'btn-group view-count',
                        menuWidth: 'wide',
                        maxLabelLength: 80,
                        toggleClassName: 'btn'
                    },
                    label: _("Provider").t()
                });

                this.children.description = new ControlGroup({
                    className: 'index-description control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'vix.description',
                        model: this.model.index.entry.content,
                        save: false,
                        placeholder: 'optional'
                    },
                    label: _('Description').t()
                });

                // notify the section of loading complete
                this.formModel.trigger('update', 'provider');

                // make the first element submitted by default
                if (!this.model.index.entry.content.get('vix.provider') && this.providerNames && this.providerNames.length>0) {
                    this.model.index.entry.content.set('vix.provider', this.providerNames[0].value);
                }
                if (this.providerNames.length <= 1) {
                    this.children.provider.disable();

                } else {
                    this.children.provider.enable();

                }

                this.children.pathHdfs = new ControlGroup({
                    className: 'index-path-hdfs control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'vix.input.1.path',
                        model: this.model.index.entry.content,
                        save: false
                    },
                    label:   _('Path to data in HDFS').t(),
                    help:    _('Example: /home/data/apache/logs/').t(),
                    tooltip: _('Root path to the data that belongs in this virtual index').t()
                });

                this.children.recursiveProcess = new ControlGroup({
                    className: 'index-recursive control-group',
                    controlType: 'SyntheticCheckbox',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'recursiveProcess',
                        model: this.formModel,
                        save: false
                    },
                    label: _('Recursively process the directory').t()
                });

                this.children.whitelist = new ControlGroup({
                    className: 'index-whitelist control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'vix.input.1.accept',
                        model: this.model.index.entry.content,
                        save: false,
                        placeholder: 'optional'
                    },
                    label:   _('Whitelist').t(),
                    help:    _('Regex that matches the file path. Example: \\.gz$').t(),
                    tooltip: _('Regular expression that file paths that belong in this virtual index should match').t()
                });

                this.children.customizeTimestamp = new ControlGroup({
                    className: 'index-whitelist control-group',
                    controlType: 'SyntheticCheckbox',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'customizeTimestamp',
                        model: this.formModel,
                        save: false
                    },
                    label: _('Customize timestamp format').t()
                });

                this.children.timeRegex = new ControlGroup({
                    className: 'index-time-regex control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'vix.input.1.et.regex',
                        model: this.model.index.entry.content,
                        save: false
                    },
                    label:   _('Time capturing regex').t(),
                    help:    _('Regex to capture date/time from path. Example: /home/data/(\\d+)/(\\d+)/').t(),
                    tooltip: _('Regex with capturing groups to extract time components from paths. The capture groups are concatenated and interpreted using the format below').t()
                });

                this.children.timeFormat = new ControlGroup({
                    className: 'index-time-format control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'vix.input.1.et.format',
                        model: this.model.index.entry.content,
                        save: false
                    },
                    label:   _('Time Format').t(),
                    help:    _('Format to interpret the extracted time string as. Example: yyyyMMddHH').t(),
                    tooltip: _('Format string to interpret the time string extracted from the path. The format is Java\'s SimpleDateFormat').t()
                });

                this.children.timeOffset = new ControlGroup({
                    className: 'control-group',
                    controlClass: 'controls-block',
                    controlType: 'TimeSecondsControl',
                    controlTypes: {'TimeSecondsControl': TimeSecondsControl},
                    controlOptions: {
                        modelAttribute: 'vix.input.1.et.offset',
                        model: this.model.index.entry.content,
                        save: false
                    },
                    label: _('Time Adjustment').t(),
                    help: _('Earliest time offset (1h, 1d, etc.)').t()
                });

                this.children.timeRange = new ControlGroup({
                    className: 'control-group',
                    controlClass: 'controls-block',
                    controlType: 'TimeSecondsControl',
                    controlTypes: {'TimeSecondsControl': TimeSecondsControl},
                    controlOptions: {
                        modelAttribute: 'vix.input.1.lt.offset',
                        model: this.model.index.entry.content,
                        save: false
                    },
                    label: _('Time Range').t(),
                    help: _('How much data is contained in the dir (1h, 1d, etc.)').t()
                });

                this.children.timeZone = new ControlGroup({
                    className: 'index-time-offset control-group',
                    controlClass: 'controls-block',
                    controlType: 'TimeZone',
                    controlTypes: {'TimeZone': TimeZoneControl},
                    controlOptions: {
                        modelAttribute: 'vix.input.1.et.timezone',
                        model: this.model.index.entry.content,
                        save: false
                    },
                    label: _('Time Zone').t()
                });

                /**
                 * settings based on timezone change.
                 * ERP-392 Virtual Index UI: Simplify time/latest time extraction rules
                 */

                this.listenTo(
                    this.model.index.entry.content,
                    'change:vix.input.1.et.regex reset:vix.input.1.et.regex ' +
                    'change:vix.input.1.et.format reset:vix.input.1.et.format ' +
                    'change:vix.input.1.et.timezone reset:vix.input.1.et.timezone',
                    function () {
                        var regex = this.model.index.entry.content.get('vix.input.1.et.regex');
                        var format = this.model.index.entry.content.get('vix.input.1.et.format');
                        var timezone = this.model.index.entry.content.get('vix.input.1.et.timezone');

                        this.model.index.entry.content.set({
                            'vix.input.1.lt.regex': regex,
                            'vix.input.1.lt.format': format,
                            'vix.input.1.lt.timezone': timezone
                        });
                });

                /*
                 * Sections
                 */

                this.sections.basic = new Section({
                    label: '',
                    id: 'basic',
                    children: this.children,
                    model: {
                        form: this.formModel,
                        data: this.model.provider
                    },
                    order: ['name', 'description', 'provider']
                });
                this.sections.paths = new Section({
                    label: _('Paths').t(),
                    id: 'paths',
                    children: this.children,
                    model: {
                        data: this.model.index
                    },
                    order: ['pathHdfs', 'recursiveProcess', 'whitelist']
                });
                this.sections.time = new Section({
                    label: _('Time').t(),
                    id: 'time',
                    children: this.children,
                    model: {
                        data: this.model.index
                    },
                    order: ['timeRegex', 'timeFormat', 'timeOffset', 'timeRange', 'timeZone']
                });

                this._initAdditionalSettings();

                // trigger 'loadComplete' when all the sections reportedly finish loading
                var sectionDfds = _.map(this.sections, function(section) {
                    return section.getLoadStatusDfd();
                }, this);
                $.when.apply($, sectionDfds).then(function() {
                    this.formModel.trigger('loadComplete');
                }.bind(this));

                // bind formModel events to DOM changes
                this.formModel.on('change:customizeTimestamp', function() {
                    this.toggleCustomizeTimestamp();
                }, this);

                this.initializeCustomizeTimestamp();


                // the dropdown associated with this model attribute toggles visibility of several sections
                this.model.index.entry.content.on('change:vix.provider', function() {
                    var providerName = that.model.index.entry.content.get('vix.provider');
                    var provider = that.collection.providers.find(function(prov) {
                        return prov.entry.get('name') == providerName;
                    }),
                    family = provider.entry.content.get('vix.family');
                    if (family == 'hadoop') {
                        that.children.paths.show(true);
                        that.children.customizeTimestamp.show();
                        that.toggleCustomizeTimestamp();
                    } else {
                        that.children.paths.hide(true);
                        that.children.customizeTimestamp.hide();
                        that.sections.time.hide(true);
                    }
                }, this);
            },

            toggleCustomizeTimestamp: function() {
                if (this.formModel.get('customizeTimestamp')) {
                    this.sections.time.show(true);
                } else {
                    this.sections.time.hide(true);
                }
            },

            initializeCustomizeTimestamp: function() {
                // if any of the customizeTimestamp group members is not empty, expand the group
                // preserve events in subviews while rerendering

                var groupHasValues = !!_.find(['time'], function(section) {
                    if (!this.sections.hasOwnProperty(section)) {
                        return false;
                    }
                    return !!_.find(this.sections[section].getChildren(), function(child) {
                        if (typeof child.getModelAttributes == 'function') {
                            var attr = child.getModelAttributes()[0],
                                val = this.model.index.entry.content.get(attr);
                            return val;
                        }
                        return false;
                    }, this);
                }, this);
                this.formModel.set('customizeTimestamp', groupHasValues);
            },

            _initAdditionalSettings: function() {
                // Pass filtered model. Omit attributes already displayed in the rest of the form. Filter out
                // attributes that don't start w/ "vix"
                var filteredKeys = this.model.index.entry.content.keys().filter(function(key) {
                    return key.indexOf("vix.") == 0;
                });
                var filteredAttrs = _(this.model.index.entry.content.omit(this._getChildrenAttributes())).pick(filteredKeys);

                this.model.additionalSettings = new Backbone.Model(filteredAttrs);
                this.model.newSettings = new Backbone.Model();

                this.children.additionalSettingsView = new ProviderAdditionalSettings({model: this.model.additionalSettings});
                this.children.newSettingsView = new ProviderNewSettings({model: this.model.newSettings});

                this.sections.additionalSettings = new Section({

                    label: _('Settings').t(),
                    id: 'additional-settings',
                    description: _('').t(),
                    children: this.children,
                    model: {
                        data: this.model.index
                    },
                    order: ['additionalSettingsView', 'newSettingsView']
                });

                // avoiding circular dependency
                this.sections.additionalSettings.loadStatusDfd.resolve();
            },

            /*
             For 'Additional settings' we want to get all the model attributes that are not included into any of the ControlGroups.
             This method returns the list of attributes already used that should be excluded.
             */
            _getChildrenAttributes: function() {
                var results = _.map(this.children, function(child) {
                    if (child.hasOwnProperty('childList')) {
                        return child.childList[0].getModelAttribute();
                    }
                    return '';
                });
                // Need to hardcode the latest time settings since we copied them from the earliest time values
                results.push('vix.input.1.lt.regex',
                             'vix.input.1.lt.format',
                             'vix.input.1.lt.timezone',
                             'vix.input.roots',
                             'vix.provider.description'
                );
                return results;
            },
            managerRoute: function(page, options) {
                return route.manager(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'system',
                    page,
                    options
                );
            },
            _getVirtualIndexesRoute: function() {
                return route.manager(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'system',
                    'virtual_indexes',
                    {
                        data:
                        {
                            t: 'indexes'
                        }
                    });
            },
            isEditMode : function() {
                return (this.model.index.get('mode') == 'edit');
            },


            render: function() {

                var html = this.compiledTemplate({
                    isEdit: this.isEditMode(),
                    managerRoute: this.managerRoute.bind(this)
                });

                var $html = $(html);
                if (!this.el.innerHTML) {
                    $html.find('.admin-content').append(this.children.flashMessages.render().el);
                    $html.find('.admin-content').append(this.sections.basic.render().el);
                    $html.find('.admin-content').append(this.sections.paths.render().el);
                    $html.find('.admin-content').append(this.children.customizeTimestamp.render().el);
                    $html.find('.admin-content').append(this.sections.time.render().el);
                    $html.find('.admin-content').append(this.sections.additionalSettings.render().el);

                    $html.find('.admin-content').append('<div class="button-wrapper" />');
                    $html.find('.admin-content .button-wrapper').append('<a href="#" class="btn cancel pull-left">' + _('Cancel').t() + '</a>');
                    $html.find('.admin-content .button-wrapper').append('<a href="#" class="btn btn-primary pull-right">' + _('Save').t() + '</a>');
                }
                this.$el.html($html);

                if (this.isEditMode()) {
                    this.children.name.childList[0].disable();
                }

                return this;
            }

        });
    }
);
