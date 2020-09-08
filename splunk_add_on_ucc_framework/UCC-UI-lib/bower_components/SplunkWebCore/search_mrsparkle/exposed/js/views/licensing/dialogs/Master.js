define(
    [
        'jquery',
        'underscore',
        'backbone',
        'module',
        'uri/route',
        'splunk.i18n',
        'splunk.util',
        'models/services/licenser/License',
        'views/shared/Modal',
        'views/licensing/dialogs/Results',
        'contrib/text!views/licensing/dialogs/AddLicense.html',
        'views/shared/pcss/dropzone.pcss'
    ],
    function($,
        _,
        backbone,
        module,
        route,
        i18n,
        splunkUtil,
        LicenseModel,
        Modal,
        ResultsView,
        AddLicenseTemplate,
        cssDropzone
    ){
        return Modal.extend({
            moduleId: module.id,
            template: AddLicenseTemplate,
            initialize: function() {
                Modal.prototype.initialize.apply(this, arguments);
                this.file = null;
                this.licenseText = '';
                this.activeGroup = this.model.activeGroup;
            },

            events: $.extend({}, Modal.prototype.events,
            {
                'click .select-file-button' : function(e) {
                    e.preventDefault();
                    this.$(Modal.BODY_SELECTOR).find('.license-file-input').click();
                },
                'click .license-paste-xml-link' : function(e) {
                    e.preventDefault();
                    this.$(Modal.BODY_SELECTOR).find('.license-pastebin').show();
                },
                'click .add-license-btn' : function(e) {
                    e.preventDefault();
                    this.renderValidation();
                },
                'click .back-license-btn' : function(e) {
                    e.preventDefault();
                    if (this.file) {
                        this.file = null;
                    }
                    this.licenseText = '';
                    this.$(Modal.HEADER_TITLE_SELECTOR).empty();
                    this.render();
                },
                'click .back-expired-license-btn' : function(e) {
                    e.preventDefault();
                    this.trigger('licenseExpired');
                }
            }),

            render: function() {
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Adding license").t());

                var helpLinkBrowser = route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'learnmore.adddata.browser'
                );

                this.$(Modal.BODY_SELECTOR).html(this.compiledTemplate({
                    _ : _,
                    helpLinkBrowser : helpLinkBrowser
                }));

                this.$(Modal.FOOTER_SELECTOR).html('<a href="#" class="btn btn-primary modal-btn-primary add-license-btn pull-right disabled">' + _('Add').t() + '</a>');
                if (!this.model.serverInfo.isLicenseStateExpired()) {
                    this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                }
                else {
                    this.$(Modal.FOOTER_SELECTOR).append('<a href="#" class="btn modal-btn-primary back-expired-license-btn pull-left">' + _('Back').t() + '</a>');
                }

                this.$(Modal.BUTTON_CLOSE_SELECTOR).remove();

                if (!window.File && !window.FileReader) {
                    this.showBrowserWarning();
                }

                this.bindFileEvents();
                return this;
            },

            bindFileEvents: function() {
                var dropzone = this.$(Modal.BODY_SELECTOR).find('.dropzone');
                var licenseFileInput = this.$(Modal.BODY_SELECTOR).find('.license-file-input');
                var licenseTextArea = this.$(Modal.BODY_SELECTOR).find('.license-pastebin-textarea');

                licenseFileInput
                    .on('change', function(e){
                        if (e.target.files) {
                            if (e.target.files.length > 1) {
                                this.showMultipleFilesError();
                            }
                            else {
                                this.file = e.target.files[0];
                                this.licenseText = '';
                                this.showLicenseFileReady();
                                this.updateFileLabel(this.file.name);
                            }
                        }
                    }.bind(this));

                dropzone
                    .on('drop', function(e){
                        e.stopPropagation();
                        e.preventDefault();
                        var files = e.originalEvent.dataTransfer.files;
                        if(files.length > 1){
                            this.showMultipleFilesError();
                        }
                        else {
                            this.file = files[0];
                            this.renderValidation();
                        }
                    }.bind(this));

                dropzone
                    .on('dragover', function (e) {
                        e.preventDefault();
                    }.bind(this));

                licenseTextArea
                    .on('input', function(e) {
                        e.preventDefault();
                        var licenseText = e.target.value.trim();
                        if (licenseText.length > 0) {
                            this.licenseText = licenseText;
                            this.file = null;
                            this.updateFileLabel('');
                            this.showLicenseTextReady();
                        }
                    }.bind(this));
            },

            renderValidation: function() {
                if (this.file || (this.licenseText.length > 0)) {
                    this.updateFileLabel('');
                    this.resetProgressBar();
                    this.showValidationProgress();
                }
                else {
                    return;
                }

                if (this.file) {
                    var reader = new FileReader();
                    var stringBuffer;

                    reader.onprogress = function(f) {
                        var percentageLoaded = 0;
                        if (f.lengthComputable) {
                            percentageLoaded = Math.round((f.loaded * 100) / f.total);
                            this.updateProgressBar(percentageLoaded);
                        }
                    }.bind(this);

                    reader.onerror = function(e) {
                        this.showValidationError();
                    }.bind(this);

                    reader.onloadend = function(e) {
                        stringBuffer = reader.result;
                        this.updateProgressBar(100);
                        this.renderResults(this.file.name, stringBuffer);
                    }.bind(this);

                    reader.readAsText(this.file);
                    return;
                }

                if (this.licenseText.length > 0) {
                    this.renderResults('', this.licenseText);
                }

            },

            updateProgressBar: function(percentageLoaded) {
                this.$(Modal.BODY_SELECTOR).find('.progress-bar').css('width', percentageLoaded.toString() + '%');
            },

            resetProgressBar: function() {
                this.updateProgressBar(0);
            },

            getUpgradeDescription: function(newLicenseGroup, newExpirationTime, resetLicense) {
                if (resetLicense) {
                    return _('You are about to reset your license violations.').t();
                }

                var currentLicenseGroup = this.activeGroup.entry.get('name').trim();
                var newDateOfExpiration = new Date(newExpirationTime);

                //find latest expiration date among active licenses
                var currentExpirationDates = [];
                var latestExpirationDate = null;

                _.each(this.model.serverInfo.entry.content.get('licenseKeys'), function(licenseKey) {
                    var adjusted = 0;
                    var license = this.collection.licenses.find(function(license) {
                        return license.entry.content.get('license_hash') == licenseKey;
                    });

                    if (license.entry.content.get('expiration_time')) {
                        adjusted = parseInt(license.entry.content.get('expiration_time'), 10) * 1000;
                        currentExpirationDates.push(adjusted);
                    }

                    if (license.entry.content.get('absolute_expiration_time')) {
                        adjusted = parseInt(license.entry.content.get('absolute_expiration_time'), 10) * 1000;
                        currentExpirationDates.push(adjusted);
                    }
                }, this);

                //sort expiration dates
                if (currentExpirationDates.length > 0) {
                    currentExpirationDates.sort(function(a, b) { return a - b; });
                    latestExpirationDate = new Date(currentExpirationDates[currentExpirationDates.length - 1]);
                }

                if ((currentLicenseGroup == 'Lite') && (newLicenseGroup == 'Lite')) {
                    if (this.model.serverInfo.isLicenseStateExpired()) {
                        return _('You are about to extend the duration of your Splunk Light Term license.').t();
                    }

                    if (latestExpirationDate && (latestExpirationDate.getFullYear() < 2030) && (newDateOfExpiration > latestExpirationDate)) {
                        return _('You are about to extend the duration of your Splunk Light Term license.').t();
                    }

                    if (latestExpirationDate && (latestExpirationDate.getFullYear() < 2030)) {
                        return _('You are about to add capacity to your Splunk Light Term license.').t();
                    }

                    if (latestExpirationDate && (latestExpirationDate.getFullYear() >= 2030)) {
                        return _('You are about to add capacity to your Splunk Perpetual license.').t();
                    }
                }
                else {
                    if ((currentLicenseGroup == 'Lite_Free') && (newLicenseGroup == 'Lite')) {
                        if (newDateOfExpiration.getFullYear() >= 2030) {
                            return _('You are about to upgrade from Splunk Light free to Splunk Perpetual license.').t();
                        }
                        else {
                            return _('You are about to upgrade from Splunk Light free to Splunk Light Term license.').t();
                        }
                    }

                    if (newLicenseGroup == 'Enterprise') {
                        return _('You are about to upgrade to Splunk Enterprise. This upgrade cannot be reversed. Learn more about the difference between Splunk Enterprise and Splunk Light: ').t();
                    }
                }
                return _('').t();
            },

            renderResults: function(fileName, stringBuffer) {
                if (this.children.results) {
                    this.children.results.remove();
                    delete this.children.results;
                }

                if (stringBuffer && (stringBuffer.trim().length > 0)) {

                    try {
                        var $xml = $($.parseXML(stringBuffer));
                    }
                    catch(e) {
                        this.showValidationError();
                        return;
                    }

                    //check for existing license group
                    var $licenseGroup = $xml.find('group_id');
                    if ($licenseGroup.length != 1) {
                        this.showValidationError();
                        return;
                    }

                    //check validity if reset license
                    var foundResetWarnings = false;
                    var $features = $xml.find('features');
                    if ($features.length > 0) {
                        var featureList = $features.find('feature');

                        for (var i = 0; i < featureList.length; i++) {
                            var feature = featureList[i];
                            if (feature.childNodes && feature.childNodes[0].data && feature.childNodes[0].data.trim() == "ResetWarnings") {
                                foundResetWarnings = true;
                                break;
                            }
                        }
                    }

                    if (this.model.serverInfo.isLite() && foundResetWarnings && (this.activeGroup.entry.get('name') != $licenseGroup.text())) {
                        this.showValidationError();
                        return;
                    }

                    //check for existing and valid expiration date
                    var $expirationTime = $xml.find('expiration_time');
                    if ($expirationTime.length == 1) {
                        var expirationTime = parseInt($expirationTime.text(), 10);
                        if (isNaN(expirationTime)) {
                            this.showValidationError();
                            return;
                        }

                        //unix time stamp vs. javascript timestamp
                        if (expirationTime*1000 < Date.now()) {
                            this.showValidationError();
                            return;
                        }
                    }

                    var $absoluteExpirationTime = $xml.find('absolute_expiration_time');
                    if ($absoluteExpirationTime.length == 1) {
                        var absoluteExpirationTime = parseInt($absoluteExpirationTime.text(), 10);
                        if (isNaN(absoluteExpirationTime)) {
                            this.showValidationError();
                            return;
                        }

                        //unix time stamp vs. javascript timestamp
                        if (absoluteExpirationTime*1000 < Date.now()) {
                            this.showValidationError();
                            return;
                        }
                    }

                    if (($expirationTime.length == 0) && ($absoluteExpirationTime.length == 0)) {
                        this.showValidationError();
                        return;
                    }
                }
                else {
                    return; //no license XML to process
                }

                //display successful validation dialog
                var descriptionText = this.getUpgradeDescription($licenseGroup.text(), parseInt($expirationTime.text(), 10) * 1000, foundResetWarnings);
                var learnMoreLink = route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'learnmore.license.features'
                );
                this.children.results = new ResultsView({fileName : fileName, descriptionText : descriptionText, learnMoreLink : learnMoreLink});
                this.$(Modal.BODY_SELECTOR).html(this.children.results.render().el);
                if (foundResetWarnings) {
                    this.$(Modal.HEADER_TITLE_SELECTOR).html(_('Reset Warnings').t());
                }
                var licenseButtonText;
                if ($licenseGroup.text() == 'Lite') {
                    licenseButtonText = foundResetWarnings ? _('Reset').t() : _('Upgrade').t();
                    this.$(Modal.FOOTER_SELECTOR).html('<a href="#" class="btn btn-primary modal-btn-primary upload-license-btn pull-right">' + licenseButtonText + '</a>');
                }
                else if ($licenseGroup.text() == 'Enterprise') {
                    licenseButtonText = _('Upgrade to ').t() + $licenseGroup.text();
                    this.$(Modal.BODY_SELECTOR).find('.enterprise-learn-more').show();
                    this.$(Modal.FOOTER_SELECTOR).html('<a href="#" class="btn btn-primary modal-btn-primary upload-license-btn upgrade-enterprise-btn pull-right">' + licenseButtonText + '</a>');
                }
                else {
                    licenseButtonText = foundResetWarnings ? _('Reset').t() : _('Upgrade to ').t() + $licenseGroup.text();
                    this.$(Modal.FOOTER_SELECTOR).html('<a href="#" class="btn btn-primary modal-btn-primary upload-license-btn pull-right">' + licenseButtonText + '</a>');
                }

                this.$(Modal.FOOTER_SELECTOR).append('<a href="#" class="btn modal-btn-primary back-license-btn pull-right">' + _('Back').t() + '</a>');

                if (!this.model.serverInfo.isLicenseStateExpired()) {
                    this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                }

                this.$(Modal.FOOTER_SELECTOR).find('.upload-license-btn').bind('click', function(fileName, stringBuffer, e) {
                    e.preventDefault();

                    var license = new LicenseModel();

                    if ((!fileName) || (fileName.trim().length == 0)) {
                        var timestamp = i18n.format_datetime((Date.now() / 1000).toFixed());
                        timestamp = timestamp.split(' ').join('_').replace(/,/g, '').replace(/:/g, '_');
                        fileName = 'web_' + timestamp;
                    }

                    license.entry.content.set({'name' : fileName, 'payload' : stringBuffer});
                    license.save({}, {
                        success:
                            function(createdLicense) {
                                this.collection.licenses.add(createdLicense);
                                this.showSuccessModal();
                            }.bind(this),

                        error:
                            function(license, error) {
                                this.$(Modal.BODY_SELECTOR).find('.license-upload-error').show();
                            }.bind(this)
                    });
                }.bind(this, fileName, stringBuffer));
            },

            showSuccessModal: function() {
                this.hide();
                this.trigger('successLicensing');
            },

            showBrowserWarning: function() {
                this.$(Modal.BODY_SELECTOR).find('.uploadControlWrapper').hide();
                this.$(Modal.BODY_SELECTOR).find('.license-pastebin').hide();
                this.$(Modal.BODY_SELECTOR).find('.license-progress-control').hide();
                this.$(Modal.BODY_SELECTOR).find('.progress').hide();
                this.$(Modal.BODY_SELECTOR).find('.license-validation-error').hide();
                this.$(Modal.BODY_SELECTOR).find('.multiple-files-error').hide();
                this.$(Modal.FOOTER_SELECTOR).find('.add-license-btn').addClass('disabled');
                this.$(Modal.BODY_SELECTOR).find('.browser-warning').show();
            },

            showMultipleFilesError: function() {
                if (this.file) {
                    this.file = null;
                }
                this.updateFileLabel('');
                this.licenseText = '';

                this.$(Modal.BODY_SELECTOR).find('.browser-warning').hide();
                this.$(Modal.BODY_SELECTOR).find('.uploadControlWrapper').show();
                this.$(Modal.BODY_SELECTOR).find('.license-pastebin-textarea')[0].value = '';
                this.$(Modal.BODY_SELECTOR).find('.license-pastebin').hide();
                this.$(Modal.BODY_SELECTOR).find('.license-progress-control').hide();
                this.$(Modal.BODY_SELECTOR).find('.progress').hide();
                this.$(Modal.BODY_SELECTOR).find('.license-validation-error').hide();
                this.$(Modal.FOOTER_SELECTOR).find('.add-license-btn').addClass('disabled');
                this.$(Modal.BODY_SELECTOR).find('.multiple-files-error').show();
                this.updateFileLabel('');
            },

            showValidationProgress: function() {
                this.$(Modal.BODY_SELECTOR).find('.browser-warning').hide();
                this.$(Modal.BODY_SELECTOR).find('.multiple-files-error').hide();
                this.$(Modal.BODY_SELECTOR).find('.uploadControlWrapper').hide();
                this.$(Modal.BODY_SELECTOR).find('.license-pastebin').hide();
                this.$(Modal.BODY_SELECTOR).find('.license-validation-error').hide();
                this.$(Modal.BODY_SELECTOR).find('.license-progress-control').show();
                this.$(Modal.BODY_SELECTOR).find('.progress').show();
                this.$(Modal.FOOTER_SELECTOR).find('.add-license-btn').addClass('disabled');
            },

            showValidationError: function() {
                if (this.file) {
                    this.file = null;
                }
                this.updateFileLabel('');
                this.licenseText = '';

                this.$(Modal.BODY_SELECTOR).find('.browser-warning').hide();
                this.$(Modal.BODY_SELECTOR).find('.multiple-files-error').hide();
                this.$(Modal.BODY_SELECTOR).find('.uploadControlWrapper').show();
                this.$(Modal.BODY_SELECTOR).find('.license-pastebin-textarea')[0].value = '';
                this.$(Modal.BODY_SELECTOR).find('.license-pastebin').hide();
                this.$(Modal.BODY_SELECTOR).find('.license-progress-control').hide();
                this.$(Modal.BODY_SELECTOR).find('.progress').hide();
                this.$(Modal.BODY_SELECTOR).find('.license-validation-error').show();
                this.$(Modal.FOOTER_SELECTOR).find('.add-license-btn').addClass('disabled');
            },

            showLicenseFileReady: function() {
                this.$(Modal.BODY_SELECTOR).find('.browser-warning').hide();
                this.$(Modal.BODY_SELECTOR).find('.license-validation-error').hide();
                this.$(Modal.BODY_SELECTOR).find('.license-pastebin').hide();
                this.$(Modal.BODY_SELECTOR).find('.license-progress-control').hide();
                this.$(Modal.BODY_SELECTOR).find('.progress').hide();
                this.$(Modal.BODY_SELECTOR).find('.multiple-files-error').hide();
                this.$(Modal.FOOTER_SELECTOR).find('.add-license-btn').removeClass('disabled');
            },

            showLicenseTextReady: function() {
                this.$(Modal.BODY_SELECTOR).find('.browser-warning').hide();
                this.$(Modal.BODY_SELECTOR).find('.license-validation-error').hide();
                this.$(Modal.BODY_SELECTOR).find('.license-progress-control').hide();
                this.$(Modal.BODY_SELECTOR).find('.progress').hide();
                this.$(Modal.BODY_SELECTOR).find('.multiple-files-error').hide();
                this.$(Modal.FOOTER_SELECTOR).find('.add-license-btn').removeClass('disabled');
                this.$(Modal.BODY_SELECTOR).find('.license-pastebin').show();
            },

            updateFileLabel: function(fileName) {
                this.$(Modal.BODY_SELECTOR).find('.license-file-name')[0].innerHTML = fileName;
            }
        });
    }
);
