/**
 * Last step in the workflow: Success.
 * Shows links where to go next.
 *
 */
define(
    [
        'underscore',
        'module',
        'views/Base',
        'uri/route',
        'util/string_utils',
        'contrib/text!views/add_data/SuccessScreen.html',
        './SuccessScreen.pcss'
    ],
    function (
        _,
        module,
        BaseView,
        route,
        stringUtils,
        template,
        css
    ) {
        /**
         */
        return BaseView.extend({
            template: template,
            moduleId: module.id,

            initialize: function (options) {
                BaseView.prototype.initialize.apply(this, arguments);

                var searchString = this.generateSearchString();

                // unsetting inputmode here, so that clicking browser's Back would takes us to the initial step
                this.model.wizard.unset('inputMode');
                this.model.wizard.trigger('disableWizardSteps');

                this.dataInputsLink = route.manager(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    this.model.application.get('app'),
                    'datainputstats'
                );

                this.searchLink = route.search(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    this.model.application.get('app'),
                    {
                        data: {
                              q: searchString,
                              earliest: '0',
                              latest: ''
                        }
                    }
                );

                this.searchHelpLink = route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'learnmore.adddata.success.search'
                );

                this.addDataLink = route.manager(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    this.model.application.get('app'),
                    'adddata'
                );

                this.addDataHelpLink = route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'learnmore.adddata.datatutorial'
                );

                this.extractFieldsLink = route.field_extractor(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    this.model.input.get('appContext'),
                    {
                        data: {
                            sourcetype: this.model.input.get('ui.sourcetype')
                        }
                    }
                );

                this.fieldsHelpLink = route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'manager.fields'
                );

                this.downloadAppsLink = route.manager(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    this.model.application.get('app'),
                    ['apps', 'remote']
                );

                this.downloadAppsHelpLink = route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'learnmore.recipes.apps'
                );

                this.buildDashboardsLink = route.page(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    this.model.application.get('app'),
                    'dashboards'
                );

                this.buildDashboardsHelpLink = route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'learnmore.dashboards'
                );

            },

            getOsSep: function() {
                return (this.model.serverInfo.getOsName().toLowerCase() === 'windows') ? '\\\\' : '/';
            },

            generateSearchString: function() {
                var searchString = [];
                var index = this.model.input.get('ui.index');
                var indexes = this.model.input.get('ui.indexes');
                var source = this.model.input.get('ui.name');
                var sourceOverride = this.model.input.get('ui.source');
                var host = this.model.input.get('ui.host');
                var sourcetype = this.model.input.get('ui.sourcetype');
                var inputType = this.model.wizard.get('inputType');
                var isDirectory = this.model.wizard.isDirectory();
                var isArchive = this.model.wizard.get('isArchive');
                var portType = this.model.input.get('sourceSwitchPort');

                if (source) {
                    if (inputType === 'tcp' || inputType === 'udp') {
                        if (sourceOverride) {
                            source = sourceOverride;
                        } else {
                            source = portType + ':' + source;
                        }
                    } else if (inputType === 'scripts') {
                        if (sourceOverride) {
                            source = sourceOverride;
                        } else {
                            source = this.model.input.get('fullScriptPath');
                        }
                    } else if (inputType === 'http') {
                        if (sourceOverride) {
                            source = sourceOverride;
                        } else {
                            source = 'http:' + source;
                        }
                    } else if (inputType === 'file_monitor' || inputType === 'file_oneshot' || inputType === 'file_upload') {
                        source = source.replace(/\\/g, "\\\\");
                        if (isDirectory) {
                            source = source + this.getOsSep() + '*';
                        } else if (this.model.wizard.isForwardMode() && stringUtils.strEndsWith(source, this.getOsSep())) {
                            // if forwarded monitored path ends with path separator, assume it's a directory
                            source = source + '*';
                        } else if (isArchive) {
                            source = source + ':*';
                        }
                    } else if (inputType === 'evt_logs_local' || inputType === 'evt_logs_remote') {
                        source = "WinEventLog:*";
                    } else if (inputType === 'perfmon_local') {
                        source = "Perfmon:" + source;
                    } else if (inputType === 'perfmon_remote') {
                        source = "WMI:" + source;
                    } else if (inputType === 'hostmon') {
                        sourcetype = 'WinHostMon';
                    } else if (inputType === 'printmon') {
                        sourcetype = 'WinPrintMon';
                    } else if (inputType === 'netmon') {
                        sourcetype = 'WinNetMon';
                    } else if (inputType === 'regmon') {
                        source = 'WinRegistry';
                        sourcetype = 'WinRegistry';
                    }
                    searchString.push('source="'+source+'"');

                    if (host && !this.model.wizard.isForwardMode() && inputType !== 'http') {
                        if ( !((inputType === 'file_monitor' || inputType === 'file_oneshot' || inputType === 'file_upload') && this.model.input.get('hostSwitch') !== 'constant') &&
                             !((inputType === 'tcp' || inputType === 'udp') && this.model.input.get('ui.connection_host') !== 'none') ) {
                            // skip adding host value for non-deterministic overrides
                            searchString.push('host="'+host+'"');
                        }
                    }
                } else {
                    return '';
                }

                if (index && index !== 'default' && inputType !== 'http') {
                    searchString.push('index="'+index+'"');
                }
                if (indexes && indexes.length > 0) {
                    var str = "(" + _.map(indexes, function(index) {
                         return 'index="' + index + '"';
                    }).join(' OR ') + ")";
                    searchString.push(str);
                }

                if (sourcetype && sourcetype !== 'default') {
                    searchString.push('sourcetype="'+sourcetype+'"');
                }

                searchString = searchString.join(' ');
                return searchString;
            },

            generateSuccessMessage: function() {
                var inputTypeLabel = {
                    'file_upload':     _("File").t(),
                    'file_monitor':    _("File").t(),
                    'file_oneshot':    _("File").t(),
                    'tcp':             this.model.input.get('sourceSwitchPort') === 'tcp' ? _("TCP").t() : _("UDP").t(),
                    'udp':             _("UDP").t(),
                    'http':            _("Token").t(),
                    'scripts':         _("Script").t(),
                    'evt_logs_local':  _("Local event logs").t(),
                    'evt_logs_remote': _("Remote event logs").t(),
                    'perfmon_local':   _("Local performance monitoring").t(),
                    'perfmon_remote':  _("Remote performance monitoring").t(),
                    'regmon':          _("Registry monitoring").t(),
                    'admon':           _("Active directory monitoring").t(),
                    'hostmon':         _("Host monitoring").t(),
                    'netmon':          _("Network monitoring").t(),
                    'printmon':        _("Print monitoring").t()
                }[this.model.wizard.get('inputType')];
                if (this.model.wizard.get('isModularInput')) {
                    inputTypeLabel = _('Modular').t();
                }

                var ending = _(' input has been created successfully.').t();
                if (this.model.wizard.get('inputType') === 'file_upload') {
                    ending = _(' has been uploaded successfully.').t();
                } else if (this.model.wizard.get('inputType') === 'http') {
                    ending = _(' has been created successfully.').t();
                }
                return inputTypeLabel + ending;
            },

            getHttpToken: function() {
                if (this.model.wizard.get('inputType') === 'http') {
                    return this.model.input.entry.content.get('token');
                }
                return false;
            },

            controlVisibility: function() {
                var sourcetype = this.model.input.get('ui.sourcetype');
                if (_.isUndefined(sourcetype) || sourcetype == 'default') {
                    this.$('.extract-fields').hide();
                } else {
                    this.$('.extract-fields').show();
                }
                if (this.model.serverInfo.isLite()) {
                    this.$('.download-apps').hide();
                }
                if (this.model.wizard.get('inputType') === 'http') {
                    this.$('.copy-token').show();
                } else {
                    this.$('.copy-token').hide();
                }
            },

            render: function () {
                var template = this.compiledTemplate({
                    token: this.getHttpToken(),
                    dataInputsLink: this.dataInputsLink,
                    addDataLink: this.addDataLink,
                    addDataHelpLink: this.addDataHelpLink,
                    searchLink: this.searchLink,
                    searchHelpLink: this.searchHelpLink,
                    downloadAppsLink: this.downloadAppsLink,
                    downloadAppsHelpLink: this.downloadAppsHelpLink,
                    buildDashboardsLink: this.buildDashboardsLink,
                    buildDashboardsHelpLink: this.buildDashboardsHelpLink,
                    extractFieldsLink: this.extractFieldsLink,
                    fieldsHelpLink: this.fieldsHelpLink,
                    inputTypeSuccessMessage: this.generateSuccessMessage()
                });
                this.$el.html(template);
                this.controlVisibility();
                return this;
            }
        });
    }
);
