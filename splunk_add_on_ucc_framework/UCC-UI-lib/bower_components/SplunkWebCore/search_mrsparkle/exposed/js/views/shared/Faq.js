/**
 * Created by dlu on 8/6/14.
 */

define(
    [
        'jquery',
        'underscore',
        'module',
        'backbone',
        'views/Base',
        './Faq.pcss'
    ],
    function(
        $,
        _,
        module,
        Backbone,
        BaseView,
        css
        ) {
        return BaseView.extend({
            moduleId: module.id,
        	className: 'faq',
            initialize: function(options) {
                BaseView.prototype.initialize.apply(this, options);
            },

            events: {
                'click .faq-header': function(e) {
                    $(e.target).closest(".faq-group").find(".faq-body").toggle();
                    $(e.target).closest(".faq-group").find(".icon-accordion-toggle").toggleClass("icon-chevron-down");
                },
                'keypress .faq-header': function(e){
                    if (e.which === 13) {
                        $(e.target).closest(".faq-group").find(".faq-body").toggle();
                        $(e.target).closest(".faq-group").find(".icon-accordion-toggle").toggleClass("icon-chevron-down");
                    }
                }
            },

            render: function() {
                var html = _.template(this.headerTemplate);
                this.$el.html(html);

                _.forEach(this.options.faqList, function(faqGroup){
                    var groupTemplate = _.template(this.groupTemplate, {
                        question: faqGroup.question,
                        answer: faqGroup.answer
                    });
                    this.$el.append(groupTemplate);
                }.bind(this));

                return this;
            },

            headerTemplate: '<h1>' + _('FAQ').t() + '</h1>',

            groupTemplate:
                '<div class="faq-group">\
                    <div class="faq-header" tabindex="0">\
                        <i class="icon-accordion-toggle icon-chevron-right"></i><span class="faq-question"><%- question %></span>\
                    </div>\
                    <div class="faq-body">\
                        <%= answer %>\
                    </div>\
                </div>'
        });
    }
);
