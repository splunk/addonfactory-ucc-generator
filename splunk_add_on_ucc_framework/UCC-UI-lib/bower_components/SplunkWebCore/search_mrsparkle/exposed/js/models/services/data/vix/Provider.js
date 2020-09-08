define(
    [
        'jquery',
        'underscore',
        'models/SplunkDBase'
    ],
    function($, _, SplunkDBaseModel) {
        var ProviderModel = SplunkDBaseModel.extend({
            url: "data/vix-providers",
            urlRoot: "data/vix-providers",
            initialize: function() {
                SplunkDBaseModel.prototype.initialize.apply(this, arguments);
                this.blacklistedAttrs = [];
            },
            disableAttr: function(attr) {
                this.blacklistedAttrs.push(attr);
            },
            enableAttr: function(attr) {
                this.blacklistedAttrs.splice(_(this.blacklistedAttrs).indexOf(attr),1);
            },
            parse: function(response, options) {
                response = $.extend(true, {}, response);
                // set the entry.name to the entry.content.name if none is specified
                if(_(response.entry[0].content.name).isUndefined()) {
                    response.entry[0].content.name = response.entry[0].name;
                }
                return SplunkDBaseModel.prototype.parse.call(this, response);
            },

            save: function (attrs, options) {
                attrs = attrs || this.entry.content.toJSON();
                options = options || {};
                // If model defines blacklistedAttrs, replace attrs with trimmed version
                if (this.blacklistedAttrs) {
                    attrs = _(attrs).omit(this.blacklistedAttrs);
                }
                options.attrs = attrs;
                // Call super with attrs moved to options
                return SplunkDBaseModel.prototype.save.call(this, attrs, options);
            }
        });

        ProviderModel.Entry = SplunkDBaseModel.Entry.extend({});

        ProviderModel.Entry.Content = SplunkDBaseModel.Entry.Content.extend({
            defaults : {
                'name' : "",
                'vix.env.JAVA_HOME' : "",
                'vix.env.HADOOP_HOME': "",
                'vix.fs.default.name': "",
                'vix.splunk.home.hdfs': ""
            },

            validation : {
                'name' :
                {
                    required: true,
                    msg: _("Name is a required field.").t()
                },

                'vix.env.JAVA_HOME' : {
                    required: function(value, attr, computedState) {
                        return computedState["vix.family"] == "hadoop";
                    },
                    msg: _("Java Home is a required field.").t()
                },

                'vix.env.HADOOP_HOME' : {
                    required: function(value, attr, computedState) {
                        return computedState["vix.family"] == "hadoop";
                    },
                    msg: _("Hadoop Home is a required field.").t()
                },

                'vix.fs.default.name' : {
                    required: function(value, attr, computedState) {
                        return computedState["vix.family"] == "hadoop";
                    },
                    msg: _("File System is a required field.").t()
                },

                'vix.splunk.home.hdfs' : {
                    required: function(value, attr, computedState) {
                        return computedState["vix.family"] == "hadoop";
                    },
                    msg: _("HDFS Working Directory is a required field.").t()
                }
            },

            validateJavaHome: function(value, attr, computedState) {
                if(value !== 'something') {
                    return 'Name is invalid';
                }
            }

        });
        return ProviderModel;
    }
);