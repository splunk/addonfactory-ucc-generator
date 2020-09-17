define(
    [
        'jquery',
        'underscore',
        'models/services/data/inputs/BaseInputModel',
        'util/splunkd_utils'
    ],
    function (
        $,
        _,
        BaseInputModel,
        splunkd_utils
        ) {
        return BaseInputModel.extend({
            url: "data/inputs/http",
            urlRoot: "data/inputs/http",
            validation: {
                'ui.name': [
                    {
                        required: function() {
                            return this.isNew();
                        },
                        msg: _("Token name is required.").t()
                    },
                    {
                        fn: 'checkInputExists'
                    }
                ],
                'ui.index': [
                    {
                        required: function() {
                            if (this.wizard && this.wizard.get('currentStep') === 'inputsettings') {
                                return _.isArray(this.get('ui.indexes')) && this.get('ui.indexes').length;
                            }
                            return false;
                        },
                        msg: _("Default index is required when list of allowed indexes is set.").t()
                    }
                ]
            },

            getPrettyName: function() {
                // cut the http:// prefix from the entity name and return it
                var name = this.entry.get('name');
                if (name.indexOf('http://') === 0) {
                    name = name.substring(7);
                }
                return name;
            },

            runAction: function(action, options) {
                var url = this.entry.links.get(action);
                if (!url) {
                    return;
                }
                return $.post(splunkd_utils.fullpath(url), options);
            },

            disableEntity: function() {
                return this.runAction('disable');
            },

            enableEntity: function() {
                return this.runAction('enable');
            }
        });
    }
);