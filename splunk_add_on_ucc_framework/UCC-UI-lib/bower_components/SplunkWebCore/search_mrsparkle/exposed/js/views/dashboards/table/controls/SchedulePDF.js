define(
    [
        'module',
        'jquery',
        'underscore',
        'backbone',
        'util/console',
        'util/pdf_utils',
        'models/services/ScheduledView',
        'models/shared/Cron',
        'views/Base',
        'views/shared/Modal',
        'views/shared/controls/ControlGroup',
        'views/shared/EmailOptions',
        'views/shared/ScheduleSentence',
        'views/shared/FlashMessages',
        'uri/route',
        './SchedulePDF.pcss',
        'util/infodelivery_utils'
    ],
    function(
        module,
        $,
        _,
        Backbone,
        console,
        pdfUtils,
        ScheduledViewModel,
        Cron,
        BaseView,
        Modal,
        ControlGroup,
        EmailOptions,
        ScheduleSentence,
        FlashMessagesView,
        route,
        css,
        InfoUtils
    ){
        var ControlWrapper = BaseView.extend({
            render: function() {
                if(!this.el.innerHTML) {
                    this.$el.html(_.template(this.template, {
                        label: this.options.label || '',
                        controlClass: this.options.controlClass || '',
                        body: _.template(this.options.body||'')(this.model ? (this.model.toJSON ? this.model.toJSON() : this.model) : {})
                    }));
                }
                var target = this.$('.controls');
                _.each(this.options.children, function(child){
                    child.render().appendTo(target);
                });
                return this;
            },
            disable: function () {
                this.$el.find('a').attr('disabled', true);
            },
            enable: function () {
                this.$el.find('a').removeAttr('disabled');
            },
            template: '<label class="control-label"><%- label %></label><div class="controls <%- controlClass %>"><%= body %></div>'
        });

        var INFODEL_PREFIX = 'InfoDelivery_';

        return Modal.extend({
            moduleId: module.id,
            className: 'modal fade schedule-pdf modal-wide',
             /**
             * @param {Object} options {
             *     model: {
             *         scheduledView: <models.services.ScheduledView>,
             *         dashboard: <models.services.data.ui.Views>
             *     }
             * }
             */
            initialize: function() {
                Modal.prototype.initialize.apply(this, arguments);

                this.model.inmem = new ScheduledViewModel.Entry.Content(this.model.scheduledView.entry.content.toJSON());
                // default come froma different model.  Since this is async, we should only do as needed
                if (!this.model.inmem.get('action.email.papersize')){
                    pdfUtils.getEmailAlertSettings().done(_.bind(function(emailSettings) {
                        // Since async souble check that user hasn't set this yet
                        if (!this.model.inmem.get('action.email.papersize')){
                            this.model.inmem.set('action.email.papersize', emailSettings.entry.content.get('reportPaperSize'));
                        }
                    }, this));
                }
                if (!this.model.inmem.get('action.email.paperorientation')){
                    pdfUtils.getEmailAlertSettings().done(_.bind(function(emailSettings) {
                        // Since async souble check that user hasn't set this yet
                        if (!this.model.inmem.get('action.email.paperorientation')){
                            this.model.inmem.set('action.email.paperorientation', emailSettings.entry.content.get('reportPaperOrientation'));
                        }
                    }, this));
                }
                if (this.model.infoDeliveryAvailable) {
                    var curContentType = this.model.inmem.get("action.email.content_type");

                    //We only want to do this if we haven't already prefixed the content type with our info delivery prefix
                    //This is to ensure that we don't double-prefix our content type
                    if (curContentType && curContentType.indexOf(INFODEL_PREFIX) !== 0) {
                        // We need to enhance the default with our prefix
                        this.model.inmem.set("action.email.content_type", INFODEL_PREFIX + curContentType);
                    }
                }
                 var cronModel = this.model.cron = Cron.createFromCronString(this.model.inmem.get('cron_schedule') || '0 6 * * 1');
                 this.listenTo(cronModel, 'change', function(){
                     this.model.inmem.set('cron_schedule', cronModel.getCronString());
                 }, this);

                 var helpLink = route.docHelp(
                    this.model.application.get("root"),
                    this.model.application.get("locale"),
                    'learnmore.alert.email'
                );

                this.children.flashMessages = new FlashMessagesView({
                    model: {
                        scheduledView: this.model.scheduledView,
                        content: this.model.inmem
                    }
                });

                this.children.name = new ControlGroup({
                    controlType: 'Label',
                    controlOptions: {
                        modelAttribute: 'label',
                        model: this.model.dashboard.entry.content
                    },
                    label: _('Dashboard').t()
                });

                this.children.scheduleSentence = new ScheduleSentence({
                    model: {
                        cron: this.model.cron,
                        application: this.model.application,
                        infoDeliveryAvailable: this.model.infoDeliveryAvailable
                    },
                    lineOneLabel: _("Schedule").t(),
                    popdownOptions: {
                        attachDialogTo: '.modal:visible',
                        scrollContainer: '.modal:visible .modal-body:visible'
                    }
                });

                this.children.emailOptions = new EmailOptions({
                    model: {
                        state: this.model.inmem,
                        application: this.model.application,
                        infoDeliveryAvailable: this.model.infoDeliveryAvailable
                    },
                    toLabel: _('Email To').t(),
                    suffix: 'view'
                });

                this.children.paperSize = new ControlGroup({
                    className: 'control-group pdf-paper-size',
                    controlType: 'SyntheticSelect',
                    controlClass: 'control-block',
                    controlOptions: {
                        modelAttribute: 'action.email.papersize',
                        model: this.model.inmem,
                        items: [
                            { label: _("A2").t(), value: 'a2' },
                            { label: _("A3").t(), value: 'a3' },
                            { label: _("A4").t(), value: 'a4' },
                            { label: _("A5").t(), value: 'a5' },
                            { label: _("Letter").t(), value: 'letter' },
                            { label: _("Legal").t(), value: 'legal' }
                        ],
                        save: false,
                        toggleClassName: 'btn',
                        popdownOptions: {
                            attachDialogTo: '.modal:visible',
                            scrollContainer: '.modal:visible .modal-body:visible'
                        }
                    },
                    label: this.model.infoDeliveryAvailable ? _('PDF Paper Size').t() : _("Paper Size").t()
                });

                if(this.model.infoDeliveryAvailable) {
                    // override default scheduledView value for email message
                    this.model.inmem.set('action.email.message.view', 'A dashboard was generated for $name$');
                    this._initHasApp();
                } else {
                    this._initNoApp();
                }
            },
            /**
             * Initializes custom control groups if the app is installed.
             *
             * @private
             */
            _initHasApp: function () {
                this.children.paperLayout = new ControlGroup({
                    className: 'control-group',
                    controlType: 'SyntheticSelect',
                    controlOptions: {
                        modelAttribute: 'action.email.paperorientation',
                        model: this.model.inmem,
                        items: [
                            { label: _("Portrait").t(), value: 'portrait' },
                            { label: _("Landscape").t(), value: 'landscape' }
                        ],
                        save: false,
                        toggleClassName: 'btn',
                        popdownOptions: {
                            attachDialogTo: '.modal:visible',
                            scrollContainer: '.modal:visible .modal-body:visible'
                        }
                    },
                    label: _("PDF Paper Layout").t()
                });

                // default will show it disabled
                this.children.enableToggle = new ControlGroup({
                    className: 'control-group enable-toggle',
                    controlType: 'SyntheticSelect',
                    controlOptions: {
                        modelAttribute: 'is_scheduled',
                        model: this.model.inmem,
                        items: [
                            { label: _("Enabled").t(), value: true },
                            { label: _("Disabled").t(), value: false }
                        ],
                        save: false,
                        toggleClassName: 'btn',
                        popdownOptions: {
                            attachDialogTo: '.modal:visible',
                            scrollContainer: '.modal:visible .modal-body:visible'
                        }
                    },
                    label: _("Delivery").t()
                });

                this.children.previewLinks = new ControlWrapper({
                    body: '<div class="preview-actions">' +
                        '<span class="test-email"><a href="#" class="action-send-test">'+_("Send Test Email").t()+'</a></span>' +
                        '<a href="#" class="action-preview" data-name="html">'+_("Preview in Browser").t()+'</a> ' +
                        '<a href="#" class="action-preview" data-name="pdf">'+_("Preview PDF").t()+'</a>' +
                        '</div>'
                });

                // if is_scheduled is undefined initially, set to display enabled by default
                // note: not saved in backend yet, when pressing save is_scheduled will be updated
                if(_.isUndefined(this.model.inmem.get('is_scheduled'))) {
                    this.model.inmem.set('is_scheduled', true);
                }

                this.model.inmem.on('change:is_scheduled', this._toggleEnable, this);
            },
            /**
             * Initializes standard control groups if the app is NOT installed.
             *
             * @private
             */
            _initNoApp: function(){
                // Standard Papersize and Email Type
                this.children.paperLayout = new ControlGroup({
                    controlType: 'SyntheticRadio',
                    controlOptions: {
                        modelAttribute: 'action.email.paperorientation',
                        model: this.model.inmem,
                        items: [
                            { label: _("Portrait").t(), value: 'portrait' },
                            { label: _("Landscape").t(), value: 'landscape' }
                        ],
                        save: false
                    },
                    label: _("Paper Layout").t()
                });

                this.children.schedule = new ControlGroup({
                    controlType: 'SyntheticCheckbox',
                    controlOptions: {
                        modelAttribute: 'is_scheduled',
                        model: this.model.inmem,
                        save: false
                    },
                    label: _("Schedule PDF").t()
                });

                this.children.previewLinks = new ControlWrapper({
                    body: '<div class="preview-actions">' +
                        '<span class="test-email"><a href="#" class="action-send-test">'+_("Send Test Email").t()+'</a></span> ' +
                        '<a href="#" class="action-preview">'+_("Preview PDF").t()+'</a>' +
                        '</div>'
                });

                this.model.inmem.on('change:is_scheduled', this._toggle, this);
            },
            events: $.extend({}, Modal.prototype.events, {
                'click .action-send-test': function(e) {
                    e.preventDefault();
                    this.model.inmem.validate();
                    if(this.model.inmem.isValid()) {
                        var $status = this.$('.test-email'), flashMessages = this.children.flashMessages.flashMsgCollection;
                        $status.html(_("Sending...").t());

                        pdfUtils.sendTestEmail(
                                this.model.dashboard.entry.get('name'),
                                this.model.dashboard.entry.acl.get('app'),
                                this.model.inmem.get('action.email.to'),
                                {
                                    ccEmail: this.model.inmem.get('action.email.cc'),
                                    bccEmail: this.model.inmem.get('action.email.bcc'),
                                    emailSubject: this.model.inmem.get('action.email.subject.view'),
                                    emailMessage: this.model.inmem.get('action.email.message.view'),
                                    paperSize: this.model.inmem.get('action.email.papersize'),
                                    paperOrientation: this.model.inmem.get('action.email.paperorientation'),
                                    emailContentType: this.model.inmem.get("action.email.content_type"),
                                    sendPDF: this.model.inmem.get("action.email.sendpdf"),
                                    sendTestEmail: '1'
                                }
                        ).done(function(){
                                    $status.html('<i class="icon-check"></i> '+_("Email sent.").t());
                        }).fail(function(error){
                                    $status.html('<span class="error"><i class="icon-warning-sign"></i> '+_("Failed!").t()+'</span>');
                                    if(error) {
                                        flashMessages.add({
                                            type: 'warning',
                                            html: _("Sending the test email failed: ").t() + _.escape(error)
                                        });
                                    }
                                }).always(function(){
                                    setTimeout(function(){
                                        $status.html('<a href="#" class="action-send-test">'+_("Send Test Email").t()+'</a>');
                                    }, 5000);
                                });
                    }
                },
                // for both preview in browser and pdf
                'click .action-preview': function(e) {
                    e.preventDefault();

                    // get the value that the user has currently selected
                    var orientationSuffix = '',
                        orientation = this.model.inmem.get('action.email.paperorientation'),
                        pageSize = this.model.inmem.get('action.email.papersize') || 'a2';

                    if(orientation === 'landscape') {
                        orientationSuffix = '-landscape';
                    }

                    var exportFormat = $(e.currentTarget).attr('data-name');

                    // if info delivery is installed, make request to app server
                    if(this.model.infoDeliveryAvailable && exportFormat != 'pdf') {
                        // either pdf or hmtl

                        InfoUtils.dashboardDownload(this.model.application.get('app'), this.model.application.get('page'), this.options.sids, exportFormat, true, {
                            // since not saved in scheduled view, pass PDF options just in case
                            orientation: orientation,
                            pageSize: pageSize
                        });

                    // perform pdf gen preview if not installed
                    } else {
                        pdfUtils.getRenderURL(
                            this.model.dashboard.entry.get('name'), this.model.dashboard.entry.acl.get('app'), {
                                'paper-size': pageSize + orientationSuffix,
                                'inline': '1'
                            }
                        ).done(function(url){
                            window.open(url);
                        });
                    }

                },
                'click .modal-btn-primary': function(e){
                    e.preventDefault();
                    this.model.inmem.validate();

                    if(this.model.inmem.isValid()) {
                        //use == instead of === in first part of conditional to cover false and 0
                        if(this.model.inmem.get('is_scheduled') == false && this.model.scheduledView.entry.content.get('is_scheduled') === false) {
                            this.hide();
                        } else {
                            this.model.scheduledView.entry.content.set(this.model.inmem.toJSON());
                            var modal = this;
                            this.model.scheduledView.save({},{success: function(){
                                modal.hide();
                            }});
                        }
                    }
                }
            }),
            // PRIVATE METHODS
            /**
             * Only runs when the app is not installed. Once the select button is pressed the scheduling
             * options will be displayed, otherwise they are hidden.
             *
             * @private
             */
            _toggle: function() {
                var action = this.model.inmem.get('is_scheduled') ? 'show' : 'hide';

                this.children.scheduleSentence.$el[action]();
                this.$emailOptions[action]();
                this.children.paperSize.$el[action]();
                this.children.paperLayout.$el[action]();
                this.children.previewLinks.$el[action]();
            },
            /**
             *  Helper method to handle enabling and disabling of the info delivery scheduling.
             *
             * @private
             */
            _toggleEnable: function () {
                var childList = $.extend(true, this.children.emailOptions.children, this.children.scheduleSentence.children);

                if(this.model.inmem.get('is_scheduled')) {
                    this.children.previewLinks.enable();
                    _.each(childList, function (item) {
                        item.enable();
                        item.$el.find('a').removeAttr('disabled');
                    });
                } else {
                    this.children.previewLinks.disable();
                    _.each(childList, function (item) {
                        item.disable();
                        item.$el.find('a').attr('disabled', true);
                    });
                }
            },
            /**
             * Only runs when the app is installed. Displays PDF options and preview links based on the email type.
             *
             * @private
             */
            _toggleApp: function(){

                var emailTypeCases = function() {
                    // Lets check the content type without
                    var contentType = this.model.inmem.get("action.email.content_type").replace(INFODEL_PREFIX, '');
                    var sendPdf = true;
                    switch(contentType) {
                        case "html":
                            this.children.paperLayout.hide();
                            this.children.paperSize.hide();
                            this.$('.action-preview[data-name*="pdf"]').hide();
                            this.$('.action-preview[data-name*="html"]').show();
                            sendPdf = false;
                            break;
                        case "html_pdf":
                            this.children.paperLayout.show();
                            this.children.paperSize.show();
                            this.$('.action-preview[data-name*="pdf"]').show();
                            this.$('.action-preview[data-name*="html"]').show();
                            break;
                        case "plain_pdf":
                            this.children.paperLayout.show();
                            this.children.paperSize.show();
                            this.$('.action-preview[data-name*="pdf"]').show();
                            this.$('.action-preview[data-name*="html"]').hide();
                            break;
                    }

                    this.model.inmem.set("action.email.sendpdf", sendPdf);
                }.bind(this);
                // to set by default
                emailTypeCases();

                this.model.inmem.on('change:action.email.content_type', emailTypeCases);
            },
            /**
             * Determines what version of the modal to load based on the info delivery flags. Will load the vanilla version
             * of the app if there was an error with the data retrieved.
             *
             * @returns {exports}
             */
            render: function() {
                this.$el.html(Modal.TEMPLATE);
                this.children.flashMessages.render().prependTo(this.$(Modal.BODY_SELECTOR));
                this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL_COMPLEX);

                if(this.model.infoDeliveryAvailable){
                    this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Schedule Delivery for ").t() + this.model.dashboard.entry.content.get('label'));
                    this.children.enableToggle.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));
                    this.$(Modal.BODY_FORM_SELECTOR).append('<hr>');
                    this.children.scheduleSentence.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));
                } else {
                    this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Edit PDF Schedule").t());
                     // both of these are hidden in app view
                    this.children.name.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));
                    this.children.schedule.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));
                    this.children.scheduleSentence.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));
                }

                this.$(Modal.BODY_FORM_SELECTOR).append('<fieldset class="email-options outline"></fieldset>');
                this.$emailOptions = this.$el.find('.email-options');
                this.children.emailOptions.render().appendTo(this.$emailOptions);

                this.children.paperSize.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));
                this.children.paperLayout.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));

                this.children.previewLinks.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));

                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_SAVE);

                if(this.model.infoDeliveryAvailable) {
                    this._toggleApp();
                    // remove border around email options
                    this.$('.email-options').removeClass('outline');
                    this._toggleEnable();
                } else {
                   this._toggle();
                }
                return this;
            }
        });
    }
);
