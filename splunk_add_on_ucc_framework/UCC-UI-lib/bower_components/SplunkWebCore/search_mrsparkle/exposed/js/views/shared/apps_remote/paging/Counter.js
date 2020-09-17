define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base'
    ],
    function(
        $,
        _,
        module,
        BaseView
        ){
        return BaseView.extend({
            moduleId: module.id,
            className: 'results-counter',

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                this.collection.on('sync',this.render, this);
            },

            render: function() {
                var template = this.compiledTemplate({
                    _: _,
                    collection: this.collection
                }); 
                this.$el.html(template);
                return this;
            },

            template: 
                '<% if (collection.length) { %>' +
                '<%- collection.paging.get("total") %> <%- _("Apps").t() %>' +
                '<% } %>'
        });
    });
