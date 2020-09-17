define([
    'underscore',
    'jquery',
    'backbone',
    'views/shared/Modal',
    'module',
    'models/search/Report',
    'models/ACLReadOnly',
    'views/shared/alertcontrols/dialogs/clone_dialog/Clone',
    'views/shared/alertcontrols/dialogs/clone_dialog/Success'
    ],
    function(
        _,
        $,
        Backbone,
        Modal,
        module,
        ReportModel,
        ACLReadOnlyModel,
        Clone,
        Success
    ) {
    return Modal.extend({
            moduleId: module.id,
            /**
            * @param {Object} options {
            *   model: {
            *       savedAlert: <models.Report>,
            *       application: <models.Application>
            *   }
            * }
            */
            initialize: function() {
                Modal.prototype.initialize.apply(this, arguments);

                this.model.defaultReport = new ReportModel();
                this.defDefaultReport = this.model.defaultReport.fetch();

                this.model.inmem = this.model.savedAlert.clone();
                this.model.acl = new ACLReadOnlyModel($.extend(true, {}, this.model.savedAlert.entry.acl.toJSON()));

                //viewsapplication
                this.children.clone = new Clone({
                    model: {
                        application: this.model.application,
                        inmem: this.model.inmem,
                        acl: this.model.acl,
                        defaultReport: this.model.defaultReport
                    }
                });

                this.children.success = new Success({
                    model: {
                        application: this.model.application,
                        inmem: this.model.inmem
                    }
                });

                this.model.inmem.on('createSuccess', function(){
                    this.children.clone.$el.hide();
                    this.children.success.render().appendTo(this.$el);
                }, this);

                this.on("hidden", function() {
                    if (!this.model.inmem.isNew()) {
                        this.model.savedAlert.trigger('updateCollection');
                    }
                }, this);

            },
            render: function() {
                $.when(this.defDefaultReport).then(function() {
                    this.children.clone.render().appendTo(this.$el);
                }.bind(this));

                return this;
            }
        }
    );
});
