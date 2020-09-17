define(
        [
            'jquery',
            'underscore',
            'module',
            'views/Base',
            'views/shared/Modal',
            'views/shared/EmailOptions',
            'views/shared/controls/ControlGroup',
            'views/shared/controls/SyntheticCheckboxControl',
            'views/shared/controls/SyntheticSelectControl',
            'views/shared/FlashMessages',
            'splunk.util',
            'uri/route',
            'util/console',
            'util/pdf_utils'
        ],
        function(
            $,
            _,
            module,
            Base,
            Modal,
            EmailOptions,
            ControlGroup,
            SyntheticCheckboxControl,
            SyntheticSelectControl,
            FlashMessage,
            splunkUtil,
            route,
            console,
            pdfUtils
        )
        {
        return Base.extend({
            moduleId: module.id,
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);

                //deferrs
                this.deferredPdfAvailable = pdfUtils.isPdfServiceAvailable();

                //views
                this.children.flashMessage = new FlashMessage({ model: this.model.inmem });

                var warningMessage = this.model.inmem.get('schedule_warning_message');
                if (warningMessage) {
                    this.children.flashMessage.flashMsgHelper.addGeneralMessage('schedule_warning_message', warningMessage);
                }

                var configEmailHelpLink = route.docHelp(
                        this.model.application.get("root"),
                        this.model.application.get("locale"),
                        'learnmore.alert.email'
                );

                var emailHelpText;
                if (this.model.serverInfo && this.model.serverInfo.isLite()) {
                    emailHelpText = _('Email must be configured in Server&nbsp;Settings > Email&nbsp;Settings. %s').t();
                } else {
                    emailHelpText = _('Email must be configured in System&nbsp;Settings > Alert&nbsp;Email&nbsp;Settings. %s').t();
                }

                this.children.sendEmailBox = new ControlGroup({
                    controlType: 'SyntheticCheckbox',
                    controlOptions: {
                        modelAttribute: 'action.email',
                        model: this.model.inmem.entry.content
                    },
                    label: _('Send Email').t(),
                    help: splunkUtil.sprintf(emailHelpText, ' <a href="' + configEmailHelpLink + '" target="_blank">' + _("Learn More").t() + ' <i class="icon-external"></i></a>')
                });

                var includeControls = [
                    new SyntheticCheckboxControl({
                        modelAttribute: 'action.email.include.view_link',
                        model: this.model.inmem.entry.content,
                        label: _('Link to Report').t()
                    }),
                    new SyntheticCheckboxControl({
                        modelAttribute: 'action.email.include.results_link',
                        model: this.model.inmem.entry.content,
                        label: _('Link to Results').t()
                    }),
                    new SyntheticCheckboxControl({
                        modelAttribute: 'action.email.include.search',
                        model: this.model.inmem.entry.content,
                        label: _('Search String').t()
                    }),
                    new SyntheticCheckboxControl({
                        additionalClassNames: 'include-inline',
                        modelAttribute: 'action.email.inline',
                        model: this.model.inmem.entry.content,
                        label: _('Inline').t()
                    }),
                    new SyntheticSelectControl({
                        additionalClassNames: 'include-inline-format',
                        modelAttribute: 'action.email.format',
                        menuWidth: 'narrow',
                        model: this.model.inmem.entry.content,
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
                        modelAttribute: 'action.email.sendcsv',
                        model: this.model.inmem.entry.content,
                        label: _('Attach CSV').t()
                    })
                ];

                $.when(this.deferredPdfAvailable).then(function(pdfAvailable) {
                    if (pdfAvailable) {
                        includeControls.push(
                            new SyntheticCheckboxControl({
                                modelAttribute: 'action.email.sendpdf',
                                model: this.model.inmem.entry.content,
                                label: _('Attach PDF').t()
                            })
                        );
                    }

                    this.children.emailOptions = new EmailOptions({
                        model: {
                            state: this.model.inmem.entry.content,
                            application: this.model.application
                        },
                        includeControls: includeControls,
                        suffix: 'report',
                        includeSubjectDefaultPlaceholder: true
                    });

                }.bind(this));

                this.children.runScriptBox = new ControlGroup({
                    controlType: 'SyntheticCheckbox',
                    controlOptions: {
                        modelAttribute: 'action.script',
                        model: this.model.inmem.entry.content
                    },
                    label: _('Run a Script').t()
                });

                this.children.scriptFilename = new ControlGroup({
                    controlType: 'Text',
                    controlOptions: {
                        modelAttribute: 'action.script.filename',
                        model: this.model.inmem.entry.content
                    },
                    label: _('Filename').t(),
                    help: splunkUtil.sprintf(_('Located in %s or %s').t(), '$SPLUNK_HOME/bin/scripts', '$SPLUNK_HOME/etc/'+ this.model.application.get('app') + '/bin/scripts')
                });

                //event listeners
                this.model.inmem.entry.content.on('change:action.email', this.toggleEmail, this);
                this.model.inmem.entry.content.on('change:action.script', this.toggleScript, this);

                this.model.inmem.entry.content.on('change:action.email.format', function(){
                    this.model.inmem.entry.content.set('action.email.inline', 1);
                }, this);

            },
            events: {
                "click .btn-primary" : function(e) {
                    var actions = [];
                    
                    _.each(this.model.inmem.entry.content.attributes, function(value, attr) {
                        if (value == true) {
                            var actionName = attr.match(/^action.([^\.]*)$/);
                            if (actionName) {
                                actions.push(actionName[1]);
                            }
                        }
                    });

                    this.model.inmem.entry.content.set('actions', actions.join(', '));
                    this.model.inmem.trigger('saveSchedule');
                    e.preventDefault();
                },
                "click .back" : function(e) {
                    this.model.inmem.entry.content.trigger('back');
                    e.preventDefault();
                }
            },
            toggleEmail: function() {
                if (this.model.inmem.entry.content.get('action.email')) {
                    this.children.emailOptions.$el.show();
                } else {
                    this.children.emailOptions.$el.hide();
                }
            },
            toggleScript: function() {
                if (this.model.inmem.entry.content.get('action.script')) {
                    this.children.scriptFilename.$el.show();
                } else {
                    this.children.scriptFilename.$el.hide();
                }
            },
            render: function() {
                $.when(this.deferredPdfAvailable).then(function() {
                    this.$el.html(Modal.TEMPLATE);

                    this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Edit Schedule").t());

                    this.children.flashMessage.render().prependTo(this.$(Modal.BODY_SELECTOR));

                    this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL_COMPLEX);

                    if (this.model.user.isFree()) {
                        var freeHelpLink = route.docHelp(
                            this.model.application.get('root'),
                            this.model.application.get('locale'),
                            'learnmore.license.features');
                        this.children.sendEmailBox.disable();
                        this.children.runScriptBox.disable();
                        this.$(Modal.BODY_FORM_SELECTOR).append(this.compiledTemplate({
                            _: _,
                            splunkUtil: splunkUtil,
                            link: ' <a href="' + freeHelpLink + '" target="_blank">' + _("Learn More").t() + ' <i class="icon-external"></i></a>'
                        }));
                    }

                    this.$(Modal.BODY_FORM_SELECTOR).append('<p class="control-heading">' + _('Enable Actions').t() + '</p>');

                    this.children.sendEmailBox.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));
                    this.children.emailOptions.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));
                    this.children.runScriptBox.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));
                    this.children.scriptFilename.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));

                    this.$(Modal.FOOTER_SELECTOR).append('<a href="#" class="btn back pull-left">' + _('Back').t() + '</a>');
                    this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_SAVE);

                    this.toggleEmail();
                    this.toggleScript();
                    
                    return this;
                }.bind(this));
            },
            template: '\
                <div class="alert alert-info">\
                    <i class="icon-alert"></i>\
                    <%= splunkUtil.sprintf(_("Scheduling Actions is an Enterprise-level feature. It is not available with Splunk Free. %s").t(), link) %>\
                </div>\
            '
        });
    }
);
