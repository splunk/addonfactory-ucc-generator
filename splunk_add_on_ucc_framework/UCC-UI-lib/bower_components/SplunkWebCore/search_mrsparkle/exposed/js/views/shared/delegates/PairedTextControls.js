/**
 * @author jszeto
 * @date 6/14/13
 *
 * Given two TextControls, copies the value of the source TextControl over to the destination TextControl. If the user
 * types into the destination TextControl, the pairing ends. Call the enablePairing or disablePairing functions to
 * customize the behavior. The text that is copied over can be modified by the transformFunction.
 *
 * Inputs:
 *    sourceDelegate {views/shared/controls/TextControl} - Text Control from which to copy text
 *    destDelegate {views/shared/controls/TextControl} - Text Control that receives the copied text
 *    transformFunction {Function} - Takes a string as an input and returns a transformed string
 */
define(['jquery',
        'underscore',
        'backbone',
        'views/shared/controls/TextControl',
        'views/shared/delegates/Base'
       ],
    function(
        $,
        _,
        Backbone,
        TextControl,
        DelegateBase) {

        return DelegateBase.extend({

            transformFunction: undefined,

            /**
             * @constructor
             * @param options {Object} {
             * }
             */

            initialize: function(options) {
                options = options || {};

                this.sourceDelegate = options.sourceDelegate;
                this.destDelegate = options.destDelegate;
                this.transformFunction = options.transformFunction;

                if (!(this.sourceDelegate instanceof TextControl) ||
                    !(this.destDelegate instanceof TextControl)) {
                    throw new Error("SourceDelegate and destDelegate must be TextControls");
                }

                this.enablePairing();
            },

            enablePairing: function() {
                this.sourceDelegate.on("keyup", this.sourceChangeHandler, this);
                this.destDelegate.on("keyup", this.destChangeHandler, this);
            },

            disablePairing: function() {
                this.sourceDelegate.off("keyup", this.sourceChangeHandler, this);
            },

            sourceChangeHandler: function(e, value) {
                var destValue = value;
                if (this.transformFunction)
                    destValue = this.transformFunction(value);
                this.destDelegate.setValue(destValue);
            },

            destChangeHandler: function(e, value) {
                // If we get a non-tab or non-shift key, then disable the pairing
                if (e.keyCode != 9 && e.keyCode != 16) {
                    this.disablePairing();
                    this.destDelegate.off("keyup", this.destChangeHandler);
                }
            }


        });
    });