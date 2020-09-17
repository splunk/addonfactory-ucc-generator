define(['module', 'views/Base', 'splunk.i18n'], function(module, BaseView, i18n) {
     return BaseView.extend({
        tagName: 'li',
        moduleId: module.id,
        initialize: function(){
            BaseView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model.searchJob, 'sync', this.render);  
        },
        render: function() {
            var count = this.model.searchJob.resultCountSafe() || 0;
            
            var template = this.compiledTemplate({
                type: this.options.type,
                label: this.options.label,
                searchJob: this.model.searchJob,
                count: count,
                i18n: i18n
            });
            this.el.innerHTML = template;
            return this;            
        },
        template:'\
            <a href="#<%- type %>" data-type="<%- type %>">\
                <% if (searchJob.isNew() || (count === 0)) { %>\
                    <%- label %>\
                <% } else { %>\
                    <%- label %> (<%= i18n.format_decimal(count) %>)\
                <% } %>\
            </a>\
        '
    });   
});
