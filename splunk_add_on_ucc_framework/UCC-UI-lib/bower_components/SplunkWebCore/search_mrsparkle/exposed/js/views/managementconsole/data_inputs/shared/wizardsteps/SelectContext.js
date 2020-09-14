// Select context wizard step
// @author: nmistry
define([
    'underscore',
    'jquery',
    'backbone',
    'module',
    'views/Base',
    'views/managementconsole/data_inputs/shared/controls/DMCContext'
], function (
    _,
    $,
    backbone,
    module,
    BaseView,
    DMCContext
) {
    var BUNDLE_TYPE_ATTRIBUTE = '@bundleType';
    var BUNDLE_ATTRIBUTE = 'app';

    return BaseView.extend({
        moduleId: module.id,
        tagName: 'div',
        className: 'modal-step',

        initialize: function () {
            BaseView.prototype.initialize.apply(this, arguments);
            this.deferreds = this.options.deferreds || {};
            // set the default context
            if (this.model.entity.isNew()) {
                var bundleType = this.model.classicurl.get('bundleType');
                var bundle = this.model.classicurl.get('bundle');
                this.model.entity.entry.acl.set(BUNDLE_TYPE_ATTRIBUTE, bundleType);
                this.model.entity.entry.acl.set(BUNDLE_ATTRIBUTE, bundle);
            }
            this.children.deployControl = new DMCContext({
                mode: 'selector',
                model: this.model.entity.entry.acl,
                modelTypeAttribute: BUNDLE_TYPE_ATTRIBUTE,
                modelAttribute: BUNDLE_ATTRIBUTE,
                collection: this.collection,
                deferreds: this.deferreds,
                hideAllForwarders: !this.model.user.canEditDMCForwarders()
            });
        },

        render: function () {
            this.$el.append(this.children.deployControl.render().el);
            return this;
        }

    });
});
