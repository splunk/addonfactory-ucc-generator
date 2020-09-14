define(
    [
        'jquery',
        'underscore',
        'module',

        /* Views */
        'views/Base',
        'views/shared/FlashMessages',
        'views/add_data/UploadProgressDialog',

        /* Models */
        'models/services/data/inputs/Monitor',
        'models/services/data/inputs/Oneshot',

        'contrib/text!views/add_data/Review.html',
        'util/splunkd_utils',

        './Review.pcss'
    ],
    function (
        $,
        _,
        module,

        BaseView,
        FlashMessagesView,
        UploadProgressDialog,

        MonitorModel,
        OneshotModel,
        template,
        splunkDUtils,
        css
    ) {
        /**
         */
        return BaseView.extend({

            template: template,
            moduleId: module.id,

            initialize: function (options) {
                BaseView.prototype.initialize.apply(this, arguments);
                this.children.flashMessages = new FlashMessagesView({ model: this.model.input });

                this.model.wizard.on('uploadSaveFile', this.showUploadProgress, this);
                this.model.wizard.on('uploadSaveFileDone', this.hideUploadProgress, this);
                this.model.wizard.on('uploadFailedStatus', this.updateFailedStatus, this);

            },
            showUploadProgress: function(){
                this.children.uploadProgressDialog = new UploadProgressDialog({
                    model: this.model,
                    onHiddenRemove: true,
                    backdrop: 'static'
                });
                $('body').append(this.children.uploadProgressDialog.render().el);
                this.children.uploadProgressDialog.show();
            },
            updateFailedStatus: function(responseError) {
                this.hideUploadProgress();
                var errorObject = JSON.parse(responseError);
                var errorMessage = _('Upload failed with ').t() + errorObject.messages[0].type +" : "+ errorObject.messages[0].text;
                this.children.flashMessages.flashMsgHelper.addGeneralMessage('upload_fail', {
                    type: splunkDUtils.ERROR,
                    html: errorMessage
                });
            },
            hideUploadProgress: function(){
                this.children.uploadProgressDialog.hide();
            },
            _getReviewRows: function() {
                /*
                 Instantiate a model appropriate for current input type,
                 load it from the temporary input model
                 and render a view with its properties.
                 */
                var inputType = this.model.wizard.get('inputType'),
                    rows = [];
                this.model.input.transposeToRest();
                var hostOverride = null;
                if (this.model.wizard.isForwardMode()) {
                    rows = rows.concat([{
                        label: _('Server Class Name').t(),
                        value: this.model.wizard.get('serverClassName')
                    }, {
                        label: _('List of Forwarders').t(),
                        value: _.map(this.model.deploymentClass.get('fwders'), function(hostname) {
                            var os = this.collection.deploymentClients.getClientDetails(hostname).os;
                            return os + ' | ' + hostname;
                        }.bind(this))
                    }]);
                }

                // Input-specific settings
                if (inputType === 'file_monitor' || inputType === 'file_oneshot' || inputType === 'file_upload') {
                    rows = rows.concat([{
                        label: _('Input Type').t(),
                        value: this.model.wizard.isUploadMode() ? _('Uploaded File').t() : (this.model.wizard.isDirectory() ? _('Directory Monitor').t() : _('File Monitor').t())
                    }, {
                        label: _('Source Path').t(),
                        value: this.model.input.entry.content.get('name'),
                        visible: !this.model.wizard.isUploadMode()
                    }, {
                        label: _('File Name').t(),
                        value: this.model.input.entry.content.get('name'),
                        visible: this.model.wizard.isUploadMode()
                    }, {
                        label: _('Continuously Monitor').t(),
                        value: this.model.input.get('continuouslyMonitor') ? _('Yes').t() : _('No, index once').t(),
                        visible: this.model.wizard.isLocalMode() && !this.model.wizard.isDirectory()
                    }, {
                        label: _('Whitelist').t(),
                        value: this.model.input.entry.content.get('whitelist'),
                        visible: this.model.wizard.isForwardMode() || (this.model.wizard.isLocalMode() && this.model.wizard.isDirectory())
                    }, {
                        label: _('Blacklist').t(),
                        value: this.model.input.entry.content.get('blacklist'),
                        visible: this.model.wizard.isForwardMode() || (this.model.wizard.isLocalMode() && this.model.wizard.isDirectory())
                    }]);

                    var hostSwitch = this.model.input.get('hostSwitch');
                    if (hostSwitch === 'regex') {
                        hostOverride = _('Source path regular expression: ').t() + this.model.input.entry.content.get('host_regex');
                    } else if (hostSwitch === 'segment') {
                        hostOverride = _('Source path segment number: ').t() + this.model.input.entry.content.get('host_segment');
                    }

                } else if (inputType == 'tcp' || inputType == 'udp') {
                    rows = rows.concat([{
                        label: _('Input Type').t(),
                        value: (this.model.input.get('sourceSwitchPort') === 'tcp') ? _('TCP Port').t() : _('UDP Port').t()
                    }, {
                        label: _('Port Number').t(),
                        value: this.model.input.entry.content.get('name')
                    }, {
                        label: _('Source name override').t(),
                        value: this.model.input.entry.content.get('source')
                    }, {
                        label: _('Restrict to Host').t(),
                        value: this.model.input.entry.content.get('restrictToHost')
                    }]);

                    var connectionHost = this.model.input.entry.content.get('connection_host');
                    if (connectionHost === 'ip') {
                        hostOverride = _('(IP address of the remote server)').t();
                    } else if (connectionHost === 'dns') {
                        hostOverride = _('(DNS entry of the remote server)').t();
                    }

                } else if (inputType == 'http') {
                    rows = rows.concat([{
                        label: _('Input Type').t(),
                        value: _('Token').t()
                    }, {
                        label: _('Name').t(),
                        value: this.model.input.entry.content.get('name')
                    }, {
                        label: _('Source name override').t(),
                        value: this.model.input.entry.content.get('source')
                    }, {
                        label: _('Description').t(),
                        value: this.model.input.entry.content.get('description')
                    }, {
                        label: _('Enable indexer acknowledgements').t(),
                        value: this.model.input.entry.content.get('useACK') ? _('Yes').t() : _('No').t()
                    }, {
                        label: _('Output Group').t(),
                        value: this.model.input.entry.content.get('outputgroup')
                    }, {
                        label: _('Allowed indexes').t(),
                        value: this.model.input.entry.content.get('indexes')
                    }, {
                        label: _('Default index').t(),
                        value: this.model.input.entry.content.get('index') || _('Default').t()
                    }]);

                } else if (inputType == 'scripts') {
                    rows = rows.concat([{
                        label: _('Input Type').t(),
                        value: _('Script').t()
                    }, {
                        label: _('Command').t(),
                        value: this.model.input.entry.content.get('name')
                    }, {
                        label: _('Interval').t(),
                        value: this.model.input.entry.content.get('interval')
                    }, {
                        label: _('Source name override').t(),
                        value: this.model.input.entry.content.get('source')
                    }]);
                } else if (inputType == 'evt_logs_local') {
                    rows = rows.concat([{
                        label: _('Collection Name').t(),
                        value: this.model.input.entry.content.get('name'),
                        visible: this.model.wizard.isForwardMode()
                    }, {
                        label: _('Input Type').t(),
                        value: _('Windows Event Logs').t()
                    }, {
                        label: _('Event Logs').t(),
                        value: this.model.input.get('ui.logs')
                    }]);
                } else if (inputType == 'evt_logs_remote') {
                    rows = rows.concat([{
                        label: _('Input Type').t(),
                        value: _('Remote Windows Event Logs').t()
                    }, {
                        label: _('Collection Name').t(),
                        value: this.model.input.entry.content.get('name')
                    }, {
                        label: _('Lookup Host').t(),
                        value: this.model.input.entry.content.get('lookup_host')
                    }, {
                        label: _('Event Logs').t(),
                        value: this.model.input.entry.content.get('logs')
                    }, {
                        label: _('Additional Hosts').t(),
                        value: this.model.input.entry.content.get('hosts')
                    }]);
                } else if (inputType == 'perfmon_local') {
                    rows = rows.concat([{
                        label: _('Input Type').t(),
                        value: _('Local Performance Monitor').t()
                    }, {
                        label: _('Collection Name').t(),
                        value: this.model.input.entry.content.get('name')
                    }, {
                        label: _('Selected Object').t(),
                        value: this.model.input.entry.content.get('object')
                    }, {
                        label: _('Selected Counters').t(),
                        value: this.model.input.entry.content.get('counters')
                    }, {
                        label: _('Selected Instances').t(),
                        value: this.model.input.entry.content.get('instances')
                    }, {
                        label: _('Polling Interval').t(),
                        value: this.model.input.entry.content.get('interval')
                    }]);
                } else if (inputType == 'perfmon_remote') {
                    rows = rows.concat([{
                        label: _('Input Type').t(),
                        value: _('Remote Performance Monitor').t()
                    }, {
                        label: _('Collection Name').t(),
                        value: this.model.input.entry.content.get('name')
                    }, {
                        label: _('Target Host').t(),
                        value: this.model.input.entry.content.get('lookup_host')
                    }, {
                        label: _('Selected Class').t(),
                        value: this.model.input.entry.content.get('classes')
                    }, {
                        label: _('Selected Counters').t(),
                        value: this.model.input.entry.content.get('fields')
                    }, {
                        label: _('Selected Instances').t(),
                        value: this.model.input.entry.content.get('instances')
                    }, {
                        label: _('Polling Interval').t(),
                        value: this.model.input.entry.content.get('interval')
                    }]);
                } else if (inputType == 'regmon') {
                    rows = rows.concat([{
                        label: _('Input Type').t(),
                        value: _('Registry Monitor').t()
                    }, {
                        label: _('Collection Name').t(),
                        value: this.model.input.entry.content.get('name')
                    }, {
                        label: _('Registry Hive').t(),
                        value: this.model.input.entry.content.get('hive')
                    }, {
                        label: _('Monitor Subnodes').t(),
                        value: this.model.input.entry.content.get('monitorSubnodes') ? _('Yes').t() : _('No').t()
                    }, {
                        label: _('Event Types').t(),
                        value: this.model.input.entry.content.get('type')
                    }, {
                        label: _('Process Path').t(),
                        value: this.model.input.entry.content.get('proc')
                    }, {
                        label: _('Baseline Index').t(),
                        value: this.model.input.entry.content.get('baseline') ? _('Yes').t() : _('No').t()
                    }]);
                } else if (inputType == 'admon') {
                    rows = rows.concat([{
                        label: _('Input Type').t(),
                        value: _('Active Directory Monitor').t()
                    }, {
                        label: _('Collection Name').t(),
                        value: this.model.input.entry.content.get('name')
                    }, {
                        label: _('Target domain controller').t(),
                        value: this.model.input.entry.content.get('targetDc')
                    }, {
                        label: _('Starting Node').t(),
                        value: this.model.input.entry.content.get('startingNode')
                    }, {
                        label: _('Monitor Subtree').t(),
                        value: this.model.input.entry.content.get('monitorSubtree')
                    }]);
                } else if (inputType == 'hostmon') {
                    rows = rows.concat([{
                        label: _('Input Type').t(),
                        value: _('Host Monitor').t()
                    }, {
                        label: _('Collection Name').t(),
                        value: this.model.input.entry.content.get('name')
                    }, {
                        label: _('Event Types').t(),
                        value: this.model.input.entry.content.get('type')
                    }, {
                        label: _('Interval (in seconds)').t(),
                        value: this.model.input.entry.content.get('interval')
                    }]);
                } else if (inputType == 'netmon') {
                    rows = rows.concat([{
                        label: _('Input Type').t(),
                        value: _('Network Monitor').t()
                    }, {
                        label: _('Collection Name').t(),
                        value: this.model.input.entry.content.get('name')
                    }, {
                        label: _('Address Family').t(),
                        value: this.model.input.entry.content.get('addressFamily')
                    }, {
                        label: _('Packet Type').t(),
                        value: this.model.input.entry.content.get('packetType')
                    }, {
                        label: _('Direction').t(),
                        value: this.model.input.entry.content.get('direction')
                    }, {
                        label: _('Protocol').t(),
                        value: this.model.input.entry.content.get('protocol')
                    }, {
                        label: _('Remote Address').t(),
                        value: this.model.input.entry.content.get('remoteAddress')
                    }, {
                        label: _('Process').t(),
                        value: this.model.input.entry.content.get('process')
                    }, {
                        label: _('User').t(),
                        value: this.model.input.entry.content.get('user')
                    }]);
                } else if (inputType == 'printmon') {
                    rows = rows.concat([{
                        label: _('Input Type').t(),
                        value: _('Print Monitor').t()
                    }, {
                        label: _('Collection Name').t(),
                        value: this.model.input.entry.content.get('name')
                    }, {
                        label: _('Event Types').t(),
                        value: this.model.input.entry.content.get('type')
                    }, {
                        label: _('Baseline Index').t(),
                        value: this.model.input.entry.content.get('baseline') ? _('Yes').t() : _('No').t()
                    }]);
                }

                // Common settings
                rows = rows.concat([{
                    label: _('Source Type').t(),
                    value: this.model.input.entry.content.get('sourcetype') || _('Automatic').t(),
                    visible: !this.model.wizard.isWindowsInput()
                }, {
                    label: _('App Context').t(),
                    value: this.model.input.get('appContext'),
                    visible: this.model.wizard.isLocalMode() && inputType !== 'http'
                }, {
                    label: _('Host').t(),
                    value: hostOverride || this.model.input.entry.content.get('host'),
                    visible: !this.model.wizard.isForwardMode() && inputType !== 'http'
                }, {
                    label: _('Index').t(),
                    value: this.model.input.entry.content.get('index') || _('Default').t(),
                    visible: inputType !== 'http'
                }]);

                if (this.model.serverInfo.isLite()) {
                    rows = rows.filter(function(row){
                        return row.label != _('App Context').t();
                    });
                }

                return rows;
            },

            render: function () {
                var rows = this._getReviewRows();

                var template = this.compiledTemplate({
                    rows: _.reject(rows, function(row) {
                        return (row.visible === false);
                    })
                });

                this.$el.html(template);
                this.$el.prepend(this.children.flashMessages.render().el);


                return this;
            }
        });
    }
);
