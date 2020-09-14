define([
        'underscore',
        'jquery',
        'backbone',
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
        'splunkjs/mvc/postprocessmanager',
        'views/shared/FlashMessages',
        'views/dashboard/editor/addcontent/preview/content/SearchTextareaControl',
        'views/dashboard/editor/element/TimeRangePanel',
        'controllers/dashboard/helpers/ModelHelper',
        'splunkjs/mvc/tokenawaremodel',
        'util/moment/relative',
        'splunkjs/mvc/tokenutils',
        './EditSearch.pcss'
], function(_,
             $,
             Backbone,
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
             PostProcessSearchManager,
             FlashMessagesView,
             SearchTextareaControl,
             PanelTimeRangePicker,
             ModelHelper,
             TokenAwareModel,
             RelativeTimeUtil,
             TokenUtils,
             css) {

        function mergeSearch(base, sub) {
            if (!sub) {
                return base;
            }
            return [base.replace(/[\|\s]$/g, ''), sub.replace(/^[\|\s]/g, '')].join(' | ');
        }

        var PanelTimeRangeModel = TimeRangeModel.extend({
            validation: _.extend({
                earliest_token: function(value, attr, computedState) {
                    if (computedState.useTimeFrom === 'tokens' && !value) {
                        return 'No value specified for earliest token.';
                    }
                },
                latest_token: function(value, attr, computedState) {
                    if (computedState.useTimeFrom === 'tokens' && !value) {
                        return 'No value specified for latest token.';
                    }
                }
            }, TimeRangeModel.prototype.validation)
        });

        var validateSearchModel = TokenAwareModel.extend({
            validation: {
                'search': function(value, attr, computedState) {
                    if (!this.get(attr, {tokens: true})) {
                        return _("Search string is required").t();
                    }
                },
                'refresh': function(value, attr) {
                    var val = this.get(attr, {tokens: true});
                    if (val) {
                        if (!TokenUtils.hasTokenName(val) && !RelativeTimeUtil.isRelativeTimeExpression(val)) {
                            return _('Invalid Auto Refresh Delay').t();
                        }
                    }
                }
            }
        });
        return Modal.extend({
            moduleId: module.id,
            className: 'modal edit-search-string ' + Modal.CLASS_MODAL_WIDE,
            initialize: function(options) {
                Modal.prototype.initialize.apply(this, arguments);
                this.searchManager = options.manager;
                this.model.searchModel = new validateSearchModel(
                    _.pick(this.searchManager.settings.toJSON({tokens: true}), ['search', 'earliest_time', 'latest_time', 'refresh', 'refreshType']),
                    {
                        applyTokensByDefault: true,
                        retrieveTokensByDefault: true
                    }
                );
                if (this.searchManager.settings.get('global_earliest_time', {tokens: true}) != null &&
                    this.searchManager.settings.get('global_latest_time', {tokens: true}) != null) {
                    this.model.searchModel.set({
                        'earliest_time': this.searchManager.settings.get('global_earliest_time', {tokens: true}),
                        'latest_time': this.searchManager.settings.get('global_latest_time', {tokens: true})
                    });
                }
                
                this.deferreds = options.deferreds || {};

                this.children.title = new ControlGroup({
                    label: _("Title").t(),
                    controlType: 'Label',
                    controlClass: 'controls-block',
                    controlOptions: {
                        model: this.model.report.entry.content,
                        modelAttribute: 'dashboard.element.title'
                    }
                });
                                
                this.collection = this.collection || {};
                this.collection.searchBNFs = ModelHelper.getCachedModel('parsedSearchBNFs', {
                    app: this.model.application.get('app'),
                    owner: this.model.application.get('owner'),
                    count: 0
                });

                this.children.searchStringInput = new SearchTextareaControl({
                    model: {
                        content: this.model.searchModel,
                        user: this.model.user,
                        application: this.model.application
                    },
                    collection: {
                        searchBNFs: this.collection.searchBNFs
                    }
                });
                
                this.collection.times = new TimeRangeCollection();
                this.deferreds.times = this.collection.times.fetch({
                    data: {
                        app: this.model.application.get("app"),
                        owner: this.model.application.get("owner"),
                        count: -1
                    }
                });
                
                this.model.timeRange = new PanelTimeRangeModel();
                this.children.timeRangePickerView = new TimeRangePickerView({
                    model: {
                        state: this.model.searchModel,
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
                        searchModel: this.model.searchModel,
                        state: this.model.state
                    },
                    collection: this.collection.times
                });
                
                this.listenTo(this.model.timeRange, 'change:useTimeFrom', this._updatePanelTimeRangePicker);

                this.model.refreshProxy = new Backbone.Model();

                var refreshTimeChoices = [
                    {
                        label: _('No auto refresh').t(),
                        value: ''
                    },
                    {
                        label: _('30 seconds').t(),
                        value: '30s'
                    },
                    {
                        label: _('1 minute').t(),
                        value: '1m'
                    },
                    {
                        label: _('2 minutes').t(),
                        value: '2m'
                    },
                    {
                        label: _('5 minutes').t(),
                        value: '5m'
                    },
                    {
                        label: _('10 minutes').t(),
                        value: '10m'
                    }
                ];

                this.children.refreshTimeInput = new ControlGroup({
                    label: _('Auto Refresh Delay').t(),
                    controlType: 'SyntheticSelect',
                    controlClass: 'controls-block',
                    tooltip: _('Automatically refresh the search after a specified delay').t(),
                    controlOptions: {
                        model: this.model.refreshProxy,
                        modelAttribute: 'selection',
                        items: refreshTimeChoices.concat({
                            label: _('Custom').t(),
                            value: '_custom'
                        }),
                        popdownOptions: {
                            detachDialog: true
                        },
                        toggleClassName: 'btn'
                    }
                });

                this.children.refreshTimeCustom = new ControlGroup({
                    controlType: 'Text',
                    controlOptions: {
                        model: this.model.searchModel,
                        modelAttribute: 'refresh',
                        placeholder: _('eg. 5m').t()
                    }
                });

                var curRefreshVal = this.model.searchModel.get('refresh') || '';
                if (_(refreshTimeChoices).chain().pluck('value').contains(curRefreshVal).value()) {
                    this.model.refreshProxy.set({
                        selection: curRefreshVal
                    });
                } else {
                    this.model.refreshProxy.set({
                        selection: '_custom',
                        customValue: curRefreshVal
                    });
                }

                this.listenTo(this.model.refreshProxy, 'change', this.updateRefreshInput);

                this.children.refreshDisplay = new ControlGroup({
                    label: _('Refresh Indicator').t(),
                    controlType: 'SyntheticSelect',
                    controlClass: 'controls-block',
                    controlOptions: {
                        model: this.model.report.entry.content,
                        modelAttribute: 'dashboard.element.refresh.display',
                        items: [
                            {
                                label: _('None').t(),
                                description: _('Background Search with No Progress Bar').t(),
                                value: 'none'
                            },
                            {
                                label: _('Progress bar').t(),
                                description: _('Background Search with Progress Bar').t(),
                                value: 'progressbar'
                            },
                            {
                                label: _('Preview and progress bar').t(),
                                description: _('Preview Events with Progress Bar').t(),
                                value: 'preview'
                            }
                        ],
                        popdownOptions: {
                            detachDialog: true
                        },
                        toggleClassName: 'btn'
                    }
                });
                
                this.children.flashMessages = new FlashMessagesView({model: new Backbone.Model()});
                this.children.searchFlashMessages = new FlashMessagesView({model: this.model.searchModel});
            },
            events: $.extend({}, Modal.prototype.events, {
                'click .modal-btn-primary': function(e) {
                    e.preventDefault();

                    this.children.flashMessages.flashMsgCollection.reset();
                    this.children.searchFlashMessages.flashMsgCollection.reset();
                    if (this.model.searchModel.validate()) {
                        return;
                    }
                    var ret = this.model.timeRange.validate();
                    if (ret) {
                        _.each(ret, function(val) {
                            this.children.flashMessages.flashMsgCollection.add({
                                key: 'token-' + val,
                                type: 'error',
                                html: _.escape(_(val).t())
                            });
                        }, this);
                        return;
                    }
                    var newAttributes = this.model.searchModel.toJSON({tokens: true});
                    this.trigger('searchUpdated', newAttributes);
                    this.model.report.save();
                },
                'click a.run-search': function(e) {
                    e.preventDefault();
                    var search = this.model.searchModel.get('search', {tokens: false});
                    this._mergeSearchIfNecessary(search);
                    if (!search) {
                        return;
                    }
                    var params = {q: search};
                    if (this.model.searchModel.has('earliest_time')) {
                        params.earliest = this.model.searchModel.get('earliest_time', {tokens: false} || '0');
                        params.latest = this.model.searchModel.get('latest_time', {tokens: false}) || '';
                    }
                    this._redirectToSearchPage(params);
                }
            }),
            _redirectToSearchPage: function(params) {
                var application = this.model.application;
                var url = route.search(application.get('root'), application.get('locale'), application.get('app'), {data: params});
                utils.redirect(url, true);
            },
            _isPostProcessSearch: function() {
                return this.searchManager instanceof PostProcessSearchManager;
            },
            _mergeSearchIfNecessary: function(search) {
                if (this._isPostProcessSearch()) {
                    if (this.searchManager && this.searchManager.parent) {
                        var baseSearch = this.searchManager.parent.settings.resolve({tokens: true});
                        return mergeSearch(baseSearch, search);
                    }
                }
            },
            _updatePanelTimeRangePicker: function(timeRangeModel, useTimeFrom) {
                useTimeFrom = useTimeFrom || timeRangeModel.get('useTimeFrom');
                var $el = this.children.panelTimeRangePicker.$el;
                var hideTimeRangePicker = (useTimeFrom !== 'search');
                
                $el.toggleClass('hide-time-range-picker', hideTimeRangePicker);
            },
            handleSubmitButtonState: function(model) {
                this.$(Modal.FOOTER_SELECTOR)
                    .find('.btn-primary')[model.get('elementCreateType') === 'pivot' ? 'addClass' : 'removeClass']('disabled');
            },
            updateRefreshInput: function(model) {
                var val = model.get('selection');
                if (val == '_custom') {
                    this.children.refreshTimeCustom.$el.show();
                } else {
                    this.children.refreshTimeCustom.$el.hide();
                    this.model.searchModel.set('refresh', val, {tokens: true});
                }
            },
            render: function() {
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Edit Search").t());

                this.$(Modal.BODY_SELECTOR).remove();

                var $modalFooter = this.$(Modal.FOOTER_SELECTOR);
                $modalFooter.before(
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

                var $modalBody = this.$(Modal.BODY_SELECTOR);
                $modalBody.prepend(this.children.flashMessages.render().el);
                $modalBody.prepend(this.children.searchFlashMessages.render().el);
                //Give an additional class name to searchFlashMessages to distinguish these two messages, required by QA.
                this.children.searchFlashMessages.$el.addClass("search");
                $modalBody.append(Modal.FORM_HORIZONTAL_JUSTIFIED);
                var $modalFormBody = this.$(Modal.BODY_FORM_SELECTOR);
                this.children.title.render().appendTo($modalFormBody);
                this.children.searchStringInput.render().appendTo($modalFormBody);
                
                var timeRangeDef = this.model.timeRange.save({
                    'earliest': this.model.searchModel.get('earliest_time', {tokens: false} || "0"),
                    'latest': this.model.searchModel.get('latest_time', {tokens: false} || "now")
                });

                if (!this._isPostProcessSearch()) {
                    // SPL-131393: So that users always sees the panelTimeRangePicker,
                    // render it directly and update the view once we receive our data.
                    this.children.panelTimeRangePicker.render().appendTo($modalFormBody);
                    this._updatePanelTimeRangePicker(this.model.timeRange);
                    
                    $.when(this.deferreds.times, timeRangeDef).done(function() {
                        this.children.panelTimeRangePicker.updateTokens();
                        this.children.panelTimeRangePicker.updateTime();
                    }.bind(this));
                    
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
                    this.children.refreshTimeInput.render().appendTo($modalFormBody);
                    this.children.refreshTimeCustom.render().appendTo($modalFormBody);
                    this.updateRefreshInput(this.model.refreshProxy);
                }
                this.children.refreshDisplay.render().appendTo($modalFormBody);

                $modalFooter.append(Modal.BUTTON_CANCEL);
                $modalFooter.append('<a href="#" class="btn btn-primary modal-btn-primary pull-right">' + _("Apply").t() + '</a>');
                $modalFooter.append('<a href="#" class="btn back modal-btn-back pull-left">' + _("Back").t() + '</a>');
                this.$('.btn.back').hide();

                return this;
            }
        });
    }
);
