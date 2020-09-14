define(function(require, exports, module) {

    var _ = require('underscore');
    var $ = require('jquery');
    var console = require('util/console');
    var mvc = require('../../../mvc');
    var Base = require('views/Base');
    var TextControl = require('views/shared/controls/TextControl');
    var sortable = require('jquery.ui.sortable');

    var StaticOptionsControl = Base.extend({

        moduleId: module.id,

        initialize: function() {
            Base.prototype.initialize.apply(this, arguments);

            this._optionsModel = this.options.controlOptions && this.options.controlOptions.model;
            this._optionsAttribute = this.options.controlOptions && this.options.controlOptions.modelAttribute;

            this._optionPairMap = {};
        },

        events: {
            "click a.static-options-add": function(e) {
                e.preventDefault();
                this._addOptionPair();
            }
        },

        render: function() {
            this.$el.html(this.compiledTemplate({ _: _ }));

            var optionList = (this._optionsModel && this._optionsAttribute) ? this._optionsModel.get(this._optionsAttribute) : null;
            if (optionList && optionList.length) {
                for (var i = 0, l = optionList.length; i < l; i++) {
                    this._addOptionPair(optionList[i]);
                }
            } else {
                this._addOptionPair();
            }
            this._updateValue();

            var self = this;
            var sortable = this.$(".static-options-body").sortable({
                handle: ".drag-handle",
                tolerance: "pointer"
            }).on("sortupdate", function(e) {
                self._updateValue();
            }).on("stop", function(e) {
                self._updateValue();
            });

            return this;
        },

        _addOptionPair: function(options) {
            var pair = new OptionPair(options || {});
            pair.on("change", this._updateValue, this);
            pair.on("click:remove", function() {
                this._removeOptionPair(pair);
            }, this);
            this.$(".static-options-body").append(pair.render().$el);
            this._optionPairMap[pair.cid] = pair;
        },

        _removeOptionPair: function(pair) {
            delete this._optionPairMap[pair.cid];
            pair.remove();
            this._updateValue();

            // ensure there is at least one OptionPair available
            if (this.$(".static-option-pair").length === 0) {
                this._addOptionPair();
            }
        },

        _updateValue: function() {
            var value = [];
            var optionPairList = this.$(".static-option-pair").removeClass('error');
            var optionPairMap = this._optionPairMap;
            var optionPairCid;
            var optionPair;
            var optionLabel;
            var optionValue;
            var optionDupesMap = {};
            for (var i = 0, l = optionPairList.length; i < l; i++) {
                optionPairCid = $(optionPairList[i]).data("cid");
                if (optionPairCid) {
                    optionPair = optionPairMap[optionPairCid];
                    if (optionPair) {
                        optionLabel = optionPair.getLabel();
                        optionValue = optionPair.getValue();
                        if (optionLabel || optionValue) {
                            value.push({ label: optionLabel, value: optionValue });
                        }
                        if (optionValue) {
                            if (!optionLabel || _.has(optionDupesMap, optionValue)) {
                                optionPair.$el.addClass('error');
                            }
                            optionDupesMap[optionValue] = true;
                        }
                    }
                }
            }

            if (this._optionsModel && this._optionsAttribute) {
                this._optionsModel.set(this._optionsAttribute, value);
            }
        },

        template: '\
            <div class="static-options-heading">\
                <div class="static-options-heading-name"><%- _("Name").t() %></div>\
                <div class="static-options-heading-value"><%- _("Value").t() %></div>\
            </div>\
            <div class="static-options-body">\
            </div>\
            <a class="static-options-add btn-link pull-right" href="#"><%- _("Add Option").t() %></a>\
        '
    });

    var OptionPair = Base.extend({

        className: "static-option-pair control-group",

        initialize: function() {
            Base.prototype.initialize.apply(this, arguments);

            this._labelControl = new TextControl({ defaultValue: this.options.label || "" });
            this._labelControl.on("change", this._notifyChange, this);

            this._valueControl = new TextControl({ defaultValue: this.options.value || "" });
            this._valueControl.on("change", this._notifyChange, this);
        },

        events: {
            "click a.static-option-remove": function(e) {
                e.preventDefault();
                this.trigger("click:remove");
            }
        },

        getLabel: function() {
            return this._labelControl.getValue();
        },

        setLabel: function(value) {
            this._labelControl.setValue(value);
        },

        getValue: function() {
            return this._valueControl.getValue();
        },

        setValue: function(value) {
            this._valueControl.setValue(value);
        },

        render: function() {
            this.$el.append($(this.template));

            this.$(".static-option-label").append(this._labelControl.render().$el);
            this.$(".static-option-value").append(this._valueControl.render().$el);

            return this;
        },

        _notifyChange: function() {
            this.trigger("change");
        },

        template: '\
            <div class="drag-handle"></div>\
            <div class="static-option-label"></div>\
            <div class="static-option-value"></div>\
            <a class="static-option-remove btn-link" href="#"><i class="icon-x-circle"></i></a>\
        '

    });

    return StaticOptionsControl;

});
