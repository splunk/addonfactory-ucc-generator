define([
    'jquery',
    'underscore',
    'splunkjs/mvc',
    'models/search/Report',
    'models/dashboard/DashboardElementReport',
    'dashboard/DashboardParser',
    'dashboard/DashboardFactory',
    'views/dashboard/layout/row_column/Row',
    'util/xml',
    'dashboard/serializer/PanelSerializer'
], function($,
            _,
            mvc,
            ReportModel,
            DashboardElementReport,
            DashboardParser,
            DashboardFactory,
            Row,
            XML,
            PanelSerializer) {

    var EditingHelper = {
        /**
         * save inline element into a report
         * @param existingManager
         * @param createdReport
         * @param reportModel
         * @param options
         * @returns {*}
         */
        saveAsReport: function(existingManager, createdReport, reportModel, options) {
            var dfd = $.Deferred();
            options = options || {};
            // this will fire edit:element event and gets the xml update
            var reportContent = _.extend({}, _.omit(reportModel.entry.content.toJSON({omitNonSavedSearchesDefaults: true}), 'name', 'description'), {
                "search": existingManager.settings.resolve({tokens: false}),
                "dispatch.earliest_time": existingManager.get('earliest_time', {tokens: false}),
                "dispatch.latest_time": existingManager.get('latest_time', {tokens: false})
            });
            var sampleRatio = existingManager.get('sample_ratio');
            if (sampleRatio != null) {
                reportContent['dispatch.sample_ratio'] = String(sampleRatio);
            }
            createdReport.entry.content.set(reportContent);
            var name = createdReport.entry.content.get('name');
            createdReport.entry.set({'name': name});
            createdReport.save({}, {data: {app: options.app, owner: options.owner}}).then(function() {
                DashboardFactory.getDefault().instantiate({
                    type: 'saved-search',
                    id: existingManager.id,
                    settings: {
                        "searchname": name,
                        "app": options.app,
                        "auto_cancel": 90,
                        "status_buckets": 0,
                        "preview": true,
                        "timeFormat": "%s.%Q",
                        "wait": 0,
                        "refresh": existingManager.get('refresh'),
                        "refreshType": existingManager.get('refreshType')
                    },
                    settingsOptions: {
                        replace: true
                    }
                }, {
                    replaceDuplicateIDs: false
                });
                dfd.resolve();
            }).fail(dfd.reject);
            return dfd;
        },
        /**
         *
         * @param existingManager
         * @param reportModel
         * @param options
         * @returns {*}
         */
        saveAsInlineSearch: function(existingManager, elementReport, reportModel, options) {
            options = options || {};
            var report = reportModel;

            // modify the element report first as the replace of search manager will recreate the report model
            var displayProperties = reportModel.entry.content.toJSON({
                omitNonSavedSearchesDefaults: true,
                onlyDisplayProperties: true
            });
            var settings = {
                "latest_time": report.entry.content.get('dispatch.latest_time'),
                "earliest_time": report.entry.content.get('dispatch.earliest_time'),
                "search": report.entry.content.get('search', {tokens: true}),
                "app": options.app,
                "auto_cancel": 90,
                "status_buckets": 0,
                "preview": true,
                "timeFormat": "%s.%Q",
                "wait": 0,
                "refresh": existingManager.get('refresh'),
                "refreshType": existingManager.get('refreshType')
            };
            // SPL-130406: make sure to add sample_ratio to settings if it exists
            if (report.entry.content.has('dispatch.sample_ratio')) {
                settings['sample_ratio'] = report.entry.content.get('dispatch.sample_ratio');
            }

            elementReport.set(displayProperties, {tokens: true});
            DashboardFactory.getDefault().instantiate({
                type: 'inline-search',
                id: existingManager.id,
                settings: settings,
                settingsOptions: {
                    replace: true
                }
            }, {
                replaceDuplicateIDs: false
            });
            return $.Deferred().resolve(report);
        },
        /**
         * switch to use another report on current element
         * @param existingManager
         * @param elementId
         * @param reportModel
         * @param newReportId
         * @param panelTitle
         * @param options
         * @returns {*}
         */
        updateReportId: function(existingManager, elementId, reportModel, newReportId, panelTitle, options) {
            var dfd = $.Deferred();
            var element = this.getComponent(elementId);
            if (newReportId && reportModel.get('id') != newReportId) {
                reportModel.set({'id': newReportId}, {silent: true});
                reportModel.entry.set({'id': newReportId}, {silent: true});
                reportModel.id = newReportId;
                var existingManagerId = element.settings.get('managerid') || element.settings.get('manager');
                var panel = this.getElementPanel(element);
                reportModel.fetch({}).then(function() {
                    // set new element title
                    if (panelTitle && panel) {
                        panel.settings.set('title', panelTitle);
                    }
                    var settingsFromExistingManager = _.pick(
                      existingManager.settings.toJSON(),
                      'auto_cancel', 'status_buckets', 'preview', 'refresh', 'refreshType');
                    DashboardFactory.getDefault().instantiate({
                        type: 'saved-search',
                        id: existingManagerId,
                        settings: _.extend({
                            "searchname": reportModel.entry.get("name"),
                            "app": options.app,
                            "auto_cancel": 90,
                            "status_buckets": 0,
                            "preview": true,
                            "timeFormat": "%s.%Q",
                            "wait": 0,
                            "refresh": existingManager.get('refresh'),
                            "refreshType": existingManager.get('refreshType')
                        }, settingsFromExistingManager),
                        settingsOptions: {
                            replace: true
                        }
                    }, {
                        replaceDuplicateIDs: false
                    });
                    // set the element viz type based on the new selected report.
                    element.model.elementReport.set(_.pick(reportModel.entry.content.toJSON(), DashboardElementReport.getVizTypeReportProperties()));
                    dfd.resolve();
                }).fail(dfd.reject);
            } else {
                dfd.resolve();
            }
            return dfd;
        },
        useReportSettingsForElement: function(elementReport, savedReport) {

            // clear all display properties in element report so that report properties will be used
            var clearProperties = _.extend({}, DashboardElementReport.getDisplayProperties(elementReport.toJSON()), DashboardElementReport.NON_SAVEDSEARCHES_DEFAULTS.toJSON());
            for (var key in clearProperties) {
                clearProperties[key] = undefined;
            }

            // copy type properties from savedReport to elementReport
            elementReport.set(_.pick(savedReport.entry.content.toJSON(), DashboardElementReport.getVizTypeReportProperties()));
            elementReport.set(clearProperties, {unset: true});
        },
        /**
         * Convert inline panel to prebuilt panel
         * @param panel
         * @param panelModel
         * @param panelProperties
         * @param options
         * @returns {*}
         */
        convertToPrebuiltPanel: function(panel, panelModel, panelProperties, options) {
            // construct panelModel from panelComponent and panelProperties and save it
            var structure = panel.captureStructure();
            var state = options.state;
            var panelState = state.panels.get(panel.id);

            var inputIds = _(structure.children).chain().where({type: 'input'}).pluck('id').value();
            var elementIds = _(structure.children).chain().where({type: 'element'}).pluck('id').value();
            var $panelXML = PanelSerializer.createPanelNode(panelState, inputIds, elementIds, state);
            _(['id', 'depends', 'rejects']).each(function(attr) {
                $panelXML.removeAttr(attr);
            });
            var dfd = $.Deferred();
            panelModel.entry.content.set('eai:data', XML.serializeDashboardXML($panelXML, true));
            panelModel.entry.content.set('name', panelProperties.get('panelName'));
            var permsParams = panel.model.application.getPermissions(panelProperties.get('panelPerm'));

            panelModel.save({}, {
                    data: permsParams
                })
                .done(function() {
                    require(['views/dashboard/layout/PanelRef'], function(PanelRef) {
                        var $docker = $('<div class="dashboard-cell"></div>').insertBefore(panel.$el);
                        var id = panel.id;
                        panel.remove();

                        var panelRef = new PanelRef({
                            id: id,
                            ref: panelModel.entry.content.get('name'),
                            model: _.extend({panel: panelModel}, options.model),
                            collection: options.collection,
                            deferreds: options.deferreds,
                            el: $docker
                        });
                        panelRef.render();

                        _(inputIds).each(function(id) { state.removeInput(id); });
                        _(elementIds).each(function(id) { state.removeElement(id); });
                        state.updatePanel(panel.id, panelRef);

                        panel.$el.trigger('resetDragAndDrop');
                        panelModel.trigger('createSuccess');
                        dfd.resolve();
                    });
                })
                .fail(dfd.reject);
            return dfd;
        },
        /**
         * Convert prebuilt panel to inline panel
         * @param panelComponent
         * @param options
         * @returns {*}
         */
        convertToInlinePanel: function(currentPanel, options) {
            var dfd = $.Deferred();
            var panelXML = currentPanel.model.panel.entry.content.get('eai:data');
            var components = DashboardParser.getDefault().parse(panelXML, {retainRawXML: true});
            components.id = currentPanel.id; // keep the id
            var $docker = $("<div></div>").insertBefore(currentPanel.$el);
            currentPanel.remove();
            DashboardFactory.getDefault().materialize(components, null, {
                model: options.model,
                deferreds: options.deferreds,
                renderRoot: true,
                loadPanels: true,
                createStateObjects: true
            }).then(function(inlinePanel, managers, components, events, stateObjects) {
                inlinePanel.$el.insertAfter($docker);
                $docker.remove();
                inlinePanel.$el.trigger('resetDragAndDrop');
                dfd.resolve(inlinePanel, managers, components, events, stateObjects);
            });
            return dfd;
        },
        /**
         *  Highlight component for 2 secs
         * @param component
         */
        highlight: function(component) {
            var $el = component.$el;
            $('html,body').animate({
                scrollTop: $el.offset().top
            });
            _.defer(function() {
                $el.addClass('panel-highlight');
                _.delay(function() {
                    $el.removeClass('panel-highlight');
                }, 2000);
            });
        },
        getElementPanel: function(element) {
            var panel = _(element.$el.parents('.dashboard-cell')).chain()
                .map(function(el) {
                    return $(el).attr('id');
                })
                .map(_.bind(mvc.Components.get, mvc.Components))
                .filter(_.identity)
                .first()
                .value();
            return panel;
        },
        getComponent: function(id) {
            return mvc.Components.get(id);
        }
    };

    return EditingHelper;
});