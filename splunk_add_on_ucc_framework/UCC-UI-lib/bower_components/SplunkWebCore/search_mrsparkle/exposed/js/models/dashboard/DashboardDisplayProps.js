define([
    'underscore',
    'backbone',
    'models/MeltingPot',
    'util/general_utils'
], function(_, Backbone, MeltingPot, GeneralUtils) {

    var DashboardDisplayPropsModel = MeltingPot.extend({
        constructor: function(initial) {
            this.url = new Backbone.Model();
            this.xml = new Backbone.Model();
            MeltingPot.prototype.constructor.call(this, {
                delegates: [
                    new MeltingPot({
                        delegates: [
                            new Backbone.Model(initial),
                            this.url
                        ]
                    }),
                    this.xml,
                    new Backbone.Model(DashboardDisplayPropsModel.GLOBAL_DEFAULTS)
                ]
            });
        },
        getRuntimeState: function() {
            return this.firstDelegate();
        },
        setFromDashboardXML: function(props) {
            this.xml.set(DashboardDisplayPropsModel.extractDisplayProps(props, {normalize: false}));
        },
        removeFromDashboardXML: function() {
            this.xml.clear();
        },
        setFromURL: function(props) {
            this.url.set(DashboardDisplayPropsModel.extractDisplayProps(props, {normalize: true}));
        }
    }, {
        GLOBAL_DEFAULTS: {
            hideSplunkBar: false,
            hideAppBar: false,
            hideChrome: false,
            hideFooter: false,
            hideTitle: false,
            hideEdit: false,
            targetTop: false,
            hideFilters: false
        },
        extractDisplayProps: function(obj, options) {

            options || (options = {});
            var pageParams = {};
            _.each(_.pick.apply(_, [obj].concat(_.keys(DashboardDisplayPropsModel.GLOBAL_DEFAULTS))), function(val, param) {
                pageParams[param] = options.normalize ? GeneralUtils.normalizeBoolean(val, {"default": true}) : val;
            });
            return pageParams;
        }
    });

    return DashboardDisplayPropsModel;
});
