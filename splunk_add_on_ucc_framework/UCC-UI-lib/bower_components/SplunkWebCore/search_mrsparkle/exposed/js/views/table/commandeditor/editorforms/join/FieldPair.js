define(
    [
        'underscore',
        'module',
        'views/Base'
    ],
    function(
        _,
        module,
        BaseView
    ) {
        return BaseView.extend({
            moduleId: module.id,
            className: 'commandeditor-group',

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
            },

            events: {
                'click .commandeditor-group-remove': function(e) {
                    e.preventDefault();
                    this.model.command.requiredColumns.remove(this.model.requiredColumn);

                },
                'click .commandeditor-join-field-pair-modify': function(e) {
                    e.preventDefault();
                    this.trigger('modifyFieldPair', this.model.requiredColumn.get('id'));
                }
            },

            render: function() {
                this.$el.html(this.compiledTemplate({
                    leftPairName: this.model.command.getFieldNameFromGuid(this.model.requiredColumn.get('id')),
                    rightPairName: this.model.requiredColumn.get('columnToJoinWith')
                }));

                return this;
            },

            template: '\
                <a href="#" class="commandeditor-group-label commandeditor-join-field-pair-modify">\
                    "<%- leftPairName %>" = "<%- rightPairName %>" <icon class="icon-chevron-right"></icon>\
                </a>\
                <a href="#" class="commandeditor-group-remove">\
                    <icon class="icon-x"></icon>\
                </a>\
            '
        });
    }
);
