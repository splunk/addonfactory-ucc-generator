define(function(require, exports, module){
    var _ = require('underscore');
    var BaseView = require('views/Base');
    var ControlGroup = require('views/shared/controls/ControlGroup');
    var console = require('util/console');
    var utils = require('../../../utils');
    var route = require('uri/route');
    var PanelTimeRangePicker = require('views/dashboards/PanelTimeRangePicker');
    require('bootstrap.tooltip');

    return BaseView.extend({
        moduleId: module.id,
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);

            this.children.panelTitleControlGroup = new ControlGroup({
                label: _("Content Title").t(),
                controlType: 'Text',
                className: 'content-title-control control-group',
                controlClass: 'controls-block',
                controlOptions: {
                    model: this.model.report,
                    modelAttribute: 'title',
                    placeholder: _("optional").t()
                }
            });
            
            this.children.searchField = new ControlGroup({
                controlType: 'Textarea',
                controlClass: 'controls-block',
                controlOptions: {
                    modelAttribute: 'search',
                    model: this.model.report
                },
                label: _("Search String").t(),
                help: '<a href="#" class="run-search">'+_("Run Search").t()+' <i class="icon-external"></i></a>'
            });
            
            this.listenTo(this.model.report, 'change:elementCreateType', this.onModeChange, this);

            this.children.panelTimeRangePicker = new PanelTimeRangePicker({
                model: {
                    timeRange: this.model.timeRange,
                    report: this.model.report,
                    state: this.model.state,
                    application: this.model.application,
                    appLocal: this.model.appLocal,
                    user: this.model.user
                },
                collection: this.collection,
                popdownTimeRange: true
            });

            this.model.report.set({
                'dispatch.earliest_time': this.model.timeRange.get('earliest'),
                'dispatch.latest_time':this.model.timeRange.get('latest')
            }, {tokens: true});
        },
        events: {
            'click a.run-search': function(e) {
                e.preventDefault();
                var search = this.model.report.get('search'), params = { q: search }, pageInfo = utils.getPageInfo();
                if(!search) {
                    return;
                }
                if(this.model.report.has('dispatch.earliest_time')) {
                    params.earliest = this.model.report.get('dispatch.earliest_time');
                    params.latest = this.model.report.get('dispatch.latest_time');
                }
                utils.redirect(route.search(pageInfo.root, pageInfo.locale, pageInfo.app, { data: params }), true);
            }
        },
        onModeChange: function() {
            var fn = this.model.report.get('elementCreateType') === 'inline' ? 'show' : 'hide';
            this.$el[fn]();
        },
        render: function() {
            this.children.panelTimeRangePicker.render().appendTo(this.el);
            this.children.panelTitleControlGroup.render().appendTo(this.el);
            this.children.searchField.render().appendTo(this.el);
            this.onModeChange();
            return this;
        }
    });

});