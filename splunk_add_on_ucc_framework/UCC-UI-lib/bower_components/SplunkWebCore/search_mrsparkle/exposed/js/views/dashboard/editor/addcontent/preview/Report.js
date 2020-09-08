define(
    [
        'module',
        'jquery',
        'underscore',
        'views/Base',
        'views/dashboard/editor/addcontent/preview/BasePreview',
        'views/dashboard/editor/addcontent/preview/content/ReportContent'
    ],
    function(module,
             $,
             _,
             BaseView,
             BasePreview,
             ReportContent) {


        return BasePreview.extend({
            moduleId: module.id,
            className: 'report-preview content-preview',
            initialize: function(options) {
                BasePreview.prototype.initialize.apply(this, arguments);
                this.model = _.extend({}, this.model);
                this.collection = _.extend({}, this.collection);
            },
            _getPayload: function() {
                return {
                    type: 'new:element-report',
                    payload: {
                        "type": "panel",
                        "settings": {},
                        "children": [
                            {
                                "type": this.model.report.entry.content.get('dashboard.element.viz.type'),
                                "settings": {},
                                "children": [
                                    {
                                        "type": "saved-search",
                                        "settings": {
                                            "cache": "scheduled",
                                            "ref": this.model.report.entry.get('name')
                                        },
                                        "children": []
                                    }
                                ],
                                "reportContent": {
                                    "dashboard.element.title": this.model.report.entry.get('name')
                                }
                            }
                        ]
                    }
                };
            },
            _getTitle: function() {
                return _("Preview").t();
            },
            _getPreview: function() {
                return new ReportContent({
                    model: this.model,
                    collection: this.collection
                });
            }
        });
    });