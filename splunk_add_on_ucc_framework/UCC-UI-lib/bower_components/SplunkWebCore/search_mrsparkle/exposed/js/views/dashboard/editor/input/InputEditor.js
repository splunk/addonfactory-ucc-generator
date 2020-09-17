define(
    [
        'module',
        'jquery',
        'underscore',
        'views/Base',
        'views/shared/dialogs/TextDialog',
        'views/dashboard/editor/input/InputMenu',
        'splunk.util'
    ],
    function(module,
             $,
             _,
             BaseView,
             TextDialog,
             InputMenu,
             SplunkUtil) {

        return BaseView.extend({
            moduleId: module.id,
            initialize: function(options) {
                BaseView.prototype.initialize.apply(this, arguments);
                this.controller = options.controller;
                this.inputId = options.inputId;
                this.inputSettings = options.inputSettings;
            },
            render: function() {
                this.$el.html(this.template);
                return this;
            },
            events: {
                'click a.edit-input': '_editInput',
                'click a.delete-input': '_deleteInput'
            },
            _editInput: function(e) {
                e.preventDefault();
                var $target = $(e.currentTarget);

                if (this.editInputMenu && this.editInputMenu.shown) {
                    this.editInputMenu.hide();
                    return;
                }
                $target.addClass('active');
                this.editInputMenu = new InputMenu({
                    model: this.model,
                    inputSettings: this.inputSettings,
                    onHiddenRemove: true
                });

                $('body').append(this.editInputMenu.render().el);

                this.editInputMenu.show($target);
                this.listenTo(this.editInputMenu, 'hide', function() {
                    $target.removeClass('active');
                });
                this.listenTo(this.editInputMenu, 'apply', function() {
                    this.controller.trigger('edit:input', {inputId: this.options.inputId});
                });
            },
            _deleteInput: function(e) {
                e.preventDefault();
                var dialog = new TextDialog({
                    id: "modal_delete"
                });
                dialog.settings.set("primaryButtonLabel", _("Delete").t());
                dialog.settings.set("cancelButtonLabel", _("Cancel").t());
                dialog.settings.set("titleLabel", _("Delete").t());

                var label = $.trim(this.model.get('label')) || SplunkUtil.sprintf(_('the %s input').t(), _(this.model.get('type')).t());
                dialog.setText(SplunkUtil.sprintf(
                    _("Are you sure you want to delete %s?").t(), '<em>' + _.escape(label) + '</em>'));
                dialog.on('click:primaryButton', function() {
                    this.controller.trigger('edit:delete-input', {inputId: this.inputId});
                    this.trigger('deleteInput');
                }.bind(this));
                $("body").append(dialog.render().el);
                dialog.show();
            },
            template: '<div class="edit-dropdown">' +
            '<a href="#" class="edit-input" title="' + _("Edit Input").t() + '"><i class="icon-pencil"></i></a>' +
            '<a href="#" class="delete-input" title="' + _("Delete Input").t() + '"><i class="icon-x"></i></a>' +
            '</div>'
        });
    });