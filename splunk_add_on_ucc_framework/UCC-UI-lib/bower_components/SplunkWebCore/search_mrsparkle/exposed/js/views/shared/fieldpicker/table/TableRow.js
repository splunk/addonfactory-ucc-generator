define(
    [
        'jquery',
        'underscore',
        'module',
        'splunk.i18n',
        'views/Base',
        'uri/route'
    ],
    function(
        $,
        _,
        module,
        i18n,
        Base,
        route
    )
    {
        return Base.extend({
            moduleId: module.id,
            tagName: 'tr',
            /**
             * @param {Object} options {
             *      model:
             *         field: <model.services.search.job.SummaryV2.field>,
             *         summary: <model.services.search.job.SummaryV2>,
             *         searchJob: <models.Job>,
             *         report: <models.services.SavedSearch>,
             *         application: <models.Application>
             *     },
             *     collections: {
             *         selectedFields: <collections.SelectedFields>,
             *     },
             *     expandedField: <fieldname_of_expanded_row>,
             *     index: <index_of_the_row>
             * }
             */
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
                this.$el.addClass((this.options.index % 2) ? 'even' : 'odd');
                this.rowExpanded = 'rowExpanded' + this.options.index;
                this.activate();
            },
            startListening: function() {
                this.listenTo(this.model.state, 'change:' + this.rowExpanded, this.render);
            },
            activate: function(options) {
                if (this.active) {
                    return Base.prototype.activate.apply(this, arguments);
                }
                options || (options = {});
                options.startListening = false;
                this.stopListening();
                this.startListening();
                if (this.options.expandedField === this.model.field.get('name')) {
                    this.model.state.set(this.rowExpanded,this.model.field.get('name'));
                }
                return Base.prototype.activate.call(this, options);
            },
            events: {
                'click td.expands, td.col-fields': function(e) {
                    (!this.model.state.get(this.rowExpanded)) ? 
                        this.model.state.set(this.rowExpanded, this.model.field.get('name')):
                        this.model.state.unset(this.rowExpanded);
                   
                    this.model.state.trigger('table-dock-update');

                    //close the last one
                    _(this.model.state.toJSON()).each(function(value, key) { 
                       if(/rowExpanded/.test(key) && (key != this.rowExpanded)) {   
                            this.model.state.unset(key);
                        } 
                    },this);

                    e.preventDefault();
                },
                'click a.show-field': function(e) {
                    var $target = $(e.currentTarget),
                        fieldName = $target.closest('tr').attr('data-value');
                    
                    $target.removeClass('show-field').addClass('hide-field').find('.icon-check').show();
                    this.collection.selectedFields.push({ 'name': fieldName });
                    e.preventDefault();
                },
                'click a.hide-field': function(e) {
                    var $target = $(e.currentTarget),
                        fieldName = $target.closest('tr').attr('data-value');
                        
                    $target.removeClass('hide-field').addClass('show-field').find('.icon-check').hide();
                    this.collection.selectedFields.remove(this.collection.selectedFields.find(function
                    (model) {
                        return model.get('name')===fieldName;
                    }, this));
                    e.preventDefault();
                 }
            },
            render: function() {
                var expanded = this.model.state.get(this.rowExpanded);
                
                this.$el[expanded ? 'addClass' : 'removeClass']('expanded').attr('data-value', this.model.field.get('name'));

                this.$el.html(this.compiledTemplate({
                    _: _,
                    field: this.model.field,
                    expanded: expanded,
                    selectedFields: this.collection.selectedFields,
                    format_percent: i18n.format_percent,
                    summary: this.model.summary
                }));
                return this;
            },
            template: '\
                <% if(expanded) { %>\
                    <td class="expands" rowspan="2"><a href="#"><i class="icon-triangle-down-small"></i></a></td>\
                <% } else { %>\
                    <td class="expands"><a href="#"><i class="icon-triangle-right-small"></i></a></td>\
                <% } %>\
                <td class="col-select">\
                    <% var isSelected = selectedFields.findByName(field.get("name")); %>\
                    <label class="checkbox">\
                    <a href="#" data-value="<%- field.get("name") %>" class="btn <%- isSelected ? "hide" : "show" %>-field" value="<%- field.get("name") %>">\
                     <i class="icon-check" style="<%- isSelected ? "" : "display:none" %>"></i>\
                    </a></label></td>\
                <td class="col-fields"><%- field.get("name") %></td>\
                <% var distinctCount = field.get("distinct_count") %>\
                <td class="col-values numeric"><%- field.get("is_exact") ? "" : ">" %><%- distinctCount %><div class="heatmap-cell"><div class="heatmap-cell-value" style="opacity: <%- distinctCount / 100 %>; filter: alpha(opacity=<%- distinctCount %>);"></div></div></td>\
                <% var frequency = Math.round(summary.frequency(field.get("name")) * 10000) / 10000 %>\
                <td class="col-coverage numeric"><%- format_percent(frequency) %><div class="heatmap-cell"><div class="heatmap-cell-value" style="opacity: <%- frequency %>; filter: alpha(opacity=<%- frequency * 100 %>);"></div></div></td>\
                <td class="col-type">\
                    <% if ( field.isNumeric()) { %>\
                        <%- _("Number").t() %>\
                    <% } else { %>\
                        <%- _("String").t() %>\
                    <% } %>\
                </td>\
            '
        });
    }
);
