/**
 * @author claral
 * @date 4/20/16
 *
 */
define([
        'jquery',
        'underscore',
        'module',
        'views/Base'
    ],
    function (
        $,
        _,
        module,
        BaseView
    ) {

        return BaseView.extend({
            moduleId: module.id,

            events: {
                'click .new-report-button': function(e) {
                    e.preventDefault();
                    this.onNewReportButton();
                },
                'click .new-alert-button': function(e) {
                    e.preventDefault();
                    this.onNewAlertButton();
                }
            },

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
            },

            onNewReportButton: function() {
                this.model.controller.trigger("newReport");
            },

            onNewAlertButton: function() {
                this.model.controller.trigger("newAlert");
            },

            render: function () {
                var html = this.compiledTemplate({
                    showAlertButton: this.model.user.canScheduleSearch() && this.model.user.canUseAlerts()
                });

                this.$el.html(html);

                return this;
            },

            template:
                '<a href="#" class="btn new-report-button"><%- _("New Report").t() %></a>\
                <% if (showAlertButton) { %>\
                    <a href="#" class="btn new-alert-button"><%- _("New Alert").t() %></a>\
                <% } %>'
        });
    });

