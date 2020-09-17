define(
    [
        'module',
        'jquery',
        'underscore',
        'views/Base',
        'views/shared/controls/ControlGroup',
        'views/shared/FlashMessages',
        'views/dashboard/editor/element/TimeRangePanel',
        'views/dashboard/editor/addcontent/preview/content/SearchTextareaControl',
        'models/dashboard/DashboardElementReport',
        'splunkjs/mvc/utils',
        'uri/route'
    ],
    function(module,
             $,
             _,
             BaseView,
             ControlGroup,
             FlashMessagesView,
             PanelTimeRangePicker,
             SearchTextareaControl,
             DashboardElementReport,
             utils,
             route
    ) {

        var InlineView = BaseView.extend({
            moduleId: module.id,
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                this.children.flashMessages = new FlashMessagesView({
                    model: this.model.content
                });

                this.children.panelTitleControlGroup = new ControlGroup({
                    label: _("Content Title").t(),
                    controlType: 'Text',
                    className: 'content-title-control control-group',
                    controlClass: 'controls-block',
                    controlOptions: {
                        model: this.model.content,
                        modelAttribute: 'dashboard.element.title',
                        placeholder: _("optional").t()
                    }
                });
                
                this.children.searchField = new SearchTextareaControl({
                    model: {
                        content: this.model.content,
                        user: this.model.user,
                        application: this.model.application
                    },
                    collection: {
                        searchBNFs: this.collection.searchBNFs
                    }
                });

                this.children.panelTimeRangePicker = new PanelTimeRangePicker({
                    model: {
                        timeRange: this.model.timeRange,
                        searchModel: this.model.content,
                        state: this.model.state,
                        application: this.model.application,
                        appLocal: this.model.appLocal,
                        user: this.model.user
                    },
                    collection: this.collection,
                    popdownTimeRange: true
                });
            },
            events: {
                'click a.run-search': function(e) {
                    e.preventDefault();
                    var search = this.model.content.get('search'), params = {q: search}, pageInfo = utils.getPageInfo();
                    if (!search) {
                        return;
                    }
                    var earliest = this.model.content.get('earliest_time', {tokens: false});
                    var latest = this.model.content.get('latest_time', {tokens: false});
                    if (!_.isUndefined(earliest) && !_.isUndefined(latest)) {
                        params.earliest = earliest;
                        params.latest = latest;
                    }
                    utils.redirect(route.search(pageInfo.root, pageInfo.locale, pageInfo.app, {data: params}), true);
                }
            },
            render: function() {
                this.children.flashMessages.render().appendTo(this.el);
                this.children.panelTimeRangePicker.render().appendTo(this.el);
                this.children.panelTitleControlGroup.render().appendTo(this.el);
                this.children.searchField.render().appendTo(this.el);
                return this;
            }
    });
        return InlineView;
    });