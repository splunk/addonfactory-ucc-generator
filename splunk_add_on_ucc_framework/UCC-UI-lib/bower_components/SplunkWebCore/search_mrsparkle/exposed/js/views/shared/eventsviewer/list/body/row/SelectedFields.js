define(
    [
        'jquery',
        'underscore',
        'backbone',
        'module',
        'views/shared/eventsviewer/shared/BaseFields'
    ],
    function($, _, Backbone, module, BaseFields){
        return BaseFields.extend({
            moduleId: module.id,
            /**
             * @param {Object} options {
             *      model: {
             *         event: <models.services.search.job.ResultsV2.results[i]>,
             *     },
             *     collection: {
             *         selectedFields: <collections.SelectedFields>
             *     },
             *     selectableFields: true|false,
             */
            initialize: function(){
                BaseFields.prototype.initialize.apply(this, arguments);
                this.rowExpanded = this.options.rowExpanded;
            },
            startListening: function() {
                this.listenTo(this.collection.selectedFields, 'add remove reset', function() {
                    if(this.model.state.get(this.rowExpanded)) { 
                        this.render(); 
                    }
                });
                
                this.listenTo(this.model.result, 'tags-updated', this.render);
            },
            render: function() {
                var strippedfields = this.model.event.strip(),
                    selectedfields = _.intersection(strippedfields, this.collection.selectedFields.pluck('name')).sort();
                this.$el.html(this.compiledTemplate({
                    selectedfields: selectedfields,
                    m: this.model.event,
                    r: this.model.result,
                    selected: selectedfields.length,
                    _:_
                }));                
                return this;
            },
            template: '\
                <% if (selected) { %>\
                    <ul class="condensed-selected-fields">\
                    <%  _(selectedfields).each(function(field, i) { %>\
                        <% var values = m.get(field) %>\
                        <li>\
                            <% _(values).each(function(value, idx) { %>\
                                <span class="field"><%- field %> =</span>\
                                <span class="field-value<%- r.highlighted.hasFieldValue(field, value) ? " a" : ""%>">\
                                    <a href="#" class="f-v" data-field-name="<%-field %>" title="<%- value ? value : ""%>"><% if(value) {%><%- value %><% } else { %>&nbsp;<% } %></a>\
                                </span>\
                                <% var tags = r.getTags(field, value); %>\
                                <% if (tags.length) { %>\
                                    <span class="tags">\
                                      <% _(tags).each(function(tag, idx){ %> \
                                        <% var taggedFieldName = "tag::"+field %>\
                                        <a data-field-name="<%- field %>" data-field-value="<%- value %>" data-tagged-field-name="<%- taggedFieldName %>" \
                                        class="tag<%- r.highlighted.hasFieldValue(taggedFieldName, tag) ? " a" : ""%>" href="#"><%- tag %>\
                                            <%if(idx!=tags.length-1){%> <%}%>\
                                        </a><% }); %>\
                                    </span>\
                                <% } %>\
                            <% }) %>\
                        </li>\
                    <% }) %>\
                  </ul>\
                <% } %>\
           '
        });
    }
);
