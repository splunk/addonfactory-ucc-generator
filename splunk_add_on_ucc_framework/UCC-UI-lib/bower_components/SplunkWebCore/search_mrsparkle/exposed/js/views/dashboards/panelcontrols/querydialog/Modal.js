define([
    'underscore',
    'jquery',
    'module',
    'views/shared/controls/ControlGroup',
    'views/shared/delegates/ModalTimerangePicker',
    'views/shared/timerangepicker/dialog/Master',
    'views/shared/Modal',
    'models/shared/TimeRange',
    'collections/services/data/ui/Times',
    'splunk.util',
    'splunkjs/mvc/utils',
    'views/Base',
    'uri/route',
    'util/time',
    'bootstrap.tooltip',
    'util/console',
    'splunkjs/mvc',
    'views/shared/FlashMessages',
    'views/dashboards/PanelTimeRangePicker',
    'splunkjs/mvc/tokenawaremodel'],
    function(_,
             $,
             module,
             ControlGroup,
             TimeRangeDelegate,
             TimeRangePickerView,
             Modal,
             TimeRangeModel,
             TimeRangeCollection,
             splunkUtils,
             utils,
             BaseView,
             route,
             time_utils,
             _bootstrapTooltip,
             console,
             mvc,
             FlashMessagesView,
             PanelTimeRangePicker,
             TokenAwareModel
    ){

        function mergeSearch(base, sub) {
            if (!sub) {
                return base;
            }
            return [ base.replace(/[\|\s]$/g,''), sub.replace(/^[\|\s]/g,'') ].join(' | ');
        }

        var PanelTimeRangeModel = TimeRangeModel.extend({
            validation: _.extend({
                earliest_token: function(value, attr, computedState) {
                    if(computedState.useTimeFrom === 'tokens' && !value) {
                        return 'No value specified for earliest token.';
                    }
                },
                latest_token: function(value, attr, computedState) {
                    if(computedState.useTimeFrom === 'tokens' && !value) {
                        return 'No value specified for latest token.';
                    }
                }
            }, TimeRangeModel.prototype.validation)
        });

        var ReportModel = TokenAwareModel.extend({
            validation: {             
                'search': function(value, attr, computedState) {
                    if (!this.get(attr, {tokens: true})) {
                        return _("Search string is required").t();
                    }
                }
            }
        });
        return Modal.extend({
            moduleId: module.id,
            className: 'modal edit-search-string',
            initialize: function() {
                Modal.prototype.initialize.apply(this, arguments);

                this.model.workingReport = new ReportModel(
                    _.pick(
                            this.model.report.entry.content.toJSON({ tokens: true }),
                            ['search','dispatch.earliest_time','dispatch.latest_time']
                    ),
                    {
                        applyTokensByDefault: true,
                        retrieveTokensByDefault: true
                    }
                );
                this.children.title = new ControlGroup({
                    label: _("Title").t(), 
                    controlType: 'Label', 
                    controlClass: 'controls-block',
                    controlOptions: {
                        model: this.model.report.entry.content, 
                        modelAttribute: 'display.general.title'
                    }
                });
                this.children.searchStringInput = new ControlGroup({
                    label: _("Search String").t(),
                    controlType:'Textarea',
                    controlClass: 'controls-block',
                    controlOptions: {
                        model: this.model.workingReport,
                        modelAttribute: 'search'
                    }
                });
                if(this.model.report.isPivotReport()){
                    this.children.searchStringInput.options.help =
                        '<a href="#" class="run-pivot">'+_("Run Pivot").t()+
                        ' <i class="icon-external"></i></a>';
                }else{
                    this.children.searchStringInput.options.help =
                        '<a href="#" class="run-search">'+_("Run Search").t()+
                        ' <i class="icon-external"></i></a>';
                }
                this.collection = this.collection || {};
                this.collection.times = new TimeRangeCollection();
                this.collection.times.fetch({
                    data: {
                        app: this.model.application.get("app"),
                        owner: this.model.application.get("owner"),
                        count: -1
                    }
                });
                this.model.timeRange = new PanelTimeRangeModel();

                this.children.timeRangePickerView =  new TimeRangePickerView({
                    model: {
                        state: this.model.workingReport,
                        timeRange: this.model.timeRange,
                        application: this.model.application,
                        user: this.model.user,
                        appLocal: this.model.appLocal
                    },
                    collection: this.collection.times,
                    appendSelectDropdownsTo: '.modal:visible'
                });

                this.model.timeRange.on('applied', function() {
                    this.timeRangeDelegate.closeTimeRangePicker();
                }, this);

                this.children.panelTimeRangePicker = new PanelTimeRangePicker({
                    model: {
                        timeRange: this.model.timeRange,
                        report: this.model.workingReport,
                        state: this.model.state
                    },
                    collection: this.collection.times
                });
                this.children.flashMessages = new FlashMessagesView({ model: this.model.dashboard });
                this.children.searchFlashMessages = new FlashMessagesView({ model: this.model.workingReport });
                //reset flashmessages to clear pre-existing flash messages on 'cancel' or 'close' of dialog
                this.on('hide', this.model.dashboard.error.clear, this.model.dashboard.error); 
                this.listenTo(this.model.report, 'successfulSave', this.hide, this); 

            },
            events: $.extend({}, Modal.prototype.events, {
                'click .modal-btn-primary': function(e){
                    e.preventDefault();

                    var useTimeFrom = this.model.timeRange.get('useTimeFrom');
                    var timeTokenPrefix = useTimeFrom == "global" ? '': useTimeFrom + '.';
                    this.children.flashMessages.flashMsgCollection.reset();
                    this.children.searchFlashMessages.flashMsgCollection.reset();
                    if (this.model.workingReport.validate()) {
                        return;
                    }
                    if (useTimeFrom === "tokens") {
                        var ret = this.model.timeRange.validate();
                        if(ret) {
                            _.each(ret, function(val) {
                                this.children.flashMessages.flashMsgCollection.add({
                                    key: 'token-' + val,
                                    type: 'error',
                                    html: _.escape(_(val).t())
                                });
                            }, this);
                            return;
                        }
                        var earliestToken = this.model.timeRange.get('earliest_token');
                        var latestToken = this.model.timeRange.get('latest_token');
                        this.model.workingReport.set({
                            'dispatch.earliest_time': '$' + earliestToken + '$',
                            'dispatch.latest_time': '$' + latestToken + '$'
                        }, {tokens: true});
                    } else if (useTimeFrom !== "search"){
                        this.model.workingReport.set({
                            'dispatch.earliest_time': '$' + timeTokenPrefix +'earliest$',
                            'dispatch.latest_time': '$' + timeTokenPrefix +'latest$'
                        }, {tokens: true});
                    } else {
                        this.model.workingReport.set({
                            'dispatch.earliest_time': this.model.timeRange.get('earliest') || "0",
                            'dispatch.latest_time': this.model.timeRange.get('latest') || ""
                        });
                    }
                    var newAttributes = this.model.workingReport.toJSON();
                    console.log('Applying attributes to report model: %o', newAttributes);
                    this.model.report.trigger('updateSearchString', newAttributes);
                },
                'click a.run-search': function(e) {
                    e.preventDefault();
                    var search = this.model.workingReport.get('search', { tokens: false });
                    var reportContent = this.model.report.entry.content;
                    if (reportContent.get('display.general.search.type') === 'postprocess') {
                        var manager = mvc.Components.get(reportContent.get('display.general.managerid'));
                        if (manager && manager.parent) {
                            var baseSearch = manager.parent.settings.resolve();
                            search = mergeSearch(baseSearch, search);
                        } else {
                            return;
                        }
                    }
                    if(!search) {
                        return;
                    }
                    var params = { q: search };
                    if(this.model.workingReport.has('dispatch.earliest_time')) {
                        params.earliest = this.model.workingReport.get('dispatch.earliest_time', { tokens: false } || '0');
                        params.latest = this.model.workingReport.get('dispatch.latest_time', { tokens: false }) || '';
                    }
                    var pageInfo = utils.getPageInfo();
                    var url = route.search(pageInfo.root, pageInfo.locale, pageInfo.app, { data: params });
                    utils.redirect(url, true);
                }, 
                'click a.run-pivot': function(e) {
                    e.preventDefault();
                    var search = this.model.workingReport.get('search', { tokens: false }), params = { q: search };
                    if(!search) {
                        return;
                    }
                    if(this.model.workingReport.has('dispatch.earliest_time')) {
                        params.earliest = this.model.workingReport.get('dispatch.earliest_time', { tokens: false });
                        params.latest = this.model.workingReport.get('dispatch.latest_time', { tokens: false });
                    }
                    var pageInfo = utils.getPageInfo();
                    var url = route.pivot(pageInfo.root, pageInfo.locale, pageInfo.app, { data: params });
                    utils.redirect(url, true);
                }
            }),
            handleSubmitButtonState: function(model) {
                this.$(Modal.FOOTER_SELECTOR)
                    .find('.btn-primary')[model.get('elementCreateType') === 'pivot' ? 'addClass' : 'removeClass']('disabled');
            },
            render: function() {
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Edit Search").t());

                this.$(Modal.BODY_SELECTOR).remove();

                this.$(Modal.FOOTER_SELECTOR).before(
                    '<div class="vis-area">' +
                        '<div class="slide-area">' +
                            '<div class="content-wrapper query-dialog-wrapper">' +
                                '<div class="' + Modal.BODY_CLASS + '" >' +
                                '</div>' +
                            '</div>' +
                            '<div class="timerange-picker-wrapper">' +
                            '</div>' +
                        '</div>' +
                    '</div>'
                );

                this.$visArea = this.$('.vis-area').eq(0);
                this.$slideArea = this.$('.slide-area').eq(0);
                this.$editSearchContent = this.$('.query-dialog-wrapper').eq(0);
                this.$timeRangePickerWrapper = this.$('.timerange-picker-wrapper').eq(0);
                this.$modalParent = this.$el;

                this.$(Modal.BODY_SELECTOR).prepend(this.children.flashMessages.render().el);                
                this.$(Modal.BODY_SELECTOR).prepend(this.children.searchFlashMessages.render().el);                
                this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL_JUSTIFIED);
                this.children.title.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));
                this.children.searchStringInput.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));
                
                var dfd = this.model.timeRange.save({
                    'earliest': this.model.workingReport.get('dispatch.earliest_time', {tokens: false} || "0"),
                    'latest': this.model.workingReport.get('dispatch.latest_time', {tokens: false} || "now")
                }); 

                dfd.done(_.bind(function(){
                    this.$(Modal.BODY_FORM_SELECTOR).append(this.children.panelTimeRangePicker.render().el);
                }, this)); 

                this.$timeRangePickerWrapper.append(this.children.timeRangePickerView.render().el);

                this.timeRangeDelegate = new TimeRangeDelegate({
                    el: this.el,
                    $visArea: this.$visArea,
                    $slideArea: this.$slideArea,
                    $contentWrapper: this.$editSearchContent,
                    $timeRangePickerWrapper: this.$timeRangePickerWrapper,
                    $modalParent: this.$modalParent,
                    $timeRangePicker: this.children.timeRangePickerView.$el,
                    activateSelector: 'a.timerange-control',
                    backButtonSelector: 'a.btn.back'
                });

                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_SAVE);
                this.$(Modal.FOOTER_SELECTOR).append('<a href="#" class="btn back modal-btn-back pull-left">' + _('Back').t() + '</a>');
                this.$('.btn.back').hide();

                return this;
            }
        });
    }
);
