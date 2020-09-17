/**
 * @author jszeto
 * @date 3/22/2013
 *
 * Dialog to edit the acceleration settings of a Data Model.
 *
 * Inputs:
 *
 *     model: {
 *         dataModel {models/services/datamodel/DataModel}
 *         application {models/Application}
 *
 * @fires AccelerationDialog#action:saveModel
 */
define(
    [
        'jquery',
        'underscore',
        'backbone',
        'models/Base',
        'views/data_model_manager/customcontrols/BlockSizeControl',
        'views/shared/dialogs/DialogBase',
        'views/shared/controls/ControlGroup',
        'views/shared/controls/SyntheticCheckboxControl',
        'views/shared/controls/SyntheticSelectControl',
        'views/shared/controls/TextControl',
        'views/shared/FlashMessages',
        'util/splunkd_utils',
        'module'
    ],
    function(
        $,
        _,
        Backbone,
        BaseModel,
        BlockSizeControl,
        DialogBase,
        ControlGroup,
        SyntheticCheckboxControl,
        SyntheticSelectControl,
        TextControl,
        FlashMessagesView,
        splunkdUtils,
        module
        )
    {
        return DialogBase.extend({
            moduleId: module.id,
            THIRTYTWO_MB: 32*1024*1024,

            initialize: function(options) {
                DialogBase.prototype.initialize.call(this, options);

                this.bodyClassName = "form form-horizontal modal-body-scrolling";

                this.children.flashMessages = new FlashMessagesView();
                this.blockSizeErrorMessageID = _.uniqueId('dfs-blocksize-error-');

                this.children.nameLabel = new ControlGroup({
                    controlType: 'Label',
                    controlOptions: {
                        defaultValue: this.model.dataModel.entry.content.get("displayName")
                    },
                    label: _("Data Model").t()
                });

                var items = [
                    {label: _("1 Day").t(), value: "-1d"},
                    {label: _("7 Days").t(), value: "-1w"},
                    {label: _("1 Month").t(), value: "-1mon"},
                    {label: _("3 Months").t(), value: "-3mon"},
                    {label: _("1 Year").t(), value: "-1y"},
                    {label: _("All Time").t(), value: "0"}
                ];

                this.enabledCheckBox = new SyntheticCheckboxControl({
                    modelAttribute: 'enabled',
                    model: this.model.dataModel.entry.content.acceleration,
                    updateModel:false
                });
                this.children.enabledGroup = new ControlGroup({
                    label: _("Accelerate").t(),
                    controls: [this.enabledCheckBox],
                    help:_("Acceleration may increase storage and processing costs.").t()
                });
                this.enabledCheckBox.on("change", this.acceleratedChangeHandler, this);

                // TODO [JCS] Maybe Control.js should use the defaultValue if the model attribute is undefined.
                // But too risky of a change to make right now. Instead, will add a hack that we should revisit later
                var accelerationModel = this.model.dataModel.entry.content.acceleration;
                if (_.isUndefined(accelerationModel.get("earliest_time")) || _.isEmpty(accelerationModel.get("earliest_time"))) {
                    accelerationModel.set("earliest_time", "-1d");
                }
                this.earliestTimeSelect = new SyntheticSelectControl({
                    modelAttribute: 'earliest_time',
                    model: accelerationModel,
                    toggleClassName: 'btn',
                    menuWidth: 'narrow',
                    items: items,
                    updateModel: false,
                    popdownOptions: {
                        attachDialogTo: '.modal:visible',
                        scrollContainer: '.modal:visible .modal-body:visible'
                    }
                });
                this.children.earliestTimeGroup = new ControlGroup({
                    label: _("Summary Range").t(),
                    controls: [this.earliestTimeSelect],
                    tooltip: _("Sets the range of time (relative to now) for which data is accelerated. " +
                               "Example: 1 Month accelerates the last 30 days of data in your pivots.").t()
                });

                this.isHunk = this.hasVix() || this.hasArchive();
                if (this.isHunk) {
                    // Hunk DMA options
                    this.enableHunkOptionsModel = new BaseModel({
                        'enabled': (this.model.dataModel.entry.content.acceleration.get('hunk.compression_codec') ||
                                    this.model.dataModel.entry.content.acceleration.get('hunk.dfs_block_size') ||
                                    this.model.dataModel.entry.content.acceleration.get('hunk.file_format'))
                    });
                    var enableHunkOptions = new SyntheticCheckboxControl({
                        modelAttribute: 'enabled',
                        model: this.enableHunkOptionsModel
                    });
                    this.listenTo(this.enableHunkOptionsModel, 'change:enabled', this.enableHunkOptionsVisibility);
                    this.children.enableHunkOptionsGroup = new ControlGroup({
                        label: _('Enable Hunk Specific Options').t(),
                        controls: [enableHunkOptions],
                        help: _('Only enable if the Hunk defaults are not what you need.').t()
                    });
                    
                    // File Format
                    var fileFormatItems = [
                        {value: 'orc', label: _('orc').t()},  // Keep orc first, because it is default value.
                        {value: 'parquet', label: _('parquet').t()}
                    ];
                    this.currentFileFormat = this.model.dataModel.entry.content.acceleration.get('hunk.file_format') || 'orc';
                    this.fileFormatModel = new BaseModel({
                        'format': this.currentFileFormat
                    });
                    this.fileFormat = new SyntheticSelectControl({
                        modelAttribute: 'format',
                        model: this.fileFormatModel,
                        items: fileFormatItems,
                        toggleClassName: 'btn',
                        menuWidth: 'narrow',
                        popdownOptions: {
                            attachDialogTo: '.modal:visible',
                            scrollContainer: '.modal:visible .modal-body:visible'
                        }
                    });
                    this.children.fileFormatGroup = new ControlGroup({
                        label: _('File Format').t(),
                        controls: [this.fileFormat],
                        tooltip: _('Sets the file format used for Hunk datamodel acceleration.').t()
                    });
                    this.listenTo(this.fileFormatModel, 'change format', this.updateCompression);
                    
                    // Compression type
                    this.orcCompressionItems = [
                        {value: 'snappy', label: _('snappy').t()},
                        {value: 'zlib', label: _('zlib').t()}
                    ];
                    this.parquetCompressionItems = [
                            {value: 'snappy', label: _('snappy').t()},
                            {value: 'gzip', label: _('gzip').t()}
                        ];
                    var compressionItems = this.orcCompressionItems;
                    if (this.model.dataModel.entry.content.acceleration.get('hunk.file_format') === 'parquet') {
                        compressionItems = this.parquetCompressionItems;
                    }
                    this.compression = new SyntheticSelectControl({
                        modelAttribute: 'hunk.compression_codec',
                        model: this.model.dataModel.entry.content.acceleration,
                        items: compressionItems,
                        toggleClassName: 'btn',
                        menuWidth: 'narrow',
                        updateModel: false,
                        popdownOptions: {
                            attachDialogTo: '.modal:visible',
                            scrollContainer: '.modal:visible .modal-body:visible'
                        }
                    });
                    this.children.compressionGroup = new ControlGroup({
                        label: _('Compression Codec').t(),
                        controls: [this.compression],
                        tooltip: _('Sets the Compression Codec used for Hunk datamodels.').t()
                    });

                    // DFS Block Size
                    this.enableBlockSizeModel = new BaseModel({
                        'enabled': (this.model.dataModel.entry.content.acceleration.get('hunk.dfs_block_size') &&
                                    (this.model.dataModel.entry.content.acceleration.get('hunk.dfs_block_size') >= this.THIRTYTWO_MB))
                    });
                    this.enableBlockSize = new SyntheticCheckboxControl({
                        modelAttribute: 'enabled',
                        model: this.enableBlockSizeModel,
                        label: _('Enable Block Size specification.').t()
                    });
                    this.listenTo(this.enableBlockSizeModel, 'change enabled', this.enableBlockSizeVisibility);
                    this.blockSize = new BlockSizeControl({
                        model: this.model.dataModel.entry.content.acceleration,
                        modelAttribute: 'hunk.dfs_block_size',
                        updateModel: false,
                        enabled: this.enableBlockSizeModel.get('enabled')
                    });
                    this.children.blockSizeGroup = new ControlGroup({
                        label: _('DFS Block Size').t(),
                        controls: [this.enableBlockSize, this.blockSize],
                        tooltip: _('DFS block size, used for Hunk datamodels.').t()
                    });
                }

                this.settings.set("primaryButtonLabel", _("Save").t());
                this.settings.set("cancelButtonLabel", _("Cancel").t());
                this.settings.set("titleLabel", _("Edit Acceleration").t());
            },

            /**
             * Return true if the dataModel has a virtual index.
             */
            hasVix: function() {
                return _(this.model.dataModel.entry.content.objects.models).any(function(obj) {
                    if (obj.attributes && obj.attributes.constraints && obj.attributes.constraints.length) {
                        var search = obj.attributes.constraints[0].search || '';
                        var regex = new RegExp('.*index ?= ?([A-Za-z_-]*).*', 'g');
                        var index = search.replace(regex, '$1');
                        return _(this.collection.vix.models).any(function(vix) {
                            return (index === vix.entry.get('name'));
                        }, this);
                    }
                    return false;
                }, this);
            },

            /**
             * Return true if the dataModel has a virtual index.
             */
            hasArchive: function() {
                return _(this.model.dataModel.entry.content.objects.models).any(function(obj) {
                    if (obj.attributes && obj.attributes.constraints && obj.attributes.constraints.length) {
                        var search = obj.attributes.constraints[0].search || '';
                        var regex = new RegExp('.*index ?= ?([A-Za-z_-]*).*', 'g');
                        var index = search.replace(regex, '$1');
                        return _(this.collection.archives.models).any(function(archive) {
                            return (index === archive.entry.get('name'));
                        }, this);
                    }
                    return false;
                }, this);
            },

            /**
             * When the enabled checkbox value is changed, toggle the visibility of the Summary Range control
             */
            acceleratedChangeHandler: function(model, value, options) {
                this.updateView();
            },

            updateView: function() {
                if (this.enabledCheckBox.getValue()) {
                    this.children.earliestTimeGroup.$el.show();
                    if (this.isHunk) {
                        this.children.enableHunkOptionsGroup.$el.show();
                        this.enableHunkOptionsVisibility();
                    }
                } else {
                    this.children.earliestTimeGroup.$el.hide();
                    if (this.isHunk) {
                        this.children.enableHunkOptionsGroup.$el.hide();
                        this.children.flashMessages.$el.hide();
                        this.children.fileFormatGroup.$el.hide();
                        this.children.compressionGroup.$el.hide();
                        this.children.blockSizeGroup.$el.hide();
                    }
                }
            },
            
            enableHunkOptionsVisibility: function() {
                if (this.enableHunkOptionsModel.get('enabled')) {
                    if (this.enableBlockSizeModel.get('enabled')) {
                        this.children.flashMessages.$el.show();
                    }
                    this.children.fileFormatGroup.$el.show();
                    this.children.compressionGroup.$el.show();
                    this.children.blockSizeGroup.$el.show();
                } else {
                    this.children.flashMessages.$el.hide();
                    this.children.fileFormatGroup.$el.hide();
                    this.children.compressionGroup.$el.hide();
                    this.children.blockSizeGroup.$el.hide();
                }
            },

            updateCompression: function() {
                var newFileFormat = this.fileFormat.getValue();
                if (this.currentFileFormat !== newFileFormat) {
                    if (newFileFormat === 'parquet') {
                       this.compression.setItems(this.parquetCompressionItems);
                    } else {
                        this.compression.setItems(this.orcCompressionItems);
                    }
                   this.compression.setValue('snappy');
                   this.currentFileFormat = newFileFormat;
                }
            },

            enableBlockSizeVisibility: function() {
                if (this.enableBlockSizeModel.get('enabled')) {
                    this.children.flashMessages.$el.show();
                    this.blockSize.enable();
                } else {
                    this.children.flashMessages.$el.hide();
                    this.blockSize.disable();
                }
            },
            
            primaryButtonClicked: function() {
                DialogBase.prototype.primaryButtonClicked.apply(this, arguments);

                if (this.isHunk && this.enableHunkOptionsModel.get('enabled') &&
                    this.enableBlockSizeModel.get('enabled')) {
                    if (_.isNaN(this.blockSize.getValueFromChildren()) ||
                        this.blockSize.getValueFromChildren() < this.THIRTYTWO_MB) {
                        this.children.flashMessages.flashMsgHelper.addGeneralMessage(this.blockSizeErrorMessageID, {
                            type: splunkdUtils.ERROR,
                            html: _('DFS Block Size must be a number greater than or equal to 32MB.').t()
                        });
                        return;
                    } else {
                        this.children.flashMessages.flashMsgHelper.removeGeneralMessage(this.blockSizeErrorMessageID);
                    }
                }
                
                this.enabledCheckBox.updateModel();
                this.earliestTimeSelect.updateModel();
                if (this.isHunk) {
                    if (this.enableHunkOptionsModel.get('enabled')) {
                        //this.fileFormat.updateModel();
                        this.model.dataModel.entry.content.acceleration.set('hunk.file_format', this.fileFormatModel.get('format'));
                        this.compression.updateModel();
                        if (this.enableBlockSizeModel.get('enabled')) {
                            this.blockSize.updateModel();
                        } else {
                            this.model.dataModel.entry.content.acceleration.set('hunk.dfs_block_size', '');
                        }
                    } else {
                        // unset all the Hunk options
                        this.model.dataModel.entry.content.acceleration.set('hunk.file_format', '');
                        this.model.dataModel.entry.content.acceleration.set('hunk.compression_codec', '');
                        this.model.dataModel.entry.content.acceleration.set('hunk.dfs_block_size', '');
                    }
                }

                // Save the results into our object
                /**
                 * Save the Data Model
                 *
                 * @event AccelerationDialog#action:saveModel
                 * @param {string} data model name
                 */
                this.trigger("action:saveModel", this.model.dataModel.get("id"));
                this.hide();
            },

            renderBody : function($el) {
                var html = _(this.bodyTemplate).template({});
                $el.html(html);
                $el.find('.error-message').append(this.children.flashMessages.render().el);
                $el.find(".nameLabel-placeholder").replaceWith(this.children.nameLabel.render().el);
                $el.find(".accelerate-checkbox-placeholder").replaceWith(this.children.enabledGroup.render().el);
                $el.find(".summary-range-dropdown-placeholder").append(this.children.earliestTimeGroup.render().el);

                if (this.isHunk) {
                    $el.find('.hunk-advanced-options').replaceWith(this.children.enableHunkOptionsGroup.render().el);
                    $el.find('.hunk-file-format').replaceWith(this.children.fileFormatGroup.render().el);
                    $el.find('.hunk-compression-codec').replaceWith(this.children.compressionGroup.render().el);
                    $el.find('.hunk-dfs-block-size').replaceWith(this.children.blockSizeGroup.render().el);
                }

                this.updateView();
                if (this.isHunk){
                    this.enableBlockSizeVisibility();
                }
            },

            bodyTemplate: '\
                <div class="error-message"></div>\
                <div class="nameLabel-placeholder"></div>\
                <div class="accelerate-checkbox-placeholder"></div>\
                <div class="summary-range-dropdown-placeholder"></div>\
                <div class="hunk-advanced-options"></div>\
                <div class="hunk-file-format"></div>\
                <div class="hunk-compression-codec"></div>\
                <div class="hunk-dfs-block-size"></div>\
        '

        });

    });