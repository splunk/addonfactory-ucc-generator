define(
    [
        'underscore',
        'module',
        'views/Base',
        'views/shared/controls/ControlGroup',
        'views/shared/controls/SpinnerControl',
        'views/shared/controls/TextControl'
    ],
    function(
        _,
        module,
        BaseView,
        ControlGroup,
        SpinnerControl,
        TextControl
    ) {
        return BaseView.extend({
            moduleId: module.id,
            className: 'rangemap-range-row commandeditor-group',

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                var controlsArray = [];
                this.rowIndex = this.model.command.editorValue.collection.indexOf(this.model.command.editorValue);
                if (this.rowIndex === 0) {
                    controlsArray.push(new TextControl({
                        modelAttribute: 'lowerLimit',
                        model: this.model.command.editorValue,
                        size: 'small',
                        className: 'control range-lower-limit',
                        updateOnKeyUp: true
                    }));
                } else {
                    // Left range control is a disabled Text Input control
                    controlsArray.push(new TextControl({
                        modelAttribute: 'lowerLimit',
                        model: this.model.command.editorValue,
                        className: 'range-text',
                        size: 'small',
                        enabled: false
                    }));
                }

                controlsArray.push(new ControlGroup({
                    label: _('to').t(),
                    controlType: 'Text',
                    size: 'small',
                    controlOptions: {
                        modelAttribute: 'upperLimit',
                        model: this.model.command.editorValue,
                        className: 'range-upper-limit-input',
                        updateOnKeyUp: true
                    },
                    className: 'range-upper-limit'
                }));

                this.children.rangeControls = new ControlGroup({
                    label: _('Range').t(),
                    controls: controlsArray,
                    size: 'small',
                    className: 'rangemap-ranges'
                });

                this.children.label = new ControlGroup({
                    controlType: 'Text',
                    label: _('Range value').t(),
                    size: 'small',
                    controlOptions: {
                        model: this.model.command.editorValue,
                        modelAttribute: 'value',
                        updateOnKeyUp: true
                    }
                });
            },

            events: {
                'click .commandeditor-group-remove': function(e) {
                    e.preventDefault();
                    this.trigger('removeRow', { cid: this.model.command.editorValue.cid });
                }
            },

            render: function() {
                // As long as this row is not the first row, it can be removed
                if (this.rowIndex !== 0) {
                    this.$el.append('<a class="commandeditor-group-remove"><i class="icon-x"></i></a>');
                }
                this.children.rangeControls.render().appendTo(this.$el);

                this.children.label.render().appendTo(this.$el);

                this.$el.attr('id', this.model.command.editorValue.id);

                return this;
            }
        });
    }
);