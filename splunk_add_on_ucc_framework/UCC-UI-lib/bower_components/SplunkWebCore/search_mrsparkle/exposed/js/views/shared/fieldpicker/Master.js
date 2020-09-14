define(
    [
        'jquery',
        'underscore',
        'models/Base',
        'module',
        'views/shared/Modal',
        'views/shared/fieldpicker/controls/Master',
        'views/shared/fieldpicker/table/Master',
        './Master.pcss'
    ],
    function($, _, BaseModel, module, ModalView, ControlsView, Table, css) {
        var View = ModalView.extend({
            moduleId: module.id,
            /**
             * Caveat Emptor: This is a very old view originally from the timeline but later promoted to shared.
             *
             * @param {Object} options {
             *     model: {
             *         summary: <model.services.search.job.SummaryV2>,
             *         searchJob: <models.Job>,
             *         report: <models.services.SavedSearch>,
             *         application: <models.Application>
             *     }
             *     collections: {
             *         selectedFields: <collections.SelectedFields>,
             *     },
             *     enableExtract: <Boolean> IFX button at top/bottom
             * }
             */
            initialize: function(options) {
                this.$el.removeClass('fade');
                options || (options = {});
                ModalView.prototype.initialize.apply(this, arguments);
                this.model.state = new BaseModel();
                this.children.controlsTop = new ControlsView({
                    model: {
                        report: this.model.report,
                        searchJob: this.model.searchJob,
                        application: this.model.application,
                        state: this.model.state
                    },
                    enableExtract: options.enableExtract
                });

                this.children.table = new Table({
                    collection: {
                        selectedFields: this.collection.selectedFields
                    },
                    model: {
                        report: this.model.report,
                        state: this.model.state,
                        searchJob: this.model.searchJob,
                        application: this.model.application,
                        summary: this.model.summary
                    }
                });

            },
            render: function() {
                this.$el.html(ModalView.TEMPLATE);
                this.$(ModalView.HEADER_TITLE_SELECTOR).html(_('Select Fields').t());
                this.children.controlsTop.render().appendTo(this.$(ModalView.BODY_SELECTOR));
                this.children.table.render().appendTo(this.$(ModalView.BODY_SELECTOR));

                return this;
            }
        },
        {
            create: function(options) {
                options || (options = {});
                var view = new View($.extend(true, {onHiddenRemove: false}, options));
                view.render().appendTo($('body')).show();
                return view;
            }
        });
        return View;
});
