define([
        'jquery',
        'underscore',
        'backbone',
        'module',
        'views/Base',
        'views/shared/jobstatus/samplingmode/Menu',
        'views/shared/jobstatus/samplingmode/Dialog',
        'splunk.util',
        'splunk.i18n'
    ],
    function($, _, Backbone, module, Base, RatioMenu, RatioDialog, splunkUtil, i18n) {
        return Base.extend({
            moduleId: module.id,
            /**
             * @constructor
             * @param options {
             *     model: {
             *         report: <models.search.Report>
             *         application: <models.Application>
             *     }
             * }
             */

            className: 'sampling-mode',
            initialize: function(options) {
                Base.prototype.initialize.apply(this, arguments);

                this.children.ratioMenu = new RatioMenu({
                    model: this.model.report.entry.content,
                    menuWidth: 'narrow'
                });
            
                this.activate();
            },
            startListening: function() {
                this.listenTo(this.children.ratioMenu, 'openRatioDialog', this.openRatioDialog);
            },
            openRatioDialog: function() {
                this.children.ratioDialog = new RatioDialog({
                    model: {
                        report: this.model.report,
                        application: this.model.application
                    },
                    onHiddenRemove: true
                });

                this.children.ratioDialog.render().appendTo($("body")).show();
                this.listenTo(this.children.ratioDialog, 'hidden', function(){
                    this.children.ratioMenu.focus();
                });
            },
            render: function() {
                this.children.ratioMenu.render().appendTo(this.$el);

                return this;
            }
        });
    }
);
