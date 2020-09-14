define(function(require) {
    var _ = require('underscore');
    var $ = require('jquery');
    var BaseSplunkView = require('../../basesplunkview');
    var Settings = require('../inputsettings');
    var utils = require('../../utils');
    var Dashboard = require('../../simplexml/controller');
    var EditMenu = require('../edit/menu');
    var mvc = require('splunkjs/mvc');
    var console = require('util/console');
    var TokenUtils = require('splunkjs/mvc/tokenutils');
    var SavedSearchManager = require('../../savedsearchmanager');
    var PostProcessSearchManager = require('../../postprocessmanager');
    var FormUtils = require('../formutils');
    var TokenDependenciesMixin = require('../../simplexml/dashboard/tokendeps');

    var BaseInput = BaseSplunkView.extend(_.extend({}, TokenDependenciesMixin, {
        className: 'input',
        _isDashboardInput: true,
        options: {
            submitOnChange: false,
            editable: true
        },
        omitted: ['id', 'name', 'model', 'collection', 'el', 'attributes', 'className', 'tagName', 'events', 'settingsOptions'],
        initialize: function(options) {
            this.configure();
            if (this.initialVisualization) {
                this.settings.set('type', this.initialVisualization);
            }
            options = options || {};
            this.inputId = options.inputId || _.uniqueId((this.id || 'input') + '_');
            this.settings.set('id', this.id);

            // Update self when settings change
            this._extractTokenName();
            this.listenTo(this.settings, 'change:label', this.renderLabel);
            this.listenTo(this.settings, 'change:token change:type', this._applyTokenName);
            this.listenTo(this.settings, 'change:type', this._updateType);
            this.listenToOnce(this.settings, 'removeInput', this.remove);
            this.listenTo(Dashboard.getStateModel(), 'change:edit', this.onEditModeChange);
            this.listenTo(this.settings, 'change:editable', this.onEditModeChange);
            this.bindToComponent(this.settings.get('managerid'), this.onManagerChange, this);
            
            if (options.handleValueChange) {
                this.listenTo(this, 'change', function(){ FormUtils.handleValueChange(this); });
            }
            
            this.setupTokenDependencies();
        },
        configure: function() {
            BaseSplunkView.prototype.configure.apply(this, arguments);
            var filteredSettings = this.settings.toJSON({tokens: true});
            this.settings = new Settings(filteredSettings, this.options.settingsOptions);
            return this;
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
        _updateType: function() {
            this._removeVisualization();

            var type = this.settings.get('type') || this.initialVisualization;
            var Input = FormUtils.getInputType(type);
            console.log('Creating input of type=%o class=%o', type, Input);

            if (!Input) {
                this.trigger("typenotfound", type);
                return;
            }

            this._bindVizSettings();
            var options = this.vizSettings.toJSON({tokens: true});
            options['settings'] = this.vizSettings;
            options['id'] = this.inputId;

            var viz = this.visualization = new Input(options, this.options.settingsOptions);
            viz.render().$el.appendTo(this.$el);
            this.listenTo(viz, 'change datachange', this._triggerValueChangeEvent);
            this.listenTo(viz, 'all', this.trigger, this);
            this.trigger('create:visualization', viz);
            _.defer(_.bind(function(){
                this.trigger('change', this.visualization.val(), this.visualization);
                this._triggerValueChangeEvent();
            }, this));
        },
        _triggerValueChangeEvent: function() {
            var viz = this.visualization;
            var e = {
                value: viz._getSelectedValue(),
                label: viz._getSelectedLabel(),
                data: viz._getSelectedData()
            };

            this.trigger('valueChange', e);
        },
        _onReady: function() {
            var dfd = $.Deferred();
            var onVizReady = function(viz) {
                viz._onReady(function() {
                    dfd.resolve();
                });
            };
            if (this.visualization) {
                onVizReady(this.visualization);
            } else {
                this.listenToOnce(this, 'create:visualization', onVizReady);
            }
            return dfd.promise();
        },
        _bindVizSettings: function() {
            this.vizSettings = new Settings(_.omit(this.options, this.omitted), this.options.settingsOptions);
            this.vizSettings.id = this.inputId;
            this.settings._sync = utils.syncModels(this.settings, this.vizSettings, {
                auto: true,
                exclude: this.omitted.concat(['value', 'earliest_time', 'latest_time', 'populating_earliest_time', 'populating_latest_time'])
            });
        },
        _unbindVizSettings: function() {
            if (this.settings._sync) {
                this.settings._sync.destroy();
                this.settings._sync = null;
            }
            if (this.vizSettings) {
                this.vizSettings.dispose();
                this.vizSettings = null;
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
                var value = this.settings.get('value', { tokens: true });
                if (TokenUtils.isToken(value)) {
                    var token = getTokenPart(TokenUtils.getTokenName(value), 'form.');
                    if (token) {
                        this.settings.set('token', token);
                    }
                }
            } else {
                var et = this.settings.get('earliest_time', { tokens: true});
                var lt = this.settings.get('latest_time', { tokens: true});
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
                this.settings.unset('value', { tokens: true });
                var newSettings = {};
                newSettings['earliest_time'] = tokenName ? '$form.' + tokenName + '.earliest$' : '$earliest$';
                newSettings['latest_time'] = tokenName ? '$form.' + tokenName + '.latest$' : '$latest$';
                this.settings.set(newSettings, { tokens: true });
                if (this.vizSettings) {
                    this.vizSettings.set(newSettings, { tokens: true });
                }
            } else {
                this.settings.set({ earliest_time: null, latest_time: null }, { unset: true, tokens: true });
                var newTokenName = '$form.' + tokenName + '$';
                this.settings.set('value', newTokenName, { tokens: true });
                if (this.vizSettings) {
                    this.vizSettings.set('value', newTokenName, { tokens: true });
                }
            }
        },
        remove: function() {
            this._removeEditMenu();
            this._removeVisualization();
            this.stopListeningToTokenDependencyChange();
            var parent = this.$el.parent();
            BaseSplunkView.prototype.remove.call(this);
            parent.trigger('itemRemoved');
        },
        _removeVisualization: function() {
            this._unbindVizSettings();
            if (this.visualization) {
                this.stopListening(this.visualization);
                this.visualization.off();
                // Remove will revoke it from the registry
                this.visualization.remove();
                this.visualization = null;
            }
        },
        _createEditMenu: function() {
            return new EditMenu({ model: this.settings });
        },
        _removeEditMenu: function() {
            if (this.editMenu) {
                this.editMenu.remove();
                this.editMenu = null;
            }
        },
        isEditMode: function(){
            return Dashboard.isEditMode() && this.settings.get('editable');
        },
        onEditModeChange: function() {
            this.$('.drag-handle').remove();
            if (this.isEditMode()) {
                $('<div class="drag-handle"></div>').prependTo(this.$el);
                if (!this.editMenu) {
                    this.editMenu = this._createEditMenu().render().prependTo(this.$el);
                }
            } else {
                this._removeEditMenu();
            }
        },
        renderLabel: function() {
            var label = this.$el.children('label');
            if (!label.length) {
                label = $('<label></label>').appendTo(this.el);
            }
            label.attr('for', this.inputId);
            if (this.settings.has('label')) {
                label.html(_.escape(this.settings.get('label')) || '&nbsp;');
            } else {
                var v = label.text();
                if (v) {
                    this.settings.set('label', v, { tokens: true });
                }
            }
        },
        hasValue: function() {
            return this.visualization ? this.visualization._hasValueForDashboards() : false;
        },
        // For API compatibility with MVC controls.
        val: function(newValue) {
            // NOTE: Ignore parameters beyond the first one.
            if (this.visualization) {
                return this.visualization.val.apply(this.visualization, arguments);
            }
        },
        render: function() {
            this.renderLabel();
            this._updateType();
            this.onEditModeChange();
            return this;
        }
    }));

    return BaseInput;
});
