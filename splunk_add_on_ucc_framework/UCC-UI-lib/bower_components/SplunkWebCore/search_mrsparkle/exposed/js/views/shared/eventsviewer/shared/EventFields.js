define(
    [
        'jquery',
        'underscore',
        'backbone',
        'module',
        'views/shared/eventsviewer/shared/BaseFields',
        'jquery.resize'
    ],
    function(
        $,
        _,
        Backbone,
        module,
        FieldsView,
        jqueryResize
     ){
        return FieldsView.extend({
            moduleId: module.id,
            /**
             * @param {Object} options {
             *      model: {
             *         event: <models.services.search.job.ResultsV2.result[i]>,
             *         summary: <model.services.search.job.SummaryV2>,
             *         application: <model.Application>,
             *         searchJob: <models.Job>
             *     }
             *     collection: {
             *         selectedFields: <collections.SelectedFields>
             *         workflowActions: <collections.WorkflowActions>
             *     },
             *     selectableFields: true|false,
             *     swappingKey: The swap key to observe a loading event on
             * }
             */
            initialize: function(){
                FieldsView.prototype.initialize.apply(this, arguments);
                this.swappingKey  = this.options.swappingKey;
                this.showAllLines = this.options.showAllLines;
                this.rowExpanded  = 'r' + this.options.idx;
                this.timeExpanded = 't' + this.options.idx;
                this.timeFieldsList = this.model.event.time();
            },
            startListening: function() {
                FieldsView.prototype.startListening.apply(this, arguments);
                this.listenTo(this.model.event, 'change', function(model, options) {
                    if (options.swap) {
                        this.isSwapping = false;
                    }
                    this.timeFieldsList = this.model.event.time();
                    this.debouncedRender();
                });
                
                this.listenTo(this.model.event.tags, 'change', this.debouncedRender);

                this.listenTo(this.model.event.highlighted, 'change', this.debouncedRender);
                
                this.listenTo(this.model.event, 'tags-updated', this.render);
                
                this.listenTo(this.model.event, 'failed-swap', function() {
                    this.$('.event-fields-loading').text(_('We were unable to provide the correct event').t());
                });
                
                this.listenTo(this.model.state, 'change:' + this.timeExpanded, this.render);

                this.listenTo(this.model.state, 'change:' + this.showAllLines, function() { this.isSwapping = true; });
                this.listenTo(this.model.result, this.swappingKey, function() { this.isSwapping = true; });
                this.$el.on('elementResize', function(e) {
                    this.invalidateReflow();
                }.bind(this));
            },
            activate: function(options) {
                if (this.active) {
                    return FieldsView.prototype.activate.apply(this, arguments);
                }
                
                this.isSwapping = true;                
                FieldsView.prototype.activate.apply(this, arguments);
                this.render();
                return this;
            },
            deactivate: function(options) {
                if (!this.active) {
                    return FieldsView.prototype.deactivate.apply(this, arguments);
                }

                this.$el.off('elementResize');
                FieldsView.prototype.deactivate.apply(this, arguments);
                return this;
            },
            remove: function() {
                this.$el.off('elementResize');
                return FieldsView.prototype.remove.apply(this, arguments);
            },
            events: $.extend({}, FieldsView.prototype.events, {
                'click a._time-expand' : function(e) {
                    this.model.state.set(this.timeExpanded, !this.model.state.get(this.timeExpanded));
                    e.preventDefault();
                },
                'click a.show-field': function(e) {
                    var $eye = $(e.currentTarget),
                        fieldName = $.trim($eye.closest('td').siblings('.field-key').text());
                    this.collection.selectedFields.push({ 'name': fieldName });
                    e.preventDefault();
                },
                'click a.hide-field': function(e) {
                    var $eye = $(e.currentTarget),
                        fieldName = $.trim($eye.closest('td').siblings('.field-key').text());
                    this.collection.selectedFields.remove(this.collection.selectedFields.find(function(model) {
                        return model.get('name')===fieldName;
                    }, this));
                    e.preventDefault();
                },
                'click a.btn.disabled': function(e) {
                    e.preventDefault();
                },

                /*
                * For 508 compliance we will refocus the user on the first tabbable 
                * element in the event fields (implementing circular tabbing) when 
                * they tab out of the last tabbable elem. 
                */
                'keydown td.actions:last': function(e) {
                    if(!e.shiftKey && e.keyCode === 9) {
                        e.preventDefault();
                        this.$el.parent().find('a.event-actions').focus();
                    }
                },
                'keydown': function(e) {
                    if(e.keyCode === 27) {
                        e.preventDefault();
                        this.model.state.set(this.rowExpanded, false);
                    }
                }
            }),
            setMaxWidth: function() {
                if (!this.el.innerHTML || !this.$el.is(":visible")) {
                    return false;
                }
            
                var $stylesheet =  $("#"+this.cid+"-styles");
                $stylesheet && $stylesheet.remove();
                
                var $wrapper = this.$el.closest('table').parent(),
                    wrapperWidth=$wrapper.width(),
                    wrapperLeft=$wrapper.offset().left - $wrapper.scrollLeft(),
                    margin=20,
                    elLeft=this.$el.offset().left,
                    maxWidth= wrapperWidth - (elLeft - wrapperLeft) - margin,
                    maxWidthPx = (maxWidth > 500? maxWidth : 500) + "px";
                
                this.$('table').css('maxWidth', maxWidthPx);
            },
            reflow: function() {
                this.setMaxWidth();
            },
            shouldHideEventActions: function() {
                var validActions = this.collection.workflowActions.getEventActions(this.model.event);

                return (this.model.searchJob.isRealtime() || !validActions.length);
            },
            render: function() {
                var strippedfields = this.model.event.strip(),
                    selectedfields = _.intersection(strippedfields, this.collection.selectedFields.pluck('name')).sort(),
                    eventfields = _.difference(this.model.event.notSystemOrTime(), selectedfields).sort(),
                    timefields = _.difference(this.timeFieldsList, selectedfields).sort(),
                    timefieldsNoTime = _.difference(timefields, ['_time']),
                    systemfields = _.difference(this.model.event.system(), selectedfields).sort(),
                    isTimeExpanded = this.model.state.get(this.timeExpanded);

                this.$el.html(this.compiledTemplate({
                    selectedfields: selectedfields,
                    eventfields: eventfields,
                    timefields: isTimeExpanded ? timefieldsNoTime : [],
                    systemfields: systemfields,
                    expanded: (timefields.length === 1) ? '': (isTimeExpanded ? 'icon-minus-circle': 'icon-plus-circle'),
                    selectableFields: this.options.selectableFields,
                    hideEventActions: this.shouldHideEventActions(),
                    m: this.model.event,
                    mTime: this.model.event.get('_time'),
                    slen: this.model.summary.fields.length,
                    _partial: this._partial,
                    isSwapping: false,
                    _:_
                }));
                this.setMaxWidth();
                return this;
            },
            template:'\
                <% if (!isSwapping) { %>\
                    <% if (!hideEventActions) { %>\
                        <a class="btn popdown-toggle event-actions" href="#"><span><%-_("Event Actions").t()%></span><span class="caret"></span></a>\
                    <% } %>\
                    <table class="table table-condensed table-embed table-expanded table-dotted">\
                        <thead>\
                            <th class="col-field-type"><%- _("Type").t() %></th>\
                            <% if(selectableFields){ %> <th class="col-visibility"><label class="checkbox"><a href="#" class="btn disabled"><i class="icon-check"></i></a></label></th><% } %>\
                            <th class="col-field-name"><%- _("Field").t() %></th>\
                            <th class="col-field-value"><%- _("Value").t() %></th>\
                            <th class="col-field-action"><%- _("Actions").t() %></th>\
                        </thead>\
                        <tbody>\
                        <%= _partial({fields: selectedfields, slen: slen, iconVisibility: true, m: m, label: _("Selected").t(), selectableFields: selectableFields}) %>\
                        <%= _partial({fields: eventfields, slen: slen, iconVisibility: false, m: m, label: _("Event").t(), selectableFields: selectableFields}) %>\
                        <% if (mTime) { %>\
                            <tr>\
                                <td rowspan="<%- m.getFieldsLength(timefields) + 1 %>" class="field-type"><%- _("Time").t() %><a class="_time-expand <%= expanded %>" href="#"></a></td>\
                                <% if (selectableFields) { %>\
                                    <td></td>\
                                <% } %>\
                               <td class="time">\
                                   <a class="popdown-toggle _time" href="#" data-time="<%- mTime[0] %>">\
                                       <span>_time</span><span class="caret"></span>\
                                   </a>\
                               </td>\
                               <td class="field-value f-v"><%- mTime[0] %>\
                                   <% var tags = m.getTags("_time", mTime); %>\
                                   <% if (tags.length > 0) { %>(<% _(tags).each(function(tag, idx){ %><a data-field-name="_time" data-tagged-field-name="tag::_time" class="tag" href="#"><%- tag %><%if(idx!=tags.length-1){%> <%}%></a><% }); %>)<% } %>\
                               </td>\
                               <td class="actions"></td>\
                            </tr>\
                        <% } %>\
                        <%= _partial({fields: timefields, slen: slen, iconVisibility: false, m: m, label: null, selectableFields: selectableFields}) %>\
                        <%= _partial({fields: systemfields, slen: slen, iconVisibility: false, m: m, label: _("Default").t(), selectableFields: selectableFields}) %>\
                        </tbody>\
                    </table>\
                <% } else { %>\
                    <div class="event-fields-loading">Loading...</div>\
                <% } %>\
            '
        });
    }
);
