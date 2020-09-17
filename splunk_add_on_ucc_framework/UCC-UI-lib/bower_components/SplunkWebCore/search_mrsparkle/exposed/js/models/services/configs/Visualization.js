define([
        'jquery',
        'underscore',
        'models/SplunkDBase',
        'helpers/VisualizationRegistry',
        'util/splunkd_utils',
        'util/general_utils',
        'util/console',
        'requirejs'
    ],
    function(
        $,
        _,
        BaseModel,
        VisualizationRegistry,
        splunkdUtils,
        generalUtils,
        console,
        requirejs
    ) {
        var VisualizationModel = BaseModel.extend({
            url: 'configs/conf-visualizations',

            addToRegistry: function(options) {
                options = options || {};
                var vizName = this.entry.get('name');
                var appName = this.entry.acl.get('app');

                var appLocalModel = null;
                if (options.appLocalsCollection) {
                    appLocalModel = _.filter(options.appLocalsCollection.models, function(model){
                        return model.entry.get('name') === appName;
                    })[0];
                }
                if (!appLocalModel) {
                    console.warn(
                        'Unable to look up the app build number for custom visualization: ' + vizName + ' from app: ' + appName
                    );
                }

                var appBuildNumber = appLocalModel ? appLocalModel.getBuild() : null;

                var registrationData = {
                    appBuildNumber: appBuildNumber,
                    appName: appName,
                    vizName: vizName,
                    label: this.entry.content.get('label'),
                    icon: this.entry.content.get('icon'),
                    description: this.entry.content.get('description'),
                    searchHint: this.entry.content.get('search_fragment'),
                    defaultHeight: this.entry.content.get('default_height'),
                    isSelectable: this.isSelectable()
                };

                var formatterPath = VisualizationRegistry.getExternalVizBasePath(appBuildNumber, appName, vizName) + 'formatter.html';

                var dfd = $.Deferred();
                if (options.loadFormatterHtml !== false) {
                    requirejs([
                            'contrib/text!' + formatterPath
                        ], function(formatterHtml) {
                            VisualizationRegistry.registerExternalVisualization(
                                _.extend(registrationData, { formatterHtml: formatterHtml })
                            );
                            dfd.resolve();
                        },
                        function(err) {
                            console.log('Custom viz description not found');
                            VisualizationRegistry.registerExternalVisualization(registrationData);
                            dfd.resolve();
                        }
                    );
                } else {
                    VisualizationRegistry.registerExternalVisualization(registrationData);
                    dfd.resolve();
                }
                return dfd;
            },

            isDisabled: function() {
                return generalUtils.normalizeBoolean(this.entry.content.get('disabled'), { 'default': false });
            },

            isSelectable: function() {
                return (
                    !this.isDisabled() &&
                    generalUtils.normalizeBoolean(this.entry.content.get('allow_user_selection'), { 'default': true })
                );
            }
        },
        {
            createFromCustomTypeAndContext: function(customType, context) {
                var appAndVizName = customType.split('.'),
                    id = splunkdUtils.fullpath(
                        VisualizationModel.prototype.url + '/' + appAndVizName[1],
                        context
                    );

                return new VisualizationModel({ id: id });
            },

            ENABLED_FILTER: 'disabled=0',
            SELECTABLE_FILTER: 'disabled=0 AND allow_user_selection=1'
        });

        return VisualizationModel;
    }
);