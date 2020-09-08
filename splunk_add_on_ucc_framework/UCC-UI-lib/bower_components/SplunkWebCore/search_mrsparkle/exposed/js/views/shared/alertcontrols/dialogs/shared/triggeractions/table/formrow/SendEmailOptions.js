define(
    [
        'underscore',
        'backbone',
        'module',
        'views/Base',
        'views/shared/EmailOptions',
        'views/shared/controls/SyntheticCheckboxControl',
        'views/shared/controls/SyntheticSelectControl'
    ],
    function(_,
        Backbone,
        module,
        Base,
        EmailOptions,
        SyntheticCheckboxControl,
        SyntheticSelectControl
    ) {
        return Base.extend({
            moduleId: module.id,
            tagName: 'form',
            className: 'form-horizontal form-complex',
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);

                var includeControls = [
                    new SyntheticCheckboxControl({
                        modelAttribute: 'action.email.include.view_link',
                        model: this.model.alert.entry.content,
                        label: _('Link to Alert').t()
                    }),
                    new SyntheticCheckboxControl({
                        modelAttribute: 'action.email.include.results_link',
                        model: this.model.alert.entry.content,
                        label: _('Link to Results').t()
                    }),
                    new SyntheticCheckboxControl({
                        modelAttribute: 'action.email.include.search',
                        model: this.model.alert.entry.content,
                        label: _('Search String').t()
                    }),
                    new SyntheticCheckboxControl({
                        additionalClassNames: 'include-inline',
                        modelAttribute: 'action.email.inline',
                        model: this.model.alert.entry.content,
                        label: _('Inline').t()
                    }),
                    new SyntheticSelectControl({
                        additionalClassNames: 'include-inline-format',
                        modelAttribute: 'action.email.format',
                        menuWidth: 'narrow',
                        model: this.model.alert.entry.content,
                        items: [
                            { label: _('Table').t(), value: 'table' },
                            { label: _('Raw').t(), value: 'raw' },
                            { label: _('CSV').t(), value: 'csv' }
                        ],
                        labelPosition: 'outside',
                        popdownOptions: {
                            attachDialogTo: '.modal:visible',
                            scrollContainer: '.modal:visible .modal-body:visible'
                        }
                    }),
                    new SyntheticCheckboxControl({
                        modelAttribute: 'action.email.include.trigger',
                        model: this.model.alert.entry.content,
                        label: _('Trigger Condition').t()
                    }),
                    new SyntheticCheckboxControl({
                        modelAttribute: 'action.email.sendcsv',
                        model: this.model.alert.entry.content,
                        label: _('Attach CSV').t()
                    }),
                    new SyntheticCheckboxControl({
                        modelAttribute: 'action.email.include.trigger_time',
                        model: this.model.alert.entry.content,
                        label: _('Trigger Time').t()
                    })
                ];
                
                if (this.options.pdfAvailable) {
                    includeControls.push(
                        new SyntheticCheckboxControl({
                            modelAttribute: 'action.email.sendpdf',
                            model: this.model.alert.entry.content,
                            label: _('Attach PDF').t()
                        })
                    );
                }

                this.children.emailOptions = new EmailOptions({
                    model: {
                        state: this.model.alert.entry.content,
                        application: this.model.application
                    },
                    includeControls: includeControls,
                    suffix: 'alert',
                    includeSubjectDefaultPlaceholder: true
                });

                this.model.alert.entry.content.on('change:action.email.format', function(){
                    if (!this.model.alert.get('action.email.inline')) {
                        this.model.alert.set('action.email.inline', 1);
                    }
                }, this);
            },
            render: function()  {
                this.children.emailOptions.render().appendTo(this.$el);
                return this;
            }
        });
});
