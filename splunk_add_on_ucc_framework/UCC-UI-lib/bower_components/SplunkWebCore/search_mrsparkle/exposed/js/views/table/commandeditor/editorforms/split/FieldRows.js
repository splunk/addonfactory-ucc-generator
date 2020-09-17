define(
    [
        'underscore',
        'module',
        'views/Base',
        'views/table/commandeditor/editorforms/split/FieldRow'
    ],
    function(
        _,
        module,
        BaseView,
        FieldRow
    ) {
        return BaseView.extend({
            moduleId: module.id,
            className: 'split-new-field-rows-section',

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.initializeFieldRows();
            },

            events: {
                'click .add-field': function(e) {
                    e.preventDefault();
                    this.addAndCreateNewRow();
                }
            },

            initializeFieldRows: function() {
                this.children.rows = this.children.rows || {};

                this.model.command.editorValues.each(function(col) {
                    this.createRow(col);
                }, this);
            },

            addAndCreateNewRow: function() {
                var newRowView,
                    newRowModel;
                this.model.command.editorValues.add({ name: '' });
                newRowModel = this.model.command.editorValues.last();
                newRowView = this.createRow(newRowModel);
                newRowView.activate({deep: true}).render().appendTo(this.$('.split-new-field-rows'));
            },

            removeRow: function(cid) {
                var modelToRemove = this.model.command.editorValues.get(cid);
                this.model.command.editorValues.remove(modelToRemove);
                this.children.rows[cid].deactivate({deep:true}).remove();
                delete this.children.rows[cid];
            },

            createRow: function(model) {
                var newRowView = this.children.rows[model.cid] = new FieldRow({
                    model: model
                });

                this.listenTo(newRowView, 'removeRow', function(options) {
                    this.removeRow(options.cid);
                });

                return newRowView;
            },

            render: function() {
                if (!this.$el.html()) {
                    this.$el.html(this.compiledTemplate({
                        _: _
                    }));
                }
                _.each(this.children.rows, function(rowView) {
                    rowView.activate({deep: true}).render().appendTo(this.$('.split-new-field-rows'));
                }, this);

                return this;
            },

            template: '\
                <div class="split-field-rows-label"> <%- _("New fields").t() %> </div>\
                <div class="split-new-field-rows"></div>\
                <a class="add-field"><i class="icon-plus"></i> <%-_("Add a field...").t()%></a>\
            '
        });
    }
);