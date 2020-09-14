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

            this.children.triggerCondition = new  ControlGroup({
                controlType: 'SyntheticSelect',
                controlClass: 'controls-block',
                label: _('Trigger alert when').t(),
                controlOptions: {
                    items: [
                        {
                            value: 'per_result',
                            label: _('Per-Result').t(),
                            description: _('Triggers whenever search returns a result.').t()
                        },
                        {
                            value: 'events',
                            label: _('Number of Results').t(),
                            description: _('Triggers based on a number of search results during a rolling-window of time.').t()
                        },
                        {
                            value: 'hosts',
                            label: _('Number of Hosts').t(),
                            description: _('Triggers based on a number of hosts during a rolling-window of time.').t()
                        },
                        {
                            value: 'sources',
                            label: _('Number of Sources').t(),
                            description: _('Triggers based on a number of sources during a rolling-window of time.').t()
                        },
                        {
                            value: 'custom',
                            label: _('Custom').t(),
                            description: _('Triggers based on a custom condition during a rolling-window time.').t()
                        }
                    ],
                    model: this.model.alert.entry.content,
                    modelAttribute: 'ui.realtime.triggercondition',
                    toggleClassName: 'btn dropdown-toggle-search-mode',
                    menuClassName: 'dropdown-menu-search-mode dropdown-menu-noscroll',
                    popdownOptions: {
                        attachDialogTo: '.modal:visible',
                        scrollContainer: '.modal:visible .modal-body:visible'
                    }
                }
            });

            this.children.comparativeGroup = new ControlGroup({
                controlClass: 'controls-split input-prepend',
                controls: [
                    new SyntheticSelectControl ({
                        modelAttribute: 'ui.realtime.resultscomparator',
                        model: this.model.alert.entry.content,
                        items: [
                            { label: _('is greater than').t(), value: 'greater than' },
                            { label: _('is less than').t(), value: 'less than' },
                            { label: _('is equal to').t(), value: 'equal to' },
                            { label: _('is not equal to').t(), value: 'not equal to' }
                        ],
                        toggleClassName: 'btn',
                        popdownOptions: {
                            attachDialogTo: '.modal:visible',
                            scrollContainer: '.modal:visible .modal-body:visible'
                        }
                    }),
                    new TextControl({
                        modelAttribute: 'ui.realtime.resultscomparatorinput',
                        model: this.model.alert.entry.content
                    })
                ]
            });

            this.children.customInput = new ControlGroup({
                className: 'alert-name custom-condition control-group',
                controlType: 'Text',
                controlClass: 'controls-block',
                help: _('e.g. "search count > 10". Evaluated against the results of the base search.').t(),
                controlOptions: {
                    model: this.model.alert.entry.content,
                    modelAttribute: 'ui.realtime.customsearch'
                }
            });

            this.children.rollingTimeWindow = new ControlGroup({
                label: _('in').t(),
                controlClass: 'controls-split input-append',
                controls: [
                    new TextControl({
                        modelAttribute: 'ui.realtime.resultstime',
                        model: this.model.alert.entry.content
                    }),
                    new SyntheticSelectControl({
                        modelAttribute: 'ui.realtime.resultstimeunit',
                        model: this.model.alert.entry.content,
                        items: [
                            { label: _('minute(s)').t(), value: 'm' },
                            { label: _('hour(s)').t(), value: 'h' },
                            { label: _('day(s)').t(), value: 'd' }
                        ],
                        toggleClassName: 'btn',
                        popdownOptions: {
                            attachDialogTo: '.modal:visible',
                            scrollContainer: '.modal:visible .modal-body:visible'
                        }
                    })
                ]
            });
            this.listenTo(this.model.alert.entry.content, 'change:ui.realtime.triggercondition', this.toggleTriggerConstraints);
        },
        toggleTriggerConstraints: function() {
            switch(this.model.alert.entry.content.get('ui.realtime.triggercondition')){
                case 'per_result':
                    this.children.customInput.$el.hide();
                    this.children.comparativeGroup.$el.hide();
                    this.children.rollingTimeWindow.$el.hide();
                    break;
                case 'events':
                case 'hosts':
                case 'sources':
                    this.children.rollingTimeWindow.$el.show();
                    this.children.comparativeGroup.$el.show();
                    this.children.customInput.$el.hide();
                    break;
                case 'custom':
                    this.children.rollingTimeWindow.$el.show();
                    this.children.customInput.$el.show();
                    this.children.comparativeGroup.$el.hide();
                    break;
            }
        },
        render: function() {
            this.children.triggerCondition.render().appendTo(this.$el);
            this.children.comparativeGroup.render().appendTo(this.$el);
            this.children.customInput.render().appendTo(this.$el);
            this.children.rollingTimeWindow.render().appendTo(this.$el);
            this.toggleTriggerConstraints();
            return this;
        }
    });
});

