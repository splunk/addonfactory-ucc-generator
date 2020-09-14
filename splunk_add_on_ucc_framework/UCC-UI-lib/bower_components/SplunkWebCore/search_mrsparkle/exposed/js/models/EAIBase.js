define(
    [
        'jquery',
        'underscore',
        'models/SplunkDBase',
        'models/shared/LinkAction',
        'util/splunkd_utils'
    ],
    function(
        $,
        _,
        SplunkDBaseModel,
        LinkAction,
        splunkd_utils
    ) {
        return SplunkDBaseModel.extend({
            initialize: function() {
                SplunkDBaseModel.prototype.initialize.apply(this, arguments);
                this.linkActionModel = new LinkAction();
                this.listenTo(this.linkActionModel, "serverValidated", this.onLinkServerValidated);
            },

            /*
             * Helper function to assign the link action url to the linkAction model
             *
             * @param linkKey {string} name of the attribute key to use in the links child model (eg. "delete")
             * @returns {boolean} If true, then the linkKey exists and the model has been updated with a new ID
             */
            assignLinkModelID: function(linkKey) {
                var url = this.entry.links.get(linkKey);
                if (url) {
                    this.linkActionModel.id = splunkd_utils.fullpath(url);
                    return true;
                }
                return false;
            },

            /**
             * Makes a REST request to an endpoint in the entry.links object
             * @param actionType (eg. "enable")
             * @returns {Promise} - The Deferred Promise object from the REST request
             */
            performAction: function(actionType) {
                var deferredResponse = $.Deferred();
                var saveDeferred;

                if (this.assignLinkModelID(actionType)) {
                    saveDeferred = this.linkActionModel.save();
                    saveDeferred.done(_.bind(function(response, status, opts) {
                        // update the original model
                        this.setFromSplunkD(response, {skipClone: true});
                        deferredResponse.resolve.apply(deferredResponse, arguments);
                    }, this));
                    saveDeferred.fail(_.bind(function() {
                        deferredResponse.reject.apply(deferredResponse, arguments);
                    }, this));
                } else {
                    deferredResponse.reject("The " + actionType + " action is not currently allowed on the Entity");
                }

                return deferredResponse.promise();
            },

            isDisabled: function () {
                return !!this.entry.content.get('disabled');
            },

            isEnabled: function () {
                return !this.isDisabled();
            },

            /**
             * Enables the Entity by making a REST request
             * @returns {Promise} - The Deferred Promise object from the REST request
             */
            enable: function() {
                return this.performAction("enable");
            },
            /**
             * Disables the Entity by making a REST request
             * @returns {Promise} - The Deferred Promise object from the REST request
             */
            disable: function() {
                return this.performAction("disable");
            },
            /*
             Proxy any serverValidated errors from the linkActionModel to the Entity model itself
             */
            onLinkServerValidated: function() {
                var triggerArgs = ["serverValidated"];
                for (var i = 0; i < arguments.length; i++) {
                    triggerArgs.push(arguments[i]);
                }
                this.trigger.apply(this, triggerArgs);
            }

        });
    }
);
