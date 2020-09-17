define(
    [
        'underscore',
        'module',
        'views/Base',
        'views/table/commandeditor/listpicker/Control'
    ],
    function(
        _,
        module,
        BaseView,
        ListOverlayControl
    ) {
        return BaseView.extend({
            moduleId: module.id,
            className: 'commandeditor-group-sortable split-by-row',

            attributes: function() {
                return {
                    'id': this.model.splitBy.get('columnGuid')
                };
            },

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.children.fieldControl = new ListOverlayControl({
                    listOptions: {
                        items: this.options.fieldPickerItems,
                        selectMessage: _('Select a field...').t(),
                        selectedValues: [this.model.splitBy.get('columnGuid')],
                        size: 'small',
                        required: true
                    },
                    model: this.model.splitBy,
                    modelAttribute: 'columnGuid',
                    toggleClassName: '',
                    className: ListOverlayControl.prototype.className + ' commandeditor-group-label split-by-control',
                    size: 'small'
                });
            },

            events: {
                'click .delete-split-by-row': function(e) {
                    e.preventDefault();
                    this.trigger('removeSplitBy', this);
                }
            },

            render: function() {
                this.$el.html(this.compiledTemplate({
                    _: _
                }));

                this.children.fieldControl.render().appendTo(this.$el);

                return this;
            },

            template: '\
                <a class="delete-split-by-row commandeditor-group-remove">\
                    <i class="icon-x"></i>\
                </a>\
                <span class="split-label"><%- _("Split by").t() %></span>\
            '
        });
    }
);