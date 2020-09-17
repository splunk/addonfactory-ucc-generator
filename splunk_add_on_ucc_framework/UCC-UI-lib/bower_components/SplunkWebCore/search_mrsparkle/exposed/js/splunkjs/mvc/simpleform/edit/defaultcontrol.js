define(function(require, exports, module) {

    var _ = require('underscore');
    var $ = require('jquery');
    var console = require('util/console');
    var mvc = require('../../../mvc');
    var Settings = require('../inputsettings');
    var ControlGroup = require('views/shared/controls/ControlGroup');

    var DefaultControl = ControlGroup.extend({

        moduleId: module.id,


        initialize: function() {
            this._optionsModel = this.options.controlOptions && this.options.controlOptions.model;
            this._optionsAttribute = this.options.controlOptions && this.options.controlOptions.modelAttribute;
            this._optionsModelProxy = new Settings($.extend(true, {}, this._optionsModel ? this._optionsModel.omit('initialValue', 'default', 'value', 'selectFirstChoice') : {}));

            if (this.options.controlOptions) {
                this._optionsModelProxy.set(this.options.controlOptions);
            }

            if (this._optionsModel && this._optionsAttribute) {
                this._optionsModelProxy.set("value", this._optionsModel.get(this._optionsAttribute));

                this.listenTo(this._optionsModel, "change", this.onOptionsModelChange, this);
                this.listenTo(this._optionsModelProxy, "change:value", this.onProxyValueChange, this);
                this.listenTo(this._optionsModelProxy, "change:choices", this.onProxyChoicesChange, this);
            }

            var inputTypeClass = this.options.inputTypeClass;
            if (inputTypeClass) {
                this.options.controls = [ new inputTypeClass({ settings: this._optionsModelProxy }) ];
            }

            ControlGroup.prototype.initialize.apply(this, arguments);
        },

        events: {
            "click a.default-clear-selection": function(e) {
                e.preventDefault();
                this._optionsModelProxy.set("value", null);
            }
        },

        render: function() {
            ControlGroup.prototype.render.apply(this, arguments);

            if (this.options.enableClearSelection) {
                if (!this._clearSelectionButton) {
                    this._clearSelectionButton = $(_.template(this.clearSelectionTemplate, { _: _ }));
                }
                this.$(".controls").append(this._clearSelectionButton);
            }

            return this;
        },

        onOptionsModelChange: function() {
            if (this._isProxySyncing) {
                return;
            }

            try {
                this._isProxySyncing = true;

                var changed = $.extend(true, {}, this._optionsModel.changed);
                delete changed["value"];                // don't sync value attribute
                delete changed["default"];              // don't sync default attribute
                delete changed["initialValue"];         // don't sync initialValue attribute
                delete changed["selectFirstChoice"];    // don't sync selectFirstChoice attribute
                this._optionsModelProxy.set(changed);
            } finally {
                this._isProxySyncing = false;
            }
        },

        onProxyValueChange: function() {
            if (this._isProxySyncing) {
                return;
            }

            try {
                this._isProxySyncing = true;

                this._optionsModel.set(this._optionsAttribute, this._optionsModelProxy.get("value"));
            } finally {
                this._isProxySyncing = false;
            }
        },

        onProxyChoicesChange: function() {
            // Changed property contains all the new choices. To find the deleted choice find the diff
            var diff = _.difference(_.pluck(this._optionsModel.previous("choices"), "value"), _.pluck(this._optionsModel.get("choices"), "value"));
            if (diff.length) {
                var defaultValue = this._optionsModel.get(this._optionsAttribute);
                if ($.isArray(defaultValue)) {
                    this._optionsModel.set(this._optionsAttribute, _.difference(defaultValue, diff));
                }
                else if (defaultValue === diff[0]) {
                    this._optionsModel.set(this._optionsAttribute, "");
                }
            }
        },

        clearSelectionTemplate: '\
            <a class="default-clear-selection btn-link" href="#"><%- _("Clear Selection").t() %></a>\
        '

    });

    return DefaultControl;

});
