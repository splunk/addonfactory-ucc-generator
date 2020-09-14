define([
    'jquery',
    'module',
    'views/Base',
    'views/clustering/peer/PeerDetails',
    'views/clustering/EditMenu',
    'views/shared/FlashMessages',
    'uri/route',
    'contrib/text!views/clustering/peer/PeerNode.html'
],
    function(
        $,
        module,
        BaseView,
        PeerDetailsView,
        EditMenuView,
        FlashMessagesView,
        route,
        PeerNodeTemplate
        ) {
        return BaseView.extend({
            moduleId: module.id,
            template: PeerNodeTemplate,
            initialize: function(options) {
                BaseView.prototype.initialize.call(this, options);
                this.children.flashMessages = new FlashMessagesView({ model: this.model.peerInfo });
                this.children.peerDetails = new PeerDetailsView({
                    model: this.model
                });
                this.children.editMenu = new EditMenuView({
                    model: this.model
                });
            },

            render: function() {
                var root = this.model.application.get('root'),
                    locale = this.model.application.get('locale'),
                    link = route.docHelp(root, locale, 'manager.clustering.slave.peers.details');
                var html = this.compiledTemplate({docLink: link});
                this.$el.html(html);
                this.$el.find('.peer-node-section-info').append(this.children.peerDetails.el);
                this.$el.find('.peer-node-section-info').append(this.children.flashMessages.render().el);
                this.$el.find('.editMenu').replaceWith(this.children.editMenu.render().el);
                return this;
            }
        });

    });
