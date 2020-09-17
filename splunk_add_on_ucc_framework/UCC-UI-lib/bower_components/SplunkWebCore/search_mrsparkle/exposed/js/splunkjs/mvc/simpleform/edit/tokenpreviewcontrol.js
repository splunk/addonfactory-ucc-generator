define(function(require, exports, module) {

    var _ = require('underscore');
    var $ = require('jquery');
    var console = require('util/console');
    var mvc = require('../../../mvc');
    var ControlGroup = require('views/shared/controls/ControlGroup');

    var TokenPreviewControl = ControlGroup.extend({

        moduleId: module.id,

        initialize: function() {
            this.options = _.extend({ controlType: "Label" }, this.options);

            ControlGroup.prototype.initialize.apply(this, arguments);

            this._optionsModel = this.options.controlOptions && this.options.controlOptions.model;
            if (this._optionsModel) {
                this.listenTo(this._optionsModel, "change", this.onOptionsModelChange, this);
                this.onOptionsModelChange();
            }
        },

        onOptionsModelChange: function() {
            var prefix = this._optionsModel.get("prefix") || "";
            var suffix = this._optionsModel.get("suffix") || "";
            var valuePrefix = this._optionsModel.get("valuePrefix") || "";
            var valueSuffix = this._optionsModel.get("valueSuffix") || "";
            var delimiter = this._optionsModel.get("delimiter") || "";

            var previewString = "";
            previewString += prefix;
            previewString += valuePrefix + "value1" + valueSuffix;
            previewString += delimiter;
            previewString += valuePrefix + "value2" + valueSuffix;
            previewString += delimiter + "...";
            previewString += suffix;

            this.getAllControls()[0].setValue(previewString);
        }

    });

    return TokenPreviewControl;

});
