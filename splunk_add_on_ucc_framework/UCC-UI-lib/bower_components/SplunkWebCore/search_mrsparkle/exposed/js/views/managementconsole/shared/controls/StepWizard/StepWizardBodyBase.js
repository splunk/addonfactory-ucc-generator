/**
 * Created by rtran on 10/6/16.
 */
define([
    'underscore',
    'jquery',
    'backbone',
    'module',
    'views/Base'
], function(_, $, backbone, module, BaseView) {

    var StepWizardBodyBase = BaseView.extend({
        moduleId: module.id,

        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);

            this.renderDfd = $.Deferred();

            this.promiseInitialize().done(function() {
                this.deferredInitialize();
            }.bind(this));
        },

        deferredInitialize: function() {
            this.renderDfd.resolve();
        },

        promiseInitialize: function() {
            return $.when();
        },

        onNext: function(dfd) {
            dfd.resolve();
        }
    });

    return StepWizardBodyBase;
});