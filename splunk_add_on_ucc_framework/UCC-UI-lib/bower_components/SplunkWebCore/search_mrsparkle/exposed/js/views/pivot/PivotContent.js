define([
            'jquery',
            'underscore',
            'module',
            'models/shared/Application',
            'models/search/Job',
            'models/pivot/PivotReport',
            'views/extensions/DeclarativeDependencies',
            'views/Base',
            'views/shared/ReportVisualizer',
            'views/shared/statscontrols/StatsControlsMaster',
            'views/pivot/PivotElementsDisplay',
            'util/splunkd_utils',
            'helpers/Printer',
            'jquery.resize'
        ],
        function(
            $,
            _,
            module,
            Application,
            Job,
            PivotReport,
            DeclarativeDependencies,
            Base,
            ReportVisualizer,
            StatsControlsMaster,
            PivotElementsDisplay,
            splunkdUtils,
            Printer,
            jquery_resize
        ) {

    var GAUGE_MAX_HEIGHT = 500,
        SINGLE_VALUE_MAX_HEIGHT = 200;
            
    var PivotContent = Base.extend({

        moduleId: module.id,

        initialize: function() {
            Base.prototype.initialize.apply(this, arguments);
            this.flashMessages = this.options.flashMessages;

            this.$el.on('elementResize', function(e){
                this.invalidateReflow();
            }.bind(this));

            this.flashMessages.$el.on('elementResize', function(e) {
                this.invalidateReflow();
            }.bind(this));

            this.listenTo(Printer, Printer.PRINT_START, this.invalidateReflow);
            this.listenTo(Printer, Printer.PRINT_END, this.invalidateReflow);

            this.model.job.entry.content.on('change', this.updateData, this);
            this.flashMessagesHelper = this.flashMessages.flashMsgHelper;
            
            if(this.model.report.entry.content.get('display.general.type') === ReportVisualizer.GENERAL_TYPES.STATISTICS) {
                this.children.tableFormatBar = new StatsControlsMaster({
                    model: {
                        report: this.model.report,
                        job: this.model.job,
                        application: this.model.application,
                        user: this.model.user
                    }
                });

                this.children.elementsDisplay = new PivotElementsDisplay({
                    apiResources: this.apiResources.elementsDisplay
                });
            }
            
            this.children.reportVisualizer = new ReportVisualizer({
                model: {
                    config: this.model.report.entry.content,
                    application: this.model.application
                },
                allowResize: false,
                ignoreConfigHeight: true,
                enableTableDock: false,
                enableStaticHeader: true,
                enableEditing: true,
                numRowSplits: this.model.report.getNumRows()
            });

            // Create a container that will hold the Report Visualizer child view.
            // In `ignoreConfigHeight` mode the Report Visualizer will always set its
            // height and width to 100%, so this container DOM element is used to
            // control the dimensions of the Report Visualizer.
            this.$visualizerContainer = $('<div class="viz-container"/>');

            var vizMaxHeight = this._computeVizMaxHeight();
            if (_.isFinite(vizMaxHeight)) {
                this.$visualizerContainer.css({
                    'max-height': vizMaxHeight
                });
            }

            if (this.model.report.isComplete()) {
                this.model.searchData = this.children.reportVisualizer.getSearchDataModel();
                this.model.searchDataParams = this.children.reportVisualizer.getSearchDataParamsModel();

                this.model.searchData.fetchData.set(this.model.searchDataParams.attributes, { silent: true });
                Job.registerArtifactModel(this.model.searchData, this.model.job, Job.RESULTS_PREVIEW);
                this.flashMessagesHelper.register(this.model.searchData,
                    [splunkdUtils.FATAL, splunkdUtils.ERROR, splunkdUtils.WARNING]);
                this.listenTo(this.model.searchDataParams, 'change', function() {
                    this.model.searchData.fetchData.set(this.model.searchDataParams.attributes);
                });
                this.listenTo(this.model.searchData, 'change', function() {
                    this.model.searchData.set({
                        meta: {
                            done:  this.model.job.isDone()
                        }
                    }, { silent: true });
                });
            }
            this.listenTo(this.children.reportVisualizer, 'drilldown', function(clickInfo, options) {
                this.model.report.trigger('drilldown', clickInfo, options);
            });
        },

        render: function() {
            this.$el.empty();
            this.renderContainer();
            this.renderData();
            this.updateData();
            return this;
        },

        renderContainer: function() {
            if(this.flashMessages) {
                this.flashMessages.render().prependTo(this.$el);
            }
            if(this.children.elementsDisplay) {
                this.children.elementsDisplay.render().appendTo(this.$el);
            }
            this.$visualizerContainer.appendTo(this.$el);
            if(this.children.tableFormatBar) {
                this.children.tableFormatBar.render().appendTo(this.$el);
            }
        },

        updateData: function() {
            this.$('.data-display-alert').remove();
            var hasResults = !this.model.job.isPreparing() && this.model.job.resultCountSafe() > 0,
                jobContent = this.model.job.entry.content;

            if(hasResults) {
                this.showDataDisplay();
            }
            else if(!jobContent.get('isFailed') && !jobContent.get('isDone')) {
                this.hideDataDisplay();
                if(_.isEmpty(jobContent.toJSON())) {
                    return;
                }
                if(this.model.job.isQueued()) {
                    this.renderMessage('info', _('Waiting for queued job to start.').t());
                }
                else if(this.model.job.isParsing()) {
                    this.renderMessage('info', _('Parsing search.').t());
                }
                else if(this.model.job.isFinalizing()) {
                    this.renderMessage('info', _('Finalizing results.').t());
                }
                // the job is running
                else {
                    if(this.model.job.isRealtime()) {
                        this.renderMessage('info', _('No results yet found.').t());
                    }
                    else {
                        this.renderMessage('info', _('Waiting for results...').t());
                    }
                }
            }
            else {
                this.hideDataDisplay();
                this.renderMessage('error', _('Your search returned no results.').t());
            }
            this.trigger('updateData');
        },
        
        renderData: function() {
            this.children.reportVisualizer.load().activate().render();
            this.children.reportVisualizer.appendTo(this.$visualizerContainer);
            this.invalidateReflow();
        },

        clearData: function() {
            this.children.reportVisualizer.remove();
        },

        showDataDisplay: function() {
            this.children.reportVisualizer.wake().$el.show();
        },

        hideDataDisplay: function() {
            this.children.reportVisualizer.sleep().$el.hide();
        },

        renderMessage: function(type, text) {
            var messageHtml = _(this.messageTemplate).template({ type: type, text: text });
            if(this.children.elementsDisplay) {
                this.children.elementsDisplay.$el.after(messageHtml);
            }
            else {
                $(messageHtml).appendTo(this.$el);
            }
        },

        disable: function() {
            if(this.children.elementsDisplay) {
                this.children.elementsDisplay.disable();
            }
        },
        
        reflow: function() {
            var vizTop = this.flashMessages ? this.flashMessages.$el.outerHeight() : 0,
                vizBottom = 0;

            if(this.children.elementsDisplay) {
                vizTop += this.children.elementsDisplay.$el.outerHeight();
            }

            if(this.children.tableFormatBar) {
                vizBottom += this.children.tableFormatBar.$el.outerHeight();
            }
            this.$visualizerContainer.css({
                bottom: vizBottom,
                top: vizTop
            });
        },

        _computeVizMaxHeight: function() {
            var vizType = this.model.report.getVisualizationType();
            // TODO [sff] we shouldn't be special-casing gauges here, try to find a way to make this generic
            if(vizType === 'radialGauge' || vizType === 'markerGauge' || vizType === 'fillerGauge') {
                return GAUGE_MAX_HEIGHT;
            }
            if (vizType === 'singlevalue') {
                return SINGLE_VALUE_MAX_HEIGHT;
            }
            return Infinity;
        },
        
        remove: function() {
            if (this.model.searchData) {
                Job.unregisterArtifactModel(this.model.searchData, this.model.job);
                this.flashMessagesHelper.unregister(this.model.searchData);
            }
            $(this.$el).off('elementResize');
            this.flashMessages.$el.off('elementResize');
            return Base.prototype.remove.apply(this, arguments);
        },

        messageTemplate: '\
            <div class="alert alert-<%- type %> data-display-alert">\
                <i class="icon-alert"></i>\
                <%- text %>\
            </div>\
        '

    },
    {
        apiDependencies: {
            report: PivotReport,
            job: Job,
            application: Application,

            elementsDisplay: PivotElementsDisplay
        }
    });

    return DeclarativeDependencies(PivotContent);

});