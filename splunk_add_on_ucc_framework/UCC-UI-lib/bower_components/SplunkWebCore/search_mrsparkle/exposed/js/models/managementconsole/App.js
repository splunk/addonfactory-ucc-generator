define([
        'jquery',
        'underscore',
        'models/managementconsole/Configuration',
        'helpers/managementconsole/url',
        'util/splunkd_utils'
    ],
    function(
        $,
        _,
        ConfigurationModel,
        urlHelper,
        splunkdUtils
    ) {
        var AFTER_INSTALLATION = {
                DO_NOTHING: {value: null, label: _('Do nothing').t()},
                RESTART_SPLUNKD: {value: 'restartSplunkd', label: _('Restart Splunk').t()},
                ISSUE_RELOAD: {value: 'issueReload', label: _('Reload App').t()}
            },
            LOCATION = {
                ALL: 'allSelected',
                NONE: 'noneSelected',
                SERVER_CLASS: 'serverClassesSelected'
            },
            STRINGS = {
                NO_VERSION: _('None').t(),
                APP_NULL_LABEL: _("N/A").t()
            };

        var getAfterInstallationLabel = function(value) {
            var entry = _.find(_.values(AFTER_INSTALLATION), function(val) { return val.value === value; });
            return entry && entry.label;
        };

        // In MultiInput control, quotes are wrapped around a group name if it contains space (which is now allowed for group name)
        // This function is to remove the quotes before sending to the endpoint
        var removeQuoteFromGroupNames = function(groupsArr) {
            return _.map(groupsArr, function(groupName) {
                return groupName.replace(/['"]+/g, '');
            });
        };

        var appModel = ConfigurationModel.extend(
            {
                urlRoot: "/services/dmc/apps",
                exportUrlRoot: "/services/dmc/apps-download",
                configureUrlKey: 'app',

                isApp: function() {
                    return true;
                },

                getPrefix: function() {
                    return _('App').t();
                },

                getBundleName: function() {
                    return this.entry.get('name');
                },

                getType: function() {
                    return 'app';
                },

                getBundleType: function() {
                    return 'app';
                },

                getAppLabel: function() {
                    return this.entry.content.get('@label');
                },

                getVersion: function() {
                    return this.entry.content.get('@version') || STRINGS.NO_VERSION;
                },

                getDeployStatusFilterQuery: function() {
                    return {};
                },

                deployStatusNeedsRefetch: function(currFetchData) {
                    var defaultDeployStatusQuery = this.getDefaultDeployStatusQuery();
                    return currFetchData.get('offset') !== 0 ||
                           currFetchData.get('deployStatusQuery') !== JSON.stringify(defaultDeployStatusQuery);
                },

                getDefaultDeployStatusQuery: function() {
                    return {bundle: this.getBundleName()};
                },

                getReleaseNotesURI: function() {
                    return this.entry.get('manifest') ? this.entry.get('manifest').info.releaseNotes.uri : null;
                },

                getPrettyPackageDependenciesString: function() {
                    var dependencies = this.entry.get('manifest') ? this.entry.get('manifest').dependencies : {},
                        dependenciesArr = [];

                    _.each(dependencies, function(val, key) {
                        dependenciesArr.push(key + ' (' + val.version + ')');
                    });
                    return _.isEmpty(dependenciesArr) ? _('None').t() : dependenciesArr.join(', ');
                },

                install: function() {
                    return this.save({}, {
                        url: splunkdUtils.fullpath("/services/dmc/apps-install"),
                        data: JSON.stringify({
                            // will need to change this later to accept null instead
                            uid: this.entry.content.get('uid'),
                            appId: this.entry.content.get('appId'),
                            auth: this.entry.content.get('auth'),
                            inputGroupMapping: this.get('inputGroupMapping') || null,
                            installDependencies: this.entry.content.get('installDependencies')
                        }),
                        contentType: 'application/json'
                    });
                },

                uninstall: function() {
                    return ConfigurationModel.prototype.destroy.call(this, {
                        url: splunkdUtils.fullpath("/services/dmc/apps-install/" + this.getId())
                    });
                },

                /**
                 * Need to override because base manager delete confirmation dialog simply calls destroy on model
                 * @returns {*}
                 */
                destroy: function() {
                    return this.uninstall();
                },

                sync: function(method, model, options) {

                    if (method === 'create' || method === 'update') {
                        var groups = removeQuoteFromGroupNames(this.entry.content.get('groups')),
                            afterInstallation = this.entry.content.get('afterInstallation') || AFTER_INSTALLATION.DO_NOTHING.value,
                            appId = this.entry.content.get('appId'),
                            auth = this.entry.content.get('auth'),
                            name = this.get('name'),
                            uiLabel = this.get('@ui.label'),
                            version = this.get('@launcher.version'),
                            author = this.get('@launcher.author'),
                            description = this.get('@launcher.description'),
                            sharedProperties = {
                                groups: groups,
                                afterInstallation: afterInstallation
                            },
                            properties = '';

                        // SplunkBase App Install
                        if (!_.isUndefined(appId) && !_.isUndefined(auth)) {
                            properties = JSON.stringify(_.extend({
                                appId: appId,
                                auth: auth
                            }, sharedProperties));
                        } else {
                            // Empty App Create
                            properties = JSON.stringify(_.extend({
                                name: name,
                                '@ui.label': uiLabel,
                                '@launcher.version': version,
                                '@launcher.author': author,
                                '@launcher.description': description
                            }, sharedProperties));
                        }

                        if (options.uploadFile) {
                            var formData = new FormData(),
                                data = this.entry.content.get('data');

                            formData.append('data', data);
                            formData.append('properties', properties);

                            options = _.defaults(options, {
                                data: formData,
                                processData: false,
                                contentType: false,
                                url: splunkdUtils.fullpath("/services/dmc/apps-upload")
                            });

                            if (method !== 'create') {
                                options.url = [options.url, this.getId()].join('/');
                            }
                        } else {
                            options = _.defaults(options, {
                                data: properties,
                                contentType: 'application/json'
                            });
                        }
                    }

                    return ConfigurationModel.prototype.sync.call(this, method, model, options);
                },

                getExportUrl: function() {
                    return [this.getFullUrlRoot(this.exportUrlRoot), encodeURIComponent(this.entry.get('name')) + '.tar.gz'].join('/');
                },

                getAfterInstallationLabel: function() {
                    return getAfterInstallationLabel(this.entry.content.get('afterInstallation'));
                },

                getDetailFields: function() {
                    return [
                        'version',
                        'afterInstallation'
                    ];
                },

                getUpToDateRatioFields: function() {
                    return ['@upToDateClientCount', '@targetedClientCount'];
                },

                getTargetedClientCount: function() {
                    return this.entry.content.get('@targetedClientCount');
                },

                getDetailFieldLabel: function(field) {
                    var value,
                        label;

                    switch (field) {
                        case 'version':
                            value = this.entry.content.get('@version');
                            label = this.getVersion();
                            break;
                        case 'afterInstallation':
                        	value = this.entry.content.get('afterInstallation');
                        	label = this.getAfterInstallationLabel();
                        	break;
                        default:
                            value = this.entry.content.get(field);
                            label = value;
                            break;
                    }
                    return {
                        value: value,
                        label: label === null ? STRINGS.APP_NULL_LABEL : label
                    };
                },

                validation: {
                    name: {
                        fn: function(value) {
                            var isValid = /^[a-zA-Z0-9][\w\-]*$/.test(value);

                            if (value === '') {
                                return _('A folder name is required to create an app.').t();
                            }
                            if (!isValid) {
                                return _('The folder name you entered is invalid. Valid characters are A-Z a-z 0-9 _ -. Spaces are not valid characters.').t();
                            }

                            return false;
                        }
                    }
                }
            },
            {
                AFTER_INSTALLATION: AFTER_INSTALLATION,
                LOCATION: LOCATION,
                getAfterInstallationLabel: getAfterInstallationLabel,
                removeQuoteFromGroupNames: removeQuoteFromGroupNames
            }
        );

        appModel.Entry.Content = appModel.Entry.Content.extend({
            validation: {
                groups: {
                    fn: function(values, attr, obj) {
                        if (values instanceof Array) {
                            if (values.length > 0) {
                                var isInvalid = _.some(values, function(value) {
                                    return value === '';
                                });
                                if (isInvalid) {
                                    return _('server class cannot be empty').t();
                                } else {
                                    return false;
                                }
                            }
                        }
                    }
                }
            }
        });

        return appModel;
    }
);
