/**
 * @author jszeto
 * @date 7/1/14
 *
 * Thin wrapper for attaching the Data Preview router and view
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/Base',
    'views/shared/FlashMessages'
],
    function (
        $,
        _,
        Backbone,
        module,
        BaseView,
        FlashMessagesView
        ) {

        return BaseView.extend({
            moduleId: module.id,
            clearErrorState: false,
            routerView: undefined,

            initialize: function(options) {
                BaseView.prototype.initialize.call(this, options);
                this.children.flashMessagesView = new FlashMessagesView({model: this.model});
                this.listenTo(this.children.flashMessagesView, "change", this.updateState);
            },

            appendRouter: function(routerView) {
                this.routerView = routerView;
                this.updateState();
                this.$(".router-placeholder").append(routerView.el);

            },
            detachRouter: function() {
                this.routerView = undefined;
                this.updateState();
            },

            updateState: function() {
//                console.log("Preview.updateState msgLength",this.children.flashMessagesView.flashMsgCollection.length,"routerView",this.routerView);

                if (this.children.flashMessagesView.flashMsgCollection.length > 0) {
                    // We are in an error state
                    this.$(".loading").hide();
                    this.$(".router-placeholder").hide();
                } else if (this.routerView) {
                    this.$(".loading").hide();
                    this.$(".router-placeholder").show();
                } else {
                    this.$(".loading").show();
                    this.$(".router-placeholder").hide();
                }
            },


            render: function() {
                // Detach children
                if (this.children.flashMessagesView) {
                    this.children.flashMessagesView.detach();
                }

                // Use template
                this.$el.html(this.compiledTemplate({}));
                this.$(".router-placeholder").hide();

                // Attach children and render them
                this.children.flashMessagesView.appendTo(this.$(".flash-messages-placeholder"));

                return this;
            },

            template: '\
               <div class="preview-container">\
                    <div class="section-padded">\
                        <div class="flash-messages-placeholder"></div>\
                        <div class="loading"><%- _("Loading...").t() %></div>\
                    </div>\
                </div>\
                <div class="router-placeholder layoutBodyColumns layoutRow addDataBody"></div>\
            '
        });

    });

