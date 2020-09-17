define(
    [
        'jquery',
        'underscore',
        'models/services/data/inputs/BaseInputModel',
        'models/services/admin/FileExplorer'
    ],
    function (
        $,
        _,
        BaseInputModel,
        FileExplorerModel
    ) {
        return BaseInputModel.extend({
            url: "data/inputs/monitor",
            urlRoot: "data/inputs/monitor",
            validation: {
                'ui.name': [
                    {
                        required: true,
                        msg: _("File or directory path is required.").t()
                    },
                    {
                        fn: 'checkPath'
                    }
                ],
                'ui.host': [
                    {
                        required: function() {
                            return (this.wizard.get('currentStep') === 'inputsettings') && (this.get('hostSwitch') === 'constant');
                        },
                        msg: _("Host value is required.").t()
                    }
                ],
                'ui.host_regex': [
                    {
                        required: function() {
                            return (this.wizard.get('currentStep') === 'inputsettings') && (this.get('hostSwitch') === 'regex');
                        },
                        msg: _("Host regex value is required.").t()
                    }
                ],
                'ui.host_segment': [
                    {
                        required: function() {
                            return (this.wizard.get('currentStep') === 'inputsettings') && (this.get('hostSwitch') === 'segment');
                        },
                        msg: _("Host segment value is required.").t()
                    }
                ]
            },
            getPathDetails: function () {
                var dfd = $.Deferred(),
                    flags = {};
                _.each(['isUNCPath','isWildcardPath','isArchive'], function(key) {
                    flags[key] = false;
                }.bind(this));

                var path = this.get('ui.name');
                if (!path) {
                    this.set('invalidPath', true);
                    dfd.reject();
                    return dfd;
                }

                if (path.indexOf('\\\\') === 0) {
                    flags.isUNCPath = true;
                } else if (path.indexOf('...') > -1 || path.indexOf('*') > -1) {
                    flags.isWildcardPath = true;
                } else if (this.isArchive(path)) {
                    flags.isArchive = true;
                }

                if (flags.isUNCPath  || flags.isWildcardPath || flags.isArchive) {
                    // don't check UNC, wildcarded and archive paths, assume they're always valid
                    dfd.resolve(flags);
                    return dfd;
                }
                var fileExplorerModel = new FileExplorerModel();
                fileExplorerModel.set({id: encodeURIComponent(path.replace(/\//g, '%2F'))});
                var res = fileExplorerModel.fetch({async: false});
                if (res) {
                    res.done(function(fileExplorerModel) {
                        //a tricky way to detect a file and not mix it up with an empty dir -
                        // the endpoint would return an entity with same name and no subnodes
                        var isFile = (
                                fileExplorerModel.entry.length === 1 &&
                                fileExplorerModel.entry[0].content.name.length > 0 &&
                                fileExplorerModel.entry[0].name === path &&
                                !fileExplorerModel.entry[0].content.hasSubNodes
                            );
                        flags.isDirectory = !isFile;
                        dfd.resolve(flags);
                    }.bind(this));
                } else {
                    // treat everything unknown as a directory
                    flags.isDirectory = true;
                    dfd.resolve(flags);
                }
                this.set('invalidPath', (res.state() === 'rejected'));

                return dfd;
            },
            checkPath: function () {
                if (this.get('continuouslyMonitor') == 1) { // don't check if Index Once is selected
                    var res = this.checkInputExists();
                    if (res) { return res; }
                }

                this.getPathDetails();
                if (this.get('invalidPath')) {
                    return  _('This path does not exist or is not accessible.').t();
                }
                return false;
            }
        });
    });