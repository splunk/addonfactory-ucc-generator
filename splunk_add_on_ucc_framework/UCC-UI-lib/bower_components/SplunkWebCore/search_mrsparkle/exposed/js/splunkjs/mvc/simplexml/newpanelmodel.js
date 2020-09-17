define(function(require, module, exports) {
    var _ = require('underscore');
    var $ = require('jquery');
    var mvc = require('splunkjs/mvc');
    var utils = require('../utils');
    var Dashboard = require('./controller');
    var DashboardElement = require('./element/base');
    var Mapper = require('./mapper');
    var SearchManager = require('../searchmanager');
    var SavedSearchManager = require('../savedsearchmanager');
    var console = require('util/console');
    var AddContentUtils = require('./addcontent/addcontentutils');
    var BaseModel = require('models/Base');

    /**
     * Transient model representing the information for a new dashboard panel element
     */
    return BaseModel.extend({
        defaults: {
            elementCreateType: 'inline',
            'dispatch.earliest_time': '0',
            'dispatch.latest_time': ''
        },
        validation: {
            search: {
                fn: 'validateSearchQuery'
            }
        },
        validateSearchQuery: function(value, attr, computedState) {
            if(computedState['elementCreateType'] === 'inline' && !value) {
                return 'Search string is required.';
            }
        },
        sync: function(method, model, options) {
            console.log('NewPanelModel.sync(%o, %o, %o)', method, model, options);
            if(method !== 'create') {
                throw new Error('Unsupported sync method: ' + method);
            }
            if(!model.isValid()) {
                return false;
            }
            var dfd = $.Deferred();
            var searchType = this.get('elementCreateType');
            var elementId, i = 1;
            do {
                elementId = 'element' + (i++);
            } while(mvc.Components.has(elementId));

            var vizType = this.get('savedSearchVisualization') || 'visualizations:charting';
            var mapper = Mapper.get(vizType);

            var elementSettings = {
                type: mapper.tagName,
                title: this.get('title'),
                search: {
                    type: searchType,
                    search: this.get('search'),
                    name: this.get('savedSearchName')
                },
                options: {},
                tags: {}
            };
            mapper.map(model, elementSettings, options);

            if (this.get('elementCreateType') === 'inline') {
                elementSettings.search.earliest_time = this.get('dispatch.earliest_time');
                elementSettings.search.latest_time = this.get('dispatch.latest_time');
            }
            Dashboard.getStateModel().view.addElement(elementId, elementSettings).done(_.bind(function() {
                    var panel = mvc.Components.get('dashboard').createNewPanel({});
                    var newSearchId = _.uniqueId('new-search');
                    switch(searchType) {
                        case 'inline':
                            new SearchManager({
                                "id": newSearchId,
                                "search": this.get('search'),
                                "earliest_time": this.get('dispatch.earliest_time') || "0",
                                "latest_time": this.get('dispatch.latest_time') || '',
                                "app": utils.getCurrentApp(),
                                "auto_cancel": 90,
                                "status_buckets": 0,
                                "preview": true,
                                "timeFormat": "%s.%Q",
                                "wait": 0,
                                "runOnSubmit": true
                            }, {tokens: true, tokenNamespace: "submitted"});
                            break;
                        case 'saved':
                            new SavedSearchManager({
                                "id": newSearchId,
                                "searchname": this.get('savedSearchName'),
                                "app": utils.getCurrentApp(),
                                "auto_cancel": 90,
                                "status_buckets": 0,
                                "preview": true,
                                "timeFormat": "%s.%Q",
                                "wait": 0
                            });
                            break;
                    }
                    var ElementType = DashboardElement.extend({
                        initialVisualization: vizType
                    });
                    var elementSettings = {
                        id: elementId,
                        managerid: newSearchId,
                        title: this.get('title', {tokens: true})
                    };
                    if (vizType === "visualizations:charting" && this.get('display.visualizations.charting.chart')) {
                        elementSettings['charting.chart'] = this.get('display.visualizations.charting.chart');
                    } else if (vizType === "visualizations:mapping" && this.get('display.visualizations.mapping.type')) {
                        elementSettings['mapping.type'] = this.get('display.visualizations.mapping.type');
                    } else if (vizType === "visualizations:custom" && this.get('display.visualizations.custom.type')) {
                        elementSettings['type'] = this.get('display.visualizations.custom.type');
                    }
                    var component = new ElementType(elementSettings, {tokens: true});
                    panel.addChild(component);
                    panel.$el.trigger('structureReset');
                    panel.$el.trigger('resetDragAndDrop');
                    dfd.resolve();
                    $('html,body').animate({
                        scrollTop: panel.$el.offset().top
                    });
                    AddContentUtils.highlightPanel(panel.$el);
                }, this));

            return dfd.promise();
        }
    });
});
