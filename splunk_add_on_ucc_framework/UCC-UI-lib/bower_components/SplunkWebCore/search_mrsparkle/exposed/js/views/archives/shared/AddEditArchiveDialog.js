/**
 * @author jszeto
 * @date 3/18/15
 */

define([
        'jquery',
        'underscore',
        'backbone',
        'module',
        './EnableButton',
        'models/indexes/cloud/Archive',
        'models/indexes/cloud/AddEditArchive',
        'models/indexes/cloud/S3BucketPolicy',
        'views/shared/FlashMessages',
        'views/shared/Modal',
        'views/shared/controls/ControlGroup',
        'uri/route',
        'views/shared/controls/TextControl',
        'views/shared/controls/TextareaControl',
        'splunk.util'
    ],

    function(
        $,
        _,
        Backbone,
        module,
        EnableButton,
        ArchiveModel,
        AddEditArchiveModel,
        S3BucketPolicyModel,
        FlashMessages,
        Modal,
        ControlGroup,
        route,
        TextControl,
        TextareaControl,
        splunkUtil
    ) {
        var BUCKET_PLACEHOLDER = "__BUCKET_PLACEHOLDER__";
        var SCHEME_SEPARATOR = "://";

        return Modal.extend({
            moduleId: module.id,
            className: Modal.CLASS_NAME + " " + Modal.CLASS_MODAL_WIDE + " archives-modal",

            events: $.extend({}, Modal.prototype.events, {
                'click .btn-primary': function(e) {
                    if (this.addEditArchiveModel.set({}, {validate:true})) {
                        // Copy addEditArchiveModel attributes to this.model.archiveModel
                        if (this.options.isNew) {
                            this.model.archiveModel.entry.content.set("name", this.addEditArchiveModel.get("name"));
                        }

                        this.model.archiveModel.entry.content.set(this.addEditArchiveModel.getArchiveAttributes());
                        var archiveDeferred = this.model.archiveModel.save();
                        $.when(archiveDeferred).done(_(function() {
                            this.trigger("archiveSaved", this.addEditArchiveModel.get("name"));
                            this.hide();
                        }).bind(this));
                    }
                },
                'click .role-json-placeholder .control.shared-controls-textareacontrol': function(event) {
                    if (event.target && event.target.select){
                        event.target.select();
                    }
                },
                'dragstart .role-json-placeholder .control.shared-controls-textareacontrol': function(event) {
                    event.preventDefault();
                },
                'focus .role-json-placeholder .control.shared-controls-textareacontrol': function(event) {
                    if (event.target){
                        $(event.target).attr('readonly', true);
                    }
                }
            }),

            /*
                The interaction between the AWS S3 Path input, the Create/Edit button and the AWS Role JSON is complex.
                Here are some of the general rules:
                1) The Create button is disabled if the Path input is empty
                2) When the user presses the Create button, the following happens:
                    - Create button changes to an Edit button
                    - Path input is disabled
                    - Role JSON is displayed
                3) When the user presses the Edit button, the following happens:
                    - Edit button changes to Create button
                    - Path input is enabled
                    - Role JSON is removed

                The stateModel contains two attributes:
                    - enabled (which holds the state for rule #1)
                    - editable (which holds the state for rules #2 and #3)
             */
            initialize: function(options) {
                Modal.prototype.initialize.call(this, arguments);
                options = options || {};
                _(options).defaults({isNew:true});

                var policyControls = [];

                // TODO [JCS] Move these models into this.model so that modelsOff will remove their listeners
                this.s3BucketPolicyModel = new S3BucketPolicyModel();
                this.stateModel = new Backbone.Model({editable:true});

                // Initialize the working model
                if (options.isNew) {
                    this.addEditArchiveModel = new AddEditArchiveModel({isNew: true});
                    this.model.archiveModel = new ArchiveModel();
                } else {
                    var name = this.model.archiveModel.entry.get("name");
                    this.addEditArchiveModel = new AddEditArchiveModel({isNew: false,
                        "vix.fs.default.name" : this.model.archiveModel.entry.content.get("vix.fs.default.name"),
                        "vix.description" : this.model.archiveModel.entry.content.get("vix.description")});
                }

                // TODO [JCS] Figure out whether to block the UI while waiting for a response
                var policyDeferred = this.s3BucketPolicyModel.fetch({data:{bucketName:BUCKET_PLACEHOLDER}});

                if (this.options.isNew) {
                    this.listenTo(this.addEditArchiveModel, "change:vix.fs.default.name", this.onPathChanged);
                    this.listenTo(this.stateModel, "change:editable", this.onEditableChanged);
                } else {
                    // When the policy REST request comes back, update the Text area
                    $.when(policyDeferred).done(_(this.updateJSONPolicyWithBucketName).bind(this));
                }

                // Create flash messages view
                this.children.flashMessagesView = new FlashMessages({model:[this.s3BucketPolicyModel, this.addEditArchiveModel, this.model.archiveModel]});

                // Create the form controls
                this.children.inputName = new ControlGroup({
                    controlType: 'Text',
                    controlOptions: {
                        modelAttribute: 'name',
                        model: this.addEditArchiveModel
                    },
                    controlClass: 'controls-block',
                    label: _('Archive Name').t(),
                    help:_("").t()
                });

                if (this.options.isNew) {
                    this.children.inputPathText = new TextControl({
                        modelAttribute: 'vix.fs.default.name',
                        model: this.addEditArchiveModel,
                        updateOnKeyUp: true
                    });

                    this.children.inputPathEditButton = new EnableButton({
                        model: this.stateModel,
                        label: _("Edit").t(),
                        attributes: {"data-name": "edit-path-button"}
                    });
                    this.listenTo(this.children.inputPathEditButton, "click", this.onPathEditButtonClicked);

                    this.children.inputPath = new ControlGroup({
                        controls: [this.children.inputPathText, this.children.inputPathEditButton],
                        controlClass: 'controls-block',
                        label: _('AWS S3 Bucket Path').t(),
                        help: _("An AWS S3 Bucket in the same AWS region as your Splunk Cloud environment. eg. s3a://mybackup").t()
                    });
                } else {
                    this.children.inputPath = new ControlGroup({
                        controlType: 'Label',
                        controlOptions: {
                            modelAttribute: 'vix.fs.default.name',
                            model: this.addEditArchiveModel
                        },
                        controlClass: 'controls-block',
                        label: _('AWS S3 Bucket Path').t(),
                        help: _("An AWS S3 Bucket in the same AWS region as your Splunk Cloud environment. eg. s3a://mybackup").t()
                    });
                }

                this.children.textareaDescription = new ControlGroup({
                    controlType: 'Textarea',
                    controlOptions: {
                        modelAttribute: 'vix.description',
                        model: this.addEditArchiveModel,
                        placeholder: 'optional'
                    },
                    label: _("Description").t()
                });
                // Check to see if browser can support JS copy to clipboard and set the help text.
                // this.browserCanJSCopy = document && document.queryCommandSupported && document.execCommand && document.queryCommandSupported('copy');

                if (this.options.isNew) {
                    this.children.generatePolicyButton = new EnableButton({
                        model: this.stateModel,
                        label: _("Generate").t(),
                        attributes: {"data-name": "generate-policy-button"}
                    });

                    this.listenTo(this.children.generatePolicyButton, "click", this.onGeneratePolicyButtonClicked);

                    policyControls.push(this.children.generatePolicyButton);
                }

                this.children.textAreaPolicy = new TextareaControl({
                    model: this.stateModel,
                    modelAttribute: 'policyJSON'});

                policyControls.push(this.children.textAreaPolicy);

                var bucketPolicyLabel = _("AWS S3 Bucket Policy").t();

                var bucketPolicyLearnMorePath = route.docHelp(
                    this.model.application.get("root"),
                    this.model.application.get("locale"),
                    'learnmore.cloud.AWSrole'
                );

                var bucketPolicyLearnMoreLink =
                    '<a href="' + bucketPolicyLearnMorePath + '"'
                    + ' target="_blank" class="help-link">'
                    + _("Learn More").t()
                    + ' <i class="icon-external"></i></a>';

                var bucketPolicyHelp = _("Copy and paste into your AWS permissions console.").t()
                    + ' ' + bucketPolicyLearnMoreLink;

                var bucketPolicyTooltip = _("The AWS S3 Bucket permissions that will allow Splunk Cloud to copy data to the AWS S3 Bucket.").t();

                this.children.roleJSON = new ControlGroup({
                    controls: policyControls,
                    label: bucketPolicyLabel,
                    help: bucketPolicyHelp,
                    tooltip: bucketPolicyTooltip
                });
            },

            // If the editable value has changed, then update the states for the Path input and the
            // Generate and Edit buttons
            onEditableChanged: function() {
                var editable = this.stateModel.get("editable");

                if (editable) {
                    this.children.inputPathText.enable();
                    this.children.inputPathEditButton.disable();
                    this.children.generatePolicyButton.enable();
                } else {
                    this.children.inputPathText.disable();
                    this.children.inputPathEditButton.enable();
                    this.children.generatePolicyButton.disable();
                }
            },

            // If the create policy button has been clicked, toggle the editable value and clear the Role Text Area
            onPathEditButtonClicked: function() {
                this.stateModel.set("editable", true);
                this.stateModel.set("policyJSON", "");
            },

            // If the Path input has changed, then update the state model and enable/disable the Generate button
            onPathChanged: function() {
                var bucketName = this.addEditArchiveModel.get("vix.fs.default.name");

                if (_(bucketName).isEmpty()) {
                    this.children.generatePolicyButton.disable();
                } else {
                    this.children.generatePolicyButton.enable();
                }
            },

            // Update the Role Text Area when the Generate button has been clicked
            onGeneratePolicyButtonClicked: function() {
                if (this.addEditArchiveModel.set({}, {validate:true})) {
                    this.updateJSONPolicyWithBucketName();
                    this.stateModel.set("editable",false);
                }
            },

            // Update the Role Text Area
            updateJSONPolicyWithBucketName: function() {
                var bucketName;
                var createdJSON;
                var bucketPath = this.addEditArchiveModel.get("vix.fs.default.name");
                var policyJSON = this.s3BucketPolicyModel.get("policyJSON");
                // Perform a string replace to insert the bucket name into the JSON policy
                var regex = new RegExp(BUCKET_PLACEHOLDER, 'g');
                var schemeIndex = bucketPath.indexOf(SCHEME_SEPARATOR);

                if (schemeIndex != -1) {
                    bucketName = bucketPath.substr(schemeIndex + SCHEME_SEPARATOR.length);
                    createdJSON = policyJSON.replace(regex, bucketName);
                    this.stateModel.set("policyJSON", JSON.stringify(JSON.parse(createdJSON), null, 4));
                }
            },

            deactivate: function(options) {
                Modal.prototype.initialize.call(this, arguments);

                this.stopListening(this.addEditArchiveModel, "change:vix.fs.default.name", this.onPathChanged);
            },

            render: function() {
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html(this.options.isNew ? _('New Archive').t() : splunkUtil.sprintf(_("Edit Archive: %s").t(), this.model.archiveModel.entry.get("name")));
                this.$(Modal.BODY_SELECTOR).show();
                this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);

                var docUrl = route.docHelp(
                    this.model.application.get("root"),
                    this.model.application.get("locale"),
                    'learnmore.cloud.newarchive'
                );

                this.$(Modal.BODY_FORM_SELECTOR).html(_(this.dialogFormBodyTemplate).template({
                    docUrl: docUrl
                }));

                this.children.flashMessagesView.render().appendTo(this.$(".flash-messages-view-placeholder"));
                if (this.options.isNew) {
                    this.children.inputName.render().appendTo(this.$(".name-placeholder"));
                } else {
                    this.$(".create-new-message").hide();
                }
                this.children.textareaDescription.render().appendTo(this.$(".description-placeholder"));
                this.children.inputPath.render().appendTo(this.$(".path-placeholder"));
                this.children.roleJSON.render().appendTo(this.$(".role-json-placeholder"));
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_SAVE);

                if (this.options.isNew) {
                    this.onEditableChanged();
                    this.onPathChanged();
                }

                return this;
            },

            dialogFormBodyTemplate: '\
                <div class="flash-messages-view-placeholder"></div>\
                <div class="create-new-message">\
                    <p><%- _("Copy data from indexes you specify into an AWS S3 Bucket. The S3 Bucket must be dedicated to Splunk Cloud archive data only, and must be in the same AWS Region as your Splunk Cloud environment.").t() %></p>\
                    <a href="<%- docUrl %>" target="_blank" class="help-link"><%- _("Learn More").t() %> <i class="icon-external"></i></a>\
                </div>\
                <div class="name-placeholder"></div>\
                <div class="description-placeholder"></div>\
                <div class="path-placeholder"></div>\
                <span class="role-json-placeholder"></span>\
            '
        });
    });
