/**
 * @author lbudchenko/jszeto
 * @date 2/11/15
 */

define([
        'jquery',
        'underscore',
        'backbone',
        'module',
        'models/indexes/cloud/AddEditIndex',
        'views/shared/FlashMessages',
        'views/shared/Modal',
        'views/shared/controls/ControlGroup',
        'views/shared/controls/SyntheticSelectControl',
        'views/shared/waitspinner/Master',
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
        Spinner,
        splunkutil,
        route,
        css
    ) {

        return Modal.extend({
            moduleId: module.id,
            className: Modal.CLASS_NAME + " indexes-modal",
            initialize: function(options) {
                Modal.prototype.initialize.call(this, arguments);
                options = options || {};
                _(options).defaults({isNew:true});
                this._buildLayout(options);

                // Show spinner to show feedback that index is being saved.
                var spinnerOptions = {
                    color: 'green',
                    size: 'medium',
                    frameWidth: 19
                };
                this.children.spinner = new Spinner(spinnerOptions);
            },

            events: $.extend({}, Modal.prototype.events, {
                'click .btn-primary': function(e) {
                    if (this.addEditIndexModel.set({}, {validate:true})) {
                        this.children.spinner.start();
                        this.children.spinner.$el.show();

                        // Copy addEditIndexModel attributes to this.model
                        var maxIndexSize = this.formatSizeForSave(this.addEditIndexModel.get("maxIndexSize"), this.addEditIndexModel.get("maxIndexSizeFormat")),
                            frozenTimePeriodInSecs = this.addEditIndexModel.get("frozenTimePeriodInDays") * (60 * 60 * 24),
                            archiveProvider = this.addEditIndexModel.get("archive.provider"),
                            archiveEnabled = !_.isEmpty(archiveProvider);
                        if (this.options.isNew) {
                            this.model.entity.entry.content.set("name", this.addEditIndexModel.get("name"));
                        }

                        if (this.model.user.canViewArchives()) {
                            this.model.entity.entry.content.set({
                                maxTotalDataSizeMB: maxIndexSize,
                                maxGlobalDataSizeMB: maxIndexSize,
                                frozenTimePeriodInSecs: frozenTimePeriodInSecs,
                                "archive.enabled": archiveEnabled,
                                "archive.provider": archiveProvider
                            });
                        } else {
                            this.model.entity.entry.content.unset("archive.enabled");
                            this.model.entity.entry.content.unset("archive.provider");
                            this.model.entity.entry.content.set({
                                maxTotalDataSizeMB: maxIndexSize,
                                maxGlobalDataSizeMB: maxIndexSize,
                                frozenTimePeriodInSecs: frozenTimePeriodInSecs
                            });
                        }

                        var indexDeferred = this.model.entity.save();

                        $.when(indexDeferred).done(_(function() {
                            this.trigger("entitySaved", this.addEditIndexModel);
                            this.hide();
                            this.children.spinner.stop();
                        }).bind(this));
                        $.when(indexDeferred).fail(_(function() {
                            this.children.spinner.$el.hide();
                            this.children.spinner.stop();
                        }).bind(this));
                    }
                }
            }),

            _buildLayout: function(options){
                // Initialize the working model
                if (options.isNew) {
                    this.addEditIndexModel = new AddEditIndexModel({isNew: true});
                    this.model.entity = new this.options.entityModelClass();
                } else {
                    var name = this.model.entity.entry.get("name"),
                        maxIndexSizeObject = this.formatSize(
                            this.model.entity.entry.content.get("maxTotalDataSizeMB") ||
                            this.model.entity.entry.content.get("maxGlobalDataSizeMB")
                        ),
                        maxIndexSize = maxIndexSizeObject.size,
                        maxIndexSizeFormat = maxIndexSizeObject.format,
                        frozenTimePeriodInDays = Math.floor(this.model.entity.entry.content.get("frozenTimePeriodInSecs") / (60 * 60 * 24)),
                        archiveName = this.model.entity.entry.content.get("archive.provider");
                    this.addEditIndexModel = new AddEditIndexModel({isNew: false,
                                                               maxIndexSize: maxIndexSize,
                                                               maxIndexSizeFormat: maxIndexSizeFormat,
                                                               frozenTimePeriodInDays: frozenTimePeriodInDays,
                                                               "archive.provider": archiveName});
                }

                // Create flash messages view
                this.children.flashMessagesView = new FlashMessages({model:[this.addEditIndexModel, this.model.entity]});

                // Initialize the archive providers dropdown
                this.archiveProviders = [[{
                    label: _("No Archiving (default)").t(),
                    value: ""}
                ]];
                //, [{label:"Create a New Archive", value:"__NEW__ARCHIVE__"}]
                var archiveList = [];

                if (this.model.user.canViewArchives()){
                    this.collection.archives.each(function(archive) {
                        var name = archive.entry.get("name");
                        archiveList.push( {label:name, value:name});
                    }, this);
                }

                this.archiveProviders.push(archiveList);

                // Create the form controls
                this.children.inputName = new ControlGroup({
                    controlType: 'Text',
                    controlOptions: {
                        modelAttribute: 'name',
                        model: this.addEditIndexModel
                    },
                    controlClass: 'controls-block',
                    label: _('Index Name').t(),
                    help:_("").t()
                });

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

                this.children.inputMaxSize = new ControlGroup({
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
                            toggleClassName: 'btn',
                            popdownOptions: {attachDialogTo: 'body'}
                        }
                    }]
                });
                this.children.inputRetention = new ControlGroup({
                    controlType: 'Text',
                    controlOptions: {
                        modelAttribute: 'frozenTimePeriodInDays',
                        model: this.addEditIndexModel
                    },
                    controlClass: 'controls-block',
                    label: _('Retention (days)').t(),
                    help:_("").t()
                });

                this.selectArchive = new SyntheticSelectControl(
                    {
                        model: this.addEditIndexModel,
                        modelAttribute: "archive.provider",
                        toggleClassName: 'btn',
                        items: this.archiveProviders,
                        popdownOptions: {attachDialogTo: 'body'}
                    }
                );
                var archiveUrl = route.docHelp(
                    this.model.application.get("root"),
                    this.model.application.get("locale"),
                    'learnmore.cloud.archives'
                );

                this.listenTo(this.selectArchive, "change", this.onSelectArchiveChange);

                this.children.selectArchiveGroup = new ControlGroup({
                    controls:[this.selectArchive],
                    controlClass: 'controls-block',
                    label: _('Archive').t(),
                    help: _("Archive data to AWS S3.").t() +
                        ' <a href="' + archiveUrl + '" target="_blank" class="help-link">' + _("Learn More").t() + ' <i class="icon-external"></i></a></div>'
                });

                this.children.inputArchiveName = new ControlGroup({
                    controlType: 'Text',
                    controlOptions: {
                        modelAttribute: 'newArchiveName',
                        model: this.addEditIndexModel
                    },
                    controlClass: 'controls-block',
                    label: _('Archive Name').t(),
                    help:_("").t()
                });

                this.children.inputPath = new ControlGroup({
                    controlType: 'Text',
                    controlOptions: {
                        modelAttribute: 's3.bucket.path',
                        model: this.addEditArchiveModel
                    },
                    controlClass: 'controls-block',
                    label: _('AWS S3 Path').t(),
                    help:_("eg. s3://mybackup/sales/").t()
                });
            },

            onSelectArchiveChange: function(value, oldValue) {
                if (this.model.entity.entry.content.get("archive.provider")  &&  value === ''){
                    // Display warning message if disabling archiving from index.
                    if (value === ''){
                        this.children.flashMessagesView.flashMsgCollection.reset();
                        this.children.flashMessagesView.flashMsgCollection.push({
                            type: "warning",
                            html: _("Once you disable archiving for this index, you can no longer search its archive!").t()
                        });
                        this.children.flashMessagesView.render();
                    }
                }
            },

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

            render: function() {
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html(this.options.isNew ? _('New Index').t() : splunkutil.sprintf(_("Edit Index: %s").t(), this.model.entity.entry.get("name")));
                this.$(Modal.BODY_SELECTOR).show();
                this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);
                this.$(Modal.BODY_FORM_SELECTOR).html(_(this.dialogFormBodyTemplate).template({ model: this.model }));
                this.children.flashMessagesView.render().appendTo(this.$(".flash-messages-view-placeholder"));
                if (this.options.isNew)
                    this.children.inputName.render().appendTo(this.$(".name-placeholder"));
                this.children.inputMaxSize.render().appendTo(this.$(".max-size-placeholder"));
                this.children.inputRetention.render().appendTo(this.$(".retention-placeholder"));

                if (this.model.user.canViewArchives()){
                    this.children.selectArchiveGroup.render().appendTo(this.$(".archive-placeholder"));
                }

                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_SAVE);
                this.$(Modal.FOOTER_SELECTOR).append(this.children.spinner.render().el);
                this.children.spinner.$el.hide();

                return this;
            },

            dialogFormBodyTemplate: '\
                <div class="flash-messages-view-placeholder"></div>\
                <div class="name-placeholder"></div>\
                <div class="size-format-placeholder max-size-placeholder"></div>\
                <div class="retention-placeholder"></div>\
                <div class="archive-placeholder"></div>\
            '
        });
    });
