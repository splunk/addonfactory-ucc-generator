/**
 * @author sfishel
 *
 * Row element models are just an extension of the column counterpart with a label attribute.
 * This is a helper function to perform the extension.
 */

define([
            'jquery'
        ],
        function(
            $
        ) {

    return ({

        convert: function(columnModel) {

            return columnModel.extend({

                defaults: $.extend({}, columnModel.prototype.defaults, {
                    elementType: 'row'
                }),

                parse: function(response) {
                    response = columnModel.prototype.parse.call(this, response);
                    return this.parseLabel(response);
                },

                toJSON: function() {
                    var json = columnModel.prototype.toJSON.call(this);
                    return $.extend(json, {
                        label: this.getComputedLabel()
                    });
                }

            });

        }

    });

});