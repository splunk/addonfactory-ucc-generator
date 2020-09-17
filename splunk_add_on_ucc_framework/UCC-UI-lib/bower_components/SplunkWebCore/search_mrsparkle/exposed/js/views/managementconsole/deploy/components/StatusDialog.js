/**
 * Created by rtran on 4/18/16.
 */
define([
    'jquery',
    'underscore',
    'module',
    'backbone',
    /* Models */
    'models/managementconsole/topology/Instance',
    'models/managementconsole/App',

    /* Views */
    'views/shared/Modal',
    'views/managementconsole/deploy/components/StatusDialogHeader',
    'views/managementconsole/deploy/components/StatusDialogTable',

    /* CSS */
    'views/managementconsole/shared.pcss',
    'views/managementconsole/deploy/components/StatusDialog.pcss'
], function($,
            _,
            module,
            Backbone,
            InstanceModel,
            AppModel,
            Modal,
            StatusDialogHeader,
            StatusDialogTable,
            sharedcss,
            css) {

    var MODE_LITERALS = {
            instance: 'instance',
            forwarders: 'forwarders',
            custom: 'custom',
            app: 'app'
        },
        MODE = {
            instance: {type: 'bundle'},
            forwarders: {type: 'instance'},
            custom: {type: 'instance'},
            app: {type: 'instance'}
    };

    return Modal.extend({
        moduleId: module.id,

        initialize: function(options) {
            options = options || {};
            _.defaults(options, {
                onHiddenRemove: true
            });
            Modal.prototype.initialize.call(this, options);
            this.mode = this.options.mode;

            this.model = this.model || {};
            this.collection = this.collection || {};
            this.redirectReturnToPage = this.options.redirectReturnToPage;

            this.children.statusDialogHeader = new StatusDialogHeader({
                MODE_LITERALS: MODE_LITERALS,
                model: this.model,
                mode: this.mode,
                type: MODE[this.mode].type,
                collection: {
                    bundles: this.collection.bundles
                }
            });

            this.children.statusDialogTable = new StatusDialogTable({
                MODE_LITERALS: MODE_LITERALS,
                model: {
                    entity: this.model
                },
                collection: {
                    entities: this.collection.entities
                },
                mode: this.mode,
                type: MODE[this.mode].type,
                redirectReturnToPage: this.redirectReturnToPage
            });
        },

        render: function() {
            this.$el.html(Modal.TEMPLATE);
            this.$(Modal.HEADER_TITLE_SELECTOR).text(_("Deploy Status").t());
            this.$(Modal.BODY_SELECTOR).append(this.children.statusDialogHeader.render().el);
            this.$(Modal.BODY_SELECTOR).append(this.children.statusDialogTable.render().el);

            this.$(Modal.FOOTER_SELECTOR);
            return this;
        }
    },
        {
            MODE_LITERALS: MODE_LITERALS
        }
    );
});