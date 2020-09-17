define([
    'jquery',
    'underscore',
    'module',
    'views/Base',
    './Accordion.pcss'
], function (
    $,
    _,
    module,
    BaseView,
    css
) {
    var DETAILS_COLLAPSED = 'collapsed';
    var DETAILS_EXPANDED = 'expanded';
    var ACCORDION_BODY_SELECTOR = '.accordion-inner';

    return BaseView.extend({
        moduleId: module.id,
        className: 'accordion-group managementconsole-accordion',

        events: {
            'click .accordion-heading a': function (e) {
                e.preventDefault();
                if ($(e.target).hasClass('icon-accordion-toggle')) {
                    $(e.target).toggleClass("icon-triangle-down-small");
                }
                $(e.target).find(".icon-accordion-toggle").toggleClass("icon-triangle-down-small").closest('.accordion-group').toggleClass('active');
                $(e.target).closest('.accordion-group').find('.accordion-inner').slideToggle(200);
            }
        },

        initialize: function () {
            BaseView.prototype.initialize.apply(this, arguments);
            this.heading = this.options.heading;
            this.initialState = this.options.initialState || DETAILS_COLLAPSED;
        },

        render: function () {
            this.$el.html(this.compiledTemplate({
                heading: this.heading,
                initialState: this.initialState
            }));
            return this;
        },

        template: '<div class="accordion-heading">' +
        '<a class="accordion-toggle" data-toggle="collapse" href="#collapse1">' +
        '<i class="icon-accordion-toggle icon-triangle-right-small <%= (initialState === "collapsed") ? "" : "icon-triangle-down-small" %>"></i>' +
        '<%- _(heading).t() %>' +
        '</a>' +
        '</div>' +
        '<div class="accordion-inner" style="<%= (initialState === "collapsed") ? "display:none" : "" %>"></div>'
    }, {
        DETAILS_COLLAPSED: DETAILS_COLLAPSED,
        DETAILS_EXPANDED: DETAILS_EXPANDED,
        ACCORDION_BODY_SELECTOR: ACCORDION_BODY_SELECTOR
    });
});
