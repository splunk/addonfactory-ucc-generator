/**
 * @author ahebert
 * @date 4/1/15
 *
 */
define([
        'jquery',
        'underscore',
        'views/Base'
    ],
    function(
        $,
        _,
        BaseView
    ){
        return BaseView.extend({
            render: function() {
                if (this.options.breadcrumb) {
                    var html = this.compiledTemplate({
                        breadcrumbUrl: this.options.breadcrumb.url,
                        breadcrumbLabel: this.options.breadcrumb.label,
                        entitiesPlural: this.options.entitiesPlural
                    });
                    this.$el.html(html);
                }
                return this;
            },

            template: '<a class="breadcrumb-link" href="<%- breadcrumbUrl %>" > <%- breadcrumbLabel %></a> &#187; <%- entitiesPlural %>'
        });
    });


