define(
    [
        'jquery',
        'underscore',
        'module',
        'views/shared/PopTart',
        'models/services/saved/FVTags',
        'models/SplunkDBase',
        'views/shared/eventsviewer/shared/TagDialog',
        'util/general_utils',
        'splunk.util',
        'uri/route'
    ], 
    function($, _, module, PopTartView, FVTags, SplunkDModel, TagDialog, generalUtils, util, route) {
        return PopTartView.extend({
           /**
            * @param {Object} options {
            *      model: {
            *         application: <models.Application>,
            *         summary: <models.services.search.jobs.SummaryV2>
            *         field: <models.services.search.jobs.SummaryV2.fields[i]
            *     },
            *     collection: <collections.services.data.ui.WorkflowActions>
            * } 
            */
            className: 'dropdown-menu',
            moduleId: module.id,
            initialize: function(){
                PopTartView.prototype.initialize.apply(this, arguments);
                                
                if (this.options.field) {
                    this.fname = this.options.field.name;
                    this.fvalue = this.options.field.value;
                }

                this.model.tags = new FVTags();
                
                this.actions = this.collection[ 
                    this.isFieldAction() ? 'getFieldActions' : 'getEventActions' 
                ](this.model.event, this.fname);
            },
            isFieldAction: function() {
                return (this.fname && this.fvalue);
            },
            events: $.extend(true, {}, PopTartView.prototype.events, {
                'click a.actions': function(e) {
                    var data = $(e.target).data();

                    this[data.type](this.getTransformedAttrs(this.collection.at(data.idx)), data.target);

                    e.preventDefault();

                },
                'click a.edit-tag': function(e) {
                    e.preventDefault();
                    
                    this.model.tags.entry.content.set('name', this.fname + '=' + this.fvalue);

                    this.children.tagDialog = new TagDialog({
                        model: {
                            tags: this.model.tags,
                            application: this.model.application
                        },
                        onHiddenRemove: true
                    });
                    
                    this.children.tagDialog.on('tags_saved', function() {
                        this.model.event.setTagsSynthetically(this.fname, this.fvalue, this.model.tags.entry.content.get('tags'));
                        this.model.result.setTagsSynthetically(this.fname, this.fvalue, this.model.tags.entry.content.get('tags'));
                    },this);

                    this.model.tags.setId(
                        this.model.application.get('app'),
                        this.model.application.get('owner'),
                        this.fname, this.fvalue
                    );

                    this.model.clonedTags = new SplunkDModel();
                    this.model.clonedTags.setFromSplunkD(this.model.tags.toSplunkD());
                    this.model.clonedTags.set(this.model.clonedTags.idAttribute, this.model.tags.id);
                    this.model.clonedTags.fetch({
                        success: function() {
                            this.children.tagDialog.render().appendTo($("body"));
                            this.model.tags.setFromSplunkD(this.model.clonedTags.toSplunkD());
                            this.model.tags.entry.content.set('ui.tags',FVTags.tagArraytoString(this.model.tags.entry.content.get('tags')));
                            this.children.tagDialog.show();
                        }.bind(this),
                        error: function() {
                            this.children.tagDialog.render().appendTo($("body"));
                            this.model.tags.setFromSplunkD(this.model.clonedTags.toSplunkD());
                            this.model.tags.unset('id');
                            this.children.tagDialog.show();
                        }.bind(this)
                    });
                }
            }),
            uri: function(uri) {
                if(uri.indexOf('/') === 0) {
                    return route.encodeRoot(this.model.application.get('root'), this.model.application.get('locale')) + uri;
                }
                return uri;
            },
            link: function(content, target) {
                var uri = this.uri(content['link.uri']);
                if (content['link.method'].toLowerCase() === 'get') {
                    if(content['link.target'] === 'self') {
                        window.location.href = uri;
                    } else {
                        window.open(uri, '_blank');
                    }
                    return true;
                }
                var $form = $('<form class="workflow-action"/>');
                $form.attr('target', target);
                $form.attr('action', uri);
                $form.attr('method', 'post');
                _(generalUtils.filterObjectByRegexes(content, /^link\.postargs\.\d+\..*/)).each(function(v, k) {
                    $form.append($('<input/>').attr({
                        'type': 'hidden',
                        'name': k.replace(/^link\.postargs\.\d+\./, ''),
                        'value': v
                    }));  
                }, this);
                $('body').append($form);
                $('form.workflow-action').submit().remove();
                return false;
            },
            search: function(content, target){
                var options = {data: {}};
                if (util.normalizeBoolean(content['search.preserve_timerange'])) {
                    options.data.earliest = this.model.report.entry.content.get('dispatch.earliest_time') || '';
                    options.data.latest = this.model.report.entry.content.get('dispatch.latest_time') || '';
                } else {
                    options.data.earliest = content['search.earliest'] || '';
                    options.data.latest = content['search.latest'] || '';
                }

                options.data.q = content['search.search_string'];
                
                var url = route.page(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),  
                    content['eai:appName'], 
                    content['search.view'] || this.model.application.get('page'),
                    options
                );

                (target === '_self') ? (window.location.href = url): window.open(url, '_blank');
                return false;
            },    
            getTransformedAttrs: function(model) {
                var obj = {},
                    key = '',
                    content = model.entry.content.toJSON(),
                    sid = this.model.searchJob.get('id'),
                    eventSorting = this.model.searchJob.entry.content.get('eventSorting'),
                    offset = this.model.result.offset(this.model.result.results.indexOf(this.model.event)),
                    namespace = this.model.application.get('app'),
                    latest_time = this.model.report.entry.content.get('display.events.timelineLatestTime');

                _.each(content, function(value, key) {
                    if (typeof value == 'string') {
                        var systemSubstitute = model.systemSubstitute(
                            key,
                            value, 
                            sid, 
                            offset, 
                            namespace, 
                            latest_time, 
                            this.fname, 
                            this.fvalue
                        );
                        obj[key] = model.fieldSubstitute(key, systemSubstitute, this.model.event.toJSON(), this.fname, this.fvalue);
                    } else {
                        obj[key] = value;
                    }
                }, this);
                                                
                return obj;
            },
            render: function() {
                this.el.innerHTML = PopTartView.prototype.template_menu;
                this.$el.append(this.compiledTemplate({ 
                    getTransformedAttrs: this.getTransformedAttrs,
                    isFieldAction: this.isFieldAction(),
                    actions: this.actions,
                    collection: this.collection,
                    trim: util.smartTrim,
                    that: this, 
                    _:_
                }));
                return this;
            },
            template: '\
                <ul>\
                    <% if (isFieldAction) { %>\
                        <li>\
                            <a href="#" class="edit-tag"><%- _("Edit Tags").t() %></a>\
                        </li>\
                    <% } %>\
                    <% var i = 0, len = actions.length %>\
                    <% for(i; i<len; i++) { %>\
                        <% var attrs = getTransformedAttrs.call(that, collection.at(actions[i])); %>\
                        <li>\
                            <a class="actions" href="#" data-target="<%- "_"+(attrs["link.target"] || attrs["search.target"]) %>" data-idx="<%- that.actions[i] %>" data-type="<%-attrs["type"] %>"><%- _(trim(attrs["label"], 100)).t() %></a>\
                        </li>\
                    <% } %>\
                </ul>\
            '
        });
    }
);

