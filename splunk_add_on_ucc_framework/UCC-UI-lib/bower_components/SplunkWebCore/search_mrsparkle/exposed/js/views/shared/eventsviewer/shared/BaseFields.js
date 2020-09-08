define(
    [
        'jquery',
        'underscore',
        'backbone',
        'module',
        'keyboard/SearchModifier',
        'views/Base',
        'views/shared/FieldInfo',
        'views/shared/eventsviewer/shared/WorkflowActions',
        'views/shared/eventsviewer/shared/TimeInfo'
    ],
    function(
        $,
        _,
        Backbone,
        module,
        KeyboardSearchModifier,
        BaseView,
        FieldInfo,
        WorkflowActionsView,
        TimeInfoView
    ){
        return BaseView.extend({
            /**
             * @param {Object} options {
             *      model: {
             *         event: <models.services.search.job.ResultsV2.result[i]>,
             *         summary: <model.services.search.job.SummaryV2>,
             *         application: <model.Application>,
             *         report: <models.services.SavedSearch>,
             *         searchJob: <models.Job>
             *     }
             *     collection: {
             *         selectedFields: <collections.SelectedFields>
             *         workflowActions: <collections.services.data.ui.WorkflowActions>
             *     },
             *     selectableFields: true|false
             * }
             */
            initialize: function(){
                BaseView.prototype.initialize.apply(this, arguments);
                this.keyboardSearchModifier = new KeyboardSearchModifier();
                this.rowExpanded = 'r' + this.options.idx;
                this.timeExpanded = 't' + this.options.idx;
                this.timeFieldsList = this.model.event.time();
            },
            startListening: function() {
                this.listenTo(this.model.event, 'change', function() {
                    this.timeFieldsList = this.model.event.time();
                    this.render();
                });

                this.listenTo(this.collection.selectedFields, 'reset', function(collection, options) {
                    // TODO: SPL-91609 - this view should be deactivated if the row is not expanded
                    if (this.model.state.get(this.rowExpanded)) {
                        this.render();
                    }
                });
                this.listenTo(this.collection.selectedFields, 'add remove', function(model, collection, options) {
                    // TODO: SPL-91609 - this view should be deactivated if the row is not expanded
                    if (this.model.state.get(this.rowExpanded)) {
                        if (!options.add && model) {
                            if (_.indexOf(this.timeFieldsList, model.get('name')) !== -1) {
                                this.model.state.set(this.timeExpanded, true, {silent: true});
                            }
                        }
                        this.render();
                        if (model) {
                            this.$('.checkbox[data-field-name="' + model.get('name') + '"] > a')[0].focus();
                            // Fix for SPL-101520: select/deselct field from field info view
                            if (this.children.fieldInfo && this.children.fieldInfo.shown) {
                                var $field = this.$('.popdown-toggle.field-info[data-field-name="' + model.get('name') + '"]'),
                                    mockEvent = {currentTarget: $field};
                                this.openFieldInfo(mockEvent, true);
                            }
                        }
                    }
                });
            },
            events: {
                'click a.f-v': function(e) {
                    e.preventDefault();
                    this.fieldDrilldown($(e.target), e);
                },
                'click a.tag': function(e) {
                    e.preventDefault();
                    this.tagDrilldown($(e.target), e);
                },
                'click a._time': function(e) {
                    e.preventDefault();
                    this.openTimeInfo(e);
                },
                'click a.field-info': function(e) {
                    e.preventDefault();
                    this.openFieldInfo(e);
                },
                'click a.field-actions': function(e) {
                    e.preventDefault();
                    this.openFieldActions(e);
                },
                'click .event-actions': function(e) {
                    e.preventDefault();
                    this.openEventActions(e);
                }
            },
            fieldDrilldown: function($target, e) {
                var data = $target.data(),
                    fieldName = $.trim(data.fieldName),
                    field = this.model.summary.findByFieldName(fieldName),
                    value = $.trim($target.text()),
                    removable = $target.parent().hasClass('a');

                this.model.state.trigger('drilldown', {
                    data: {
                        q: this.model.report.entry.content.get('search'),
                        stripReportsSearch: this.options.tagClick,
                        action: removable ? 'removefieldvalue' : 'fieldvalue',
                        field: fieldName,
                        value: value,
                        negate: this.keyboardSearchModifier.isNegation(e),
                        app: this.model.application.get('app'),
                        owner: this.model.application.get('owner'),
                        usespath: this.options.usespath
                     },
                     event: e,
                     idx: this.options.idx,
                     type: "fieldvalue",
                     $target: $target,
                     stateModel: this.model.state
                });
            },
            tagDrilldown: function($target, e) {
                var data = $target.data(),
                    taggedFieldName = $.trim(data.taggedFieldName),
                    value = $.trim($target.text()),
                    removable = $target.hasClass('a');
                                    
                this.model.state.trigger('drilldown', {
                    data: {
                        q: this.model.searchJob.getStrippedEventSearch(),
                        stripReportsSearch: true,
                        action: removable ? 'removefieldvalue' : 'fieldvalue',
                        field: taggedFieldName,
                        value: value,
                        negate: this.keyboardSearchModifier.isNegation(e),
                        app: this.model.application.get('app'),
                        owner: this.model.application.get('owner'),
                        usespath: this.options.usespath
                     },
                     event: e,
                     idx: this.options.idx,
                     type: "tag",
                     $target: $target,
                     stateModel: this.model.state
                });
            },
            openTimeInfo: function(e) {
                var $target = $(e.currentTarget),
                    time = $target.data().time;
                    
                if (this.children.time && this.children.time.shown) {
                    this.children.time.hide();
                    this.children.time.remove();
                    delete this.children.time;
                    return;
                }
                
                this.children.time = new TimeInfoView({
                    model: {
                        report: this.model.report
                    },
                    time: time,
                    header: _('_time').t(),
                    onHiddenRemove: true,
                    ignoreToggleMouseDown: true
                });

                this.children.time.render().appendTo($('body')).show($target, {
                    $onClickCloseFocus: $target.closest(this.options.clickFocus)
                });
            },
            openFieldInfo: function(e, moveView) {
                var $target = $(e.currentTarget),
                    $onOpenFocus = null,
                    field = this.model.summary.fields.findWhere({'name': $target.attr('data-field-name') }),
                    fieldName = field.get('name');

                if (this.children.fieldInfo && this.children.fieldInfo.shown) {
                    this.children.fieldInfo.hide();
                    if(this.lastMenu == (fieldName+'-field-info') && !moveView)
                        return true;
                }
                
                if (!field) {
                    alert(_("This event is no longer within the results window.").t());
                }
                
                this.children.fieldInfo = new FieldInfo({
                    model: {
                        field: field,
                        summary: this.model.summary,
                        report: this.model.report,
                        application: this.model.application
                    },
                    collection: {selectedFields: this.collection.selectedFields},
                    onHiddenRemove: true,
                    selectableFields: this.options.selectableFields,
                    scrollContainer: $target.closest('.scrolling-table-wrapper'),
                    ignoreToggleMouseDown: true,
                    keepStatic: true
                });
                this.lastMenu = fieldName + "-field-info";

                this.children.fieldInfo.render().appendTo($('body'));

                if (moveView) {
                    var isSelectedField = this.collection.selectedFields.findWhere({'name': fieldName});
                    $onOpenFocus = this.children.fieldInfo.$('button.' + (isSelectedField ? 'select' : 'unselect'));
                } else {
                    $onOpenFocus = this.children.fieldInfo.$('a:first');
                }

                this.children.fieldInfo.show($target, {
                    $onClickCloseFocus: $target.closest(this.options.clickFocus),
                    $onOpenFocus : $onOpenFocus
                });
            },
            openFieldActions: function(e) {
                var $target = $(e.currentTarget),
                    fieldName = $target.attr('data-field-name'),
                    fieldValue = $.trim($target.closest('tr').find('.f-v').text());
                
                if (this.children.fieldActions && this.children.fieldActions.shown) {
                    this.children.fieldActions.hide();
                    if(this.lastMenu == (fieldName+'-field-actions'))
                        return true;
                }
                
                this.children.fieldActions = new WorkflowActionsView({
                    model: this.model,
                    collection: this.collection.workflowActions,
                    field: { 'name': fieldName, 'value': fieldValue },
                    mode: 'menu',
                    scrollContainer: $target.closest('.scrolling-table-wrapper'),
                    ignoreToggleMouseDown: true
                });

                this.lastMenu = fieldName + "-field-actions";

                this.children.fieldActions.render().appendTo($('body')).show($target, {
                    $onClickCloseFocus: $target.closest(this.options.clickFocus)
                });
            },
            openEventActions: function(e) {
                var $target = $(e.currentTarget); 
                if (this.children.eventActions && this.children.eventActions.shown) {
                    this.children.eventActions.hide();
                    return true;
                }

                this.children.eventActions = new WorkflowActionsView({
                    model: this.model,
                    collection: this.collection.workflowActions,
                    mode: 'menu',
                    onHiddenRemove: true,
                    scrollContainer: $target.closest('.scrolling-table-wrapper'),
                    ignoreToggleMouseDown: true
                });
                
                this.children.eventActions.render().appendTo($('body')).show($target, {
                    $onClickCloseFocus: $target.closest(this.options.clickFocus)
                });
            },
            _partial: _.template(
                '<!-- Line breaks cause table to not render correctly in IE9 -->' +
                '<%  _(fields).each(function(field, i) { %>' +
                    '<% var fieldlist = m.get(field) %>' +
                    '<% if(fieldlist.length > 1){ %>' +
                        '<%  _(fieldlist).each(function(mv_field, j) { %>' +
                            '<tr>' +
                               '<% if(i==0 && j==0 && label) { %>'+
                                   '<td rowspan="<%= m.getFieldsLength(fields) %>" class="field-type"><%- label %></td>'+
                               '<% } %>'+
                               '<% if(selectableFields && j==0) { %>'+
                                   '<td rowspan="<%= fieldlist.length %>" class="col-visibility"><label class="checkbox" data-field-name="<%- field %>">'+
                                   '<a href="#" data-name="Everyone.read" class="btn <%- iconVisibility ? "hide" : "show" %>-field">'+
                                   '<% if(iconVisibility) { %>'+
                                   '<i class="icon-check"></i>'+
                                   '<% } %>'+
                                   '</label></td>'+
                               '<% } %>'+
                               '<% if(j==0 && slen>0) {%>'+
                                   '<td rowspan="<%=fieldlist.length %>" class="field-key">'+
                                        '<a class="popdown-toggle field-info" href="#" data-field-name="<%- field %>">'+
                                            '<span><%- field %></span><span class="caret"></span>'+
                                        '</a>'+
                                    '</td>'+
                               '<% } else if(j==0 && slen==0) { %>'+
                                    '<td rowspan="<%=fieldlist.length %>" class="field-key">'+
                                        '<span  data-field-name="<%- field %>"><%- field %></span>'+
                                    '</td>'+
                               '<% } %>'+
                               '<td class="field-value<%- m.highlighted.hasFieldValue(field, mv_field) ? " a" : ""%>">' +
                                   '<a data-field-name="<%- field %>"  class="f-v" href="#"><%- mv_field %></a>'+
                                   '<% var tags = m.getTags(field, mv_field); %>'+
                                   '<% if (tags.length) { %>'+
                                       '(<% _(tags).each(function(tag, idx){ %>'+
                                            '<% var taggedFieldName = "tag::"+field %>'+
                                            '<a data-field-name="<%- field %>" data-field-value="<%- mv_field %>" data-tagged-field-name="<%- taggedFieldName %>"'+
                                            'class="tag<%- m.highlighted.hasFieldValue(taggedFieldName, tag) ? " a" : ""%>" href="#">'+
                                            '<%- tag %><%if(idx!=tags.length-1){%> <%}%></a>'+
                                        '<% }); %>)'+
                                   '<% } %>'+
                               '</td>'+
                               '<td  class="actions popdown">'+
                                       '<a class="popdown-toggle field-actions" href="#" data-field-name="<%- field %>">'+
                                           '<span class="caret"></span>'+
                                       '</a>'+
                               '</td>'+
                            '</tr>'+
                        '<% }) %>'+
                    '<% } else { %>'+
                        '<tr>'+
                           '<% if(i==0 && label) { %>'+
                               '<td rowspan="<%= m.getFieldsLength(fields) %>" class="field-type"><%- label %></td>'+
                           '<% } %>'+
                           '<% if(selectableFields) { %>'+
                               '<td rowspan="<%= fieldlist.length %>" class="col-visibility"><label class="checkbox" data-field-name="<%- field %>">'+
                               '<a href="#" data-name="Everyone.read" class="btn <%- iconVisibility ? "hide" : "show" %>-field">'+
                               '<% if(iconVisibility) { %>'+
                                '<i class="icon-check"></i>'+
                                '<% } %>'+
                               '</a></label></td>'+
                           '<% } %>'+
                           '<% if(slen >0) { %>'+
                              '<td class="field-key">'+
                                   '<a class="popdown-toggle field-info" href="#" data-field-name="<%- field %>">'+
                                       '<span><%- field %></span><span class="caret"></span>'+
                                   '</a>'+
                               '</td>'+
                           '<% } else { %>'+
                                '<td class="field-key">'+
                                    '<span  data-field-name="<%- field %>"><%- field %></span>'+
                                '</td>'+
                           '<% } %>'+
                           '<td class="field-value<%- m.highlighted.hasFieldValue(field, m.get(field)[0]) ? " a" : ""%>">'+
                               '<a data-field-name="<%- field %>"  class="f-v" href="#"><%- m.get(field)[0] %></a>'+
                               '<% var tags = m.getTags(field, m.get(field)); %>'+
                               '<% if (tags.length > 0) { %>'+
                                   '(<% _(tags).each(function(tag, idx){ %>'+
                                        '<% var taggedFieldName = "tag::"+field %>'+
                                        '<a data-field-name="<%- field %>" data-field-value="<%- m.get(field)[0] %>" data-tagged-field-name="<%- taggedFieldName %>"'+ 
                                        'class="tag<%- m.highlighted.hasFieldValue(taggedFieldName, tag) ? " a" : ""%>" href="#">'+
                                        '<%- tag %><%if(idx!=tags.length-1){%> <%}%></a>'+
                                    '<% }); %>)'+
                               '<% } %>'+
                           '</td>'+
                           '<td  class="actions">'+
                                   '<a class="popdown-toggle field-actions" href="#" data-field-name="<%- field %>">'+
                                       '<i class="icon-chevron-down"></i>'+
                                   '</a>' +
                           '</td>' +
                       '</tr>' +
                   '<% } %>' +
               '<% }); %>'
            )
        });
    }
);
