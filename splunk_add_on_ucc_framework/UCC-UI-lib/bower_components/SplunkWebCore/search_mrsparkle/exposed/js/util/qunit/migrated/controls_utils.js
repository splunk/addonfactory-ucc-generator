/* globals assert */
/**
 * @author jszeto
 * @date 9/25/13
 *
 * Setup functions and baseline test for the base Control class. QUnit tests for a control should import this file
 * and run the baseline test
 */
define(['jquery',
        'underscore',
        'mocks/models/MockModel',
        'mocks/models/MockValidatingModel',
        'views/shared/controls/Control',
        'views/shared/controls/ControlGroup',
        'views/shared/controls/SyntheticSelectControl',
        'views/shared/controls/SyntheticRadioControl',
        'views/shared/controls/TextControl',
        'views/shared/controls/TextareaControl',
        'util/qunit_utils'],
    function(
        $,
        _,
        MockModel,
        MockValidatingModel,
        Control,
        ControlGroup,
        SyntheticSelectControl,
        SyntheticRadioControl,
        TextControl,
        TextareaControl,
        qunitUtils) {

    var BaseControlModule = {

        setup: function() {
            this.clock = sinon.useFakeTimers();
            this.$container = $('<div class="container"></div>').appendTo('body');
        },

        setupModel: function(attrs) {
            this.model = new MockModel(attrs);
        },

        setupDefaultModel: function() {
            this.setupModel({stringAttr:"stringAttrValue", numberAttr: 3});
        },

        setupValidatingModel: function(attrs) {
            this.model = new MockValidatingModel(attrs);
        },

        setupControl: function(options) {
            this.controlView = new Control(options);
            this.$container.append(this.controlView.render().el);
        },

        setupDefaultControl: function(options) {
            options = options || {};
            _(options).defaults({
                model: this.model,
                modelAttribute: "stringAttr"});

            this.setupControl(options);
        },

        cleanup: function() {
            if(this.controlView) {
                this.controlView.remove();
            }
            delete this.controlView;
            delete this.model;
        },

        normalizeControlView: function(controlView) {
            if(!(controlView instanceof ControlGroup || controlView instanceof Control)) {
                throw new Error('Input view must be a control or a control group');
            }
            if(controlView instanceof ControlGroup) {
                var controls = controlView.getAllControls();
                if(controls.length !== 1) {
                    throw new Error('When passing a control group, it must contain exactly one control');
                }
                return controls[0];
            }
            return controlView;
        },

        $getSyntheticSelectItems: function($el) {
            var $toggle = $el.find('.dropdown-toggle');
            var $dialog = $el.find('.dropdown-menu');
            if($dialog.length === 0) {
                $dialog = $('#' + $toggle.attr('data-dialog-id'));
            }
            return $dialog.find('li > a');
        },

        readControlValue: function(controlView) {
            controlView = this.normalizeControlView(controlView);
            if(controlView instanceof TextControl) {
                return this.readTextInputValue(controlView.$el);
            }
            if(controlView instanceof TextareaControl) {
                return this.readTextareaValue(controlView.$el);
            }
            if(controlView instanceof SyntheticRadioControl) {
                return this.readSyntheticRadioValue(controlView.$el);
            }
            if(controlView instanceof SyntheticSelectControl) {
                return this.readSyntheticSelectValue(controlView.$el);
            }
            throw new Error('Unsupported control type');
        },

        readTextInputValue: function($el) {
            return $el.find('input').val();
        },

        readTextareaValue: function($el) {
            return $el.find('textarea').val();
        },

        readSyntheticRadioValue: function($el) {
            return $el.find('button.active').attr('data-value');
        },

        readSyntheticSelectValue: function($el) {
            var value;
            this.$getSyntheticSelectItems($el).each(function() {
                var $this = $(this);
                if($this.find('i.icon-check').css('display') !== 'none') {
                    value = $this.attr('data-item-value');
                }
            });
            return value;
        },

        writeControlValue: function(controlView, value) {
            controlView = this.normalizeControlView(controlView);
            if(controlView instanceof TextControl) {
                this.writeTextInputValue(controlView.$el, value);
            }
            else if(controlView instanceof TextareaControl) {
                this.writeTextareaValue(controlView.$el, value);
            }
            else if(controlView instanceof SyntheticRadioControl) {
                this.writeSyntheticRadioValue(controlView.$el, value);
            }
            else if(controlView instanceof SyntheticSelectControl) {
                this.writeSyntheticSelectValue(controlView.$el, value);
            }
            else {
                throw new Error('Unsupported control type');
            }
        },

        writeTextInputValue: function($el, value) {
            $el.find('input').val(value).trigger('change');
        },

        writeTextareaValue: function($el, value) {
            $el.find('textarea').val(value).trigger('change');
        },

        writeSyntheticRadioValue: function($el, value) {
            $el.find('button[data-value="' + value + '"]').trigger('click');
        },

        writeSyntheticSelectValue: function($el, value) {
            var $toggle = $el.find('.dropdown-toggle');
            $toggle.trigger('mousedown');
            this.$getSyntheticSelectItems($el).filter('[data-item-value="' + value + '"]').trigger('click');
        },

        writeSyntheticSelectValueByIndex: function($el, index) {
            var $toggle = $el.find('.dropdown-toggle');
            $toggle.trigger('mousedown');
            this.$getSyntheticSelectItems($el).eq(index).trigger('click');
        },

        getAvailableValues: function(controlView) {
            controlView = this.normalizeControlView(controlView);
            if(controlView instanceof SyntheticRadioControl) {
                var $buttons = controlView.$('button[data-value]:not(.disabled)');
                return _($buttons).map(function(el) { return $(el).attr('data-value'); });
            }
            if(controlView instanceof SyntheticSelectControl) {
                var $options = controlView.$('.dropdown-menu li > a[data-item-value]:not(.disabled)');
                return _($options).map(function(el) { return $(el).attr('data-item-value'); });
            }
            throw new Error('Unsupported control type');
        },

        verifyControlEnabled: function(controlView, model, modelAttribute) {
            controlView = this.normalizeControlView(controlView);
            var originalValue = model.get(modelAttribute);
            model.unset(modelAttribute);

            assert.ok(true, 'testing the ' + modelAttribute + ' control');
            if(controlView instanceof TextControl || controlView instanceof TextareaControl) {
                assert.ok(true, 'setting a value in the text box');
                this.writeControlValue(controlView, 'foo');
                assert.equal(model.get(modelAttribute), 'foo', 'the model was updated correctly');
                assert.ok(true, 'setting a value in the model');
                model.set(modelAttribute, 'bar');
                assert.equal(this.readControlValue(controlView), 'bar', 'the text box was updated correctly');
            }
            else if(controlView instanceof SyntheticRadioControl || controlView instanceof SyntheticSelectControl) {
                var values = this.getAvailableValues(controlView);
                if(values.length < 2) {
                    throw new Error('Cannot verify a radio or select control with less than two enabled options');
                }
                assert.ok(true, 'clicking the ' + values[0] + ' button');
                this.writeControlValue(controlView, values[0]);
                assert.equal(model.get(modelAttribute), values[0], 'the model was updated correctly');
                assert.ok(true, 'setting the model attribut to ' + values[1]);
                model.set(modelAttribute, values[1]);
                assert.equal(this.readControlValue(controlView), values[1], 'the radio control was updated correctly');
            }
            else {
                throw new Error('Unsupported control type');
            }

            model.set(modelAttribute, originalValue);
        },

        mainRun: function() {
            this.setupControl({});
            assert.ok(this.controlView, "Simple Control created with no options");
            this.cleanup();

            // DEFAULTVALUE
            assert.ok(true, "Default Value");
            this.setupDefaultModel();
            this.setupControl({defaultValue:"newDefaultValue"});
            assert.equal(this.controlView.getValue(), "newDefaultValue","Default value assigned");
            // model/modelAttribute overrides defaultValue
            this.setupDefaultControl({defaultValue:"newDefaultValue"}); // Setup with model
            assert.equal(this.controlView.getValue(), "stringAttrValue","Default value overridden by model attribute value");
            this.controlView.setValue("overrideValue");
            assert.equal(this.controlView.getValue(), "overrideValue","Set value called");
            this.cleanup();

            // ENABLED
            this.setupDefaultModel();
            this.setupControl({enabled:false});
            assert.ok(this.controlView, "View was created with enabled = false");
            this.cleanup();

            // VALIDATE = FALSE
            assert.ok(true, "Test validate = false");
            this.setupValidatingModel();
            this.setupControl({validate:true, model:this.model, modelAttribute:"typeAttr"});
            assert.equal(this.controlView.getValue(), "", "Value is empty string");
            this.controlView.setValue("InvalidType");
            assert.equal(this.controlView.getValue(), "InvalidType", "Set value to InvalidType. Value should change");
            assert.equal(this.model.get("typeAttr"), "", "Model attribute should remain empty string");
            this.cleanup();

            // VALIDATE = TRUE
            assert.ok(true, "Test validate = true");
            this.setupValidatingModel();
            this.setupControl({forceUpdate:true, validate:true, model:this.model, modelAttribute:"typeAttr"});
            assert.equal(this.controlView.getValue(), "", "Value is empty string");
            this.controlView.setValue("InvalidType");
            assert.equal(this.controlView.getValue(), "InvalidType", "Set value to InvalidType. Value should change");
            assert.equal(this.model.get("typeAttr"), "InvalidType", "Model attribute should change");
            this.cleanup();

            // UPDATEMODEL
            assert.ok(true, "Test updateModel");
            this.setupDefaultModel();
            this.setupControl({updateModel:false, model:this.model, modelAttribute:"stringAttr"});
            assert.equal(this.controlView.getValue(), "stringAttrValue", "Value set by model");
            this.controlView.setValue("updatedStringAttrValue");
            assert.equal(this.controlView.getValue(), "updatedStringAttrValue", "Set value. Value should change");
            assert.equal(this.model.get("stringAttr"), "stringAttrValue", "Model attribute should not change");
            this.cleanup();

            // GET MODEL ATTRIBUTE
            assert.ok(true, "Test getModelAttribute");
            this.setupDefaultModel();
            this.setupDefaultControl();
            assert.equal(this.controlView.getModelAttribute(), 'stringAttr', 'getModelAttribute returns the correct value');
            this.cleanup();

            // NORMALIZE VALUE
            assert.ok(true, "Test normalizeValue");
            this.setupDefaultModel();
            this.setupDefaultControl();
            assert.equal(this.controlView.normalizeValue("SomeValue"), 'SomeValue', 'normalizeValue returns the same value');
            this.cleanup();

            // UPDATE VALUE
            assert.ok(true, "Test updateValue");
            this.setupControl();
            assert.equal(this.controlView.getValue(), "", 'Empty value');
            this.controlView.setValue("UpdateValue");
            assert.equal(this.controlView.getValue(), "UpdateValue", 'setValue called. Value should change');
            this.cleanup();

            // UNSETVALUE
            assert.ok(true, "Test unsetValue");
            this.setupDefaultModel();
            this.setupDefaultControl();
            this.controlView.unsetValue();
            assert.equal(this.model.get(this.controlView.getModelAttribute()), undefined, 'unsetValue sets value to undefined');
            this.cleanup();

            // UPDATEMODEL
            assert.ok(true, "Test updateModel");
            this.setupValidatingModel();
            this.setupControl({model:this.model, modelAttribute:"typeAttr"});
            assert.equal(this.model.get(this.controlView.getModelAttribute()), "", 'Model attribute value in model');
            this.controlView._value = "UpdatedTypeValue";
            this.controlView.updateModel();
            assert.equal(this.controlView.getValue(), "UpdatedTypeValue", 'updateModel called. Value should change');
            this.cleanup();

            // GET UPDATED MODEL ATTRIBUTES
            assert.ok(true, "Test getUpdatedModelAttributes");
            this.setupValidatingModel();
            this.setupControl({model:this.model, modelAttribute:"typeAttr"});
            assert.equal(this.controlView.getValue(), "", 'Empty value');
            this.controlView._value = "UpdatedTypeValue";
            assert.deepEqual(this.controlView.getUpdatedModelAttributes(), {typeAttr:"UpdatedTypeValue"}, 'getUpdatedModelAttributes called.');
            },

        teardown: function() {
            this.$container.remove();
            this.clock.restore();
            this.cleanup();
        }
    };

    return ({
        BaseControlModule: BaseControlModule
    });
});