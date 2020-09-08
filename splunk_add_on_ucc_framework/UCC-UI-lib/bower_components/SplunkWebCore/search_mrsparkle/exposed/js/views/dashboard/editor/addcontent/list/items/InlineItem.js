define(
    [
        'module',
        'jquery',
        'underscore',
        'views/Base'
    ],
    function(module,
             $,
             _,
             BaseView) {

        var InlineItem = BaseView.extend({
            moduleId: module.id,
            tagName: 'li',
            className: 'inline-item panel-content',
            initialize: function(options) {
                BaseView.prototype.initialize.apply(this, arguments);
                this.id = options.id || _.uniqueId('inline_');
                this.listenTo(this.model.sidebarState, 'change:select', this._onItemSelected);
            },
            render: function() {
                var model = {
                    icon: this.model.inline.get('icon') || 'icon-star', //todo refine the default icon
                    name: this.model.inline.get('label'),
                    title: this.model.inline.get('label')
                };
                this.$el.html(this.compiledTemplate(model));
                return this;
            },
            events: {
                'click a': 'select'
            },
            select: function(e) {
                e.preventDefault();
                this.trigger('preview', this.model.inline);
                this.model.sidebarState.set('select', this.cid);
            },
            _onItemSelected: function() {
                if (this.model.sidebarState.get('select') === this.cid) {
                    this.$el.addClass('selected');
                } else {
                    this.$el.removeClass('selected');
                }
            },
            template: '\
                <a href="#" title="<%- title %>">\
                    <div class="icons"><i class="icon-<%- icon %>"></i></div>\
                    <%- name %>\
                </a>\
            '
        });

        return InlineItem;
    });