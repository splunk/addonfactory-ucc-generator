define(
    [
        'underscore',
        'module',
        'views/Base',
        'views/table/commandeditor/editorforms/join/FieldPairOverlays',
        'views/table/commandeditor/editorforms/join/FieldPair'
    ],
    function(
        _,
        module,
        BaseView,
        FieldPairOverlays,
        FieldPair
    ) {
        return BaseView.extend({
            moduleId: module.id,
            className: 'join-on-control',

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
            },

            startListening: function(options) {
                this.listenTo(this.model.command.requiredColumns, 'add remove change', this.renderFieldPairs);
            },

            events: {
                'click a.add-field-pair': function(e) {
                    e.preventDefault();
                    this.createOverlay();
                }
            },

            renderFieldPairs: function() {
                var newFieldPair;

                _.each(this.children.fieldPairs, function(fieldPairView) {
                    fieldPairView.deactivate({ deep: true }).remove();
                }, this);
                this.children.fieldPairs = [];

                this.model.command.requiredColumns.each(function(requiredColumn) {
                    newFieldPair = new FieldPair({
                        model: {
                            command: this.model.command,
                            requiredColumn: requiredColumn
                        }
                    });
                    newFieldPair.activate({ deep: true }).render().appendTo(this.$('.commandeditor-join-field-pairs'));

                    this.children.fieldPairs.push(newFieldPair);
                    this.listenTo(newFieldPair, 'modifyFieldPair', this.createOverlay);
                }, this);
            },

            createOverlay: function(requiredColumnGuid) {
                if (this.children.doubleOverlay) {
                    this.children.doubleOverlay.deactivate({deep: true}).remove();
                }

                var firstSelection = requiredColumnGuid,
                    secondSelection = requiredColumnGuid && this.model.command.requiredColumns.get(requiredColumnGuid).get('columnToJoinWith');

                this.children.doubleOverlay = new FieldPairOverlays({
                    model: {
                        command: this.model.command
                    },
                    firstListItems: this.options.tableItems,
                    firstSelection: firstSelection,
                    secondListItems: this.options.availableFieldsFromChosenDataset,
                    secondSelection: secondSelection
                });

                this.children.doubleOverlay.activate({ deep: true }).render().appendTo(this.$el);
            },

            render: function() {
                this.$el.html(this.compiledTemplate());

                this.renderFieldPairs();

                return this;
            },

            template: '\
                <%- _("Join on").t() %>\
                <div class="commandeditor-join-field-pairs"></div>\
                <div class="commandeditor-join-add-container">\
                    <a href="#" class="add-field-pair">\
                        <i class="icon-plus"></i> <%- _("Add field pair...").t() %>\
                    </a>\
                </div>\
            '
        });
    }
);