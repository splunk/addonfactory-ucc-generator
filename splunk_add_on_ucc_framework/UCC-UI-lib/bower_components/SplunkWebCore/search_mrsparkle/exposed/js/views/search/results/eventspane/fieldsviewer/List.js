define(
    [
        'underscore',
        'backbone',
        'jquery',
        'module',
        'views/Base',
        'views/shared/FieldInfo',
        'views/shared/fieldpicker/Master',
        'models/Base',
        'models/services/search/jobs/Summary',
        'splunk.util',
        'splunk.i18n',
        'uri/route'
    ],
    function(_, Backbone, $, module, Base, FieldInfoView, PickerView, BaseModel, SummaryModel, splunkUtil, i18n, route) {
        return Base.extend({
            className: 'fieldsviewer-list',
            moduleId: module.id,
            /**
             * @param {Object} options {
             *     model: {
             *          summary: <model.services.search.job.SummaryV2>,
             *          searchJob: <models.Job>,
             *          report: <models.services.SavedSearch>,
             *          application: <models.Application>
             *     },
             *     collections: {
             *         selectedFields: <collections.SelectedFields>,
             *     }
             * }
             */
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
                this.model.state = new BaseModel(); 
                this.model.field = new SummaryModel.Field();
                this.lastRenderedField = '';
            },
            startListening: function() {
                this.listenTo(this.model.state, 'change:activeFieldName', this.render);
                this.listenTo(this.model.summary.fields, 'reset', function() {
                    var activeFieldName = this.model.state.get('activeFieldName');
                    if (activeFieldName) {
                        if (!this.model.summary.findByFieldName(activeFieldName)) {
                            this.model.state.unset('activeFieldName');
                            return;
                        }
                    }
                    this.render();
                });
                this.listenTo(this.model.summary, 'change:fieldPickerOpen', function() {
                    if(!this.model.summary.get('fieldPickerOpen')){
                        this.children.picker && this.children.picker.remove();
                    }
                });
                this.listenTo(this.collection.selectedFields, 'reset remove add', this.render);
            },
            activate: function(options) {
                if (this.active) {
                    return Base.prototype.activate.apply(this, arguments);
                }
                this.render();

                if (this.model.report.get('openFirstFieldInfo')) {
                    this.model.report.unset('openFirstFieldInfo');
                    var mockEvent = {};
                    mockEvent.currentTarget = this.$el.find('a:first');
                    this.openFieldInfo(mockEvent);
                }
                return Base.prototype.activate.apply(this, arguments);
            },
            deactivate: function(options) {
                if (!this.active) {
                    return Base.prototype.deactivate.apply(this, arguments);
                }
                Base.prototype.deactivate.apply(this, arguments);
                this.model.state.clear();
                this.model.field.clear();
                return this;
            },
            events: {
                'click ol li a': function(e) {
                    e.preventDefault();
                },
                'mousedown ol li a': function(e) {
                    this.openFieldInfo(e);
                    e.preventDefault();
                },
                'keydown ol li a': function(e) {
                    if (e.keyCode == 13) {
                        this.openFieldInfo(e);
                        e.preventDefault();
                    }
                }
            },
            openFieldInfo: function(e) {
                var activeFieldName = $(e.currentTarget).attr('data-field-name');
                
                if (this.model.state.get('activeFieldName') == activeFieldName) { 
                    return;
                }
                this.model.state.set('activeFieldName', activeFieldName);
            },
            render: function() {
                var selected = this.model.summary.fields.filter(function(field) {
                        return !!this.collection.selectedFields.findWhere({name: field.get('name')});
                    }, this),
                    interesting = _.filter(this.model.summary.filterByMinFrequency(0.2), function(field) {
                        return !this.collection.selectedFields.findWhere({name: field.get('name')});
                    }, this),
                    additional = this.model.summary.fields.length - selected.length - interesting.length;
                this.$el.html(this.compiledTemplate({
                    _: _,
                    splunkUtil: splunkUtil,
                    i18n: i18n,
                    fields: this.model.summary.fields,
                    interesting: interesting,
                    interestingClassName: "interesting-fields-list",
                    selected: selected,
                    selectedClassName: "selected-fields-list",
                    additional: additional,
                    _partial: this._partial,
                    activeFieldName: this.model.state.get('activeFieldName'),
                    extractFieldsHref: route.field_extractor(
                        this.model.application.get('root'),
                        this.model.application.get('locale'),
                        this.model.application.get('app'),
                        { data: { sid: this.model.searchJob.id } }
                    )
                }));
                this.initAndRenderFieldInfo();
                return this;
            },
            initAndRenderFieldInfo: function() {
                var activeFieldName = this.model.state.get('activeFieldName'),
                    prevFocusedInfo={},
                    $target = this.$('a[data-field-name="' + activeFieldName + '"]'),
                    $onOpenFocus = null;
                    
                
                if (this.children.fieldInfo) {
                    if (this.children.fieldInfo.shown &&
                        this.lastRenderedField === activeFieldName) {
                        var $prevFocused = this.children.fieldInfo.$(':focus');

                        if ($prevFocused.length) {
                            _.extend(prevFocusedInfo, {
                                tag:  $prevFocused.prop('tagName'),
                                html: $prevFocused.html(),
                                hasCloseClass: $prevFocused.hasClass('close')
                            });
                        }
                    }
                    this.children.fieldInfo.off(null, null, this);
                    this.children.fieldInfo.remove();
                }
                if($target.length){
                    this.model.field.replace(this.model.summary.findByFieldName(activeFieldName).toJSON());
                    this.children.fieldInfo = new FieldInfoView({
                        model: {
                            field: this.model.field,
                            summary: this.model.summary,
                            report: this.model.report,
                            application: this.model.application
                        },
                        collection: {selectedFields: this.collection.selectedFields},
                        direction: 'right',
                        onHiddenRemove: true
                    });

                    this.children.fieldInfo.render().appendTo($('body'));

                    // SPL-101485: set focus on first anchor or previous focused element.
                    if (!_.isEmpty(prevFocusedInfo)) {
                        if (prevFocusedInfo['hasCloseClass']) {
                            $onOpenFocus = this.children.fieldInfo.$('.close');
                        } else {
                            $onOpenFocus = this.children.fieldInfo.$(prevFocusedInfo['tag'])
                                            .filter(function(){
                                                return $(this).html() === prevFocusedInfo['html'];
                                            });   
                        }
                    }

                    if (!$onOpenFocus || !$onOpenFocus.length) {
                        $onOpenFocus = this.children.fieldInfo.$('a:first');
                    }

                    this.children.fieldInfo.show($target, {
                        $onOpenFocus: $onOpenFocus
                    });
                    this.children.fieldInfo.on('hidden', function() {
                        this.$('a[data-field-name="' + this.model.state.get('activeFieldName') + '"]').removeClass('active');
                        this.model.state.unset('activeFieldName', {silent: true});
                    }, this);

                    this.lastRenderedField = this.model.state.get('activeFieldName');
                }
            },
            template: '\
                <% if (selected.length) { %>\
                    <h6><%- _("Selected Fields").t() %></h6>\
                    <%= _partial({fields: selected, activeFieldName: activeFieldName, className: selectedClassName}) %>\
                <% } %>\
                <% if (interesting.length) { %>\
                    <h6><%- _("Interesting Fields").t() %></h6>\
                    <%= _partial({fields: interesting, activeFieldName: activeFieldName, className: interestingClassName}) %>\
                <% } %>\
                <% if (additional > 0) {%>\
                    <a href="#" class="additional-fields" title="<%- _("show additional fields").t() %>">\
                        <% if(interesting.length == 0 && selected == 0) { %>\
                            <%- splunkUtil.sprintf(i18n.ungettext("%s field", "%s fields", additional), additional) %>\
                        <% } else { %>\
                            <%- splunkUtil.sprintf(i18n.ungettext("%s more field", "%s more fields", additional), additional) %>\
                        <% } %>\
                    </a>\
                <% } %>\
                <a href="<%- extractFieldsHref %>" class="extract-fields-button">\
                    <i class="icon icon-plus"></i>\
                    <%- _("Extract New Fields").t() %>\
                </a>\
            ',
            _partial: _.template('\
                <ol class="<%- className%>">\
                    <% _.each(fields, function(field) { %>\
                        <li>\
                            <a href="#" data-field-name="<%- field.get("name") %>" class="<%= (activeFieldName==field.get("name")) ? "active" : "" %>">\
                                <span class="fields-type font-icon"><%- field.isNumeric() ? "#" : "a" %></span>\
                                <span class="field-name"><%- field.get("name") %></span>\
                                <span class="field-count numeric"><%- field.get("distinct_count") %><%- field.get("is_exact") ? "" : "+" %></span>\
                            </a>\
                        </li>\
                    <% }); %>\
                </ol>\
            ')
        });
    }
);
