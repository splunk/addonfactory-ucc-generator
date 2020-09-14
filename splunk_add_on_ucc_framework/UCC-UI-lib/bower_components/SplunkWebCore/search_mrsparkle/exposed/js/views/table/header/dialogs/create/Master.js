define(
    [
        'underscore',
        'module',
        'views/shared/MultiStepModal',
        'views/table/header/dialogs/create/Create',
        'views/table/header/dialogs/shared/Success',
        'util/splunkd_utils'
    ],
    function(
        _,
        module,
        MultiStepModal,
        Create,
        Success,
        splunkd_utils
    ) {
        return MultiStepModal.extend({
            moduleId: module.id,

            initialize: function() {
                MultiStepModal.prototype.initialize.apply(this, arguments);

                this.model.inmem = this.model.table.clone();
                this.model.inmem.unset(this.model.inmem.idAttribute);

                this.children.create = new Create({
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
                        table: this.model.table,
                        user: this.model.user,
                        serverInfo: this.model.serverInfo
                    },
                    collection: {
                        roles: this.collection.roles
                    },
                    title: _('Your Table Has Been Created').t()
                });

                this.model.inmem.on('createSuccess', function() {
                    this.stepViewStack.setSelectedView(this.children.success);
                    this.children.success.focus();
                }, this);

                this.on('hidden', function() {
                    if (!this.model.inmem.isNew()) {
                        this.model.table.fetch({ url: splunkd_utils.fullpath(this.model.inmem.id) });
                    }
                }, this);

                this.children.success.on('closeModal', this.remove, this);
            },

            getStepViews: function() {
                return ([
                    this.children.create,
                    this.children.success
                ]);
            }
        });
    }
);
