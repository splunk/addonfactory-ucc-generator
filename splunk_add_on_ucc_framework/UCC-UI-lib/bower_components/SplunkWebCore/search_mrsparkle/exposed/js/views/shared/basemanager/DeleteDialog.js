/**
 * @author lbudchenko
 * @date 10/23/15
 */

define([
        'jquery',
        'underscore',
        'backbone',
        'module',
        'splunk.util',
        'views/shared/dialogs/TextDialog'
    ],

    function(
        $,
        _,
        Backbone,
        module,
        splunkUtil,
        TextDialog
    ) {

        return TextDialog.extend({
            moduleId: module.id,
            initialize: function(options) {
                TextDialog.prototype.initialize.call(this, options);

                this.options = options || {};

                this.targetEntity = this.options.targetEntity;

                this.setText(this.makeDeleteBody());
                this.settings.set({
                    titleLabel: this.makeTitle(),
                    primaryButtonLabel: this.options.dialogButtonLabel || _('Delete').t()
                });
            },

            makeTitle: function() {
                return splunkUtil.sprintf(_('Delete %s').t(),
                    this.options.entitySingular
                );
            },

            makeDeleteBody: function() {
                return splunkUtil.sprintf(_('Are you sure you want to delete the %s named <i>%s</i>?').t(),
                    this.options.entitySingular.toLowerCase(),
                    this.targetEntity.entry.get('name')
                );
            },

            primaryButtonClicked: function() {
                this.targetEntity.destroy()
                    .fail(this.onActionFail.bind(this))
                    .done(this.onActionSuccess.bind(this));
                TextDialog.prototype.primaryButtonClicked.call(this);
            },

            onActionSuccess: function() {
                _.isFunction(this.options.onActionSuccess) && this.options.onActionSuccess.apply(this, arguments);
                this.closeDialog();
            },

            onActionFail: function() {
                return;
            }

        });
    });
