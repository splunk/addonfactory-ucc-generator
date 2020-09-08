/**
 * @author jszeto
 * @date 12/6/13
 *
 * Wrapper view with a results table subview. If the results table has no results, then we show an error message instead.
 * The error message is passed in by the parent since it the wording is usually context sensitive.
 *
 * Inputs:
 *
 *  resultsTableClass {View} The class to use to generate the results table. Default is views/shared/results_table/ResultsTableMaster
 *  tableOptions {Object} The options to pass to the results table upon creation.
 *  noResultsMessage {Object}
 *      type {string} The type of message (splunkDUtils.ERROR | splunkDUtils.WARNING | splunkDUtils.INFO)
 *      html {string} The message text
 *  model {Object} The model object to pass to the resultsTableClass. It must contain a results model.
 *      results {models/services/search/jobs/ResultJsonRows} contains the rows and fields for the results
 *
 *
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/Base',
    'views/shared/results_table/ResultsTableMaster',
    'views/shared/FlashMessages',
    'util/splunkd_utils'
],
    function (
        $,
        _,
        Backbone,
        module,
        BaseView,
        ResultsTableMaster,
        FlashMessagesView,
        splunkdUtils
        ) {

        var ResultsTableContainer = BaseView.extend({
            moduleId: module.id,

            initialize: function(options) {
                BaseView.prototype.initialize.call(this, options);

                _(options).defaults({resultsTableClass: ResultsTableMaster, tableOptions: {}});
                _(options.tableOptions).defaults({enableTableDock: true, className: "scrolling-table-wrapper"});
                options.tableOptions.model = this.model;

                this.model.searchData.on("sync", this.resultsRowsChangeHandler, this);

                // Create the results table
                this.children.resultsTable = new options.resultsTableClass(options.tableOptions);

                // re-broadcast any events that come from the results table
                this.listenTo(this.children.resultsTable, 'all', this.trigger);
                this.children.flashMessagesView = new FlashMessagesView({
                    model:[this.model.searchData],
                    whitelist: [splunkdUtils.ERROR, splunkdUtils.INFO]
                });
            },

            setAddSamplesEnabled: function(isEnabled) {
                if(_(this.children.resultsTable.setAddSamplesEnabled).isFunction()) {
                    this.children.resultsTable.setAddSamplesEnabled(isEnabled);
                }
            },

            resultsRowsChangeHandler: function() {
                var rows = this.model.searchData.get("rows");
                if (!rows || rows.length == 0) {
                    if(!this.model.searchJob.isDone()) {
                        this.children.flashMessagesView.flashMsgHelper.removeGeneralMessage(ResultsTableContainer.NO_RESULTS_ID);
                        this.children.flashMessagesView.flashMsgHelper.addGeneralMessage(
                            ResultsTableContainer.WAITING_ID,
                            {
                                type: splunkdUtils.INFO,
                                html: _("Waiting for results...").t()
                            }
                        );
                    }
                    else {
                        this.children.flashMessagesView.flashMsgHelper.removeGeneralMessage(ResultsTableContainer.WAITING_ID);
                        this.children.flashMessagesView.flashMsgHelper.addGeneralMessage(ResultsTableContainer.NO_RESULTS_ID,
                            this.options.noResultsMessage);
                    }
                } else {
                    this.children.flashMessagesView.flashMsgHelper.removeGeneralMessage(ResultsTableContainer.NO_RESULTS_ID);
                    this.children.flashMessagesView.flashMsgHelper.removeGeneralMessage(ResultsTableContainer.WAITING_ID);
                }
            },

            render: function() {
                // Detach children

                // Use template
                this.$el.html(this.compiledTemplate({}));

                // Attach children and render them
                this.children.resultsTable.render().appendTo(this.$(".results-table-placeholder"));
                this.children.flashMessagesView.render().appendTo(this.$(".flash-messages-placeholder"));
                return this;
            },

            invalidateReflow: function() {
                BaseView.prototype.invalidateReflow.apply(this, arguments);
                this.children.resultsTable.invalidateReflow();
            },

            template: '\
                <div class="results-table-placeholder"></div>\
                <div class="flash-messages-placeholder" style="height:100%;"></div>\
            '
        },
        {
            NO_RESULTS_ID : "__NO_RESULTS_ID__",
            WAITING_ID: "__WAITING_ID__",
            NO_RESULTS_MSG : "No results found."

        });

        return ResultsTableContainer;

    });

