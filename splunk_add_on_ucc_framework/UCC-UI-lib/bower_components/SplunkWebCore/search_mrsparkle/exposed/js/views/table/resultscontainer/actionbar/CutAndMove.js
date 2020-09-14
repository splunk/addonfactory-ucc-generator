define(
    [
        'jquery',
        'underscore',
        'module',
        'collections/datasets/Columns',
        'views/Base'
    ],
    function(
        $,
        _,
        module,
        ColumnsCollection,
        BaseView
    ) {
        return BaseView.extend({
            moduleId: module.id,
            tagName: 'ul',
            className: 'nav dataset-action-menu-list',

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
            },

            startListening: function() {
                this.listenTo(this.model.table.selectedColumns, 'add remove reset', this.toggleEnabledState);
                this.listenTo(this.model.table.entry.content, 'change:dataset.display.selectionType', this.toggleEnabledState);
            },

            activate: function(options) {
                if (this.active) {
                    return BaseView.prototype.activate.apply(this, arguments);
                }

                this.model.state.trigger('cutSelection');
                this.cutColumns = this.model.table.selectedColumns.pluck('id');

                this.toggleEnabledState();

                return BaseView.prototype.activate.apply(this, arguments);
            },

            events: {
                'click li.insert-before:not(".disabled") a': function(e) {
                    e.preventDefault();
                    this.insertCutColumns({ insertAfter: false });
                },
                'click li.insert-after:not(".disabled") a': function(e) {
                    e.preventDefault();
                    this.insertCutColumns({ insertAfter: true });
                },
                'click a.cancel': function(e) {
                    e.preventDefault();
                    this.model.state.trigger('clearCutSelection');
                    this.model.state.unset('activeActionBar');
                }
            },

            updateMenuItemsState: function(options) {
                // pretty sure nothing has to be done here...
            },

            toggleEnabledState: function() {
                if ((this.model.table.entry.content.get('dataset.display.selectionType') !== 'column') ||
                        (this.model.table.selectedColumns.length !== 1) ||
                        (_.contains(this.cutColumns, this.model.table.selectedColumns.first().id))) {
                    this.$('li.insert-after').addClass('disabled');
                    this.$('li.insert-before').addClass('disabled');
                } else {
                    this.$('li.insert-after').removeClass('disabled');
                    this.$('li.insert-before').removeClass('disabled');
                }
            },

            insertCutColumns: function(options) {
                options = options || {};

                var currentCommandModel = this.model.table.getCurrentCommandModel(),
                    currentColumns = currentCommandModel.columns,
                    currentColumnsCopy = new ColumnsCollection(currentColumns.toJSON()),
                    colsToInsert = currentColumnsCopy.remove(this.cutColumns),
                    selectedColumns = this.model.table.selectedColumns.pluck('id'),
                    columnToInsertAt = options.insertAfter ?
                        currentColumnsCopy.get(_.last(selectedColumns)) :
                        currentColumnsCopy.get(_.first(selectedColumns)),
                    columnIndexToInsertAt = currentColumnsCopy.indexOf(columnToInsertAt);

                this.model.state.trigger('clearCutSelection');

                if (columnIndexToInsertAt < 0) {
                    throw new Error('Selected column is missing from command\'s columns');
                }

                if (options.insertAfter) {
                    columnIndexToInsertAt++;
                }

                currentColumnsCopy.add(colsToInsert, { at: columnIndexToInsertAt });

                if (_.isEqual(currentColumns.toJSON(), currentColumnsCopy.toJSON())) {
                    this.model.state.unset('activeActionBar');
                } else {
                    currentColumns.reset(currentColumnsCopy.toJSON());
                    this.model.table.trigger('applyAction', currentCommandModel, this.model.table.commands);
                }
            },

            render: function () {
                this.$el.html(this.compiledTemplate({
                    _ : _
                }));

                return this;
            },

            template: '\
                <li class="insert-before">\
                    <a class="dataset-action-menu-activator" href="#"><%= _("Insert Before").t() %></a>\
                </li>\
                <li class="insert-after">\
                    <a class="dataset-action-menu-activator" href="#"><%= _("Insert After").t() %></a>\
                </li>\
                <li>\
                    <a class="dataset-action-menu-activator cancel" href="#"><%= _("Cancel").t() %></a>\
                </li>\
            '
        });
    }
);
