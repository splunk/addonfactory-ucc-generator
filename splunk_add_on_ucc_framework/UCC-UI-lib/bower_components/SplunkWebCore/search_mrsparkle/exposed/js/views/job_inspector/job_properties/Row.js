define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'views/shared/JSONTree'
    ],
    function(
        $,
        _,
        module,
        Base,
        JSONTree
    ){
        /**
         * @constructor
         * @memberOf views
         * @name JobPropertyRowView
         * @description
         * @extends {Base}
         */
        return Base.extend(/** @lends views.Base.prototype */{
            moduleId: module.id,
            tagName: 'tr',
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
                if (_.isObject(this.options.prop.value)) {
                    this.children.jsonTree = new JSONTree({
                        json: this.options.prop.value
                    });
                }
            },
            
            render: function() {
                this.$el.html(this.compiledTemplate({}));
                this.children.jsonTree && this.children.jsonTree.render().appendTo(this.$el.find(".job-prop-value"));
                return this;
            },
            
            template: '\
                <td class="job-prop-name"><%- this.options.prop.key %></td>\
                <td class="job-prop-value">\
                    <% if (!this.children.jsonTree) { %>\
                        <%- this.options.prop.value || _("None").t() %>\
                    <% } %>\
                </td>\
            '
        });
    }
);