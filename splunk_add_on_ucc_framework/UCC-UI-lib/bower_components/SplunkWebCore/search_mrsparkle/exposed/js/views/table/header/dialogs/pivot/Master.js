define(
    [
        'jquery',
        'underscore',
        'module',
        'models/datasets/PolymorphicDataset',
        'models/datasets/Table',
        'views/Base',
        'views/table/header/dialogs/pivot/CreateNoSuccess',
        'views/table/header/dialogs/pivot/Save',
        'uri/route'
    ],
    function(
        $,
        _,
        module,
        PolymorphicDataset,
        TableModel,
        Base,
        CreateDialog,
        SaveDialog,
        route
    ) {
        return Base.extend({
            moduleId: module.id,
            className: 'open-in-pivot',


            startListening: function() {
                this.listenTo(this.model.table.entry.content, 'change:dataset.commands', this.render);
                this.listenTo(this.model.table, 'sync', this.render);
                this.listenTo(this.model.currentPointJob, 'prepared', this.render);
            },

            events: {
                'click a.pivot-btn:not(.disabled)': function(e) {
                    e.preventDefault();
                    this.model.inmem = this.model.table.clone();
                    var openInPivotFn = function(name) {
                        var routeToPivot = route.pivot(
                            this.model.application.get('root'),
                            this.model.application.get('locale'),
                            this.model.application.get('app'),
                            {
                                data: {
                                    dataset: name,
                                    type: PolymorphicDataset.DATAMODEL
                                }
                            }
                        );
                        window.location.href = routeToPivot;
                    }.bind(this);

                    if (this.shouldCreate()) {
                        this.children.createDialog = new CreateDialog({
                            model: {
                                application: this.model.application,
                                inmem: this.model.inmem,
                                searchPointJob: this.model.searchPointJob,
                                currentPointJob: this.model.currentPointJob
                            }
                        });
                        this.children.createDialog.render().appendTo($('body')).show();
                        this.listenToOnce(this.model.inmem, 'createSuccess', function() {
                            this.children.createDialog.remove();
                            openInPivotFn(this.model.inmem.entry.content.get('name'));
                        }.bind(this));

                    } else {
                        openInPivotFn = openInPivotFn.bind(this, this.model.table.entry.get('name'));
                        if (this.shouldSave()) {
                            this.model.inmem.entry.content.set({
                                'request.ui_dispatch_view': this.model.application.get('page')
                            });
                            this.children.saveDialog = new SaveDialog({
                                model: {
                                    application: this.model.application,
                                    inmem: this.model.inmem
                                },
                                callbackFn: openInPivotFn
                            });
                            this.children.saveDialog.render().appendTo($('body')).show();
                        } else {
                            openInPivotFn();
                        }
                    }


                },
                'click a.disabled': function(e) {
                    e.preventDefault();
                }
            },

            shouldCreate: function() {
                return this.model.table.isNew();
            },

            shouldSave: function() {
                return this.model.table.isDirty(this.model.tablePristine);
            },

            canPivot: function() {
                return this.model.table.isValid();
            },

            render: function() {
                this.$el.html(this.compiledTemplate({
                    _: _,
                    enablePivot: this.canPivot()
                }));

                return this;
            },

            template: '\
                <a class="btn pivot-btn <%= enablePivot ? "" : "disabled" %>">\
                    <%- _("Pivot").t() %>\
                </a>\
            '
        });
    }
);
