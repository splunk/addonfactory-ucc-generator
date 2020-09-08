define(['underscore','views/Base','module'], function(_, Base,module) {

    return Base.extend({
        moduleId: module.id,
        className: 'alerts',
        initialize: function(){
            Base.prototype.initialize.apply(this, arguments);
            
            _.defaults(this.options, {
                escape: true
            });
            
            this.activate();
        },
        startListening: function() {
            this.listenTo(this.collection, 'add push reset', this.render);
        },
        render: function() {
            var template = _.template(this.template, {
                    flashMessages: this.collection,
                    escape: this.options.escape
                });
            this.$el.html(template);

            if (this.collection.length === 0){
                this.$el.hide();
            } else {
                this.$el.show();
            }

            return this;
        },
        template: '\
            <% flashMessages.each(function(flashMessage){ %> \
                <div class="alert alert-<%- flashMessage.get("type") %>">\
                    <i class="icon-alert"></i>\
                    <% if (escape && flashMessage.get("escape") !== false) { %>\
                        <%- flashMessage.get("html") %>\
                    <% } else { %>\
                        <%= flashMessage.get("html") %>\
                    <% } %>\
                </div>\
            <% }); %> \
        '
    },
    {
        update: function(errors, parentView, flashMessagesCollection){
            var flashMessageModels = [],
                uniquifier = 0;

            _(parentView.children).each(function(child){
                child.error(false);
            });
            _(errors).each(function(error){
                parentView.children[error.name].error(true);
                flashMessageModels.push({
                    key: parentView.cid + (uniquifier++),
                    type: 'error',
                    html: error.msg
                });
            }, parentView);
            flashMessagesCollection.reset(flashMessageModels);
        }
    });

});
