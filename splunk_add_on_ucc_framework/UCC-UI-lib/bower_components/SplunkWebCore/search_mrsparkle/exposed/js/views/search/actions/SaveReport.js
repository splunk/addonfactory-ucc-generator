define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'views/shared/reportcontrols/dialogs/savereport/Master',
        'util/general_utils',
        'bootstrap.tooltip'
     ],
     function($, _, module, Base, SaveDialog, util /* undefined */) {
        return Base.extend({
            tagName: "span",
            moduleId: module.id,
            className: 'save-report',
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
            },
            startListening: function() {
                this.listenTo(this.model.report.entry.content, 'change', this.render);
                this.listenTo(this.model.report, 'sync', this.render);
                this.listenTo(this.model.searchJob, 'prepared', this.render);
            },
            events: {
                'click a.btn-pill:not(.disabled)': function(e) {
                    this.children.saveDialog = new SaveDialog({
                        model: {
                            report: this.model.report,
                            reportPristine: this.model.reportPristine,
                            application: this.model.application,
                            searchJob: this.model.searchJob,
                            user: this.model.user
                        },
                        onHiddenRemove: true
                    });
                    
                    this.children.saveDialog.render().appendTo($('body'));
                    this.children.saveDialog.show();

                    e.preventDefault();
                },
                'click a.disabled': function(e) {
                    e.preventDefault();
                }
            },
            remove: function() {
                this.$el.tooltip('destroy');
            },
            render: function() {
                var canWrite = this.model.report.canWrite(this.model.user.canScheduleSearch(), this.model.user.canRTSearch()),
                    isEmbedded = util.normalizeBoolean(this.model.report.entry.content.get('embed.enabled')),
                    isDirty, template;
                
                if (canWrite && !this.model.searchJob.isPreparing()) {
                    isDirty = this.model.report.isDirty(this.model.reportPristine);
                    template = this.compiledTemplate({
                        _: _,
                        report: this.model.report,
                        isDirty: isDirty,
                        isEmbedded: isEmbedded
                    });                    
                } else {
                    template = "";
                }
                
                this.$el.html(template);

                this.$el.tooltip('destroy');
                if (isEmbedded) {
                    this.$el.tooltip({
                        animation: false, 
                        title: _('You cannot save changes to this report because it is embedded in an external website, dashboard, or portal.').t(), 
                        container: this.$el
                    });
                }
                return this;
            },
            template: '\
                <% if (!report.isNew() && isDirty && !isEmbedded) { %>\
                    <a class="btn-pill" href="#"><%- _("Save").t() %></a>\
                <% } else {%>\
                    <a class="btn-pill disabled" href="#"><%- _("Save").t() %></a>\
                <% } %>\
            '
        });
    }
);
