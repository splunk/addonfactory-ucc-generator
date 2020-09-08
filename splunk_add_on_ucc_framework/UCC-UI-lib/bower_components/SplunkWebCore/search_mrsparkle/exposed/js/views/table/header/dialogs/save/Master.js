define(
    [
        'underscore',
        'module',
        'models/datasets/Table',
        'views/shared/MultiStepModal',
        'views/table/header/dialogs/save/Save',
        'views/table/header/dialogs/shared/Success'
    ],
    function(
        _,
        module,
        TableModel,
        MultiStepModal,
        Save,
        Success
    ) {
        return MultiStepModal.extend({
            moduleId: module.id,

            initialize: function() {
                MultiStepModal.prototype.initialize.apply(this, arguments);

                this.model.inmem = this.model.table.clone();

                this.children.save = new Save({
                    model: {
                        application: this.model.application,
                        inmem: this.model.inmem,
                        searchPointJob: this.model.searchPointJob,
                        currentPointJob: this.model.currentPointJob
                    }
                });

                this.children.success = new Success({
                    model: {
                        application: this.model.application,
                        inmem: this.model.inmem,
                        searchPointJob: this.model.searchPointJob,
                        currentPointJob: this.model.currentPointJob,
                        user: this.model.user,
                        serverInfo: this.model.serverInfo
                    },
                    collection: {
                        roles: this.collection.roles
                    },
                    title: _('Your Table Has Been Saved').t()
                });

                this.model.inmem.on('saveSuccess', function() {
                    this.stepViewStack.setSelectedView(this.children.success);
                    this.children.success.focus();
                }, this);

                this.on('hidden', function() {
                    if (this.model.inmem.get('updated') > this.model.table.get('updated')) {
                        this.model.table.fetch();
                    }
                }, this);

                this.children.success.on('closeModal', this.remove, this);
            },

            getStepViews: function() {
                return ([
                    this.children.save,
                    this.children.success
                ]);
            }
        });
    }
);
