/**
 * @author jszeto
 * @date 10/14/14
 *
 * Working model used to store the values of the views/virtual_indexes/config/ArchiveSetup view.
 *
 * Attributes:
 *
 * originIndexes {String} - Comma-delimited string of one or more indexes
 * suffix {String} - suffix to append to each originIndex to generate the archive name
 * provider {String} - provider for the archives
 * outputDirectory {String} - path in the provider for the root output path of each archive
 * threshold {String} - archive any buckets older than this unit of time (eg. 5d or 1m)
 */
define([
    'jquery',
    'underscore',
    'models/Base',
    'splunk.util'
],
    function(
        $,
        _,
        BaseModel,
        splunkUtils
        ) {

        return BaseModel.extend({

            defaults: {
                originIndexes: undefined,
                suffix: "_archive",
                provider: undefined,
                outputDirectory: undefined,
                threshold: 86400
            },

            validation: {
                originIndexes : {
                    required : true,
                    msg: _("Splunk Indexes is a required field.").t()
                },
                suffix : {
                    required : true,
                    msg : _("Archived Index Name Suffix is a required field.").t()
                },
                provider : {
                    required : true,
                    msg : _("Destination Provider is a required field.").t()
                },
                outputDirectory : {
                    required : true,
                    msg : _("Destination Path in HDFS is a required field.").t()
                },
                threshold : {
                    min: 1,
                    msg : _("Older Than must be a number.").t()
                },
                cutoff : {
                    min: 1,
                    msg: _("Cutoff Time must be a number.").t()
                }
            },

            initialize: function(attrs, options) {
                BaseModel.prototype.initialize.call(this, attrs, options);
            },

            /**
             * Generates an array of attribute objects that represent a set of archives. The caller of this function
             * can use these objects to create new Archive model instances
             * @returns {Array}
             */
            generateVixAttributes: function() {
                var originIndexes = this.get("originIndexes");
                var indexes = originIndexes.split(",");
                var results = [];
                var suffix = this.get("suffix");
                var outputDirectory = this.get("outputDirectory");
                var provider = this.get("provider");
                var threshold = this.get("threshold");
                var cutoff = this.get("cutoff");

                // Strip off any trailing / from outputDirectory
                if (outputDirectory.charAt(outputDirectory.length - 1) == "/") {
                    outputDirectory = outputDirectory.substr(0, outputDirectory.length - 1);
                }

                _(indexes).each(function(index) {
                    results.push({
                        name : index + suffix,
                        "vix.output.buckets.from.indexes" : index,
                        "vix.provider" : provider,
                        "vix.output.buckets.path" : outputDirectory + "/" + index + suffix,
                        "vix.output.buckets.older.than" : threshold,
                        "vix.validate.paths" : 1,
                        "vix.unified.search.cutoff_sec" : cutoff
                    });
                }, this);

                return results;
            }

        });
    });

