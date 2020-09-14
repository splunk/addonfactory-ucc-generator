define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'splunk.util',
        'helpers/user_agent'
    ],
    function(
        $,
        _,
        module,
        BaseView,
        util,
        user_agent
    )
    {
        return BaseView.extend({
            moduleId: module.id,
            tagName: 'thead',
            /**
             * @param {Object} options {
             *     model: <models.services.SavedSearch>,
             *     collection: <Backbone.Collection>,
             *     sortableFields: true|false (default true),
             *     allowRowExpand: true|false,
             *     showWarnings: true|false
             * }
             */
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                _.defaults(this.options, {sortableFields: true});
            },
            startListening: function() {
                this.listenTo(this.collection.intersectedFields, 'reset', this.render);
                this.listenTo(this.model.report.entry.content, 'change:display.events.rowNumbers change:display.events.table.sortDirection change:display.events.table.sortColumn', this.render);
                this.listenTo(this.model.searchJob.entry.content, 'change:isDone', this.render);
            },
            activate: function(options) {
                if (this.active) {
                    return BaseView.prototype.activate.apply(this, arguments);
                }

                BaseView.prototype.activate.apply(this, arguments);
                
                /*
                 * Listeners for intersected fields were not set up when the call to 
                 * update the collection in table Master took place.  Manually render
                 * given a correct state of the collection.
                 */ 
                this.render();

                return this;
            },
            events: {
                'click th': function(e) {
                    var $target = $(e.currentTarget);
                    this.model.report.entry.content.set({
                        'display.events.table.sortDirection': ($target.hasClass('asc') ? 'desc' : 'asc'),
                        'display.events.table.sortColumn': $target.attr('data-name')
                    });
                    e.preventDefault();
                }
            },
            render: function() {
                this.$el.html(this.compiledTemplate({
                    collection: this.collection.intersectedFields,
                    hasRowNum: util.normalizeBoolean(this.model.report.entry.content.get('display.events.rowNumbers')),
                    showWarnings: this.options.showWarnings,
                    allowRowExpand: this.options.allowRowExpand,
                    content: this.model.report.entry.content,
                    sortableFields: this.options.sortableFields,
                    reorderableHandle: this.options.selectableFields ? 'on': 'off',
                    isRealTime: this.model.searchJob.entry.content.get('isRealTimeSearch'),
                    hasPreviewEvents: this.model.searchJob.isEventsPreviewEnabled() && !this.model.searchJob.isDone(),
                    is_ie7: (user_agent.isIE7()) ? 'ie7': '',
                    _: _
                }));
                return this;
            },
            template: '\
                <tr class="">\
                    <% if (allowRowExpand) { %>\
                        <th class="col-info"><i class="icon-info"></i></th>\
                    <% } %>\
                    <% if (hasRowNum) { %>\
                        <th class="line-num <%- is_ie7 %> <%- showWarnings ? "merge-right": "" %>">&nbsp;</th>\
                    <% }%>\
                    <% if (showWarnings) { %>\
                        <th class="col-warnings">&nbsp;</th>\
                    <% } %>\
                    <th class="col-time <%- content.get("display.events.table.sortColumn") ? "sorts" : "" %> <%- is_ie7 %>"><%- _("_time").t() %></th>\
                    <% collection.each(function(model) { %>\
                        <% var active = (!isRealTime && (content.get("display.events.table.sortColumn") == model.get("name"))) ? "active": ""%>\
                        <% var dir = (!isRealTime && (active==="active")) ? content.get("display.events.table.sortDirection") : ""%>\
                        <% var sorts = (!isRealTime && sortableFields && !hasPreviewEvents) ? "sorts" : ""; %>\
                        <% var reorderable = (!isRealTime) ? "reorderable" : ""; %>\
                        <% var reorderableLabel = (!isRealTime) ? "reorderable-label" : ""; %>\
                        <th class=" <%- reorderable %> <%- sorts %> <%-active%> <%-dir%>" data-name="<%- model.get("name") %>"><span class="<%- reorderableLabel %> <%- reorderableHandle %>"><%- _(model.get("name")).t() %></span></th>\
                    <% }) %>\
                </tr>\
            '
        });
    }
);

