define(
    [
        'underscore',
        'backbone',
        'module',
        'views/shared/Modal',
        'views/shared/MultiStepModal',
        'views/shared/alertcontrols/dialogs/shared/Save',
        'views/shared/alertcontrols/dialogs/shared/SuccessEdit',
        'views/shared/alertcontrols/dialogs/shared/CanNotEdit'
    ],
    function(
        _,
        Backbone,
        module,
        ModalView,
        MultiStepModal,
        SaveView,
        SuccessView,
        CanNotEditView
    ){
    return MultiStepModal.extend({
        /**
         * @param {Object} options {
         *     model: {
         *         alert: <models.search.Alert>,  
         *         application: <models.Application>,
         *         user: <models.services.authentication.User> (Only required for type:typeandtrigger),
         *         serverInfo: <models.services.server.ServerInfo> (Only required for type:typeandtrigger)
         *         controller: <Backbone.Model> (Optional)
         *     },
         *     collection: {
         *         alertActions: <collections.shared.ModAlertActions>(Only required for type:actions)
         *         searchBNFs: <collections/services/configs/SearchBNFs> (Optional) Only needed if the showSearchField is true.
         *     }
         *     showSearchField: <Boolean> Whether to show an editable search field. Default false.
         * }
         */
        moduleId: module.id,
        className: ModalView.CLASS_NAME + ' ' + ModalView.CLASS_MODAL_WIDE + ' alert-edit',
        initialize: function() {
            MultiStepModal.prototype.initialize.apply(this, arguments);
            var defaults = {
                showSearchField: false
            };

            _.defaults(this.options, defaults);

            //model
            this.model.inmem = this.model.alert.clone();
            if (this.model.alert.canNotEditInUI()) {
                this.children.canNotEdit = new CanNotEditView({
                    model: {
                        alert: this.model.inmem,
                        application: this.model.application
                    }
                });
            } else {
                this.children.edit = new SaveView({
                    model:  {
                        alert: this.model.inmem,
                        application: this.model.application,
                        user: this.model.user,
                        serverInfo: this.model.serverInfo
                    },
                    collection: {
                        alertActions: this.collection.alertActions.deepClone(),
                        searchBNFs: this.collection.searchBNFs
                    },
                    mode: 'edit',
                    showSearchField: this.options.showSearchField
                });

                this.children.success = new SuccessView({
                    model: {
                        application: this.model.application
                    }
                });
          
                this.listenTo(this.model.inmem, 'sync', function() {
                    this.stepViewStack.setSelectedView(this.children.success);
                    this.children.success.focus();
                });

                this.on("hidden", function() {
                    if (this.model.inmem.get("updated") > this.model.alert.get("updated")) {
                        // SPL-106370 Apply in-memory state, so we don't loose track of deleted attributes when we fetch
                        this.model.alert.entry.content.set(this.model.inmem.entry.content.toJSON());
                        this.model.alert.fetch();
                    }
                    if (this.model.controller) {
                        this.model.controller.trigger('refreshEntities');
                    }
                }, this);
            }
        },
        getStepViews: function() {
            if (this.model.alert.canNotEditInUI()) {
                return([this.children.canNotEdit]);
            } 
            return ([
                this.children.edit,
                this.children.success
            ]);
        },
        scrollTo: function(position) {
            if (this.children.edit) {
                this.children.edit.scrollTo(position);
            }
        }
    });
});
