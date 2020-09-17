define(function(require, exports, module) {
    var $ = require('jquery');
    var BaseView = require('views/Base');
    var _ = require('underscore');
    var mvc = require('../../mvc');
    var SavedSearchManager = require('../../savedsearchmanager');
    var DashboardElement = require('../element/base');
    var utils = require('../../utils');
    var NewPanelModel = require('../newpanelmodel');
    var ReportDetails = require('views/shared/reportcontrols/details/Master');
    var sidebarTemplate = require('contrib/text!./sidebartemplate.html');
    var SearchStringDetails = require('./searchdetails');

    var PREVIEW_SEARCH_ID = 'previewSearch';
    var PREVIEW_ELEMENT_ID = 'previewElement';
    
    var ReportPreview = BaseView.extend({
        moduleId: module.id,
        className: 'report-preview content-preview',
        events: {
            'click .btn.add-content': 'addReport'
        },
        initialize: function (options) {
            BaseView.prototype.initialize.apply(this, arguments);
            this.children.reportDetails = new ReportDetails({
                model: {
                    report: this.model.report,
                    application: this.model.application,
                    appLocal: this.model.appLocal,
                    user: this.model.user,
                    serverInfo: this.model.serverInfo
                },
                collection: this.collection.roles,
                showLinks: false
            });
            this.children.searchStringDetails = new SearchStringDetails({
                model: {
                    report: this.model.report
                }
            });
        },
        render: function() {
            this.$el.html(this.compiledTemplate({ title: _("Preview").t()}));
            new SavedSearchManager({
                "id": PREVIEW_SEARCH_ID,
                "searchname": this.model.report.entry.get('name'),
                "app": utils.getCurrentApp(),
                "cancelOnUnload": true,
                "auto_cancel": 90,
                "status_buckets": 0,
                "preview": true,
                "cache": "scheduled"
            }, {replace:true});

            var $previewBody = this.$('.preview-body');
            var vizType = 'statistics', sub;
            if(this.model.report.entry.content.has('display.general.type')) {
                vizType = this.model.report.entry.content.get('display.general.type');
                sub = ['display', vizType, 'type'].join('.');
                if(this.model.report.entry.content.has(sub)) {
                    vizType = [vizType, this.model.report.entry.content.get(sub)].join(':');
                }
            }
            var ElementType = DashboardElement.extend({
                initialVisualization: vizType
            });

            this.children.reportDetails.render().appendTo($previewBody);
            this.children.searchStringDetails.render().appendTo(this.$('.list-dotted'));
            var component = this.children.component = new ElementType({
                id: PREVIEW_ELEMENT_ID,
                managerid: PREVIEW_SEARCH_ID,
                noEdit: true
            }, {tokens: true, replace:true});

            var $panelEl = $(_.template(this.panelTemplate, {}));
            $panelEl.find('.dashboard-panel').append(component.render().$el);
            $previewBody.append($panelEl);
        },
        remove: function() {
            var search = mvc.Components.get(PREVIEW_SEARCH_ID);
            if (search) {
                search.dispose();
            }
            return BaseView.prototype.remove.apply(this, arguments);
        },
        addReport: function(e) {
            e.preventDefault();
            var settings = {
                title: this.model.report.entry.get('name'),
                elementCreateType: "saved",
                savedSearchName: this.model.report.entry.get('name')
            };
            var vizType = 'statistics';
            var content = this.model.report.entry.content;
            var sub;
            if(content.get('display.general.type')) {
                vizType = content.get('display.general.type');
                sub = ['display', vizType, 'type'].join('.');
                if(content.get(sub)) {
                    vizType = [vizType, content.get(sub)].join(':');
                }
            }
            if (content.has('display.visualizations.custom.type')) {
                settings['display.visualizations.custom.type'] = content.get('display.visualizations.custom.type');
            }
            settings['savedSearchVisualization'] = vizType;
            var newpanelmodel = new NewPanelModel(settings);
            var xhr = newpanelmodel.save();
            if (!xhr === false) {
                this.trigger('addToDashboard');
            }
        },
        focus: function() {
            this.$el.find('.add-content').focus();
        },
        template: sidebarTemplate,
        panelTemplate: '\
            <div class="dashboard-row">\
                <div class="dashboard-cell">\
                    <div class="dashboard-panel">\
                    </div>\
                </div>\
            </div>\
            '
    });

    return ReportPreview;
});
