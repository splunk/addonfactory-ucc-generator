define(function(require, exports, module) {
    var _ = require('underscore');
    var $ = require('jquery');
    var TextDialog = require('views/shared/dialogs/TextDialog');
    var BaseView = require('views/Base');
    var Dashboard = require('../../simplexml/controller');
    var SplunkUtil = require('splunk.util');
    var EditInputMenu = require('./editinputmenu');

    var MenuView = BaseView.extend({
        events: {
            'click a.edit-input': function(e) {
                e.preventDefault();

                var $target = $(e.currentTarget);
                if (this.editInputMenu && this.editInputMenu.shown) {
                    this.editInputMenu.hide();
                    return;
                }

                $target.addClass('active');

                this.editInputMenu = new EditInputMenu({
                    model: this.model,
                    onHiddenRemove: true
                });

                $('body').append(this.editInputMenu.render().el);

                this.editInputMenu.show($target);
                this.editInputMenu.on('hide', function() {
                    $target.removeClass('active');
                }, this);
            },
            'click a.delete-input': function(e) {
                e.preventDefault();

                var dialog = new TextDialog({
                    id: "modal_delete",
                    flashModel: Dashboard.model.view
                });

                var model = this.model;
                dialog.on('click:primaryButton', function() {
                    dialog.preventDefault();
                    model.destroy().then(function(){
                        dialog.closeDialog();
                    });
                });

                dialog.settings.set("primaryButtonLabel", _("Delete").t());
                dialog.settings.set("cancelButtonLabel", _("Cancel").t());
                dialog.settings.set("titleLabel", _("Delete").t());

                var label = $.trim(this.model.get('label')) || SplunkUtil.sprintf(_('the %s input').t(), _(this.model.get('type')).t());
                dialog.setText(SplunkUtil.sprintf(
                    _("Are you sure you want to delete %s?").t(), '<em>' + _.escape(label) + '</em>'));

                $("body").append(dialog.render().el);
                dialog.show();
            }
        },
        render: function() {
            this.$el.html(this.template);
            return this;
        },
        template: '<div class="edit-dropdown">' +
            '<a href="#" class="edit-input" title="' + _("Edit Input").t() + '"><i class="icon-pencil"></i></a>' +
            '<a href="#" class="delete-input" title="' + _("Delete Input").t() + '"><i class="icon-x"></i></a>' +
            '</div>'
    });
    return MenuView;
});