define(function (require, exports, module) {
    var $ = require('jquery');
    var _ = require('underscore');
    var mvc = require('./mvc');
    var BaseSplunkView = require("./basesplunkview");
    var Footer = require('views/shared/footer/Master');
    var sharedModels = require('./sharedmodels');

    /**
     * @constructor
     * @memberOf splunkjs.mvc
     * @name FooterView
     * @description The **Footer** view displays the Splunk footer.
     * @extends splunkjs.mvc.BaseSplunkView
     *
     * @param {Object} options 
     * @param {String} options.id - The unique ID for this control. 
     * @param {Object} [options.settings] - The properties of the view. 
     *
     * @example
     * require([
     *     "splunkjs/mvc/footerview",
     *     "splunkjs/mvc/simplexml/ready!"
     * ], function(FooterView) {
     * 
     *     // Instantiate components
     *     new FooterView({
     *         id: "example-footer",
     *         el: $("#myfooterview")
     *     }).render();
     * 
     * });
     */
    var FooterView = BaseSplunkView.extend(/** @lends splunkjs.mvc.FooterView.prototype */{
        moduleId: module.id,
        
        className: 'splunk-footer',
        initialize: function() {
            var appModel = sharedModels.get("app");
            var appLocalModel = sharedModels.get("appLocal");
            var serverInfoModel = sharedModels.get("serverInfo");
            var appLocals = sharedModels.get("appLocals");

            this.dfd = $.when.apply($, [
                appModel.dfd,
                appLocalModel.dfd,
                serverInfoModel.dfd,
                appLocals.dfd
            ]);
            this.dfd.done(_.bind(function(){
                this.footer = Footer.create({
                    model: {
                        application: appModel,
                        appLocal: appLocalModel,
                        serverInfo: serverInfoModel
                    },
                    collection: {
                        apps: appLocals
                    }
                });
            }, this));
        },
        /**
         * Draws the view to the screen. Called only when you create the view manually.
         */
        render: function() {
            this.dfd.done(_.bind(function(){
                this.$el.append(this.footer.render().el);
            }, this));
            return this;
        }
    });

    return FooterView;
});