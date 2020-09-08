define(
    [
        'underscore',
        'models/services/data/inputs/BaseInputModel'
    ],
    function(_, BaseInputModel) {
        return BaseInputModel.extend({
            url: "deployment/server/setup/data/inputs/remote_monitor",
            validation: {
                'ui.name': [
                    {
                        required: true,
                        msg: _("File path is required.").t()
                    },
                    {
                        fn: 'checkPathSlashes'
                    }
                ]
            },
            checkPathSlashes: function() {
                var path = this.get('ui.name');
                if (!path) {
                    return true;
                }
                if (this.wizard.get('fwdGroupIsWindows') && (path.indexOf('/') > -1)) {
                    return _('The path you specified includes forward slashes, which are atypical for file paths in Windows environments. Correct this path or choose a server class with non-Windows hosts.').t();
                } else if (!this.wizard.get('fwdGroupIsWindows') && (path.indexOf('\\') > -1)) {
                    return _('You specified a Windows path, but the server class you selected has no Windows hosts as members. Correct this path or choose a server class with Windows hosts.').t();
                }
            }
        });
    }
);