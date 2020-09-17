define(function(require, exports, module) {

    var _ = require('underscore');
    var Class = require('jg/Class');
    var CSS = require('jg/CSS');
    var HStackPanel = require('splunk/panels/HStackPanel');
    var ObservableEnumProperty = require('jg/properties/ObservableEnumProperty');
    var ObservableProperty = require('jg/properties/ObservableProperty');
    var BooleanEditor = require('splunk/editors/BooleanEditor');
    var Editor = require('splunk/editors/Editor');
    var EditorLabel = require('splunk/editors/EditorLabel');
    var EnumEditor = require('splunk/editors/EnumEditor');
    var SimpleTypeEditor = require('splunk/editors/SimpleTypeEditor');
    var numeral = require('util/numeral');

    require('./NumberFormatEditor.pcss');

    return Class(module.id, Editor, function(NumberFormatEditor, base) {

        // Public Properties

        this.precision = new ObservableProperty('precision', Number, 0)
            .onChange(function(e) {
                this.invalidate('renderInputPass');
            });

        this.useThousandSeparators = new ObservableProperty('useThousandSeparators', Boolean, true)
            .onChange(function(e) {
                this.invalidate('renderInputPass');
            });

        this.unit = new ObservableProperty('unit', String, null)
            .onChange(function(e) {
                this.invalidate('renderInputPass');
            });

        this.unitPosition = new ObservableEnumProperty('unitPosition', String, ['before', 'after'], 'after')
            .onChange(function(e) {
                this.invalidate('renderInputPass');
            });

        // Private Properties

        this._precision = null;
        this._useThousandSeparators = null;
        this._unit = null;
        this._unitPosition = null;

        // Protected Methods

        this.setupOverride = function() {
            var i;
            var l;

            this._precision = new EnumEditor()
                .addOption(0, numeral(0).format('0'))
                .addOption(1, numeral(0).format('0.0'))
                .addOption(2, numeral(0).format('0.00'))
                .addOption(3, numeral(0).format('0.000'))
                .addOption(4, numeral(0).format('0.0000'))
                .set('defaultLabel', _('Custom').t())
                .set('menuWidth', 'narrow')
                .on('value.change', this.onInputChange, this);

            this._useThousandSeparators = new BooleanEditor()
                .on('value.change', this.onInputChange, this);

            this._unit = new SimpleTypeEditor(String)
                .on('value.change', this.onInputChange, this);

            this._unitPosition = new BooleanEditor()
                .set('trueLabel', _('Before').t())
                .set('falseLabel', _('After').t())
                .on('value.change', this.onInputChange, this);

            this.addChild(new HStackPanel()
                    .addChild(new EditorLabel(_('Precision').t()))
                    .addChild(this._precision)
                    .addClass(CSS.formatClassName(module.id, 'row'))
            );

            this.addChild(new HStackPanel()
                    .addChild(new EditorLabel(_('Use Thousand Separators').t()))
                    .addChild(this._useThousandSeparators)
                    .addClass(CSS.formatClassName(module.id, 'row'))
            );

            this.addChild(new HStackPanel()
                    .addChild(new EditorLabel(_('Unit').t()))
                    .addChild(this._unit)
                    .addClass(CSS.formatClassName(module.id, 'row'))
            );

            this.addChild(new HStackPanel()
                    .addChild(new EditorLabel(_('Unit Position').t()))
                    .addChild(this._unitPosition)
                    .addClass(CSS.formatClassName(module.id, 'row'))
            );
        };

        this.renderInputOverride = function() {
            this._precision
                .set('value', this.get('precision'))
                .renderInput();

            this._useThousandSeparators
                .set('value', this.get('useThousandSeparators'))
                .renderInput();

            this._unit
                .set('value', this.get('unit'))
                .renderInput();

            this._unitPosition
                .set('value', this.get('unitPosition') === 'before')
                .renderInput();
        };

        this.processInputOverride = function() {
            this.set('precision', this._precision.get('value'));
            this.set('useThousandSeparators', this._useThousandSeparators.get('value'));
            this.set('unit', this._unit.get('value'));
            this.set('unitPosition', this._unitPosition.get('value') === true ? 'before' : 'after');
        };

    });

});
