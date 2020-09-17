define([
        'jquery',
        'underscore',
        'module',
        'backbone',
        'views/shared/controls/Control',
        'views/shared/controls/colors/ColorRangeLabelControl',
        'views/shared/controls/colors/ColorRangeInputControl',
        'views/shared/controls/colors/ColorRangeColorControl',
        'models/Base'
    ],
    function(
        $,
        _,
        module,
        Backbone,
        Control,
        LabelControl,
        InputControl,
        ColorControl,
        BaseModel
        ) {

        return Control.extend({
            moduleId: module.id,

            initialize: function() {
                Control.prototype.initialize.apply(this, arguments);
                this.model.to = this.model;
                this.model.from = this.options.fromModel;
                this.displayMinMaxLabels = this.options.displayMinMaxLabels;
                this.initRowComponents();
            },

            events: {
                'click .remove-range': function(e) {
                    this.trigger('removeRange', this.model);
                }
            },

            initRowComponents: function() {
                var i = this.collection.indexOf(this.model.to);
                if (this.model.to.get('value') === 'max') {
                    this.createLabelControl(this.model.from, 'maxFrom', 'from');
                    // Set row's right control to label 'max'
                    this.createLabelControl(this.model.to, 'max', 'to', 'color-control-right-col');
                    this.createColorControl(this.model.to, 'max');
                } else {
                    if (i === 0) {
                        // Set row's left control to label 'min'
                        this.createLabelControl(this.model.from, 'min', 'from');
                        this.createInputControl(this.model.to, this.model.to.cid, 'to');
                    } else if (i === 1 && !this.displayMinMaxLabels) {
                        // Left control should be an input instead of a label
                        this.createInputControl(this.model.from, this.model.from.cid, 'from', 'color-control-left-col');
                        this.createInputControl(this.model.to, this.model.to.cid, 'to');
                    } else {
                        // Most range values get both label and input controls.
                        // Use previous range value to power label.
                        this.createLabelControl(this.model.from, this.model.from.cid, 'from');
                        this.createInputControl(this.model.to, this.model.to.cid, 'to', '');
                    }
                    this.createColorControl(this.model.to, this.model.to.cid);
                }
            },

            createInputControl: function(model, id, label, customClass) {
                var inputView = this.children['inputView_' + id] = new InputControl({
                    model: model,
                    label: _(label).t(),
                    customClass: customClass
                });
            },

            createLabelControl: function(model, id, label, customClass) {
                this.children['labelView_' + id] = new LabelControl({
                    model: model,
                    label: _(label).t(),
                    customClass: customClass
                });
            },

            createColorControl: function(model, id) {
                if (model.get('color') && model.get('color').length > 0) {
                    this.children['colorView_' + id] = new ColorControl({
                        model: model,
                        paletteColors: this.options.paletteColors
                    });
                }
            },

            render: function() {
                if (!this.el.innerHTML) {
                    this.el.innerHTML = this.compiledTemplate({
                        hideRemoveButton: this.options.hideRemoveButton
                    });
                }
                var $colorControlsPlaceholder = this.$('.color-controls-placeholder');
                // Detach all children so that their listeners are preserved when we empty their container.
                _(this.children).invoke('detach');
                $colorControlsPlaceholder.empty();
                _.each(this.children, function(childControl) {
                    childControl.render().appendTo($colorControlsPlaceholder);
                }, this);
                return this;
            },
            template: '\
                <div class="color-range-control-row">\
                    <div class="color-controls-placeholder"></div>\
                    <% if (!hideRemoveButton) { %>\
                        <div class="remove-range-container">\
                            <a class="remove-range btn-link" href="#">\
                                <i class="icon-x-circle"></i>\
                            </a>\
                        </div>\
                    <% } %>\
                </div>\
            '

    });

    });