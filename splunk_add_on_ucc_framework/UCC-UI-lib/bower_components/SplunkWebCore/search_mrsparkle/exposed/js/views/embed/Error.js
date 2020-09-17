define(
    [
        'underscore',
        'module',
        'views/Base',
        'views/shared/FlashMessagesLegacy',
        'collections/shared/FlashMessages'
    ],
    function(_, module, BaseView, FlashMessagesLegacyView, FlashMessagesCollection) {
        return BaseView.extend({
            moduleId: module.id,
            /**
             * @param {Object} options {
             *     {
             *         model: <models.search.Report>,
             *         collection: <collections.services.saved.searches.Histories>
             *     }
             * }
             */
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                this.collection = {
                    histories: this.collection,
                    messages: new FlashMessagesCollection()
                };
                this.children.flashMessages = new FlashMessagesLegacyView({
                    collection: this.collection.messages
                });
                this.activate();
            },
            startListening: function() {
                this.listenTo(this.collection.histories, 'sync', function() {
                    if (this.collection.histories.length) {
                        this.$el.hide();
                        this.collection.messages.reset([]);
                    } else {
                        this.collection.messages.reset([
                            {
                                type: 'error',
                                html: _('This scheduled report has not yet run. Try again soon.').t()
                            }
                        ]);
                        this.$el.show();
                    }
                });
                this.listenTo(this.model, 'error', function() {
                    this.collection.messages.reset([
                        {
                            type: 'error',
                            html: _('Report not available.').t()
                        }
                    ]);
                    this.$el.show();
                });
            },
            render: function() {
                this.$el.append(this.children.flashMessages.render().el);
                return this;
            }
        });
    }
);
