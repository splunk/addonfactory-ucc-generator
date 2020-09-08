define(function(require, exports, module) {

    var _ = require('underscore');
    var Backbone = require('backbone');
    var console = require('util/console');
    var mvc = require('../../../mvc');
    var Base = require('views/Base');
    var ControlGroup = require('views/shared/controls/ControlGroup');
    var SearchTextareaControl = require('views/dashboard/editor/addcontent/preview/content/SearchTextareaControl');
    var Dashboard = require('../../simplexml/controller');
    var ReportForm = require('../../simplexml/dialog/addpanel/report');
    var TimeRangeView = require('../../timerangeview');
    var utils = require('../../utils');
    var route = require('uri/route');
    var UserModel = require('models/services/authentication/User');
    require('bootstrap.tooltip');

    var DynamicOptionsControl = Base.extend({

        moduleId: module.id,

        initialize: function() {
            Base.prototype.initialize.apply(this, arguments);

            this._optionsModel = (this.options.controlOptions && this.options.controlOptions.model) || new Backbone.Model();
            this._optionsModelProxy = new Backbone.Model();

            this.listenTo(this._optionsModel, "change", this.onOptionsModelChange, this);
            this.listenTo(this._optionsModelProxy, "change", this.onProxyModelChange, this);

            this.onOptionsModelChange();

            this.children.elementCreateType = new ControlGroup({
                label: _("Content Type").t(),
                controlType: 'SyntheticRadio',
                controlClass: 'controls-thirdblock',
                controlOptions: {
                    className: 'btn-group btn-group-3 add-panel-select',
                    items: [
                        {value: 'inline', label: '<i class="icon-search-thin"></i>', tooltip: _("Inline Search").t()},
                        {value: 'saved', label: '<i class="icon-report"></i>', tooltip: _("Report").t()}
                    ],
                    model: this._optionsModelProxy,
                    modelAttribute: 'elementCreateType'
                }
            });

            this.children.inline = new InlineForm({
                model: this._optionsModelProxy,
                collection: {
                    timeRanges: Dashboard.collection.times
                }
            });

            this.children.report = new ReportForm({
                model: {
                    report: this._optionsModelProxy,
                    user: Dashboard.model.user,
                    application: Dashboard.model.app
                },
                collection: {
                    searchBNFs: Dashboard.collection.searchBNFs,
                    timeRanges: Dashboard.collection.times
                },
                controller: Dashboard,
                popdownOptions: {
                    attachDialogTo: '.popdown-dialog.open',
                    scrollContainer: '.popdown-dialog.open .concertina-body'
                }
            });
        },

        onOptionsModelChange: function() {
            if (this._isProxySyncing) {
                return;
            }

            try {
                this._isProxySyncing = true;

                this._optionsModelProxy.set({
                    elementCreateType: this._optionsModel.get("searchType") || "inline",
                    savedSearchName: this._optionsModel.get("searchName"),
                    search: this._optionsModel.get("search"),
                    earliest_time: this._optionsModel.get("populating_earliest_time"),
                    latest_time: this._optionsModel.get("populating_latest_time")
                });
            } finally {
                this._isProxySyncing = false;
            }
        },

        onProxyModelChange: function() {
            if (this._isProxySyncing) {
                return;
            }

            try {
                this._isProxySyncing = true;

                this._optionsModel.set({
                    searchType: this._optionsModelProxy.get("elementCreateType"),
                    searchName: this._optionsModelProxy.get("savedSearchName"),
                    search: this._optionsModelProxy.get("search"),
                    populating_earliest_time: this._optionsModelProxy.get("earliest_time"),
                    populating_latest_time: this._optionsModelProxy.get("latest_time")
                });
            } finally {
                this._isProxySyncing = false;
            }
        },

        render: function() {
            this.$el.append(this.children.elementCreateType.render().el);
            this.$el.append(this.children.inline.render().el);
            this.$el.append(this.children.report.render().el);
            return this;
        }

    });

    var InlineForm = Base.extend({

        initialize: function() {
            Base.prototype.initialize.apply(this, arguments);

            this.children.searchField = new SearchTextareaControl({
                model: {
                    content: this.model,
                    user: Dashboard.model.user,
                    application: Dashboard.model.app
                },
                collection: {
                    searchBNFs: Dashboard.collection.searchBNFs
                },
                searchAssistant: UserModel.SEARCH_ASSISTANT.NONE
            });

            this.children.timeRangeView = new TimeRangeView({
                popdownOptions: {
                    attachDialogTo: '.popdown-dialog.open',
                    scrollContainer: '.popdown-dialog.open .concertina-body'
                }
            });
            this.children.timeRangeView.val({
                earliest_time: this.model.get("earliest_time"),
                latest_time: this.model.get("latest_time")
            });

            this.listenTo(this.model, 'change:elementCreateType', this.onModeChange, this);
            this.listenTo(this.children.timeRangeView, 'change', this.onTimeRangeChange, this);
        },

        events: {
            'click a.run-search': function(e) {
                e.preventDefault();
                var search = this.model.get('search'), params = { q: search }, pageInfo = utils.getPageInfo();
                if(!search) {
                    return;
                }
                if(this.model.has('dispatch.earliest_time')) {
                    params.earliest = this.model.get('dispatch.earliest_time');
                    params.latest = this.model.get('dispatch.latest_time');
                }
                utils.redirect(route.search(pageInfo.root, pageInfo.locale, pageInfo.app, { data: params }), true);
            }
        },

        onModeChange: function() {
            var elementCreateType = this.model.get('elementCreateType');
            switch (elementCreateType) {
                case "inline":
                    this.children.timeRangeView.$el.show();
                    this.$el.show();
                    break;
                case "postprocess":
                    this.children.timeRangeView.$el.hide();
                    this.$el.show();
                    break;
                default:
                    this.$el.hide();
            }
        },

        onTimeRangeChange: function(e) {
            this.model.set(this.children.timeRangeView.val());
        },

        render: function() {
            this.children.searchField.render().appendTo(this.el);
            this.children.timeRangeView.render().$el.appendTo(this.el);

            this.onModeChange();

            return this;
        }

    });

    return DynamicOptionsControl;

});
