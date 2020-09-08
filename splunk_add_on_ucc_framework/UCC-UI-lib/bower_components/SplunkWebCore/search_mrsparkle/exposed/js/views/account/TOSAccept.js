define(
    [
        'module',
        'underscore',
        'views/Base',
        'views/shared/FlashMessagesLegacy',
        'collections/shared/FlashMessages'
    ],
    function(
        module,
        _,
        BaseView,
        FlashMessagesLegacyView,
        FlashMessagesCollection
    ) {
        return BaseView.extend({
            moduleId: module.id,
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                if (!this.collection) {
                    this.collection = new FlashMessagesCollection();
                }
                this.children.flashMessagesLegacy = new FlashMessagesLegacyView({
                    collection: this.collection
                });
                this.listenTo(this.model.tos, 'change:content', this.render);
            },
            events: {
                'click a.btn': function(e) {
                    if (this.$('input[name="accept"]').is(':checked')) {
                        this.model.login.save({
                            accept_tos: this.model.tos.get('tos_version')
                        });
                        this.collection.reset([]);
                   } else {
                       this.collection.reset([
                            {
                                type: 'error',
                                html: _('Accept the Terms of Service to continue.').t()
                            }
                        ]);
                    }
                    e.preventDefault();
                }
            },
            render: function() {
                var html = this.compiledTemplate({
                    _: _,
                    model: this.model.tos
                });
                this.el.innerHTML = html;
                this.children.flashMessagesLegacy.render().insertAfter(this.$('.content'));
                return this;
            },
            template: '\
                <h2><%- _("Terms of Service").t() %></h2>\
                <div class="content"><%= model.get("content") %></div>\
                <label for="accept"><%- _("Click here to accept the terms:").t() %></label> <input type="checkbox" id="accept" name="accept" value="1" /> <a href="#" class="btn"><%- _("Ok").t() %></a>\
            '
        });
    }
);
