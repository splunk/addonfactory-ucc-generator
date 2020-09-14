define(
    [
        'underscore',
        'jquery',
        'module',
        'views/shared/Modal',
        'views/table/header/dialogs/create/Create'
    ],
    function(
        _,
        $,
        module,
        Modal,
        Create
    ) {
        return Modal.extend({
            moduleId: module.id,

            initialize: function () {
                Modal.prototype.initialize.apply(this, arguments);
                this.model.inmem.unset(this.model.inmem.idAttribute);

                this.children.create = new Create({
                    model: {
                        application: this.model.application,
                        inmem: this.model.inmem,
                        searchPointJob: this.model.searchPointJob,
                        currentPointJob: this.model.currentPointJob
                    }
                });
            },

            render: function () {
                Modal.prototype.render.apply(this, arguments);
                this.children.create.render().appendTo(this.$el);
                $(_.template(this.warningTemplate, {_: _})).prependTo(this.$(Modal.BODY_SELECTOR));
                return this;
            },

            warningTemplate: '\
                <div class="alert alert-warning">\
                    <i class="icon-alert"></i>\
                    <span>\
                        <%- _("Save your new table dataset before visualizing it in Pivot.").t() %>\
                    </span>\
                </div>\
            '
        });
    }
);
