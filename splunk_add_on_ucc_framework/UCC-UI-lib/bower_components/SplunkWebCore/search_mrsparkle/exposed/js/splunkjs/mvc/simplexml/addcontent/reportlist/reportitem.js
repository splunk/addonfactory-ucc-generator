define(function(require, exports, module) {
    var $ = require('jquery');
    var _ = require('underscore');
    var BaseView = require('views/Base');
    var VisualizationRegistry = require('helpers/VisualizationRegistry');
    var splunkUtil = require('splunk.util');
    require('bootstrap.tooltip');

    var ReportItem = BaseView.extend({
    	moduleId: module.id,
    	tagName: 'li',
        className: 'panel-content',
    	initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            this.model.highlightSelectedModel.on('change:currentSelectedView', this.checkSelectedItem, this);
    	},
    	render: function() {
    		var report = this.model.report;
			var icon = report.entry.content.get('display.general.type');
            var vsid = report.entry.content.get("vsid");
            var displayview = report.entry.content.get("displayview");
            var hasBeenMigrated = splunkUtil.normalizeBoolean(report.entry.content.get("display.general.migratedFromViewState"));

			if (vsid && displayview && !hasBeenMigrated) {
                icon = null;
            } else {
                var vizDescriptor = VisualizationRegistry.findVisualizationForConfig(report.entry.content.toJSON());
                icon = (vizDescriptor && vizDescriptor.icon) || null;
            }
    		this.$el.html(this.panelReportTemplate({name: _(this.model.report.entry.get('name')).t(), icon: icon}));
    		this.$el.tooltip({
    			template: '<div class="tooltip add-report-name"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
    			container: 'body',
    			delay: {show: 500, hide: 0}
    		});
    		return this;
    	},
    	events: {
    		'click a': 'select'
    	},
    	select: function(evt) {
    		evt.preventDefault();
    		this.trigger('previewPanel', this.model.report, evt);
            this.model.highlightSelectedModel.set('currentSelectedView', this.cid);
    	},
        checkSelectedItem: function(changedModel) {
            if(changedModel.get('currentSelectedView') === this.cid) {
                this.$el.addClass('selected');
            } else {
                this.$el.removeClass('selected');
            }
        },
		panelReportTemplate: _.template('<a href="#" class="panel-content-report" title="<%- name %>"><div class="icons"><i class="icon-<%- icon %>"></i></div><%- name %></a>')
    });

    return ReportItem;
});