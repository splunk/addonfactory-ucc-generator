define(
    [
        'underscore',
        'module',
        'views/Base'
    ],
    function(
        _,
        module,
        BaseView
    ) {
        return BaseView.extend({
            moduleId: module.id,
            className: 'index-and-sourcetypes-row',

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
            },

            events: {
                'click .index-and-sourcetypes-row-remove': function(e) {
                    e.preventDefault();
                    this.trigger('removeIndexAndSourcetypesRow', { cid: this.model.editorValue.cid });
                }
            },

            render: function() {
                this.$el.html(this.compiledTemplate({
                    index: this.model.editorValue.get('index'),
                    sourcetypes: this.model.editorValue.get('sourcetypes')
                }));

                return this;
            },

            template: '\
                 <a class="index-and-sourcetypes-row-remove">\
                    <i class="icon-x"></i>\
                </a>\
                <span class="index property">\
                    <%- _.isArray(index) ? _("indexes").t() : _("index").t() %> =\
                </span>\
                <%- _.isArray(index) ? index.join(_(" or ").t()) : index %>\
                <br/>\
                <span class="index-and-sourcetypes-all">\
                    <span class="index-and-sourcetypes property index-and-sourcetypes-block">\
                        <%- _("sourcetypes").t() %> =&nbsp\
                    </span>\
                    <span class="index-and-sourcetypes-block">\
                    <% _(sourcetypes).each(function(sourcetype) { %>\
                        <span>\
                            <%- sourcetype %>\
                        </span>\
                    <% }); %>\
                    </span>\
                </span>\
            '
        });
    }
);