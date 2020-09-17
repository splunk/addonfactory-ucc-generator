define([
    'jquery',
    'underscore',
    'models/Base',
    'module',
    'views/shared/Modal',
    'views/shared/controls/ControlGroup',
    'views/shared/FlashMessages',
    'uri/route',
    'util/pdf_utils',
    'util/validation',
    'util/splunkd_utils',
    'helpers/user_agent',
    'splunk.util'
    ],
    function(
        $,
        _,
        Base,
        module,
        Modal,
        ControlGroup,
        FlashMessagesV2,
        route,
        pdfUtils,
        validationUtils,
        splunkd_utils,
        userAgent,
        splunkUtil
    ) {
    return Modal.extend({
        moduleId: module.id,
         /**
         * @param {Object} options {
         *      model: {
         *          searchJob: <helpers.ModelProxy>,
         *          application: <models.Application>,
         *          report: <models.Report> (Only required for export to pdf. If passed in pdf will be a format option.)
         *      }
         *      verifyJobExistsExport: <Boolean> Defaults to False, if true the job will be fetched before
         *                       results are exported to insure the job has not expired.
         * }
         */
        initialize: function(options) {
            Modal.prototype.initialize.apply(this, arguments);
            var Inmem = Base.extend({
                defaults: {
                    fileName: '',
                    format: 'csv',
                    maxResults: '',
                    maxRowsPerTable: '1000'
                },
                validation: {
                    maxResults: {
                        fn: 'validateMaxResults'
                    },
                    maxRowsPerTable: {
                        fn: 'validatemaxRowsPerTable'
                    },
                    format: {
                        fn: 'validateFormat'
                    }
                },
                validateMaxResults: function(value, attr, computedState) {
                    if (computedState.format !== 'pdf' && !_.isEmpty(value) && !validationUtils.isPositiveValidInteger(value)) {
                        return _('The Number of Results field must be an integer greater than 0 or remain empty.').t();
                    }
                },
                validatemaxRowsPerTable: function(value, attr, computedState) {
                    if (computedState.format === 'pdf' && !validationUtils.isPositiveValidInteger(value)) {
                        return _('The Number of Results field must be an integer greater than 0.').t();
                    }
                },
                validateFormat: function(value, attr, computedState) {
                    if (computedState.format === 'pdf' && !(options.model.report && !options.model.report.isNew())) {
                        return _('Invalid format').t();
                    }
                }
            });
            
            var defaults = {
                verifyJobExistsExport: false
            };
            
            _.defaults(this.options, defaults);
            
            this.title = _("Export Results").t();
            
            this.model = {
                searchJob: this.model.searchJob,
                application: this.model.application,
                report: this.model.report,
                reportPristine: this.model.reportPristine,
                inmem: new Inmem()
            };
            
            this.children.flashMessage = new FlashMessagesV2({ model: this.model.inmem });
            
            this.deferredPdfAvailable = $.Deferred();
            this.deferredInitializeFormat = $.Deferred();
            
            this.usePanelType = options.usePanelType;
            this.resultTypeIsReport = this.usePanelType ? (this.model.report.entry.content.get('display.general.type') !== 'events') : this.model.searchJob.isReportSearch();
            
            if (this.model.report && !this.model.report.isNew()) {
                this.deferredPdfAvailable = pdfUtils.isPdfServiceAvailable();
            } else {
                this.deferredPdfAvailable.resolve(false);
            }
            
            $.when(this.deferredPdfAvailable).then(function(available) {
                var items = [
                    {
                        label: _('CSV').t(),
                        value: 'csv'
                    },
                    {
                        label: _('XML').t(),
                        value: 'xml'
                    },
                    {
                        label: _('JSON').t(),
                        value: 'json'
                    }
                ];
                
                if (available && (!this.model.reportPristine || !this.model.report.isDirty(this.model.reportPristine))) {
                    items.unshift({
                        label: _('PDF').t(),
                        value: 'pdf'
                    });
                }
                
                if (!this.resultTypeIsReport) {
                    items.unshift({
                        label: _('Raw Events').t(),
                        value: 'raw'
                    });
                }
                
                this.children.formatControl = new ControlGroup({
                    controlType: 'SyntheticSelect',
                    controlOptions: {
                        modelAttribute: 'format',
                        model: this.model.inmem,
                        items: items,
                        save: false,
                        toggleClassName: 'btn',
                        labelPosition: 'outside',
                        elastic: true,
                        popdownOptions: {
                            attachDialogTo: '.modal:visible',
                            scrollContainer: '.modal:visible .modal-body:visible'
                        }
                    },
                    label: _('Format').t()
                });
                
                this.deferredInitializeFormat.resolve();
            }.bind(this));
            
            this.children.filenameControl = new ControlGroup({
                controlType: 'Text',
                controlOptions: {
                    modelAttribute: 'fileName',
                    model: this.model.inmem,
                    placeholder: _('optional').t()
                },
                label: _('File Name').t(),
                tooltip: _('If left blank, a file is created using the search job ID as the filename. The search job ID is the UNIX time when the search was run. For example "1463687468_7.csv".').t()
            });
            
            this.children.maxResultsControl = new ControlGroup({
                controlType: 'Text',
                controlOptions: {
                    modelAttribute: 'maxResults',
                    model: this.model.inmem,
                    placeholder: _('leave blank to export all results').t()
                },
                label: _('Number of Results').t()
            });

            this.children.maxRowsPerTableControl = new ControlGroup({
                controlType: 'Text',
                controlOptions: {
                    modelAttribute: 'maxRowsPerTable',
                    model: this.model.inmem
                },
                label: _('Number of Results').t()
            });
                        
            this.model.inmem.on('change:format', this.toggleByFormat, this);
            
            this.model.inmem.on('validated', function(isValid, model, invalidResults){
                if(isValid) {
                    if (this.options.verifyJobExistsExport) {
                        this.model.searchJob.fetch({
                            success: function(model, response) {
                                this.exportResults();
                            }.bind(this),
                            error: function(model, response) {
                                if (response.status == splunkd_utils.NOT_FOUND) {
                                    this.model.searchJob.trigger('jobStatus:notFound', { title: this.title });
                                    this.hide();
                                } else {
                                    this.exportResults();
                                }
                            }.bind(this)
                        });
                    } else {
                        this.exportResults();
                    }
                }
            },this);
        },
        
        exportResults: function() {
            var format = this.model.inmem.get('format'),
                maxResults = (_.isEmpty(this.model.inmem.get('maxResults'))) ? 0 : this.model.inmem.get('maxResults');

            if (format === 'pdf') {
                var orientationSuffix = '',
                    orientation = this.model.report.entry.content.get('action.email.reportPaperOrientation'),
                    pageSize = this.model.report.entry.content.get('action.email.reportPaperSize') || 'a2';
                if(orientation === 'landscape') {
                    orientationSuffix = '-landscape';
                }
                pdfUtils.getRenderURL(
                    this.model.report.entry.get('name'),
                    this.model.report.entry.acl.get('app'),
                    {
                        'sid': this.model.searchJob.id,
                        'paper-size': pageSize + orientationSuffix,
                        'max-rows-per-table': this.model.inmem.get('maxRowsPerTable')
                    },
                    'report'
                ).done(function(url){
                    this.$el.removeClass('fade'); //Fix for SPL-96295
                    this.hide();
                    window.open(url);
                }.bind(this));
            } else {
                window.location.href = route.exportUrl(this.model.application.get("root"), this.model.application.get("locale"), this.model.searchJob.get('id'),
                    this.model.inmem.get('fileName'), this.model.inmem.get('format'), maxResults, this.resultTypeIsReport);
                this.hide();
            }
        },
        events: $.extend({}, Modal.prototype.events, {
            'click .btn-primary': function(e) {
                this.model.inmem.validate();
                e.preventDefault();
            }
        }),
        toggleByFormat: function() {
            if(this.model.inmem.get('format') === 'pdf') {       
                this.children.filenameControl.$el.hide();
                this.children.maxResultsControl.$el.hide();
                this.children.maxRowsPerTableControl.$el.show();
                this.$(".rerun-msg").hide();
            } else {
                this.children.filenameControl.$el.show();
                this.children.maxResultsControl.$el.show();
                this.children.maxRowsPerTableControl.$el.hide();
                this.$(".rerun-msg").show();
            }
        },
        render : function() {
            $.when(this.deferredInitializeFormat).then(function() {
                this.$el.html(Modal.TEMPLATE);
                
                if (userAgent.isIE()) {   //SPL-112957: Fix for modal backdrop in IE
                    this.$el.removeClass("fade");
                }
                
                this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Export Results").t());
                
                this.children.flashMessage.render().prependTo(this.$(Modal.BODY_SELECTOR));
                
                this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL_JUSTIFIED);
                
                this.children.formatControl.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));
                this.children.filenameControl.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));
                this.children.maxResultsControl.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));
                this.children.maxRowsPerTableControl.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));
                
                this.toggleByFormat();

                var learnMoreLink = route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'learnmore.search.export_results'
                );

                if (this.model.searchJob.searchWillReRun()) {
                    if (this.model.searchJob.entry.content.get('isRemoteTimeline')) {
                        this.$(Modal.BODY_FORM_SELECTOR).append('<div class="rerun-msg">' + _('Your search will rerun. ').t() +
                            '<a href="' + learnMoreLink + '" target="_blank">' + _('Learn more').t() + ' <i class="icon-external"></i></a>' +
                            '</div>');
                    } else {
                        this.$(Modal.BODY_FORM_SELECTOR).append('<div class="rerun-msg">' + splunkUtil.sprintf(_('Your search will rerun if the number of results is higher than %s. ').t(), splunkUtil.getCommaFormattedNumber(this.model.searchJob.entry.content.get('eventAvailableCount'))) +
                            '<a href="' + learnMoreLink + '" target="_blank">' + _('Learn more').t() + ' <i class="icon-external"></i></a>' +
                            '</div>');
                    }
                }

                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$(Modal.FOOTER_SELECTOR).append('<a href="#" class="btn btn-primary modal-btn-primary">' + _("Export").t() + '</a>');
                
                return this;
            }.bind(this));
        }
    });
});
