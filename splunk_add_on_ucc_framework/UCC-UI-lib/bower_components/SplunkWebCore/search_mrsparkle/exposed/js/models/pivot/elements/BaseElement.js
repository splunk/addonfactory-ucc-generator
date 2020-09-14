/**
 * @author sfishel
 *
 * An abstract base model for a pivot report element.
 */

define([
            'jquery',
            'models/Base'
        ],
        function(
            $,
            Base
        ) {

    return Base.extend({

        /**
         * Attributes
         *
         * -- primitive --
         *
         * fieldName {String} the name of the field
         * displayName {String} the name to use when displaying the field in the UI
         * elementType {String} the pivot element type, possible values are filter, column, row, cell
         * type {String} the data type, possible values are string, number, boolean, timestamp, objectCount, childCount, ipv4
         * owner {String} the id of the owner Object
         * label {String} a custom label to replace the default
         */

        defaults: {
            label: ''
        },

        getDefaultLabel: function() {
            return this.computeDefaultLabel(this.attributes);
        },

        /**
         * To be optionally overridden by sub-classes, returns the default label based on the given JSON configuration.
         * It is paramaterized this way so that it can be called from within parse.
         *
         * @return {String}
         */

        computeDefaultLabel: function(attributes) {
            return attributes.displayName || attributes.fieldName;
        },

        /**
         * A computed getter that returns the label attribute if it is non-empty, otherwise the default label
         *
         * @return {String}
         */

        getComputedLabel: function() {
            return this.get('label') || this.getDefaultLabel();
        },

        refreshLabel: function(options) {
            if(this.get('label') === this.getDefaultLabel()) {
                this.set({ label: '' }, options);
            }
        },

        parse: function(response) {
            return this.parseLabel(response);
        },

        // to be called at the end of the parse routine, passing the parsed attribute object
        parseLabel: function(response) {
            // if the label matches the default, unset the label
            if(response.label === this.computeDefaultLabel(response)) {
                return $.extend({}, response, { label: '' });
            }
            return response;
        },

        toJSON: function() {
            return ({
                // TODO: should the back end require fieldName (even for object counts)
                fieldName: this.get('fieldName') || '',
                type: this.get('type'),
                owner: this.get('owner')
            });
        }

    });
});