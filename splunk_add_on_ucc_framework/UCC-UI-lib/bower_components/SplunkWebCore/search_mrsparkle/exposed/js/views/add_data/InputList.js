/**
 * View listing available data inputs
 * Listens and modifies this.model.wizard:inputType
 *
 */
define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'contrib/text!views/add_data/InputList.html',
        'constants/CloudRules',
        './InputList.pcss'
    ],
    function(
        $,
        _,
        module,
        BaseView,
        template,
        CloudRules,
        css
        ) {
        return BaseView.extend({
            template: template,
            moduleId: module.id,

            initialize: function(options) {
                BaseView.prototype.initialize.apply(this, arguments);
                this.deferreds = options.deferreds || {};

                this.IGNORED_MODINPUTS = ['admon', 'perfmon', 'powershell2', 'MonitorNoHandle', 'WinEventLog', 'WinHostMon', 'WinNetMon', 'WinPrintMon', 'WinRegMon'];
                this.model.wizard.on('change:inputType', function() {
                    this.selectCurrentInput();
                }, this);
            },

            events: {
                'click .input_list a': function(e) {
                    e.preventDefault();
                    var target = $(e.currentTarget);
                    var inputItem = $(target.children('.input_item')[0]);
                    var selectedType = inputItem.attr('id');
                    this.model.wizard.set('isModularInput', inputItem.hasClass('modular_input'));
                    this.model.wizard.set('inputType', selectedType);
                }
            },

            selectCurrentInput: function() {
                var current = this.model.wizard.get('inputType');
                // exceptions for forms that contain 'sub-types'
                if (current == 'file_oneshot') {
                    current = 'file_monitor';
                } else if (current == 'udp') {
                    current = 'tcp';
                }
                this.$('div').removeClass('selected');
                this.$('div#'+current).addClass('selected');
            },

            controlVisibility: function() {
                var isWindows = (this.model.serverInfo.getOsName() === 'Windows'),
                    isCloud = this.model.serverInfo.isCloud();

                if (this.model.wizard.isForwardMode()) {
                    this.$('.input_item').hide();

                    this.$('#file_monitor').show();
                    this.$('#tcp').show();
                    this.$('#scripts').show();
                    if (this.model.wizard.get('fwdGroupIsWindows')) {
                        this.$('#evt_logs_local').show();
                        this.$('#perfmon_local').show();
                    }
                } else if (this.model.wizard.isLocalMode()) {
                    this.$('.input_item').show();
                    if (!isWindows) {
                        this.$('.input_item.windows').hide();
                    }
                    if (!this.model.user.canEditMonitor()){
                        this.$('#file_monitor').hide();
                    }
                    if (!this.model.user.canEditTCP() && !this.model.user.canEditUDP()){
                        this.$('#tcp').hide();
                    }
                    if (!this.model.user.canEditScripts()){
                        this.$('#scripts').hide();
                    }
                    if (!this.model.user.canEditHTTPTokens()){
                        this.$('#http').hide();
                    }
                    if (!this.model.user.canEditWinActiveDirectoryMonitoring()){
                        this.$('#admon').hide();
                    }
                    if (!this.model.user.canEditWinEventLogCollections()){
                        this.$('#evt_logs_local').hide();
                        this.$('#evt_logs_remote').hide();
                    }
                    if (!this.model.user.canEditWinHostMonitoring()){
                        this.$('#hostmon').hide();
                    }
                    if (!this.model.user.canEditWinNetworkMonitoring()){
                        this.$('#netmon').hide();
                    }
                    if (!this.model.user.canEditWinLocalPerformanceMonitoring()){
                        this.$('#perfmon_local').hide();
                    }
                    if (!this.model.user.canEditWinPrintMonitoring()){
                        this.$('#printmon').hide();
                    }
                    if (!this.model.user.canEditWinRegistryMonitoring()){
                        this.$('#regmon').hide();
                    }
                    if (!this.model.user.canEditWinRemotePerformanceMonitoring()){
                        this.$('#perfmon_remote').hide();
                    }
                }

                if (isCloud && !this.model.wizard.isForwardMode()) {
                  CloudRules.inputTypes.blacklist.forEach(function (blacklistedInput) {
                    this.$('#' + blacklistedInput).hide();
                  }.bind(this));
                }
            },

            render: function() {
                var template = this.compiledTemplate({
                    modularInputs: this.collection.modularInputs,
                    model: {
                        user: this.model.user
                    },
                    isForwarderMode: this.model.wizard.isForwardMode()
                });
                this.$el.html(template);

                $.when(
                    this.deferreds.modularInputs,
                    this.deferreds.inputs)
                .then(this.renderModularInputs.bind(this));

                //TODO need to ensure the next two functions take effect in case of modular input async render on line above
                this.selectCurrentInput();
                this.controlVisibility();
                return this;
            },
            renderModularInputs: function(){
                var modInputsList = this.collection.modularInputs.filter(function(model) {
                        // don't list generic mod inputs created by Splunk
                        var modInputName = model.entry.get('name'),
                            isIgnoredModInput = this.IGNORED_MODINPUTS.indexOf(modInputName) >  -1,
                            inputModel = this.collection.inputs.find(function(imodel) {
                                var inputName = imodel.entry.get('name');
                                return inputName === modInputName;
                            }),
                            canCreate = inputModel ? inputModel.entry.links.get('create') : false;
                        return !isIgnoredModInput && canCreate;
                    }.bind(this));
                var html = _.template(this.modularInputsTemplate, {
                        modularInputs: modInputsList
                    });
                this.$('.input_list').append(html);
            },
            modularInputsTemplate: '<% for(var i=0,len=(modularInputs.length||0);i<len;i++){' +
                'var input = modularInputs[i];' +
                'var inputId = input.entry.get("name");' +
                'var title = input.entry.content.get("title") || "";' +
                'var desc = input.entry.content.get("description")|| "";' +
                '%>' +
                '<a class="link-wrap"><div id="<%=inputId%>" class="input_item modular_input">' +
                '<div class="input_type"><%= _(title).t() %></div>' +
                '<div class="input_desc"><%= _(desc).t() %></div>' +
                '</div></a> <%}%>'
        });
    }
);
