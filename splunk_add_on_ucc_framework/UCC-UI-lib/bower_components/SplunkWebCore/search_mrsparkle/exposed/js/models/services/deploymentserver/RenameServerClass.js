/**
 * @author jszeto
 *
 * Represents the action of renaming a Server Class. This isn't a normal EAI endpoint.
 * It takes two attributes as input:
 *
 * oldName {String} - current name of the Server Class
 * newName {String} - new name for the Server Class
 *
 * The response is the JSON for the renamed Server Class
 */

define(
    [
     'underscore',
     'jquery',
     'backbone',
     'models/Base',
     'models/SplunkDBase',
     'util/splunkd_utils'
     ],
     function(_, $, Backbone, BaseModel, SplunkDBase, splunkDUtils) {
        return BaseModel.extend({
            initialize: function(attributes, options) {
                BaseModel.prototype.initialize.apply(this, arguments);
            },
            url: "deployment/server/serverclasses/rename",

            defaults: {
                oldName: "",
                newName: ""
            },

            validation: {
                oldName: {
                        required: true,
                        msg: _("Old Name is required.").t()
                },
                newName: [
                     {
                         required: true,
                             msg: _("Name is required.").t()
                     },
                     {
                         pattern: /^[\w\s\.@~\-]+$/g,
                             msg: _("Name can can only contain alphanumeric characters, spaces, underscores, dashes, periods, tildes, or at signs.").t()
                     }
                ]
            },

            // Since we don't have an ID, we need to convince Backbone to do an update instead of a create
            isNew: function() {
                return false;
            },

            sync: function(method, model, options) {
                var defaults = {};

                // Only allow update.
                switch(method) {
                    case 'update':
                        defaults.processData = true;
                        defaults.type = 'POST';
                        defaults.url = splunkDUtils.fullpath(model.url); // Don't concat the id to the url.
                        defaults.data = model.toJSON(options);
                        defaults.data.output_mode = "json";
                        $.extend(true, defaults, options);
                        break;
                    default:
                        throw new Error('invalid method: ' + method);
                }
                return Backbone.sync.call(this, method, model, defaults);
            }
        });
    }
);

