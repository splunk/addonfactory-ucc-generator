define(
    [
        'underscore',
        'models/SplunkDBase'
    ],
    function(_, SplunkDBaseModel) {
        var DeploymentServerClass = SplunkDBaseModel.extend({
            url: "deployment/server/serverclasses",

            initialize: function() {
                SplunkDBaseModel.prototype.initialize.apply(this, arguments);
            },
            getNameWithoutSpecialCharacters: function() {
                var parsedName = this.entry.get('name');
                parsedName = parsedName.replace(/\W/g, "_");
                return parsedName;
            },
            getDisplayName: function() {
                return this.entry.get('name');
            }
        });

        // break the shared reference to Entry
        DeploymentServerClass.Entry = SplunkDBaseModel.Entry.extend({});
        // now we can safely extend Entry.Content
        DeploymentServerClass.Entry.Content = SplunkDBaseModel.Entry.Content.extend({
            defaults: {
                name: ""
            },
            validation: {
                name : [
                    {
                        required: true,
                        msg: _("Name is required.").t()
                    },
                    {
                        pattern: /^[\w\s\.@~\-]+$/g,
                        msg: _("Name can can only contain alphanumeric characters, spaces, underscores, dashes, periods, tildes, or at signs.").t()
                    }
                ]
            }
        });

        return DeploymentServerClass;
    }
);

