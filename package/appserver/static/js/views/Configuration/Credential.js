/*global define*/
define([
    'jquery',
    'underscore',
    'backbone',
    'app/util/Util',
    'splunk.util',
    'models/Base',
    'app/models/appData',
    'app/views/Models/FileUploadControl',
    'app/models/Certification',
    'app/models/CertificationUpload',
    'app/collections/Certifications',
    'app/config/ContextMap',
    'contrib/text!app/templates/Models/LoadingMsg.html',
    'contrib/text!app/templates/Models/ErrorMsg.html',
    'contrib/text!app/templates/Configuration/CredentialTemplate.html'
], function (
    $,
    _,
    Backbone,
    Util,
    SplunkdUtil,
    BaseModel,
    appData,
    FileUpload,
    Certification,
    CertificationUpload,
    Certifications,
    ContextMap,
    LoadingMsgTemplate,
    ErrorMsgTemplate,
    CredentialTemplate
) {

    var STATUS_MAPPING = {
            empty: 'No certificate configured yet.',
            not_verified: 'Certificate is uploaded but not verified yet.',
            valid: 'Uploaded and verified as valid.',
            invalid: 'Uploaded but invalid.',
            generated: 'Auto-generated but not verified yet.',
            generated_valid: 'Auto-generated and verified as valid.',
            generated_invalid: 'Auto-generated but invalid.'
        },
        HELP_LINK = SplunkdUtil.make_url("help") + "?location=" + Util.getLinkPrefix() + "mscs.certificate",
        DESCRIPTION = [
            'You can upload a <b>Base64-encoded X.509 Certificate (.cer)</b> and a <b>private key (*.key)</b> to enable service-to-service calls, ',
            'which allow you to avoid reconfiguring your authorization token if it expires. ',
            '<br/><br/>',
            'You can also use an auto-generated certificate provided by the add-on. ',
            '<a class="external" target="_blank" href="' + HELP_LINK + '">Learn more</a>',
            '<br/><br/>'
        ].join('');

    $.fn.autoHeight = function () {
        function autoHeight(elem) {
            elem.style.height = 'auto';
            elem.scrollTop = 0;
            elem.style.height = elem.scrollHeight + 'px';
        }

        this.each(function () {
            autoHeight(this);
        });
    };

    return Backbone.View.extend({
        initialize: function () {
            var that = this;
            this.addonName = Util.getAddonName();
            this.model = new Backbone.Model({});
            this.certUpload = new FileUpload({
                model: this.model,
                modelAttribute: "content",
                text: "Choose a Certificate",
                validator: function (file) {
                    return file.type.match('x-x509-ca-cert');
                }
            });

            this.certUpload.on("invalid", function () {
                that.$("input[id='upload-submit']").attr("disabled", "disabled");
                that.addErrorMsg('Selected file is an invalid file. Please choose the right certificate file, which should be a <b>Base64-encoded X.509 Certificate</b> and end with <b>".cer"</b>.');
            });

            this.certUpload.on("loaded", function () {
                that.$("input[id='upload-submit']").attr("disabled", "disabled");
                if (this.isLoaded()) {
                    that.removeErrorMsg();
                    if (that.keyUpload.isLoaded()) {
                        that.$("input[id='upload-submit']").removeAttr("disabled");
                    }
                }
            });

            this.keyUpload = new FileUpload({
                model: this.model,
                modelAttribute: "private_key",
                text: "Choose a Private Key"
            });

            this.keyUpload.on("loaded", function () {
                that.$("input[id='upload-submit']").attr("disabled", "disabled");
                if (this.isLoaded() && that.certUpload.isLoaded()) {
                    that.removeErrorMsg();
                    that.$("input[id='upload-submit']").removeAttr("disabled");
                }
            });

            this.stateModel = new BaseModel();
            this.stateModel.set({
                sortKey: 'name',
                sortDirection: 'asc',
                count: 100,
                offset: 0,
                fetching: true
            });

            this.certifications = new Certifications([], {
                appData: {
                    app: appData.get("app"),
                    owner: appData.get("owner")
                },
                targetApp: this.addonName,
                targetOwner: "nobody"
            });
            this.certification = new Certification(null, {
                appData: this.appData,
                collection: this.certifications
            });
        },

        render: function () {
            var deferred = this.fetchListCollection(this.certifications, this.stateModel);
            deferred.done(function () {
                this.certification = this.certifications.models[0];
                if (this.certification.entry.content.get("status") === undefined) {
                    this.status = "empty";
                } else {
                    this.status = this.certification.entry.content.get("status");
                }
                this.$el.html(_.template(this.template, {
                    status: STATUS_MAPPING[this.status],
                    description: DESCRIPTION,
                    help_link: SplunkdUtil.make_url("help") + "?location=" + Util.getLinkPrefix() + "mscs.certificate_status"
                }));
                if (this.certification && this.certification.entry.content.get("manifest_json")) {
                    this.showManifest(this.certification.entry.content.get("manifest_json"));
                }
                this.$fileInputContainer = this.$(".file-input-container");
                this.$fileInputContainer.append(this.certUpload.render().$el);
                this.$fileInputContainer.append(this.keyUpload.render().$el);
                if (!this.certification) {
                    this.certification = new Certification(null, {
                        appData: this.appData,
                        collection: this.certifications
                    });
                }
            }.bind(this));

            return this;
        },

        events: {
            "click input[id='upload-submit']": "submitTask",
            "click input[id='generate-submit']": "generate",
            "click .accordion-toggle": "toggleUploadForm",
            "click .auto-toggle": "toggleAutoForm"
        },
        submitTask: function (e) {
            e.preventDefault();
            var uploadModel = new CertificationUpload();

            // new_json.status = 'not_verified';

            this.removeErrorMsg();
            this.addSavingMsg('Saving Certification File');
            uploadModel.fetch({
                data: {
                    'content': this.model.attributes.content
                },
                type: "POST"
            }).done(function (response) {
                var data = {
                    'name': "certificate",
                    'status': "not_verified",
                    'manifest_json': response.entry[0].content.manifest,
                    'private_key': this.model.attributes.private_key
                };
                this.showManifest(data.manifest_json);
                this.certification.entry.content.set(data);
                this.certification.save().done(function () {
                    this.status = data.status;
                    this.$('span.status').html(STATUS_MAPPING[this.status]);
                    this.removeSavingMsg();
                }.bind(this)).fail(function (response) {
                    this.removeSavingMsg();
                    this.addErrorMsg(this.parseErrorMsg(response));
                }.bind(this));
            }.bind(this)).fail(function (response) {
                this.removeSavingMsg();
                this.addErrorMsg(
                    'Submitted file is an invalid certificate. The file might be broken. Please check and submit it again.'
                );
            }.bind(this));
        },

        generate: function () {
            var success, self = this;
            self.addSavingMsg("Generating the Certificate...");
            $.ajax({
                url: this.certification.collection.proxyUrl + '/' + ContextMap.restRoot + '/ta_o365_generate_certificate/generate?output_mode=json',
                method: 'POST'
            }).done(function (model) {
                self.removeSavingMsg();
                success = model.entry[0].content.success;
                //Load the manifest
                if (success) {
                    self.showManifest(model.entry[0].content.manifest_json);
                } else {
                    self.addErrorMsg("Error in generating the certificate.");
                }
                //Update the status
                self.$(".status-container .status").text(STATUS_MAPPING[model.entry[0].content.status]);
            }).fail(function () {
                self.removeSavingMsg();
                self.addErrorMsg("Error in generating the certificate.");
            });
        },

        fetchListCollection: function (collection, stateModel) {
            var search = '';
            if (stateModel.get('search')) {
                search = stateModel.get('search');
            }

            stateModel.set('fetching', true);
            return collection.fetch({
                data: {
                    sort_dir: stateModel.get('sortDirection'),
                    sort_key: stateModel.get('sortKey').split(','),
                    search: search,
                    count: stateModel.get('count'),
                    offset: stateModel.get('offset')
                },
                success: function () {
                    stateModel.set('fetching', false);
                }.bind(this)
            });
        },

        addErrorMsg: function (text) {
            if (this.$('.msg-error').length) {
                this.$('.msg-text').text(text);
            } else {
                this.$('.modal-body').prepend(_.template(ErrorMsgTemplate, {
                    msg: text
                }));
            }
        },

        removeErrorMsg: function () {
            if (this.$('.msg-error').length) {
                this.$('.msg-error').remove();
            }
        },

        addSavingMsg: function (text) {
            if (this.$('.msg-loading').length) {
                this.$('.msg-text').text(text);
            } else {
                this.$('.modal-body').prepend(_.template(LoadingMsgTemplate, {
                    msg: text
                }));
            }
        },

        removeSavingMsg: function () {
            if (this.$('.msg-loading').length) {
                this.$('.msg-loading').remove();
            }
        },

        showManifest: function (manifest) {
            if (manifest.length > 2) {
                manifest = manifest.substr(1, manifest.length - 2);
            }
            var $manifest = this.$(".manifest"),
                $container,
                $uploadForm = this.$(".manifest-container");
            $uploadForm.css("margin-top", "10px");
            $uploadForm.hide();
            if (!$manifest[0]) {
                $container = $([
                    "<p>",
                    "<b>JSON Key Credentials for Manifest:</b>",
                    "</p>",
                    "<textarea class='manifest' type='textarea' autoheight='true' readonly onfocus='this.select();' onmouseup='return false;' ></textarea>"
                ].join(""));
                $container.insertBefore($uploadForm);
                $manifest = this.$(".manifest");
            }
            $manifest.val(manifest);
            //$manifest.autoHeight();
        },
        toggleUploadForm: function () {
            var $icon = this.$(".accordion-toggle i");
            $icon.toggleClass("icon-chevron-right");
            $icon.toggleClass("icon-chevron-down");
            this.$(".upload-form").toggle("fast");
            //toggle another option
            if (this.$(".upload-form").css("display") !== "none" && this.$(".auto-form").css("display") !== "none") {
                this.$(".auto-toggle i").toggleClass("icon-chevron-right");
                this.$(".auto-toggle i").toggleClass("icon-chevron-down");
                this.$(".auto-form").toggle("fast");
            }
        },

        toggleAutoForm: function () {
            var $icon = this.$(".auto-toggle i");
            $icon.toggleClass("icon-chevron-right");
            $icon.toggleClass("icon-chevron-down");
            this.$(".auto-form").toggle("fast");
            //toggle another option
            if (this.$(".upload-form").css("display") !== "none" && this.$(".auto-form").css("display") !== "none") {
                this.$(".accordion-toggle i").toggleClass("icon-chevron-right");
                this.$(".accordion-toggle i").toggleClass("icon-chevron-down");
                this.$(".upload-form").toggle("fast");
            }
        },
        resetIcon: function () {
            var $icon = this.$(".accordion-toggle i");
            $icon.addClass("icon-chevron-right");
            $icon.removeClass("icon-chevron-down");
        },
        parseErrorMsg: function (data) {
            var error_msg = '',
                rsp,
                regex,
                msg,
                matches;
            try {
                rsp = JSON.parse(data.responseText);
                regex = /In handler.+and output:\s+\'([\s\S]*)\'\.\s+See splunkd\.log for stderr output\./;
                msg = String(rsp.messages[0].text);
                matches = regex.exec(msg);
                if (!matches || !matches[1]) {
                    // try to extract another one
                    regex = /In handler[^:]+:\s+(.*)/;
                    matches = regex.exec(msg);
                    if (!matches || !matches[1]) {
                        matches = [msg];
                    }
                }
                error_msg = matches[1];
            } catch (err) {
                error_msg = "ERROR in processing the request";
            }
            return error_msg.replace(/Splunk Add-on REST Handler ERROR\[\d{1,6}\]\: /, '');
        },
        template: CredentialTemplate
    });
});
