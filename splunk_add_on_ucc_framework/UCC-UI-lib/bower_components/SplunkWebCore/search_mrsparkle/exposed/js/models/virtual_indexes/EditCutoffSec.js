/**
 * @author claral
  *
 * Working model used to store the value for editing the cutoff_sec of an archive.
 *
 * Attributes:
 *
 * vix.unified.search.cutoff_sec {String} - Cutoff for switching to the archive for searching.
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
                'vix.unified.search.cutoff_sec': undefined
            },

            validation: {
                'vix.unified.search.cutoff_sec' : {
                    min: 1,
                    msg : _('Cutoff Sec must be a number greater than 0.').t()
                }
            },

            initialize: function(attrs, options) {
                BaseModel.prototype.initialize.call(this, attrs, options);
            }

        });
    });


