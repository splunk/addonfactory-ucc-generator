define(
    [
        'underscore',
        'models/services/data/inputs/BaseInputModel'
    ],
    function(
        _,
        BaseInputModel
    ) {
        return BaseInputModel.extend({
            url: "deployment/server/setup/data/inputs/remote_perfmon",
            validation: {
                'ui.name': [
                    {
                        required: true,
                        msg: _("Collection name is required.").t()
                    }
                ],
                'ui.interval': [
                    {
                        pattern: 'number',
                        msg: _('Enter a number for the Interval field.').t(),
                        required: true
                    }
                ],
                'ui.object': [
                    {
                        msg: _('Object must be selected.').t(),
                        required: true
                    }
                ]
            }
        });
    }
);