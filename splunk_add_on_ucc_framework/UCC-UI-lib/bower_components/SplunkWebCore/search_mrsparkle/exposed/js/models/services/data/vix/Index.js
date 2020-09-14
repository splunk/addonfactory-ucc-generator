define(
    [
        'underscore',
        'models/SplunkDBase'

    ],
    function(_, SplunkDBaseModel) {
        var IndexModel = SplunkDBaseModel.extend({
            url: "data/vix-indexes",
            urlRoot: "data/vix-indexes",
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

        //make sure that the user has entered a description and an hdfs path for the vix.
        //Show an error message if not. TODO: fix problem with saving despite missing required input
        IndexModel.Entry = SplunkDBaseModel.Entry.extend({
            defaults : {
                'name' : ""
            },

            validation:
            {
                'name': {
                    required: true,
                    msg: _("Name is a required field.").t()
                }
            }

        });

        IndexModel.Entry.Content = SplunkDBaseModel.Entry.Content.extend({
            defaults: {
                'vix.input.1.path': ""
            },
            validation: {
                'vix.input.1.path' :
                {
                    required: true,
                        msg: _("HDFS Path is a required field.").t()
                }
            }
        });
        return IndexModel;
    }
);