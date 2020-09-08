/**
 * @author ecarillo
 * @date 4/24/15
 *
 * Working model to create a new index
 */
define([
    'underscore',
    'models/Base'
    ],
    function(
        _,
        BaseModel
    ){
    return BaseModel.extend({
        idAttribute: 'name',
        defaults: {
            name: '',
            app: '',
            homePath: '',
            coldPath: '',
            thawedPath: '',
            enableDataIntegrityControl: false,
            frozenPath: '',
            maxIndexSize: 500,
            maxIndexSizeFormat: 'GB',
            maxBucketSize: 'auto',
            maxBucketSizeFormat: 'GB',
            enableTsidxReduction: false,
            tsidxReductionCheckPeriodInSec: '',
            timePeriodInSecBeforeTsidxReduction: '',
            tsidxAgeFormat: 'Days'
        },
        validation: {
            name : [
                {
                    fn: function(value, attr, computedState) {
                        if (computedState.isNew) {
                            if (value == "") {
                                return _("Index Name is required.").t();
                            }
                        }
                        return;
                    }
                },
                {
                    fn: function(value, attr, computedState) {
                        if (computedState.isNew) {
                            if (!/^[a-zA-Z0-9]([a-zA-Z0-9_\-]*)$/.test(value)) {
                                return _("Index Names may contain only letters, numbers, underscores, or hyphens. They must begin with a letter or number.").t();
                            }
                        }
                        return;
                    }
                }
            ],
            maxIndexSize: [
                {
                    required: true,
                    msg: _("Max Data Size is required.").t()
                },{
                    pattern: /^[\d]+$/,
                    msg: _("Max Data Size must be a positive integer.").t()
                }
            ],
            maxBucketSize: [
                {
                    required: true,
                    msg: _("Max Bucket Size is required.").t()
                }
            ],
            timePeriodInSecBeforeTsidxReduction: [
                {
                    fn: function(value, attr, computedState){
                        value += "";
                        if (computedState.enableTsidxReduction && !value.match(/^[\d]+$/)) {
                            return _("Age has to be a positive integer.").t();
                        }
                        return;
                    }
                }
            ]
        }
    });
});
