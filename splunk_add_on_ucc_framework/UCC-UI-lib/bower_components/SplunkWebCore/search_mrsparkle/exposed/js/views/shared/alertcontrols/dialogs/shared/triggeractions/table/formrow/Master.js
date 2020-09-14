define(
    [
        'underscore',
        'views/Base',
        'views/shared/alertcontrols/dialogs/shared/triggeractions/table/formrow/SendEmailOptions',
        'views/shared/alertcontrols/dialogs/shared/triggeractions/table/formrow/RunScriptOptions',
        'views/shared/alertcontrols/dialogs/shared/triggeractions/table/formrow/ListOptions',
        'views/shared/alertcontrols/dialogs/shared/triggeractions/table/formrow/ModAlertOptions',
        'module'
    ], 
    function(
        _,
        BaseView,
        EmailOptionsView,
        RunScriptOptionsView,
        ListOptionsView,
        ModAlertOptionsView,
        module
    ) {
    return BaseView.extend({
        moduleId: module.id,
        tagName: 'tr',
        className: 'more-info',
        attributes: function() {
            return {
                'data-name': this.model.selectedAlertAction.entry.get('name')
            };
        },
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);

            this.children.sendEmailOptions = new EmailOptionsView({
                pdfAvailable: this.options.pdfAvailable,
                model: {
                    alert: this.model.alert,
                    application: this.model.application
                }
            });

            this.children.runScriptOptions = new RunScriptOptionsView({
                model: {
                    alert: this.model.alert,
                    application: this.model.application
                }
            });

            this.children.listOptions = new ListOptionsView({
                model: {
                    alert: this.model.alert
                }
            });

            this.listenTo(this.model.selectedAlertAction, 'remove', this.remove);
        },
        render: function() {
            var actionName = this.model.selectedAlertAction.entry.get('name');
            this.$el.html(this.compiledTemplate({
                _: _
            }));

            switch (actionName) {
                case 'email':
                    this.children.sendEmailOptions.render().appendTo(this.$('td'));
                    break;
                case 'script':
                    this.children.runScriptOptions.render().appendTo(this.$('td'));
                    break;
                case 'list':
                    this.children.listOptions.render().appendTo(this.$('td'));
                    break;
                default:
                    this.children[actionName + 'ModAlertOptions'] = new ModAlertOptionsView({
                        model: {
                            alert: this.model.alert,
                            alertAction: this.model.selectedAlertAction,
                            alertActionUI: this.model.alertActionUI,
                            application: this.model.application
                        }
                    }).render().appendTo(this.$('td'));
                    break;
            }

            if (!this.model.selectedAlertAction.get('isExpanded')) {
                this.$el.hide();
            }

            return this;
        },
        template: '\
            <td colspan="2"></td>\
        '
    });
});

