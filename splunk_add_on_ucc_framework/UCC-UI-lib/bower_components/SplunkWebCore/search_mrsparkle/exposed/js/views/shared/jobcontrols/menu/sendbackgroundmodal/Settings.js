define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'views/shared/controls/ControlGroup',
        'views/shared/FlashMessages',
        'views/shared/Modal',
        'splunk.util',
        'uri/route',
        'util/console'
     ],
     function(
        $,
        _,
        module,
        Base,
        ControlGroup,
        FlashMessages,
        Modal,
        splunkUtil,
        route,
        console
     ){
        return Base.extend({
            moduleId: module.id,
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);

                this.children.flashMessages = new FlashMessages({
                    model: {
                        inmen: this.model.inmem
                    }
                });

                var configEmailHelpLink = route.docHelp(
                    this.model.application.get("root"),
                    this.model.application.get("locale"),
                    'learnmore.alert.email'
                );

                //email checkbox
                this.children.email = new ControlGroup({
                    label: _("Email when complete").t(),
                    controlType:'SyntheticCheckbox',
                    controlOptions: {
                        model: this.model.inmem,
                        modelAttribute: 'email',
                        value: true
                    },
                    help: splunkUtil.sprintf(_('Email must be configured in System&nbsp;Settings > Alert&nbsp;Email&nbsp;Settings. %s').t(), ' <a href="' + configEmailHelpLink + '" target="_blank">' + _("Learn More").t() + ' <i class="icon-external"></i></a>')
                });

                //email subject
                this.children.subject = new ControlGroup({
                    label: _("Email Subject Line").t(),
                    controlType:'Text',
                    controlOptions: {
                        model: this.model.inmem,
                        modelAttribute: 'subject'
                    }
                });

                //email addresses
                this.children.addresses = new ControlGroup({
                    label: _("Email Addresses").t(),
                    controlType:'Textarea',
                    controlOptions: {
                        model: this.model.inmem,
                        modelAttribute: 'addresses'
                    },
                    help: _('Comma separated list.').t()
                });

                //include results
                /*
                 * TODO: the backend does not support attaching the results to the background
                 * finish email. When it does, add this back.
                this.children.results = new ControlGroup({
                    label: "Include Results",
                    controlType:'SyntheticRadio',
                    controlOptions: {
                        className: "btn-group btn-group-2",
                        items: [
                            { value: 'none', label: 'None' },
                            { value: 'text', label: 'Text' },
                            { value: 'csv', label: 'CSV' },
                            { value: 'csv', label: 'PDF' }
                        ],
                        model: this.model.inmem,
                        modelAttribute: 'results'
                    }
                });
                */
                
                this.model.inmem.on("change:email", function(){
                    var shouldEmail = this.model.inmem.get("email");
                    if (shouldEmail) {
                        this.children.subject.$el.show();
                        this.children.addresses.$el.show();
                        //this.children.results.$el.show();
                    } else {
                        this.children.subject.$el.hide();
                        this.children.addresses.$el.hide();
                       //this.children.results.$el.hide();
                    }
                }, this);
            },
            events: {
                "click .modal-btn-primary" : function(e) {
                    e.preventDefault();
                    $.when(this.model.inmem.sendToBackground()).then(function(){
                        var fetch = this.model.inmem.fetch();
                        
                        $.when(fetch).then(function() {
                            this.model.inmem.trigger('saveSuccess');
                        }.bind(this));
                    }.bind(this));
                }
            },
            render: function() {
                this.$el.html(Modal.TEMPLATE);

                this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Send Job to Background").t());

                this.children.flashMessages.render().prependTo(this.$(Modal.BODY_SELECTOR));

                this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);
                
                this.children.email.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));
                this.children.subject.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));
                this.children.addresses.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));
                //this.children.results.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));
                this.children.subject.$el.hide();
                this.children.addresses.$el.hide();
                //this.children.results.$el.hide();

                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$(Modal.FOOTER_SELECTOR).append('<a class="btn btn-primary modal-btn-primary">' + _("Send to Background").t() + '</a>');

                return this;
            }
        });
    }
);
