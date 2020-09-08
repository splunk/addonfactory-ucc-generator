define(
    [
        'underscore',
        'views/Base',
        'module',
        'views/shared/controls/ControlGroup',
        'views/shared/controls/SyntheticSelectControl',
        'views/shared/controls/TextControl'
    ], 
    function(
        _,
        BaseView,
        module,
        ControlGroup,
        SyntheticSelectControl,
        TextControl
    ) {
    return BaseView.extend({
        moduleId: module.id,
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);

            this.children.executeActions = new ControlGroup({
                className: 'alert-type control-group',
                controlType: 'SyntheticRadio',
                controlClass: 'controls-halfblock',
                controlOptions: {
                    modelAttribute: 'ui.executeactions',
                    model: this.model.alert.entry.content,
                    items: [
                        { label: _('Once').t(), value: true },
                        { label: _('For each result').t(), value: false }
                    ]
                },
                label: _('Trigger').t()
            });

            this.children.throttle = new ControlGroup({
                className: 'control-group',
                controlType: 'SyntheticCheckbox',
                controlOptions: {
                    modelAttribute: 'alert.suppress',
                    model: this.model.alert.entry.content
                },
                tooltip: _('After an alert is triggered, subsequent alerts will not be triggered until after the throttle period.').t(),
                label: _('Throttle').t()
            });

            this.children.fieldValue = new ControlGroup({
                className: 'alert-name control-group',
                controlType: 'Text',
                controlClass: 'controls-block',
                controlOptions: {
                    modelAttribute: 'alert.suppress.fields',
                    model: this.model.alert.entry.content
                },
                label: _('Suppress results containing field value').t()
            });

            this.children.supressTime = new ControlGroup({
                label:_('Suppress triggering for').t(),
                controlClass: 'controls-split input-append',
                controls: [
                    new TextControl({
                        modelAttribute: 'ui.supresstime',
                        model: this.model.alert.entry.content
                    }),
                    new SyntheticSelectControl({
                        modelAttribute: 'ui.supresstimeunit',
                        model: this.model.alert.entry.content,
                        items: [
                            { label: _('second(s)').t(), value: 's' },
                            { label: _('minute(s)').t(), value: 'm' },
                            { label: _('hour(s)').t(), value: 'h' },
                            { label: _('day(s)').t(), value: 'd' }
                        ],
                        toggleClassName: 'btn',
                        labelPosition: 'outside',
                        popdownOptions: {
                            attachDialogTo: '.modal:visible',
                            scrollContainer: '.modal:visible .modal-body:visible'
                        }
                    })

                ]
            });

            this.listenTo(this.model.alert.entry.content, 'change:ui.realtime.triggercondition change:ui.type',
                this.toggleThrottle);

            this.listenTo(this.model.alert.entry.content, 'change:alert.suppress change:ui.executeactions change:ui.realtime.triggercondition change:ui.type',
                this.toggleThrottleOptions);
        },
        toggleThrottle: function() {
            if (this.model.alert.entry.content.get('ui.type') === 'realtime' &&
                this.model.alert.entry.content.get('ui.realtime.triggercondition') === 'per_result') {
                this.children.executeActions.$el.hide();
            } else {
                this.children.executeActions.$el.show();
            }
        },
        toggleThrottleOptions: function() {
            if (this.model.alert.entry.content.get('alert.suppress')) {
                this.$el.find('.throttle-options').addClass('outline');
                if (!this.model.alert.entry.content.get('ui.executeactions') ||
                    (this.model.alert.entry.content.get('ui.type') === 'realtime' &&
                        this.model.alert.entry.content.get('ui.realtime.triggercondition') === 'per_result')) {
                    this.children.fieldValue.$el.show();
                } else {
                    this.children.fieldValue.$el.hide();
                }
                this.children.supressTime.$el.show();
            } else {
                this.$el.find('.throttle-options').removeClass('outline');
                this.children.fieldValue.$el.hide();
                this.children.supressTime.$el.hide();
            }
        },
        render: function() {
            this.children.executeActions.render().appendTo(this.$el);
            this.$el.append('<fieldset class="throttle-options"></fieldset>');
            var $throttleOptions = this.$el.find('.throttle-options');
            this.children.throttle.render().appendTo($throttleOptions);
            this.children.fieldValue.render().appendTo($throttleOptions);
            this.children.supressTime.render().appendTo($throttleOptions);
            this.toggleThrottle();
            this.toggleThrottleOptions();
            return this;
        }
    });
});

