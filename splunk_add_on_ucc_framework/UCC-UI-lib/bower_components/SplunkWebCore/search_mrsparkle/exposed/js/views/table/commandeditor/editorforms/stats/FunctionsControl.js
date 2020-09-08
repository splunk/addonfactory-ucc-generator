define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'views/table/commandeditor/listpicker/Overlay'
    ],
    function(
        $,
        _,
        module,
        BaseView,
        ListPickerOverlay
    ) {
        return BaseView.extend({
            moduleId: module.id,
            className: 'functions-control',

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
            },

            startListening: function(options) {
                this.listenTo(this.model.aggregate.functions, 'add remove change reset', this.debouncedRender);
            },

            events: {
                'click .add-functions, .edit-functions': function(e) {
                    e.preventDefault();
                    this.openFunctionsPicker();
                }
            },

            openFunctionsPicker: function() {
                if (this.children.functionsPickerOverlay) {
                    this.children.functionsPickerOverlay.deactivate({ deep: true }).remove();
                }

                this.children.functionsPickerOverlay = new ListPickerOverlay({
                    items: this.model.commandPristine.getFunctionListPickerItems({ columnGuid: this.model.aggregate.get('columnGuid') }),
                    selectedValues: this.model.aggregate.functions.pluck('value'),
                    multiselectMessage: _('Select functions...').t(),
                    multiselect: true
                });

                this.children.functionsPickerOverlay.render().appendTo(this.$el.closest('.overlay-parent'));
                this.children.functionsPickerOverlay.slideIn();

                this.listenTo(this.children.functionsPickerOverlay, 'selectionDidChange', function() {
                    var selectedValues = this.children.functionsPickerOverlay.getSelectedValues();

                    this.model.aggregate.functions.reset();
                    _.each(selectedValues, function(selectedValue) {
                        this.model.aggregate.functions.add({ value: selectedValue });
                    }, this);
                });
            },

            render: function() {
                this.$el.html(this.compiledTemplate({
                    commandPristine: this.model.commandPristine,
                    functions: this.model.aggregate.functions,
                    columnGuid: this.model.aggregate.get('columnGuid')
                }));

                return this;
            },

            template: '\
                <% if (functions.length) { %>\
                    <% functions.each(function(func) { %>\
                        <div class="function">\
                            <%= commandPristine.getFunctionDisplayName({ func: func.get("value"), columnGuid: columnGuid }) %>\
                        </div>\
                    <% }, this) %>\
                    <div class="change-functions-container">\
                        <a href="#" class="edit-functions">\
                            <i class="icon-plus"></i>\
                            <%- _("Edit functions...").t() %>\
                        </a>\
                    </div>\
                <% } else { %>\
                    <a href="#" class="add-functions">\
                        <i class="icon-plus"></i>\
                        <%- _("Add functions...").t() %>\
                    </a>\
                <% } %>\
            '
        });
    }
);