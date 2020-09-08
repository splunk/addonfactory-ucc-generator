define(
    [
        'underscore',
        'models/services/data/inputs/BaseInputModel',
        'models/services/admin/RegExplorer'
    ],
    function (
        _,
        BaseInputModel,
        RegExplorerModel
    ) {
        return BaseInputModel.extend({
            url: "data/inputs/registry",
            validation: {
                'ui.name': [
                    {
                        required: true,
                        msg: _("Collection name is required.").t()
                    },
                    {
                        fn: 'checkInputExists'
                    }
                ],
                'ui.hive': [
                    {
                        required: true,
                        msg: _("Registry hive must be selected.").t()
                    },
                    {
                        fn: 'checkHiveExists'
                    }
                ],
                'ui.host': [
                    {
                        required: function() {
                            return this.wizard.get('currentStep') === 'inputsettings';
                        },
                        msg: _("Host value is required.").t()
                    }
                ]
            },
            checkHiveExists: function () {
                var path = this.get('ui.hive');
                var regExplorerModel = new RegExplorerModel();
                regExplorerModel.set({id: encodeURIComponent(path)});
                var res = regExplorerModel.fetch({async: false});
                if (res.state() === 'rejected') {
                    return  _('This hive does not exist or is not accessible.').t();
                }

                return false;
            }

        });
    }
);