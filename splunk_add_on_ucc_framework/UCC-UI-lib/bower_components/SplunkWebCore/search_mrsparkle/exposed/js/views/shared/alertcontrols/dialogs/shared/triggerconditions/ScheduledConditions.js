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
                            value: 'events',
                            label: _('Number of Results').t(),
                            description: _('Triggers based on a number of search results during a scheduled search.').t()
                        },
                        {
                            value: 'hosts',
                            label: _('Number of Hosts').t(),
                            description: _('Triggers based on a number of hosts during a scheduled search.').t()
                        },
                        {
                            value: 'sources',
                            label: _('Number of Sources').t(),
                            description: _('Triggers based on a number of sources during a scheduled search.').t()
                        },
                        {
                            value: 'custom',
                            label: _('Custom').t(),
                            description: _('Triggers based on a custom condition during a scheduled search.').t()
                        }
                    ],
                    model: this.model.alert.entry.content,
                    modelAttribute: 'ui.scheduled.triggercondition',
                    toggleClassName: 'btn dropdown-toggle-search-mode',
                    menuClassName: 'dropdown-menu-search-mode dropdown-menu-noscroll',
                    popdownOptions: {
                        attachDialogTo: '.modal:visible',
                        scrollContainer: '.modal:visible .modal-body:visible'
                    }
                }
            });
            
            this.children.comparativeGroup = new ControlGroup ({
                controlClass: 'controls-split input-prepend',
                controls: [
                    new SyntheticSelectControl ({
                        modelAttribute: 'ui.scheduled.resultscomparator',
                        model: this.model.alert.entry.content,
                        items: [
                            { label: _('is greater than').t(), value: 'greater than' },
                            { label: _('is less than').t(), value: 'less than' },
                            { label: _('is equal to').t(), value: 'equal to' },
                            { label: _('is not equal to').t(), value: 'not equal to' },
                            { label: _('drops by').t(), value: 'drops by' },
                            { label: _('rises by').t(), value: 'rises by' }
                        ],
                        toggleClassName: 'btn',
                        popdownOptions: {
                            attachDialogTo: '.modal:visible',
                            scrollContainer: '.modal:visible .modal-body:visible'
                        }
                    }),
                    new TextControl ({
                        modelAttribute: 'ui.scheduled.resultsinput',
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
                    modelAttribute: 'ui.scheduled.customsearch'
                }
            });
            this.listenTo(this.model.alert.entry.content, 'change:ui.scheduled.triggercondition',
                this.toggleTriggerConstraints);
        },
        toggleTriggerConstraints: function() {
            switch(this.model.alert.entry.content.get('ui.scheduled.triggercondition')){
                case 'events':
                case 'hosts':
                case 'sources':
                    this.children.comparativeGroup.$el.show();
                    this.children.customInput.$el.hide();
                    break;
                case 'custom':
                    this.children.comparativeGroup.$el.hide();
                    this.children.customInput.$el.show();
                    break;
            }
        },
        render: function() {
            this.children.triggerCondition.render().appendTo(this.$el);
            this.children.comparativeGroup.render().appendTo(this.$el);
            this.children.customInput.render().appendTo(this.$el);
            this.toggleTriggerConstraints();
            return this;
        }
    });
});
