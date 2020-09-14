define(
    [
        'jquery',
        'underscore',
        'module',
        'views/shared/eventsviewer/Master',
        'views/shared/eventsviewerdrilldown/FieldValueDrilldown',
        'views/shared/eventsviewerdrilldown/SegmentationDrilldown',
        'views/shared/eventsviewerdrilldown/TagDrilldown',
        'views/shared/eventsviewer/shared/TimeInfo',
        'models/services/search/IntentionsParser',
        'uri/route'
    ],
    function(
        $,
        _,
        module,
        EventsViewer,
        FieldValueDrilldown,
        SegmentationDrilldown,
        TagDrilldown,
        TimeInfoDrilldown,
        IntentionsParserModel,
        route
    )
    {
        return EventsViewer.extend({
            initialize: function(options) {
                options = options || {};
                options.model = options.model || {};
                if (!options.model.intentions) {
                    options.model.intentions = new IntentionsParserModel();
                    this.createdDrilldownIntentions = true;
                }

                EventsViewer.prototype.initialize.call(this, options);
            },
            deactivate: function(options) {
                if (!this.active) {
                    return EventsViewer.prototype.deactivate.apply(this, arguments);
                }
                EventsViewer.prototype.deactivate.apply(this, arguments);
                if (this.createdDrilldownIntentions) {
                    this.model.intentions.clear();
                }
                this.lastTargetElement = undefined;
                return this;
            },
            openTagDrilldown: function(drilldownInfo) {
                var $target = drilldownInfo.$target,
                    stateModel = drilldownInfo.stateModel;

                if (this.children.tagDrilldown && this.children.tagDrilldown.shown) {
                    this.children.tagDrilldown.hide();
                    this.children.tagDrilldown.remove();
                    delete this.children.tagDrilldown;

                    if (this.lastTargetElement === $target[0]) {
                        return;
                    }
                }

                stateModel.set('modalizedRow', drilldownInfo.idx);
                
                this.children.tagDrilldown = new TagDrilldown({
                    taggedFieldName: drilldownInfo.data.field,
                    value: drilldownInfo.data.value,
                    action: drilldownInfo.data.action,
                    idx: drilldownInfo.idx,
                    usespath: drilldownInfo.data.usespath,
                    onHiddenRemove: true,
                    model: {
                        application: this.model.application,
                        report: this.model.report,
                        state: stateModel,
                        searchJob: this.model.searchJob
                    },
                    scrollContainer: $target.closest('.scrolling-table-wrapper'),
                    ignoreToggleMouseDown: true
                });

                this.lastTargetElement = $target[0];
                this.children.tagDrilldown.render().appendTo($('body')).show($target, {
                    onClickCloseFocus: $target.closest('tr.tabbable-list-row, tr.tabbable-table-primary-row, tr.tabbable-table-secondary-row')
                });
            },
            openSegmentationDrilldown: function(drilldownInfo) {
                var $target = drilldownInfo.$target,
                    stateModel = drilldownInfo.stateModel;
                $target.addClass('selected-segment');

                if (this.children.segmentationDrilldown && this.children.segmentationDrilldown.shown) {
                    this.children.segmentationDrilldown.hide();
                    this.children.segmentationDrilldown.remove();
                    delete this.children.segmentationDrilldown;
                    
                    if (this.lastTargetElement === $target[0]) {
                        return;
                    }
                }

                stateModel.set('modalizedRow', drilldownInfo.idx);

                this.children.segmentationDrilldown = new SegmentationDrilldown({
                    field: drilldownInfo.data.field,
                    value: drilldownInfo.data.value,
                    action: drilldownInfo.data.action,
                    usespath: drilldownInfo.data.usespath,
                    idx: drilldownInfo.idx,
                    onHiddenRemove: true,
                    model: {
                        application: this.model.application,
                        report: this.model.report,
                        state: stateModel,
                        searchJob: this.model.searchJob
                    },
                    scrollContainer: $target.closest('.scrolling-table-wrapper'),
                    ignoreToggleMouseDown: true
                });

                this.lastTargetElement = $target[0];
                this.children.segmentationDrilldown.render().appendTo($('body')).show($target, {
                    $onClickCloseFocus: $target.closest('tr.tabbable-list-row, tr.tabbable-table-primary-row, tr.tabbable-table-secondary-row')
                });
                this.listenToOnce(this.children.segmentationDrilldown, 'hidden', function() {
                    $target.removeClass('selected-segment');
                });
            },
            openFieldDrilldown: function(drilldownInfo) {
                var $pointTo = drilldownInfo.$anchor || drilldownInfo.$target,
                    stateModel = drilldownInfo.stateModel,
                    field = drilldownInfo.data.field,
                    fieldModel = this.model.summary.findByFieldName(field),
                    value = drilldownInfo.data.value,
                    action = drilldownInfo.data.action;

                if (this.children.fieldValueDrilldown && this.children.fieldValueDrilldown.shown) {
                    this.children.fieldValueDrilldown.hide();
                    this.children.fieldValueDrilldown.remove();
                    delete this.children.fieldValueDrilldown;
                    
                    if (this.lastTargetElement === $pointTo[0]) {
                        return;
                    }   
                }
                
                $pointTo.addClass('selected-segment');
                stateModel.set('modalizedRow', drilldownInfo.idx);

                this.children.fieldValueDrilldown = new FieldValueDrilldown({
                    field: field,
                    value: value,
                    action: action,
                    idx: drilldownInfo.idx,
                    onHiddenRemove: true,
                    usespath: drilldownInfo.data.usespath,
                    model: {
                        field: fieldModel,
                        application: this.model.application,
                        report: this.model.report,
                        state: stateModel,
                        searchJob: this.model.searchJob
                    },
                    scrollContainer: $pointTo.closest('.scrolling-table-wrapper'),
                    ignoreToggleMouseDown: true
                });

                this.lastTargetElement = $pointTo[0];
                this.children.fieldValueDrilldown.render().appendTo($('body')).show($pointTo, {
                    $toggle: drilldownInfo.$target,
                    $onClickCloseFocus: $pointTo.closest('tr.tabbable-list-row, tr.tabbable-table-primary-row, tr.tabbable-table-secondary-row')
                });
                this.listenToOnce(this.children.fieldValueDrilldown, 'hidden', function() {
                    $pointTo.removeClass('selected-segment');
                });
            },
            openTimeInfoDrilldown: function(drilldownInfo) {
                var time = drilldownInfo.$anchor.data().timeIso;
                
                if (this.children.timeInfoDrilldown && this.children.timeInfoDrilldown.shown) {
                    this.children.timeInfoDrilldown.hide();
                    this.children.timeInfoDrilldown.remove();
                    delete this.children.timeInfoDrilldown;
                    return;
                }
                
                //modalize
                drilldownInfo.stateModel.set('modalizedRow', drilldownInfo.idx);

                this.children.timeInfoDrilldown = new TimeInfoDrilldown({
                    model: {
                        report: this.model.report
                    },
                    header: _('_time').t(),
                    time: time,
                    onHiddenRemove: true,
                    scrollContainer: drilldownInfo.$anchor.closest('.scrolling-table-wrapper'),
                    ignoreToggleMouseDown: true
                });

                this.children.timeInfoDrilldown.render().appendTo($('body')).show(drilldownInfo.$anchor, {
                    $toggle: drilldownInfo.$target,
                    $onClickCloseFocus: drilldownInfo.$anchor.closest('tr.tabbable-list-row, tr.tabbable-table-primary-row, tr.tabbable-table-secondary-row')
                });         
            },
            drilldownHandler: function(drilldownInfo) {
                var newWindow, domEvent, drilldown, ddDeferred;
                
                switch (drilldownInfo.type) {
                    case 'tag':
                        this.openTagDrilldown(drilldownInfo);
                        return;
                    case 'segmentation':
                        this.openSegmentationDrilldown(drilldownInfo);
                        return;
                    case 'fieldvalue':
                        this.openFieldDrilldown(drilldownInfo);
                        return;
                    case 'time':
                        this.openTimeInfoDrilldown(drilldownInfo);
                        return;                        
                    default:
                        domEvent = drilldownInfo.event;
                        drilldown = this.getDrilldownCallback(drilldownInfo.data, drilldownInfo.noFetch);
                        ddDeferred = drilldown();
                        
                        if (!drilldownInfo.noFetch) {
                            if (domEvent.ctrlKey || domEvent.metaKey || drilldownInfo.newTab) {
                                newWindow = window.open();
                            }
                            
                            $.when(ddDeferred).then(function() {
                                var search = this.model.intentions.fullSearch(),
                                    searchRoute = route.search(this.model.application.get('root'), this.model.application.get('locale'), this.model.application.get('app'), {
                                    data: {
                                        q: search,
                                        earliest: this.model.report.entry.content.get('dispatch.earliest_time'),
                                        latest: this.model.report.entry.content.get('dispatch.latest_time')
                                    }
                                });
                                
                                if (newWindow) {
                                    this.model.intentions.clear({silent: true});
                                    newWindow.location = searchRoute;
                                } else {
                                    this.model.state.trigger('unmodalize');
                                    if (this.options.setLocation) {
                                        window.location = searchRoute;
                                    } else {
                                        this.model.report.entry.content.set('search', search);
                                    }
                                }
                            }.bind(this));
                        }
                        
                        this.trigger('drilldown', drilldownInfo, drilldown);
                }
            }
        });
    }
);
