/**
 * @author usaha 
 * @date 1/24/14
 *
 * Set of controls that go at the top of a drilldown pane. 
 *
 * Inputs:
 *
 *     model {object}
 *         page {Backbone.Model} model used for controlling the number of table rows to display per page. Expects a "count" attribute
 *         paginatorState {Backbone.Model} model used for the SearchResultsPaginator
 *         searchJob {models/search/Job} model for the search job
 *
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/Base',
    'views/shared/SearchResultsPaginator',
    'views/shared/controls/ControlGroup',
    'views/shared/controls/SyntheticSelectControl',
    'views/shared/jobstatus/Spinner',
    'views/shared/jobstatus/Count',
    'collections/Base'
],
    function ($, _, Backbone, module, BaseView,
              SearchResultsPaginator,
              ControlGroup,
              SyntheticSelectControl,
              Spinner,
              Count,
              BaseCollection) {

        return BaseView.extend({
            moduleId:module.id,

            events: {
                'click .back-to-regex-link': function(e) {
                    this.trigger("backToRegexClicked"); 
                }
            },
            initialize:function (options) {
                BaseView.prototype.initialize.call(this, options);

                this.children.spinner = new Spinner({model: this.model.searchJob});
                this.children.count = new Count({model: this.model.searchJob});

                // Select the number of results per page
                this.children.pageCount = new SyntheticSelectControl({
                    menuWidth: "narrow",
                    className: "btn-group pull-left",
                    items: [
                        {value: 10, label: '10 per page'},
                        {value: 20, label: '20 per page'},
                        {value: 50, label: '50 per page'},
                        {value: 100, label: '100 per page'}
                    ],
                    model: this.model.page,
                    modelAttribute: 'count',
                    toggleClassName: 'btn-pill'
                });

                this.children.paginator = new SearchResultsPaginator({model: {
                                                                state: this.model.paginatorState,
                                                                searchJob: this.model.searchJob,
                                                                results: this.model.results
                                                            },
                                                            collection: new BaseCollection(),
                                                            mode: this.options.reportType});

                this.model.rowInfo.on("change", this.renderValueStats, this); 
                this.model.results.on("change:post_process_count", this.renderValueStats, this); 
   
            },

            renderValueStats: function() {
                if (this.model.results.get("post_process_count")) { 
                    this.$(".value-stats").html(this.model.results.get("post_process_count") + " matches for " + this.model.rowInfo.get("field") + "=" + this.model.rowInfo.get("value") ); 
                }
            }, 
            render: function() {
                this.$el.html(this.compiledTemplate({}));

                this.children.pageCount.render().appendTo(this.$(".page-count-placeholder"));
                this.children.paginator.render().appendTo(this.$(".paginator-placeholder"));
                this.renderValueStats(); 
                return this;
            },
            template: '\
                <div class="back-button-container">\
                        <a href="#" class="back-to-regex-link"><i class="icon-chevron-left icon-no-underline"></i><span><%- _("Back to regex").t() %></span></a>\
                </div>\
                <div class="divider"></div>\
                <div class="value-stats-container">\
                    <div class="value-stats pull-left"></div>\
                    <div class="page-count-placeholder"></div>\
                    <div class="paginator-placeholder pull-right"></div>\
                </div>'
        });

    });

