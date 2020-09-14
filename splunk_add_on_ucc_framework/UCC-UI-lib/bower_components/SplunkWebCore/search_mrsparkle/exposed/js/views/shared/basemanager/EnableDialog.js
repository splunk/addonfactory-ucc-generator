/**
 * @author lbudchenko
 * @date 12/14/15
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

                this.setText(this.makeDialogBody());
                this.settings.set({
                    titleLabel: this.makeTitle(),
                    primaryButtonLabel: this.options.primaryButtonLabel || _('Enable').t()
                });
            },

            makeTitle: function() {
                return splunkUtil.sprintf(_('Enable %s').t(),
                    this.options.entitySingular.toLowerCase()
                );
            },

            makeDialogBody: function() {
                return splunkUtil.sprintf(_('Are you sure you want to enable the %s named <i>%s</i>?').t(),
                    this.options.entitySingular.toLowerCase(),
                    this.targetEntity.entry.get('name')
                );
            },

            primaryButtonClicked: function() {
                this.targetEntity.enable()
                    .fail(this.onActionFail.bind(this))
                    .done(this.onActionSuccess.bind(this));
                TextDialog.prototype.primaryButtonClicked.call(this);
            },

            onActionSuccess: function() {
                _.isFunction(this.options.onActionSuccess) ? this.options.onActionSuccess() : '';
                this.closeDialog();
            },

            onActionFail: function() {
                return;
            }

        });
    });
