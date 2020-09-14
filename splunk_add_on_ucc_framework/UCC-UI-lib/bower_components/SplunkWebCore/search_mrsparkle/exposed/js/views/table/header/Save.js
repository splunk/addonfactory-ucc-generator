define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'views/table/header/dialogs/create/Master',
        'views/table/header/dialogs/save/Master',
        'uri/route'
    ],
    function(
        $,
        _,
        module,
        Base,
        SaveAsDialog,
        SaveDialog,
        route
    ) {
        return Base.extend({
            moduleId: module.id,
            className: 'save-table',

            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
            },

            startListening: function() {
                this.listenTo(this.model.table.entry.content, 'change:dataset.commands', this.render);
                this.listenTo(this.model.table, 'sync', this.render);
                this.listenTo(this.model.currentPointJob, 'prepared', this.render);
            },

            events: {
                'click a.save:not(.disabled)': function(e) {
                    this.children.saveDialog = new SaveDialog({
                        model: {
                            application: this.model.application,
                            searchPointJob: this.model.searchPointJob,
                            currentPointJob: this.model.currentPointJob,
                            table: this.model.table,
                            tablePristine: this.model.tablePristine,
                            user: this.model.user,
                            serverInfo: this.model.serverInfo
                        },
                        collection: {
                            roles: this.collection.roles
                        },
                        create: false,
                        onHiddenRemove: true
                    });

                    this.children.saveDialog.render().appendTo($('body')).show();

                    e.preventDefault();
                },
                'click a.save-as:not(.disabled)': function(e) {
                    this.children.saveAsDialog = new SaveAsDialog({
                        model:  {
                            application: this.model.application,
                            searchPointJob: this.model.searchPointJob,
                            currentPointJob: this.model.currentPointJob,
                            table: this.model.table,
                            user: this.model.user,
                            serverInfo: this.model.serverInfo
                        },
                        collection: {
                            roles: this.collection.roles
                        },
                        onHiddenRemove: true
                    });
                    this.children.saveAsDialog.render().appendTo($('body')).show();

                    e.preventDefault();
                },
                'click a.disabled': function(e) {
                    e.preventDefault();
                }
            },

            render: function() {
                var isDirty = this.model.table.isDirty(this.model.tablePristine),
                    isValid = this.model.table.isValid();

                this.$el.html(this.compiledTemplate({
                    _: _,
                    enableSave: (!this.model.table.isNew() && isDirty && isValid),
                    enableSaveAs: isValid
                }));

                return this;
            },

            template: '\
                <a class="btn save <%= enableSave ? "" : "disabled" %>">\
                    <%- _("Save").t() %>\
                </a>\
                <a class="save-as btn <%= enableSaveAs ? "" : "disabled" %>">\
                    <%- _("Save As").t() %>\
                </a>\
            '
        });
    }
);
