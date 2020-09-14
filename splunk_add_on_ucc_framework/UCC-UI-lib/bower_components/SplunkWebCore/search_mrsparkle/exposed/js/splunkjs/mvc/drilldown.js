define(function(require) {
    var _ = require('underscore');
    var $ = require('jquery');
    var utils = require('./utils');
    var route = require('uri/route');
    var console = require('util/console');
    var util = require('splunk.util');
    var sharedModels = require('./sharedmodels');
    var splunkConfig = require('splunk.config');
    var IntentionsParser = require('models/services/search/IntentionsParser');
    var GeneralUtils = require('util/general_utils');
    var CoreDrilldownUtils = require('util/drilldown');
    
    /**
     * @name Drilldown
     * @description The **Drilldown** class provides methods for working
     * with drilldown functionality on search results.
     * @namespace splunkjs.mvc.drilldown
     * @private
     */
    var Drilldown = {
        applyDrilldownIntention: function(clickInfo, manager, options) {
            var applicationModel = sharedModels.get('app');
            var jobProperties = manager.get('data');
            var earliest = jobProperties.searchEarliestTime;
            var latest = jobProperties.searchLatestTime;

            if (!earliest && jobProperties.earliestTime) {
                earliest = util.getEpochTimeFromISO(jobProperties.earliestTime);
            }
            if (!latest && jobProperties.latestTime) {
                latest = util.getEpochTimeFromISO(jobProperties.latestTime);
            }
            var query = {
                search: manager.settings.resolve({ qualified: true }),
                earliest: earliest,
                latest: latest
            };
            return CoreDrilldownUtils.applyDrilldownIntention(
                clickInfo, query, jobProperties.fieldMetadataResults, applicationModel, options);
        },
        // DEPRECATED - use handleAutoDrilldown instead
        handleDrilldown: function(click, drilldownType, manager) {
            console.warn('DEPRECATED Drilldown.handleDrilldown() - use Drilldown.autoDrilldown() instead');
            return Drilldown.autoDrilldown(click, manager, { drilldownType: drilldownType });
        },
        /**
         * Applies the drilldown intention and redirects to the search page when the result is ready.
         * If a user-defined global drilldown exists, it gets called instead of redirecting.
         * @memberof splunkjs.mvc.drilldown
         */
        autoDrilldown: function(click, manager, options) {
            var drilldownPromise = Drilldown.applyDrilldownIntention(click, manager, options);
            if (splunkConfig.ON_DRILLDOWN) {
                drilldownPromise.done(splunkConfig.ON_DRILLDOWN);
            } else {
                var app = sharedModels.get('app').toJSON();
                route.redirectTo(
                    drilldownPromise.then(function(drilldownInfo) {
                        return route.search(app.root, app.locale, app.app, { data : drilldownInfo });
                    }),
                    CoreDrilldownUtils.shouldDrilldownInNewTab(click, options)
                );
            }
        },
        /**
         * Redirects to the search page.
         * @param {Object} params - The query string parameters to send to search view.
         * @param {Boolean} newWindow - When `true`, opens the search page in a new window.
         * @memberof splunkjs.mvc.drilldown
         */
        redirectToSearchPage: function(params, newWindow) {
            var app = sharedModels.get('app').toJSON();
            var url = route.search(app.root, app.locale, app.app, {
                data: params
            });
            utils.redirect(url, newWindow);
        },

        getNormalizedTimerange: function(manager, e) {
            if (e && e.name === "_time" && e._span) {
                var span = parseFloat(e._span);
                var earliest = parseFloat(e.value);
                return {
                    earliest: earliest || '',
                    latest: earliest + span || ''
                };
            } else {
                return Drilldown.getSearchJobTimerange(manager);
            }
        },

        getSearchJobTimerange: function(manager){
            var earliest, latest;
            var jobProperties = manager.get('data');
            if (jobProperties) {
                earliest = jobProperties.searchEarliestTime;
                latest = jobProperties.searchLatestTime;
                if (!earliest && jobProperties.earliestTime) {
                    earliest = util.getEpochTimeFromISO(jobProperties.earliestTime);
                }
                if (!latest && jobProperties.latestTime) {
                    latest = util.getEpochTimeFromISO(jobProperties.latestTime);
                }
            }
            return {
                earliest: earliest || '',
                latest: latest || ''
            };
        },

        /**
         * Normalizes information of a core view drilldown event into a data object that is passed to drilldown
         * listeners.
         *
         * @param {Object} e - Event payload from a drilldown event of core view.
         * @param {Object} options
         * @param {String} options.contextProperty
         * @param {Boolean} options.jobTimeOnly - When `true`, forces the use of the search job timerange for drilldown.
         * @returns {Object} The normalized event data.
         * @memberof splunkjs.mvc.drilldown
         */
        normalizeDrilldownEventData: function(e, options) {
            options || (options = {});
            var data = {}, manager = options.manager;
            if (e.type === 'geoviz') {
                data = this.normalizeGeovizDrilldownEventData(e, options);
            } else {
                _.extend(data, {
                    "click.name": e.name,
                    "click.value": e.value
                });
                if (e.hasOwnProperty('name2')) {
                    _.extend(data, {
                        "click.name2": e.name2,
                        "click.value2": e.value2
                    });
                } else {
                    _.extend(data, {
                        "click.name2": e.name,
                        "click.value2": e.value
                    });
                }
                if (options.contextProperty) {
                    _.extend(data, e[options.contextProperty]);
                    if (e._span) {
                        data['row._span'] = e._span;
                    }
                }
            }

            _.extend(data, options.jobTimeOnly ?
                Drilldown.getSearchJobTimerange(manager) :
                Drilldown.getNormalizedTimerange(manager, e, options)
            );
            return data;
        },

        normalizeGeovizDrilldownEventData: function(e) {
            var data = {};
            _(e.fields).each(function(key) {
                var value = e.data[key];
                data['row.' + key] = value;
                if (key !== 'latitude' && key != 'longitude') {
                    if (!data.hasOwnProperty('click.name')) {
                        data['click.name'] = key;
                        data['click.value'] = value;
                        data['click.name2'] = key;
                        data['click.value2'] = value;
                    }
                }
            });
            if (!data.hasOwnProperty('click.name')) {
                data['click.name'] = 'latitude';
            }
            _(['south', 'west', 'north', 'east']).each(function(orientation) {
                data['click.bounds.' + orientation] = e.data['_geo_bounds_' + orientation];
            });
            data['click.lat.name'] = e.data['_geo_lat_field'];
            data['click.lon.name'] = e.data['_geo_long_field'];
            data['click.lat.value'] = e.data['latitude'];
            data['click.lon.value'] = e.data['longitude'];
            return data;
        },

        /**
         * Creates a drilldown event payload from the given data object and additionally injects these methods:
         *
         * - **preventDefault**: Prevents the default drilldown action.
         * - **defaultPrevented**: Detects whether **preventDefault** has been called.
         * - **drilldown**: Explicitly invokes the default drilldown action. This method ensures that the default action
         *   is invoked once once regardless of how often **drilldown** is called.
         *
         * @param {Object} data - Additional data for the event payload.
         * @param {Function} defaultHandler - The default drilldown handler function.
         * @return {Object} The enriched event payload.
         * @memberof splunkjs.mvc.drilldown
         */
        createEventPayload: function(data, defaultHandler) {
            var defaultPrevented = false;
            return _.extend(data, {
                preventDefault: function() {
                    defaultPrevented = true;
                },
                defaultPrevented: function() {
                    return defaultPrevented;
                },
                drilldown: _.once(defaultHandler)
            });
        },

        /**
         * Normalizes the drilldown type option value.
         * @param {String} value - The user-specified value.
         * @param {Object} options
         * @param {Array} options.validValues - All accepted string values.
         * @param {String} options.default - The default value to use when the specified value is not defined or invalid.
         * @param {Boolean} options.allowBoolean - Indicates whether to accept user-specified Boolean values.
         * @param {Object} options.aliasMap - A name mapping.
         * @memberof splunkjs.mvc.drilldown
         */
        getNormalizedDrilldownType: function(value, options) {
            options = _.extend({ allowBoolean: false, validValues: ['all', 'none'], 'default': 'all' }, options);
            options.aliasMap = _.extend(_.object(options.validValues, options.validValues), options.aliasMap);
            if (options.aliasMap.hasOwnProperty(value)) {
                return options.aliasMap[value];
            } else if (options.allowBoolean && GeneralUtils.isBooleanEquivalent(value)) {
                return GeneralUtils.normalizeBoolean(value) ? 'all' : 'none';
            }
            return options['default'];
        }
    };

    return Drilldown;

});
