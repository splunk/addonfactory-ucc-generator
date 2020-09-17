define(
    [
        'underscore',
        'models/services/data/inputs/BaseInputModel',
        'models/services/admin/AdExplorer'
    ],
    function (
        _,
        BaseInputModel,
        AdExplorerModel
    ) {
        return BaseInputModel.extend({
            url: "data/inputs/ad",
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
                'ui.startingNode': [
                    {
                        fn: 'checkPathExists'
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
            checkPathExists: function () {
                var path = this.get('ui.startingNode');
                if (_.isUndefined(path) || (path === '')) {
                    // skip checking empty path, which is an optional field
                    return false;
                }
                var adExplorerModel = new AdExplorerModel();
                adExplorerModel.set({id: encodeURIComponent(path)});
                var res = adExplorerModel.fetch({async: false});
                if (res.state() === 'rejected') {
                    return  _('This starting node does not exist or is not accessible.').t();
                }

                return false;
            }
        });
    }
);