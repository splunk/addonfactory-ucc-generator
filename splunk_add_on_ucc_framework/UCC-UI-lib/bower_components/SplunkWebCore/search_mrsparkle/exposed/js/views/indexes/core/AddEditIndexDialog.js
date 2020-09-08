/**
 * @author jszeto,
 * @author ecarillo
 * @date 4/24/15
 */

define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'models/indexes/AddEditIndex',
    'views/shared/FlashMessages',
    'views/shared/Modal',
    'views/shared/controls/ControlGroup',
    'views/shared/controls/SyntheticSelectControl',
    'splunk.util',
    'uri/route',
    '../shared/AddEditIndexDialog.pcss'
    ],
    function(
        $,
        _,
        Backbone,
        module,
        AddEditIndexModel,
        FlashMessages,
        Modal,
        ControlGroup,
        SyntheticSelectControl,
        splunkutil,
        route,
        css
    ){
    return Modal.extend({
        moduleId: module.id,
        className: Modal.CLASS_NAME + " " + Modal.CLASS_MODAL_WIDE + " indexes-modal",
        initialize: function(options) {
            Modal.prototype.initialize.call(this, arguments);
            options = options || {};
            _(options).defaults({isNew:true});
            this._buildLayout(options);
        },

        events: $.extend({}, Modal.prototype.events, {
            'click .btn-primary': function(e) {
                if (this.addEditIndexModel.set({}, {validate:true})) {
                    // Copy addEditIndexModel attributes to this.model
                    var name = this.addEditIndexModel.get("name"),
                        app = this.addEditIndexModel.get("app"),
                        homePath = this.addEditIndexModel.get("homePath"),
                        coldPath = this.addEditIndexModel.get("coldPath"),
                        thawedPath = this.addEditIndexModel.get("thawedPath"),
                        frozenPath = this.addEditIndexModel.get("frozenPath"),
                        enableDataIntegrityControl = this.addEditIndexModel.get("enableDataIntegrityControl"),
                        maxIndexSize = this.formatSizeForSave(this.addEditIndexModel.get("maxIndexSize"), this.addEditIndexModel.get("maxIndexSizeFormat")),
                        maxBucketSize = this.formatSizeForSave(this.addEditIndexModel.get("maxBucketSize"), this.addEditIndexModel.get("maxBucketSizeFormat")),
                        enableTsidxReduction = splunkutil.normalizeBoolean(this.addEditIndexModel.get("enableTsidxReduction")),
                        tsidxReductionCheckPeriodInSec = this.addEditIndexModel.get("tsidxReductionCheckPeriodInSec"),
                        timePeriodInSecBeforeTsidxReduction = this.convertPeriodToSec(this.addEditIndexModel.get("timePeriodInSecBeforeTsidxReduction"), this.addEditIndexModel.get("tsidxAgeFormat"));

                    this.model.entity.entry.content.set({
                        name: this.options.isNew ? name : undefined,
                        homePath: homePath,
                        coldPath: coldPath,
                        thawedPath: thawedPath,
                        enableDataIntegrityControl: enableDataIntegrityControl,
                        maxTotalDataSizeMB: maxIndexSize,
                        maxDataSize: maxBucketSize,
                        coldToFrozenDir: frozenPath,
                        enableTsidxReduction: enableTsidxReduction,
                        tsidxReductionCheckPeriodInSec: enableTsidxReduction ? tsidxReductionCheckPeriodInSec : undefined,
                        timePeriodInSecBeforeTsidxReduction: enableTsidxReduction ? timePeriodInSecBeforeTsidxReduction : undefined
                    });

                    var indexDeferred = this.options.isNew ? this.model.entity.save({}, {
                        data: {
                            app: app
                        }
                    }) : this.model.entity.save();

                    $.when(indexDeferred).done(_(function() {
                        this.trigger("entitySaved", name);
                        this.hide();
                    }).bind(this));
                }
            }
        }),

        _buildLayout: function(options){
            var applicationApp = (!options.isNew && this.model && this.model.entity) ?
                                    this.model.entity.entry.acl.get('app') :
                                    options.model.application.get('app'),
                useApplicationApp = false,
                appItems = [];

            // Initialize the working model
            if (options.isNew) {

                if (this.model.user.canUseApps()){
                    // Filter out the app list to hold apps the user can write to
                    this.collection.appLocals.each(function(model){
                        if (model.entry.acl.get("can_write")) {
                            appItems.push({
                                label: model.entry.content.get('label'),
                                value: model.entry.get('name')
                            });
                            if (model.entry.get('name') == applicationApp)
                                useApplicationApp = true;
                        }
                    }, this);

                    // Use the current app unless user can't write to it
                    if (!useApplicationApp && appItems.length > 0) {
                        applicationApp =  appItems[0].value;
                    }
                }
                else {
                    applicationApp = undefined;
                }
                this.addEditIndexModel = new AddEditIndexModel({
                    isNew: true,
                    app: applicationApp
                });
                this.model.entity = new this.options.entityModelClass();
            }
            else {
                var name = this.model.entity.entry.get("name"),
                    homePath = this.model.entity.entry.content.get("homePath"),
                    coldPath = this.model.entity.entry.content.get("coldPath"),
                    thawedPath = this.model.entity.entry.content.get("thawedPath"),
                    frozenPath = this.model.entity.entry.content.get("coldToFrozenDir"),
                    enableDataIntegrityControl = this.model.entity.entry.content.get('enableDataIntegrityControl'),
                    maxDataSize = this.model.entity.entry.content.get("maxDataSize"),
                    maxIndexSizeObject = this.formatSize(this.model.entity.entry.content.get("maxTotalDataSizeMB")),
                    maxIndexSize = maxIndexSizeObject.size,
                    maxIndexSizeFormat = maxIndexSizeObject.format,
                    maxBucketSizeObject = this.formatSize(this.model.entity.entry.content.get("maxDataSize")),
                    maxBucketSize = maxBucketSizeObject.size,
                    maxBucketSizeFormat = maxBucketSizeObject.format,
                    enableTsidxReduction = splunkutil.normalizeBoolean(this.model.entity.entry.content.get("enableTsidxReduction")),
                    tsidxReductionPeriod = this.model.entity.entry.content.get("tsidxReductionCheckPeriodInSec"),
                    tsidxReductionFreqObj = this.convertSecondsToPeriod(this.model.entity.entry.content.get("timePeriodInSecBeforeTsidxReduction"));

                this.addEditIndexModel = new AddEditIndexModel({
                    isNew: false,
                    app: applicationApp,
                    homePath: homePath,
                    coldPath: coldPath,
                    thawedPath: thawedPath,
                    frozenPath: frozenPath,
                    enableDataIntegrityControl: enableDataIntegrityControl,
                    maxDataSize: maxDataSize,
                    maxIndexSize: maxIndexSize,
                    maxIndexSizeFormat: maxIndexSizeFormat,
                    maxBucketSize: maxBucketSize,
                    maxBucketSizeFormat: maxBucketSizeFormat,
                    enableTsidxReduction: enableTsidxReduction,
                    tsidxReductionCheckPeriodInSec: tsidxReductionPeriod,
                    timePeriodInSecBeforeTsidxReduction: tsidxReductionFreqObj.value,
                    tsidxAgeFormat: tsidxReductionFreqObj.format
                });
            }

            // Defining byte format dropdown items.
            var byteFormatOptions = [{
                value: 'MB',
                label: _('MB').t()
            },{
                value: 'GB',
                label: _('GB').t(),
                description: _('1GB = 1024MB').t()
            },{
                value: 'TB',
                label: _('TB').t(),
                description: _('1TB = 1024GB').t()
            }];

            // Units for time period dropdown
            var periodFormatOptions = [{
                value: 'Seconds',
                label: _('Seconds').t()
            },{
                value: 'Minutes',
                label: _('Minutes').t()
            },{
                value: 'Hours',
                label: _('Hours').t()
            },{
                value: 'Days',
                label: _('Days').t()
            }];

            // Create flash messages view
            this.children.flashMessagesView = new FlashMessages({
                model: [this.addEditIndexModel, this.model.entity],
                helperOptions: {
                    removeServerPrefix: true
                }
            });

            // Create the form controls
            this.children.inputName = new ControlGroup({
                controlType: 'Text',
                controlOptions: {
                    modelAttribute: 'name',
                    model: this.addEditIndexModel
                },
                controlClass: 'controls-block',
                label: _('Index Name').t(),
                help:_("Set index name (e.g., INDEX_NAME). Search using index=INDEX_NAME.").t()
            });
            this.children.inputHomePath = new ControlGroup({
                controlType: 'Text',
                controlOptions: {
                    modelAttribute: 'homePath',
                    model: this.addEditIndexModel,
                    placeholder: 'optional'
                },
                controlClass: 'controls-block',
                label: _('Home Path').t(),
                help:_("Hot/warm db path. Leave blank for default ($SPLUNK_DB/INDEX_NAME/db).").t(),
                enabled: options.isNew
            });
            this.children.inputColdPath = new ControlGroup({
                controlType: 'Text',
                controlOptions: {
                    modelAttribute: 'coldPath',
                    model: this.addEditIndexModel,
                    placeholder: 'optional'
                },
                controlClass: 'controls-block',
                label: _('Cold Path').t(),
                help:_("Cold db path. Leave blank for default ($SPLUNK_DB/INDEX_NAME/colddb).").t(),
                enabled: options.isNew
            });
            this.children.inputThawedPath = new ControlGroup({
                controlType: 'Text',
                controlOptions: {
                    modelAttribute: 'thawedPath',
                    model: this.addEditIndexModel,
                    placeholder: 'optional'
                },
                controlClass: 'controls-block',
                label: _('Thawed Path').t(),
                help:_("Thawed/resurrected db path. Leave blank for default ($SPLUNK_DB/INDEX_NAME/thaweddb).").t(),
                enabled: options.isNew
            });
            this.children.inputEnableDataIntegrity = new ControlGroup({
                controlType: 'SyntheticRadio',
                controlOptions: {
                    modelAttribute: 'enableDataIntegrityControl',
                    model: this.addEditIndexModel,
                    items: [
                        {
                            label: "Enable",
                            value: 1
                        },
                        {
                            label: "Disable",
                            value: 0
                        }
                    ]
                },
                controlClass: 'controls-halfblock',
                label: _('Data Integrity Check').t(),
                help: _("Enable this if you want Splunk to compute hashes on every slice of your data for the purpose of data integrity.").t()
            });
            this.children.inputMaxIndexSize = new ControlGroup({
                label: _('Max Size of Entire Index').t(),
                help:_("Maximum target size of entire index.").t(),
                controls: [{
                    type: 'Text',
                    options: {
                        modelAttribute: 'maxIndexSize',
                        model: this.addEditIndexModel
                    }
                },{
                    type: 'SyntheticSelect',
                    options: {
                        menuWidth: 'narrow',
                        modelAttribute: 'maxIndexSizeFormat',
                        model: this.addEditIndexModel,
                        items: byteFormatOptions,
                        toggleClassName: 'btn'
                    }
                }]
            });
            this.children.inputMaxBucketSize = new ControlGroup({
                label: _('Max Size of Hot/Warm/Cold Bucket').t(),
                help:_("Maximum target size of buckets. Enter 'auto_high_volume' for high-volume indexes.").t(),
                controls: [{
                    type: 'Text',
                    options: {
                        modelAttribute: 'maxBucketSize',
                        model: this.addEditIndexModel
                    }
                },{
                    type: 'SyntheticSelect',
                    options: {
                        menuWidth: 'narrow',
                        modelAttribute: 'maxBucketSizeFormat',
                        model: this.addEditIndexModel,
                        items: byteFormatOptions,
                        toggleClassName: 'btn'
                    }
                }]
            });
            this.children.inputFrozenPath = new ControlGroup({
                controlType: 'Text',
                controlOptions: {
                    modelAttribute: 'frozenPath',
                    model: this.addEditIndexModel,
                    placeholder: 'optional'
                },
                controlClass: 'controls-block',
                label: _('Frozen Path').t(),
                help:_("Frozen bucket archive path. Set this if you want Splunk to automatically archive frozen buckets.").t()
            });
            // Hide in lite.
            if (this.model.user.canUseApps()){
                this.children.selectApp = options.isNew ? new ControlGroup({
                    label: _("App").t(),
                    controlType: 'SyntheticSelect',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: "app",
                        model: this.addEditIndexModel,
                        toggleClassName: 'btn',
                        menuWidth: 'narrow',
                        items: appItems,
                        popdownOptions: {
                            attachDialogTo: '.modal:visible',
                            scrollContainer: '.modal:visible .modal-body:visible'
                        }
                    }
                }) : new ControlGroup({
                    controlType: 'Text',
                    controlOptions: {
                        modelAttribute: 'app',
                        model: this.addEditIndexModel
                    },
                    controlClass: 'controls-block',
                    label: _('App').t(),
                    enabled: false
                });
            }

            // Mini-TSIDX controls
            var docRoute = route.docHelp(this.model.application.get("root"), this.model.application.get("locale"), 'learnmore.tsidx_reduction');
            this.children.switchTSDIXReduction = new ControlGroup({
                controlType: 'SyntheticRadio',
                controlOptions: {
                    modelAttribute: 'enableTsidxReduction',
                    model: this.addEditIndexModel,
                    items: [
                        {
                            label: _('Enable Reduction').t(),
                            value: true
                        },
                        {
                            label: _('Disable Reduction').t(),
                            value: false
                        }
                    ],
                    save: false
                },
                controlClass: 'controls-halfblock',
                label: _('Tsidx Retention Policy').t(),
                help:_('<b>Warning</b>: Do not enable reduction without understanding the full implications. It is extremely difficult to rebuild reduced buckets. <a href="'+ docRoute +'" class="external" target="_blank" + title="' + _("Splunk help").t() + '">Learn More</a>').t()
            });

            this.children.inputTSDIXReductionAge = new ControlGroup({
                label: _('Reduce tsidx files older than').t(),
                help:_("Age is determined by the latest event in a bucket.").t(),
                controls: [{
                    type: 'Text',
                    options: {
                        modelAttribute: 'timePeriodInSecBeforeTsidxReduction',
                        model: this.addEditIndexModel
                    }
                },{
                    type: 'SyntheticSelect',
                    options: {
                        menuWidth: 'narrow',
                        modelAttribute: 'tsidxAgeFormat',
                        model: this.addEditIndexModel,
                        items: periodFormatOptions,
                        toggleClassName: 'btn',
                        popdownOptions: {detachDialog: true}
                    }
                }]

            });

            this.addEditIndexModel.on('change:enableTsidxReduction', this.toggleMiniTsidxSettings, this);
        },

        // Toggles display of mini-tsidx configuration
        // based on the value of enableTsidxReduction
        toggleMiniTsidxSettings: function(model, value, options){
            if (value === true){
                this.children.inputTSDIXReductionAge.enable();
            }else{
                this.children.inputTSDIXReductionAge.disable();
            }
        },

        // Determine if we should display value in MB or GB or TB.
        formatSize: function(inputSize, inputFormat){
            var result = {
                size: inputSize,
                format: inputFormat || 'MB'
            };
            if (!isNaN(inputSize)){
                var inputSizeGB = inputSize / 1024,
                    inputSizeTB = inputSizeGB / 1024,
                    isInputSizeMB = inputSizeGB.toString().indexOf('.') !== -1,
                    isInputSizeGB = inputSizeTB.toString().indexOf('.') !== -1;
                if (!isInputSizeGB) {
                    result = {
                        size: inputSizeTB,
                        format: 'TB'
                    };
                }
                else if (!isInputSizeMB){
                    result = {
                        size: inputSizeGB,
                        format: 'GB'
                    };
                }
            }
            return result;
        },

        formatSizeForSave: function(inputSize, inputFormat){
            var result = inputSize;
            if (!isNaN(inputSize)){
                if (inputFormat === 'TB'){
                    result *= 1048576;
                }
                else if (inputFormat === 'GB'){
                    result *= 1024;
                }
                // Ensure input is an integer.
                if (result.toString().indexOf('.') !== -1){
                    result = Math.floor(result);
                }
            }
            return result;
        },

        // Converts seconds to Reduction period
        // returns an object with value and format property
        convertSecondsToPeriod: function (value){
            var result = {
                value: 1*value,
                format: 'Seconds'
            };
            if (!isNaN(value)) {
                if (value % 86400 === 0) {
                    result.value = value / 86400;
                    result.format = 'Days';
                }
                else if (value % 3600 === 0) {
                    result.value = value / 3600;
                    result.format = 'Hours';
                }
                else if (value % 60 === 0) {
                    result.value = value / 60;
                    result.format = 'Minutes';
                }
            }
            return result;
        },

        // Converts Reduction period to seconds
        convertPeriodToSec: function (size, format){
            var result = 1*size;
            if (!isNaN(size)){
                if (format === "Days"){
                    result *= 60 * 60 * 24;
                }
                else if (format === "Hours"){
                    result *= 60 * 60;
                }
                else if (format === "Minutes"){
                    result *= 60;
                }
                // Ensure input is an integer.
                if (result.toString().indexOf('.') !== -1){
                    result = Math.floor(result);
                }
            }
            return result;
        },

        render: function() {
            this.$el.html(Modal.TEMPLATE);
            this.$(Modal.HEADER_TITLE_SELECTOR).html(this.options.isNew ? _('New Index').t() : splunkutil.sprintf(_("Edit Index: %s").t(), _.escape(this.model.entity.entry.get("name"))));
            this.$(Modal.BODY_SELECTOR).show();
            this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);
            this.$(Modal.BODY_FORM_SELECTOR).html(_(this.dialogFormBodyTemplate).template({}));
            this.children.flashMessagesView.render().appendTo(this.$(".flash-messages-view-placeholder"));
            if (this.options.isNew) {
                this.children.inputName.render().appendTo(this.$(".name-placeholder"));
            }
            this.children.inputHomePath.render().appendTo(this.$(".home-path-placeholder"));
            this.children.inputColdPath.render().appendTo(this.$(".cold-path-placeholder"));
            this.children.inputThawedPath.render().appendTo(this.$(".thawed-path-placeholder"));
            this.children.inputEnableDataIntegrity.render().appendTo(this.$(".enable-data-integrity-placeholder"));
            this.children.inputMaxIndexSize.render().appendTo(this.$(".max-index-size-placeholder"));
            this.children.inputMaxBucketSize.render().appendTo(this.$(".max-bucket-size-placeholder"));
            this.children.inputFrozenPath.render().appendTo(this.$(".frozen-path-placeholder"));
            if (this.model.user.canUseApps()){
                this.children.selectApp.render().appendTo(this.$(".application-placeholder"));
            }
            this.children.switchTSDIXReduction.render().appendTo(this.$(".tsidx-reduction-switch-placeholder"));
            this.children.inputTSDIXReductionAge.render().appendTo(this.$(".tsidx-reduction-age-placeholder"));
            if (!this.addEditIndexModel.get('enableTsidxReduction')){
                this.children.inputTSDIXReductionAge.disable();
            }

            this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
            this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_SAVE);

            return this;
        },

        dialogFormBodyTemplate: '\
            <p><strong>General Settings</strong></p>\
            <div class="flash-messages-view-placeholder"></div>\
            <div class="name-placeholder"></div>\
            <div class="home-path-placeholder"></div>\
            <div class="cold-path-placeholder"></div>\
            <div class="thawed-path-placeholder"></div>\
            <div class="enable-data-integrity-placeholder"></div>\
            <div class="size-format-placeholder max-index-size-placeholder"></div>\
            <div class="size-format-placeholder max-bucket-size-placeholder"></div>\
            <div class="frozen-path-placeholder"></div>\
            <div class="application-placeholder"></div>\
            <p><strong>Storage Optimization</strong></p>\
            <div class="tsidx-reduction-switch-placeholder"></div>\
            <div class="size-format-placeholder tsidx-reduction-age-placeholder"></div>\
            '
    });
});
