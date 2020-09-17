/**
 * @author ahebert
 * @date 4/4/15
 *
 * Action modal for moving an entity.
 */
define([
        'jquery',
        'underscore',
        'backbone',
        'module',
        'models/services/ACL',
        'views/shared/controls/ControlGroup',
        'views/shared/FlashMessages',
        'views/shared/Modal',
        'splunk.util'
    ],
    function(
        $,
        _,
        Backbone,
        module,
        ACLModel,
        ControlGroup,
        FlashMessages,
        Modal,
        splunkUtil
    ) {
        return Modal.extend({
            moduleId: module.id,
            /**
            * @param {Object} options {
            *       model: {
            *           entity: <entity model>
            *           application: <models.Application>,
            *           controller: <Backbone.Model> (Optional) Only needed if MoveDialog isn't being directly called from the controller.
            *       },
            *       collection: {
            *           appLocals: <collection.services.AppLocals>
            *       },
            *       {String} entitySingular: Title of the type of entity.
            */
            initialize: function(options) {
                Modal.prototype.initialize.call(this, arguments);

                // Create flash messages view
                this.children.flashMessagesView = new FlashMessages({
                    model: this.model.entity
                });

                var items = this.collection.appLocals.map(function(app){
                    return {
                        value: app.entry.get('name'),
                        label: app.entry.content.get('label')
                    };
                });

                // SPL-132646: ahebert
                // What this does is iterating over the appLocals to check
                // if the current app of the object is visible or non visible.
                // We can actually create objects from launcher app even though it's not a visible app per definition.
                // We could use appLocalsUnfilteredAll from routers/Base but
                // we would get a lot of apps from where it's impossible to create objects.
                // If the current app is not visible, create a entry in the appSelector widget to avoid weird behavior.
                var currentApp = this.collection.appLocals.find(function(app) {
                    if (app.entry.get('name') === this.model.entity.entry.acl.get('app')) {
                        return app;
                    }
                }.bind(this));
                if (!currentApp) {
                    items.push({
                        value: this.model.entity.entry.acl.get('app'),
                        label: this.model.entity.entry.acl.get('app')
                    });
                }

                this.children.appsSelector = new ControlGroup({
                    label: _('Destination app').t(),
                    controlType:'SyntheticSelect',
                    controlOptions: {
                        model: this.model.entity.entry.acl,
                        modelAttribute: 'app',
                        updateModel: false,
                        items: items,
                        className: 'fieldAppSelect',
                        toggleClassName: 'btn',
                        popdownOptions: {
                            detachDialog: true
                        }
                    }
                });
            },

            /**
             * Allows for override options needed for successfully move the entity
             */
            getMoveData: function() {
                return {
                    data : {
                        // Because we are not updating the model get the app to move to from the app Selector.
                        app: this.children.appsSelector.childList[0].getValue(),
                        user: this.model.entity.entry.acl.get('sharing') === "user" ?
                            this.model.entity.entry.acl.get('owner') : "nobody"
                    }
                };
            },

            events: $.extend({}, Modal.prototype.events, {
                'click .modal-btn-move': function(e) {
                    var moveDeferred = this.model.entity.move(this.getMoveData());

                    $.when(moveDeferred).then(function() {
                        this.trigger("moveEntityConfirmed");
                        if (this.model.controller) {
                            this.model.controller.trigger('refreshEntities');
                        }
                        this.hide();
                    }.bind(this));
                    e.preventDefault();
                }
            }),

            render: function() {
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html(splunkUtil.sprintf(_('Move %s').t(), this.options.entitySingular));
                this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);
                this.$(Modal.BODY_FORM_SELECTOR).html(this.dialogFormBodyTemplate);
                this.children.flashMessagesView.render().appendTo(this.$(".flash-messages-view-placeholder"));
                this.children.appsSelector.render().appendTo(this.$(".app-selector-placeholder"));
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_MOVE);
                return this;
            },

            dialogFormBodyTemplate: '\
                <div class="flash-messages-view-placeholder"></div>\
                <div class="app-selector-placeholder"></div>\
            '
        });
    });
