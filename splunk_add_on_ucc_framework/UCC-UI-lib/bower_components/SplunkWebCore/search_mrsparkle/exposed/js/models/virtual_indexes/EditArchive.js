/**
 * @author jszeto
 * @date 11/5/14
  *
 * Working model used to store the value for editing an archive.
 *
 * Attributes:
 *
 * vix.output.buckets.older.than {String} - archive any buckets older than this unit of time (eg. 5d or 1m)
 */
define([
        'jquery',
        'underscore',
        'models/Base'
    ],
    function(
        $,
        _,
        BaseModel
    ) {

        return BaseModel.extend({

            defaults: {
                "vix.output.buckets.older.than": undefined
            },

            validation: {
                "vix.output.buckets.older.than" : {
                    min: 1,
                    msg : _("Older Than must be a number").t()
                }
            },

            initialize: function(attrs, options) {
                BaseModel.prototype.initialize.call(this, attrs, options);
            }

        });
    });


