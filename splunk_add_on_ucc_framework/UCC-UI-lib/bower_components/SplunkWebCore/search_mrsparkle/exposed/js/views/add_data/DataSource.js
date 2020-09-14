

/**
 * Entry point for the AddData workflow.
 * Expects from the router:
 *  this.model.wizard - workflow state machine
 *  this.model.input - current input's model
 */

define(
    [
        'jquery',
        'underscore',
        'module',
        'backbone',
        'views/Base',
        'views/add_data/InputList',
        'views/add_data/input_forms/FileUpload',
        'views/add_data/input_forms/FilesAndDirs',
        'views/add_data/input_forms/ModularInputs',
        'views/add_data/input_forms/Script',
        'views/add_data/input_forms/TCPUDP',
        'views/add_data/input_forms/HTTP',
        'views/add_data/input_forms/WinAdmon',
        'views/add_data/input_forms/WinEventLogsLocal',
        'views/add_data/input_forms/WinEventLogsWMI',
        'views/add_data/input_forms/WinHostmon',
        'views/add_data/input_forms/WinNetmon',
        'views/add_data/input_forms/WinPerfmonLocal',
        'views/add_data/input_forms/WinPerfmonRemote',
        'views/add_data/input_forms/WinPrintmon',
        'views/add_data/input_forms/WinRegmon',
        'contrib/text!views/add_data/DataSource.html'
    ],
    function(
        $,
        _,
        module,
        Backbone,
        BaseView,
        InputListView,
        FileUpload,
        FilesAndDirs,
        ModularInputs,
        Script,
        TCPUDP,
        HTTP,
        WinAdmon,
        WinEventLogsLocal,
        WinEventLogsWMI,
        WinHostmon,
        WinNetmon,
        WinPerfmonLocal,
        WinPerfmonRemote,
        WinPrintmon,
        WinRegmon,
        template
        ) {
        return BaseView.extend({
            template: template,
            moduleId: module.id,
            className: 'selectSourceColumns',
            initialize: function(options) {
                BaseView.prototype.initialize.apply(this, options);

                this.deferreds = options.deferreds || {};

                this.typeToViewMap = {
                    file_upload:     FileUpload,
                    file_monitor:    FilesAndDirs,
                    file_oneshot:    FilesAndDirs,
                    tcp:             TCPUDP,
                    udp:             TCPUDP,
                    http:            HTTP,
                    scripts:         Script,
                    evt_logs_local:  WinEventLogsLocal,
                    evt_logs_remote: WinEventLogsWMI,
                    perfmon_local:   WinPerfmonLocal,
                    perfmon_remote:  WinPerfmonRemote,
                    regmon:          WinRegmon,
                    admon:           WinAdmon,
                    hostmon:         WinHostmon,
                    netmon:          WinNetmon,
                    printmon:        WinPrintmon
                };

                /* Views */
                this.children.inputListView = new InputListView({
                    model: this.model,
                    collection: this.collection,
                    deferreds: this.deferreds
                });

                /* Events */
                this.model.wizard.on('inputModelFetched', function() {
                    // inputModelFetched is triggered by the router when the model fetch caused by change:inputType
                    // has completed successfully. The fetched model is in this.model.inputModels[inputType]
                    var inputType = this.model.wizard.get('inputType');
                    this._renderInput.apply(this, [inputType]);
                }, this);
            },

            _renderInput: function(inputType) {
                var isModInput = this.model.wizard.get('isModularInput');

                //we should have a input model now. if we dont, and this is not modular input, do nothing.
                if(!isModInput && !this.model.inputModels[inputType]){
                    return;
                }

                var modInputWrapper = this.$('.modularInputWrapper');
                var inputForm = this.$('.inputForm');
                var inputFormView;
                var inputFormDestination;

                if (isModInput) {
                    inputFormView = ModularInputs;
                    inputFormDestination = modInputWrapper;
                    modInputWrapper.show();
                    inputForm.hide();
                } else {
                    this.model.input = this.model.inputModels[inputType];
                    inputFormView = this.typeToViewMap[inputType];
                    inputFormDestination = inputForm;
                    modInputWrapper.hide();
                    inputForm.show();
                }

                if (inputFormView){
                    this.children.inputForm = new inputFormView({
                        model: this.model,
                        collection: this.collection
                    });
                    var viewHtml = this.children.inputForm.render().el;
                    inputFormDestination.html(viewHtml);
                }
            },

            render: function() {
                var html = this.compiledTemplate({
                    isUpload: this.model.wizard.isUploadMode()
                });
                this.$el.html(html);

                var inputType = this.model.wizard.get('inputType');
                this._renderInput.apply(this, [inputType]);

                if (!this.model.wizard.isUploadMode()) {
                    this.$el.find('.sourceList').append(this.children.inputListView.render().el);
                    this.children.inputListView.delegateEvents();
                }

                // Header might be hidden here, need to reveal it
                $(".adddata-header").css("display", "block");
                $(".layoutRow").css("position", "absolute");
                return this;
            }
        });
    }
);