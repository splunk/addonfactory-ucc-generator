/**
 * @author jszeto
 * @date 3/18/15
 *
 * Working model to create a new archive
 */
define([
        'underscore',
        'models/Base'
    ],
    function(
        _,
        BaseModel
    ) {

        return BaseModel.extend({

            idAttribute: 'name',
            defaults: {
                name:"",
                "vix.fs.default.name":""
            },

            validation: {
                name : {
                    fn : function(value, attr, computedState) {
                        if (computedState.isNew) {
                            if (value == "") {
                                return _("Archive Name is required.").t();
                            }
                            // TODO [JCS] Add checks for lowercase and no whitespace
                        }

                        return;
                    }
                },
                "vix.fs.default.name": [
                    {
                        required: true,
                        msg: _("AWS S3 Path is required.").t()
                    },
                    {
                        fn: function (value) {
                            var schemePattern = /^([a-z]([a-z0-9\+\.\-]*):\/\/)/i;
                            var rootedPathPattern = /^([^/]+)\/?$/i;

                            var schemeMatch = value.match(schemePattern);
                            if (!schemeMatch) {
                                return _("No scheme found in AWS S3 Path.").t();
                            }

                            var path = value.slice(schemeMatch[0].length);

                            if (path.length == 0) {
                                return _("AWS S3 Path is missing the bucket name.").t();
                            }

                            var pathMatch = path.match(rootedPathPattern);
                            if (!pathMatch) {
                                return _("AWS S3 Path must point to the root of the bucket.").t();
                            }
                        }
                    }
                ]
            },

            getArchiveAttributes: function() {
                return {"vix.fs.default.name": this.get("vix.fs.default.name"),
                        "vix.description" : this.get("vix.description")};
            }

        });
    });
