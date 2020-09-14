/**
 * @author jszeto
 * @date 10/28/13
 *
 * Set of controls that go at the top of a preview pane. These include a events count control, a sample size dropdown,
 * a page count dropdown and a paginator
 *
 * Inputs:
 *
 *     model {object}
 *         page {Backbone.Model} model used for controlling the number of table rows to display per page. Expects a "count" attribute
 *         paginatorState {Backbone.Model} model used for the SearchResultsPaginator
 *         sampleSize {Backbone.Model} model used for SelectSampleSize. Expects a "sampleSize" attribute
 *         searchJob {models/search/Job} model for the search job
 *
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/Base',
    './SelectSampleSize',
    './SelectPageCount',
    'views/shared/SearchResultsPaginator',
    'views/shared/controls/ControlGroup',
    'views/shared/jobstatus/Spinner',
    'views/shared/jobstatus/Count',
    'collections/Base'
],
    function ($, _, Backbone, module, BaseView,
              SelectSampleSize,
              SelectPageCount,
              SearchResultsPaginator,
              ControlGroup,
              Spinner,
              Count,
              BaseCollection) {

        return BaseView.extend({
            moduleId:module.id,

            initialize:function (options) {
                BaseView.prototype.initialize.call(this, options);

                this.children.spinner = new Spinner({model: this.model.searchJob});
                this.initializeCount(options);

                // Generate the controls that persist for the view's lifetime
                this.children.selectSampleSize = new SelectSampleSize({model:this.model.state, modelAttribute:"sampleSize"});

                // Select the number of results per page
                this.children.pageCount = new SelectPageCount({
                    model: this.model.page
                });

                this.children.paginator = this.options.paginator;

            },

            initializeCount: function(options) {
                this.children.count = new Count({model: this.model.searchJob});
            },


            render: function() {
                this.$el.html(this.compiledTemplate({}));

                this.children.spinner.render().appendTo(this.$(".spinner-container"));
                this.children.count.render().appendTo(this.$(".count-container"));

                this.children.selectSampleSize.render().appendTo(this.$(".select-sample-size-placeholder"));
                this.children.pageCount.render().appendTo(this.$(".page-count-placeholder"));
                this.children.paginator.render().appendTo(this.$(".paginator-placeholder"));

                return this;
            },

            template: '\
                <div class="job-status-row">\
                    <div class="spinner-container"></div>\
                    <div class="count-container"></div>\
                    <div class="paginator-placeholder pull-right"></div>\
                    <div class="page-count-placeholder pull-right"></div>\
                </div>\
                <div class="controls-row">\
                    <div class="select-sample-size-placeholder pull-left"></div>\
                </div>'
        });

    });

