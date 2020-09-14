/**
 * @author sfishel
 *
 * A model for an individual string column pivot element.
 */

define(['jquery', 'underscore', 'splunk.util', '../BaseElement'], function($, _, splunkUtils, BaseElement) {

    return BaseElement.extend({

        /**
         * Attributes
         *
         * (See models/pivot/elements/BaseElement.js for inherited attributes)
         *
         * limitAmount {String, should parse to an integer} the number of results to limit to
         */

        defaults: $.extend({}, BaseElement.prototype.defaults, {

            elementType: 'column'

        })

    });

});