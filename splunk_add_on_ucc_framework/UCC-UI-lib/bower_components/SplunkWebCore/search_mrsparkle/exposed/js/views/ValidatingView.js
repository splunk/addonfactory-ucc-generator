/**
 * @author jszeto
 * @date 12/17/12
 */
define([
    'jquery',
    'backbone',
    'underscore',
    'views/Base',
    'util/general_utils'
],
    function(
        $,
        Backbone,
        _,
        BaseView,
        general_utils
        ){
        return BaseView.extend(
        {

            /**
             * A dictionary mapping the model attributes to the name of ControlGroup children views. The key is the
             * model attribute name. The value is the name of the ControlGroup in the view's children dictionary.
             * ex. {
             *         firstName: "FirstNameView",
             *         lastName: "LastNameView",
             *         zipCode: "ZipCodeView"
             *     }
             */
            modelToControlGroupMap: {},

            /**
             *  Override parent class stopListening to also call tearDownValidation()
             */
            stopListening: function() {
                this.tearDownValidation();
                BaseView.prototype.stopListening.apply(this, arguments);
            },

            /**
             * Call this function if your View has data input controls that need to perform validation. Instantiate the
             * view's model prior to calling this function.
             *
             * @param model - a model or collection The view listens for their "validated" event
             * @param flashMessagesHelper - {FlashMessagesHelper} - reference to the FlashMessagesHelper which listens to
             * "validated" events from a set of Views and applies those errors to a FlashMessages collection
             */
            setupValidation: function(modelOrCollection, flashMessagesHelper) {
                if (_.isUndefined(modelOrCollection))
                    throw "The model or collection you passed into views/Base.setupValidation is undefined";
                // Handle case of collection by iterating over it
                if (modelOrCollection instanceof Backbone.Model)
                    this._setupModelValidationListener(modelOrCollection);
                else if (modelOrCollection instanceof Backbone.Collection) {
                    modelOrCollection.each(function(model){
                        this._setupModelValidationListener(model);
                    });
                    modelOrCollection.on('add', function(model) {this._setupModelValidationListener(model);}, this);
                    modelOrCollection.on('remove', function(model) {model.off("validated", this._modelValidatedHandler, this);}, this);
                }
                // Register with the FlashMessagesHelper
                this.__flashMessagesHelper__ = flashMessagesHelper;
                this.__flashMessagesHelper__.register(this);
            },

            /**
             * Call this when destroying the View
             */
            tearDownValidation: function() {
                if (this.__flashMessagesHelper__)
                    this.__flashMessagesHelper__.unregister(this);
            },

            // Helper function to setup the validated listener on a given model. For internal use only.
            _setupModelValidationListener: function(model) {
                model.on("validated",this._modelValidatedHandler, this);
            },

            /**
             * Handle when a model has performed validation. This function decorates the error messages with labels from
             * the view's ControlGroups if the modelToControlGroupMap property is defined. It then sets the error states
             * of the ControlGroups based on the errors. The function also notifies the FlashMessagesHelper of the latest
             * validation result.
             *
             * @param isValid - true if the entire model passed validation
             * @param model - the model that was validated
             * @param invalidAttrs - an object of invalid model attributes and their error messages. The key is the attribute
             * name while the value is the error message.
             */
            _modelValidatedHandler: function(isValid, model, invalidAttrs) {

                var flashMessages = [];

                if (this.modelToControlGroupMap) {
                    // Get a dictionary where the keys are the controlGroups and the values are undefined.
                    var controlGroupToErrorMap = general_utils.invert(this.modelToControlGroupMap);
                    controlGroupToErrorMap =  _.reduce(_.keys(controlGroupToErrorMap || {}), function(memo, key) {
                        memo[key] = void 0;
                        return memo;
                    }, {});

                    _(invalidAttrs).each(function (error, invalidAttr) {
                        invalidAttrs[invalidAttr] = {message:error, label:""};
                    });

                    // Iterate over the invalidAttrs and map their error message to the controlGroupToErrorMap
                    _(invalidAttrs).each(function(error, invalidAttr) {
                        // Get the controlGroup associated with this model attribute
                        var controlGroupName = this.modelToControlGroupMap[invalidAttr];
                        var message = error.message;
                        var decoratedMessage;
                        var controlGroupLabel = "";

                        if (!_.isUndefined(controlGroupName)) {

                            // Replace the {label} placeholder with the control group's label.
                            if (this.children[controlGroupName].options.label)
                                controlGroupLabel = this.children[controlGroupName].options.label;
                            decoratedMessage = message.replace(/\{(label)\}/g, controlGroupLabel || invalidAttr);

                            controlGroupToErrorMap[controlGroupName] = decoratedMessage;
                        } else {
                            // If we can't find the attribute in the map, then just use the model attribute for the label
                            decoratedMessage = message.replace(/\{(label)\}/g, invalidAttr);
                        }

                        error.message = decoratedMessage;
                        error.label = controlGroupLabel;

                    }, this);

                    // Iterate over the View's controlGroups and set the error state
                    _(controlGroupToErrorMap).each(function(error, controlGroup) {
                        if (!_.isUndefined(error)) {
                            this.children[controlGroup].error(true, error);
                        }
                        else {
                            this.children[controlGroup].error(false, "");
                        }
                    }, this);
                }
                else {
                    _(invalidAttrs).each(function(error, invalidAttr) {
                        error.message = error.message.replace(/\{(label)\}/g, invalidAttr);
                    });
                }

                this.trigger("validated", isValid, model, invalidAttrs, this);
            }

    });
});
