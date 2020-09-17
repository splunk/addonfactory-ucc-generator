define(
    [
        'jquery',
        'underscore',
        'backbone',
        'collections/shared/ModAlertActions',
        'views/Base',
        'views/shared/alertcontrols/dialogs/shared/triggeractions/table/Master',
        'views/shared/alertcontrols/dialogs/shared/triggeractions/AddActionDropDown',
        'module',
        'splunk.util'
    ],
    function(
        $,
        _,
        Backbone,
        ModAlertActionsCollection,
        BaseView,
        TableView,
        AddActionDropDownView,
        module,
        splunkUtil
    ) {
    return BaseView.extend({
        moduleId: module.id,
        className: 'trigger-actions form-complex form-horizontal',
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);

            this.collection.selectedAlertActions = new ModAlertActionsCollection();
            this.collection.unSelectedAlertActions = new ModAlertActionsCollection();
            this.collection.unSelectedAlertActions.comparator = function(unSelectedAlertAction) {
                return unSelectedAlertAction.entry.content.get('label');
            };

            this.populateAlertActionCollections();

            this.children.addAction = new AddActionDropDownView({
                model: {
                    application: this.model.application
                },
                collection: {
                    unSelectedAlertActions: this.collection.unSelectedAlertActions
                },
                canViewAlertActionsManager: this.options.canViewAlertActionsManager,
                ignoreToggleMouseDown: true
            });

            this.children.table = new TableView({
                pdfAvailable: this.options.pdfAvailable,
                model: {
                    alert: this.model.alert,
                    application: this.model.application
                },
                collection: {
                    selectedAlertActions: this.collection.selectedAlertActions,
                    unSelectedAlertActions: this.collection.unSelectedAlertActions,
                    alertActionUIs: this.collection.alertActionUIs
                }
            });

            this.listenTo(this.children.addAction, 'itemClicked', this.handleAddAction);
            this.listenTo(this.collection.alertActions, 'add remove reset', _.debounce(this.populateAlertActionCollections));
            this.listenTo(this.collection.selectedAlertActions, 'remove reset', _.debounce(this.toggleTable));
            this.listenTo(this.collection.selectedAlertActions, 'add', _.debounce(
                function(addedAlertAction) {
                    this.toggleTable();
                    this.children.table.trigger('addrow', addedAlertAction);
                }
            ));
            this.listenTo(this.collection.unSelectedAlertActions, 'add remove reset', _.debounce(this.toggleAddAction));
        },
        events: {
            'click .add-action-btn > a.dropdown-toggle': function(e) {
                e.preventDefault();

                var $target = $(e.currentTarget);
                if (this.children.addAction && this.children.addAction.shown) {
                    this.children.addAction.hide();
                    return;
                }
                if (!this.children.addAction.$el.html()) {
                    this.children.addAction.render().hide();
                }

                if (!this.children.addAction.isAddedToDocument()) {
                    this.children.addAction.appendTo($('.modal:visible'));
                }

                this.children.addAction.show($target);
            }
        },
        populateAlertActionCollections: function() {
            var selected = [],
                unselected = [];
            this.collection.alertActions.each(function(model) {
                var alertActionName = model.entry.get('name'),
                    modelAttr = (alertActionName === 'list') ? 'alert.track' : 'action.' + alertActionName;
                if (splunkUtil.normalizeBoolean(this.model.alert.entry.content.get(modelAttr))) {
                    selected.push(model);
                } else {
                    unselected.push(model);
                }
            }, this);
            this.collection.selectedAlertActions.reset(selected);
            this.collection.unSelectedAlertActions.reset(unselected);
        },
        handleAddAction: function(alertActionModel) {
            var name = alertActionModel.entry.get('name');
            if (name === 'list') {
                this.model.alert.entry.content.set('alert.track', true);
            } else {
                this.model.alert.entry.content.set('action.' + name, true);
            }
            this.collection.selectedAlertActions.add(alertActionModel);
        },
        toggleAddAction: function() {
            if (this.$addActionActivator) {
                if (this.collection.unSelectedAlertActions.length) {
                    this.$addActionActivator.show();
                } else {
                    this.$addActionActivator.hide();
                }
            }
        },
        toggleTable: function() {
            if (this.collection.selectedAlertActions.length) {
                this.children.table.$el.show();
            } else {
                this.children.table.$el.hide();
            }
        },
        render: function() {
            this.$el.html(this.compiledTemplate({
                _: _
            }));
            this.$addActionActivator = $('<div class="controls trigger-actions-controls add-action-btn"><a class="dropdown-toggle btn" href="#">' + _('+ Add Actions').t() + '<span class="caret"></span></a></div>');
            this.$addActionActivator.appendTo(this.$el);
            this.children.table.render().appendTo(this.$el);
            this.toggleTable();
            this.toggleAddAction();
            return this;
        },
        template: '\
            <p class="trigger-actions-control-heading control-heading"><%- _("Trigger Actions").t() %></p>\
        '
    });
});
