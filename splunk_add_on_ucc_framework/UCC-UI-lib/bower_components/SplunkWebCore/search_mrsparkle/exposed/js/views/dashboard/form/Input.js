define(
    [
        'module',
        'jquery',
        'underscore',
        'views/dashboard/Base',
        'views/dashboard/editor/input/InputEditor',
        'splunkjs/mvc/simpleform/inputsettings',
        'splunkjs/mvc/savedsearchmanager',
        'splunkjs/mvc/postprocessmanager',
        'dashboard/manager/FormManager',
        'splunkjs/mvc/tokenutils',
        'dashboard/DashboardFactory',
        'splunkjs/mvc/simplexml/dashboard/tokendeps',
        'splunkjs/mvc/utils'
    ],
    function(module,
             $,
             _,
             BaseDashboardView,
             InputEditor,
             Settings,
             SavedSearchManager,
             PostProcessSearchManager,
             FormManager,
             TokenUtils,
             DashboardFactory,
             TokenDependenciesMixin,
             utils) {

        var omitted = ['name', 'model', 'collection', 'el', 'attributes', 'deferreds',
            'className', 'tagName', 'events', 'settingsOptions'];

        var inputConfigs = DashboardFactory.getDefault().getTypeConfigByClass('input');
        var typeToSettings = {};
        _.each(inputConfigs, function(component) {
            typeToSettings[component.settingsToCreate.type] = _.omit(component.settingsToCreate, 'type');
        });

        return BaseDashboardView.extend(_.extend({}, TokenDependenciesMixin, {
            moduleId: module.id,
            _isDashboardInput: true,
            viewOptions: {
                register: true
            },
            initialize: function(options) {
                BaseDashboardView.prototype.initialize.apply(this, arguments);
                options = options || {};

                this.inputId = options.inputId || _.uniqueId((this.id || 'input') + '_');
                this._extractTokenName();
                this._normalizeSettings();
                this._bindSearchManager();

                this.listenTo(this.settings, 'change:label', this._renderLabel);
                this.listenTo(this.settings, 'change:token', this._normalizeLabel);
                this.listenTo(this.settings, 'change:type', this._renderInput);
                this.listenTo(this.settings, 'change:token change:type', this._applyTokenName);
                this.listenTo(this.settings, 'change:choices', this._normalizeChoices);

                this.listenTo(this.settings, 'change:managerid change:manager', this._bindSearchManager);
                this.listenTo(this, 'change', function() { FormManager.handleValueChange(this); });
                this.listenTo(this.model.state, 'change:mode', this._onModeChange);
                this.setupTokenDependencies();
            },
            _normalizeSettings: function() {
                this._normalizeChoices();
                this._normalizeDefaults();
                this._normalizeLabel();
            },
            _normalizeChoices: function() {
                // use label as value if there's no value provided
                if (this.settings.has('choices')) {
                    var choices = this.settings.get('choices');
                    choices = _(choices).map(function(choice) {
                        return _.isUndefined(choice.value) ? {label: choice.label, value: choice.label} : choice;
                    }, this);
                    this.settings.set('choices', choices);
                }
            },
            _normalizeDefaults: function() {
                /**
                 * default and initialValue can be an array
                 */
                var defaultValue = this.settings.get('default');
                var initialValue = this.settings.get('initialValue');
                if (this.settings.has('choices')) {
                    if (defaultValue) {
                        defaultValue = this._getChoiceValueFromLabel(defaultValue);
                        this.settings.set('default', defaultValue, {silent: true});
                    }
                    if (initialValue) {
                        initialValue = this._getChoiceValueFromLabel(initialValue);
                        this.settings.set('initialValue', initialValue, {silent: true});
                    }
                }
            },
            _normalizeLabel: function() {
                var label = this.settings.get('label', {tokens: true});
                var token = this.settings.get('token');
                if (label == null && this.settings.get('type') != 'time') {
                    // fix SPL-110609, use token as label if there no label provided
                    this.settings.set('label', token);
                }
            },
            _getChoiceValueFromLabel: function(label) {
                var labels = _.pluck(this.settings.get('choices'), 'label');
                var values = _.pluck(this.settings.get('choices'), 'value');
                if (_.isString(label)) {
                    var idx = _.indexOf(labels, label);
                    label = idx < 0 ? label : values[idx];
                }
                else if (_.isArray(label)) {
                    label = _.map(label, function(text) {
                        var idx = _.indexOf(labels, text);
                        return idx < 0 ? text : values[idx];
                    });
                }
                return label;
            },
            _bindInputSettings: function(settingsToCreate) {
                if (this.settings._sync) {
                    this.settings._sync.destroy();
                }
                if (this.vizSettings) {
                    this.vizSettings.dispose();
                }
                this.vizSettings = new Settings(_.extend(settingsToCreate || {}, _.omit(this.options, omitted)), this.options.settingsOptions);
                this.vizSettings.id = this.inputId;
                this.settings._sync = utils.syncModels(this.settings, this.vizSettings, {
                    auto: true,
                    exclude: omitted.concat(['value', 'earliest_time', 'latest_time', 'populating_earliest_time', 'populating_latest_time'])
                });
            },
            _bindSearchManager: function() {
                this.managerid = this.settings.get('managerid') || this.settings.get('manager');
                if (this.managerid) {
                    this.unbindFromComponent(this.managerid, this.onManagerChange, this);
                    this.bindToComponent(this.managerid, this.onManagerChange, this);
                }
            },
            _extractTokenName: function() {
                var type = this.settings.get('type');
                // helper to extract name from actual form token
                var getTokenPart = function(str, prefix, suffix) {
                    if (str.indexOf(prefix) === 0) {
                        if (suffix && str.slice(-(suffix.length)) === suffix) {
                            return str.substring(prefix.length, str.length - suffix.length);
                        } else {
                            return str.substring(prefix.length);
                        }
                    }
                    return null;
                };
                if (type !== 'time') {
                    var value = this.settings.get('value', {tokens: true});
                    if (TokenUtils.isToken(value)) {
                        var token = getTokenPart(TokenUtils.getTokenName(value), 'form.');
                        if (token) {
                            this.settings.set('token', token);
                        }
                    }
                } else {
                    var et = this.settings.get('earliest_time', {tokens: true});
                    var lt = this.settings.get('latest_time', {tokens: true});
                    if (TokenUtils.isToken(et) && TokenUtils.isToken(lt)) {
                        et = getTokenPart(TokenUtils.getTokenName(et), 'form.', '.earliest');
                        lt = getTokenPart(TokenUtils.getTokenName(lt), 'form.', '.latest');
                        if (et && lt && et === lt) {
                            this.settings.set('token', et);
                        }
                    }
                }
            },
            _applyTokenName: function() {
                var type = this.settings.get('type');
                var tokenName = this.settings.get('token');
                if (type === 'time') {
                    this.settings.unset('value', {tokens: true});
                    var newSettings = {};
                    newSettings['earliest_time'] = tokenName ? '$form.' + tokenName + '.earliest$' : '$earliest$';
                    newSettings['latest_time'] = tokenName ? '$form.' + tokenName + '.latest$' : '$latest$';
                    this.settings.set(newSettings, {tokens: true});
                    if (this.vizSettings) {
                        this.vizSettings.set(newSettings, {tokens: true});
                    }
                } else {
                    this.settings.set({earliest_time: null, latest_time: null}, {unset: true, tokens: true});
                    var newTokenName = '$form.' + tokenName + '$';
                    this.settings.set('value', newTokenName, {tokens: true});
                    if (this.vizSettings) {
                        this.vizSettings.set('value', newTokenName, {tokens: true});
                    }
                }
            },
            onManagerChange: function(managers, manager) {
                if (manager instanceof SavedSearchManager) {
                    this.settings.set({
                        searchName: manager.get('searchname'),
                        searchType: 'saved'
                    }, {tokens: true});
                } else if (manager instanceof PostProcessSearchManager) {
                    this.settings.set({
                        searchType: 'postprocess',
                        search: manager.get('search', {tokens: true}),
                        basesearch: manager.get('managerid')
                    }, {tokens: true});
                } else if (manager) {
                    this.settings.set({
                        searchType: 'inline',
                        search: manager.get('search', {tokens: true}),
                        populating_earliest_time: manager.get('earliest_time', {tokens: true}),
                        populating_latest_time: manager.get('latest_time', {tokens: true})
                    }, {tokens: true});
                }
            },
            render: function() {
                this._renderLabel();
                this._renderInput();
                this._onModeChange();
                return this;
            },
            _triggerValueChangeEvent: function() {
                var input = this.children.input;
                var e = {
                    value: input._getSelectedValue(),
                    label: input._getSelectedLabel(),
                    data: input._getSelectedData()
                };
                this.trigger('valueChange', e);
            },
            _resetInput: function() {
                if (this.children.input) {
                    this.stopListening(this.children.input);
                    this.children.input.off();
                    // Remove will revoke it from the registry
                    this.children.input.remove();
                    this.children.input = null;
                }
            },
            _renderLabel: function() {
                var label = this.settings.get('label');
                if (!this.$label) {
                    this.$label = $('<label></label>').appendTo(this.$el);
                }
                if (label) {
                    this.$label.text(_(label).t());
                } else {
                    this.$label.html('&nbsp;');
                }
            },
            _renderInput: function() {
                var inputType = this.settings.get('type');
                var classes = 'input input-' + inputType;
                this.$el.hasClass('hidden') && (classes += ' hidden');
                this.$el.attr('class', classes);
                var inputTypeSettings = typeToSettings[inputType];
                if (!inputTypeSettings) {
                    return;
                }
                var Input = inputTypeSettings.getView();

                this._bindInputSettings(_.omit(inputTypeSettings, 'view', 'module'));
                // bind vizSettings and this.settings
                this._resetInput();
                var options = {
                    id: this.inputId,
                    model: this.model,
                    el: $('<div></div>').appendTo(this.$el),
                    settings: this.vizSettings
                };
                this.children.input = new Input(options, this.options.settingsOptions);
                this.children.input.render().$el.appendTo(this.$el);
                this.listenTo(this.children.input, 'change datachange', this._triggerValueChangeEvent);
                this.listenTo(this.children.input, 'all', this.trigger);
                this.trigger('create:visualization', this.children.input);
                _.defer(_.bind(function() {
                    this.trigger('change', this.children.input.val(), this.children.input);
                    this._triggerValueChangeEvent();
                }, this));
            },
            _onModeChange: function() {
                //this._unbindEventHandler();
                this._removeInputEditor();
                switch (this.model.state.get('mode')) {
                    case 'edit':
                        this._renderInputEditor();
                        //this._bindEventHandler();
                        break;
                }
            },
            _removeInputEditor: function() {
                if (this.children.inputEditor) {
                    this.children.inputEditor.remove();
                    this.children.inputEditor = null;
                }
                this.$('.drag-handle').remove();
            },
            _renderInputEditor: function() {
                $('<div class="drag-handle"></div>').prependTo(this.$el);
                this.children.inputEditor = new InputEditor({
                    model: this.settings,
                    inputSettings: this.vizSettings,
                    controller: this.model.controller,
                    inputId: this.id
                });
                this.children.inputEditor.render().prependTo(this.$el);
            },
            hasValue: function() {
                return this.children.input ? this.children.input._hasValueForDashboards() : false;
            },
            val: function(newValue) {
                if (this.children.input) {
                    return this.children.input.val.apply(this.children.input, arguments);
                }
            },
            onInputReady: function() {
                if (this.children.input && _.isFunction(this.children.input._onReady)) {
                    return this.children.input._onReady();
                }
                else {
                    return $.Deferred().resolve();
                }
            },
            getInputView: function() {
                return this.children.input;
            },
            remove: function() {
                this.stopListeningToTokenDependencyChange();                
                BaseDashboardView.prototype.remove.apply(this, arguments);
            }
        }));
    }
);
