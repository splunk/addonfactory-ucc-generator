define(function(require, module, exports) {
    var _ = require('underscore');
    var BaseView = require('views/Base');
    var ControlGroup = require('views/shared/controls/ControlGroup');
    var console = require('util/console');
    var route = require('uri/route');
    var mvc = require('splunkjs/mvc');
    var FormUtils = require('splunkjs/mvc/simpleform/formutils');
    var token_utils = require('splunkjs/mvc/tokenutils');
    var SplunkUtil = require('splunk.util');
    var TimeRangePickerView = require('views/shared/timerangepicker/Master');
    require('./TimeRangePanel.pcss');
    require('bootstrap.tooltip');

    return BaseView.extend({
        moduleId: module.id,
        className: 'control-group',
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);

            this.model.timeRange.on('applied', function() {
                this.updateSearchModelTime();
                this.updateTime();
            }, this);

            if (this.options.popdownTimeRange === true) {
                this.children.timerange = new TimeRangePickerView({
                    model: {
                        state: this.model.searchModel,
                        timeRange: this.model.timeRange,
                        appLocal: this.model.appLocal,
                        user: this.model.user,
                        application: this.model.application
                    },
                    collection: this.collection.timeRanges,
                    timerangeClassName: 'btn',
                    popdownOptions: {
                        attachDialogTo: '.sidebar:not(.first)',
                        scrollContainer: '.preview-body'
                    }
                });
            }

            this.initializeUseTimeFrom();

            this.children.advancedEarliest = new ControlGroup({
                label: _("Earliest Token").t(),
                controlType: 'Text',
                controlClass: 'controls-block',
                controlOptions: {
                    model: this.model.timeRange,
                    modelAttribute: 'earliest_token'
                }
            });
            this.children.advancedLatest = new ControlGroup({
                label: _("Latest Token").t(),
                controlType: 'Text',
                controlClass: 'controls-block',
                controlOptions: {
                    model: this.model.timeRange,
                    modelAttribute: 'latest_token'
                }
            });

            this.listenTo(this.model.timeRange, 'change:useTimeFrom change:latest_token change:earliest_token', this.updateTokens, this);
        },
        initializeUseTimeFrom: function() {
            var items = _(mvc.Components.toJSON()).chain().values().filter(function(value) {
                if (FormUtils.isFormInput(value) && value.settings) {
                    return value.settings.get('type') == 'time';
                }
                return false;
            }).map(function(timePicker) {
                var token = timePicker.settings.get('token') || 'global';
                var label = SplunkUtil.sprintf(_("Shared Time Picker (%s)").t(), token);
                return {value: token, label: label};
            }).value();

            var useTimeFrom = 'search';
            var earliest = this.model.searchModel.get("earliest_time");
            var latest = this.model.searchModel.get("latest_time");
            var hasTokens =
                token_utils.hasToken(earliest) &&
                token_utils.hasToken(latest);
            if (hasTokens) {
                var earliestTokenName = token_utils.getTokenName(earliest);
                var earliestTokenPrefix = earliestTokenName.replace(/\.?earliest$/g, '');
                earliestTokenPrefix = earliestTokenPrefix === '' ? 'global' : earliestTokenPrefix;
                var latestTokenName = token_utils.getTokenName(latest);
                var latestTokenPrefix = latestTokenName.replace(/\.?latest$/g, '');
                latestTokenPrefix = latestTokenPrefix === '' ? 'global' : latestTokenPrefix;
                this.model.timeRange.set({'earliest_token': earliestTokenName, 'latest_token': latestTokenName});
                if (earliestTokenPrefix === latestTokenPrefix) {
                    if (_(items).find(function(item) { return item.value === earliestTokenPrefix; })) {
                        useTimeFrom = earliestTokenPrefix;
                    } else if (earliestTokenPrefix === "global") {
                        useTimeFrom = "global";
                    }
                    else {
                        useTimeFrom = "tokens";
                    }
                } else {
                    useTimeFrom = "tokens";
                }
            }

            this.model.timeRange.set({useTimeFrom: useTimeFrom});
            var scopeItems = [
                [{label: _('Use Time Picker').t(), value: 'search'}],
                [{label: _('Tokens').t(), value: 'tokens'}],
                [{label: _('Global').t(), value: 'global'}]
            ];
            if (items.length > 0) {
                scopeItems.unshift(items);
            }

            this.children.timeScope = new ControlGroup({
                label: _("Time Range").t(),
                controlType: 'SyntheticSelect',
                className: 'time-range-scope',
                controlOptions: {
                    className: 'btn-group time-range-scope-select',
                    toggleClassName: 'btn',
                    items: scopeItems,
                    model: this.model.timeRange,
                    popdownOptions: {
                        attachDialogTo: '.sidebar:not(.first), .modal:visible',
                        scrollContainer: '.preview-body, .modal:visible, .modal-body:visible'
                    },
                    modelAttribute: 'useTimeFrom',
                    elastic: true
                }
            });
        },
        updateSearchModelTime: function() {
            var useTimeFrom = this.model.timeRange.get('useTimeFrom');
            if (useTimeFrom === "search") {
                this.model.searchModel.set({
                    'earliest_time': this.model.timeRange.get('earliest', {tokens: true}) || 0,
                    'latest_time': this.model.timeRange.get('latest', {tokens: true}) || ''
                }, {tokens: true});
            } else if (useTimeFrom === "tokens") {
                var earliestToken = this.model.timeRange.get('earliest_token');
                var latestToken = this.model.timeRange.get('latest_token');
                this.model.searchModel.set({
                    'earliest_time': '$' + earliestToken + '$',
                    'latest_time': '$' + latestToken + '$'
                }, {tokens: true});
            } else if (useTimeFrom === "global") {
                this.model.searchModel.set({
                    'earliest_time': "$earliest$",
                    'latest_time': "$latest$"
                }, {tokens: true});
            } else {
                this.model.searchModel.set({
                    'earliest_time': "$" + useTimeFrom + ".earliest$",
                    'latest_time': "$" + useTimeFrom + ".latest$"
                }, {tokens: true});
            }
        },
        updateTokens: function() {
            this.updateSearchModelTime();
            this.toggleTimeRangePicker();
            this.toggleAdvancedTokens();
        },
        toggleAdvancedTokens: function() {
            if (this.model.timeRange.get('useTimeFrom') === "tokens") {
                this.children.advancedEarliest.$el.show();
                this.children.advancedLatest.$el.show();
            }
            else {
                this.children.advancedEarliest.$el.hide();
                this.children.advancedLatest.$el.hide();
            }
        },
        toggleTimeRangePicker: function() {
            if (this.model.timeRange.get('useTimeFrom') === "search") {
                if (this.children.timerange) {
                    this.children.timerange.$el.show();
                } else {
                    this.$('.timerange').show();
                }
            }
            else {
                if (this.children.timerange) {
                    this.children.timerange.$el.hide();
                } else {
                    this.$('.timerange').hide();
                }
            }
        },
        updateTime: function() {
            var timeLabel = this.model.timeRange.generateLabel(this.collection);
            this.$el.find("span.time-label").text(_(timeLabel).t());
        },
        render: function() {
            if (this.children.timeScope) {
                this.children.timeScope.render().appendTo(this.el);
            }
            this.children.advancedEarliest.render().$el.appendTo(this.$el);
            this.children.advancedLatest.render().$el.appendTo(this.$el);

            if (this.children.timerange) {
                this.$el.append(this.children.timerange.render().$el);
            } else {
                this.$el.append('<div class="timerange" style="display: block;"><label class="control-label"></label></div>');
            }
            this.$('div.timerange').append('<div class="controls"><a href="#" class="btn timerange-control"><span class="time-label"></span><span class="icon-triangle-right-small"></span></a></div>');
            this.toggleTimeRangePicker();
            this.toggleAdvancedTokens();
            this.updateTime();

            return this;
        }
    });
});
