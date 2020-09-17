/**
 * @author ahebert
 * @date 5/20/16
 *
 * This dialog allows user to change the background image of the login page.
 */
define(
    [
        "jquery",
        "underscore",
        'backbone',
        'uri/route',
        'models/services/data/inputs/Upload',
        'models/services/Message',
        "views/Base",
        'views/shared/FlashMessages',
        'views/shared/FlashMessagesLegacy',
        'views/shared/RestartRequired',
        'views/shared/Restart',
        'views/shared/ModalLocalClassNames',
        'collections/shared/FlashMessages',
        'contrib/text!./Master.html',
        'splunk.util',
        'util/keyboard',
        'util/login_page',
        './Master.pcss'
    ],
    function(
        $,
        _,
        Backbone,
        route,
        UploadModel,
        MessageModel,
        BaseView,
        FlashMessagesView,
        FlashMessagesLegacyView,
        RestartRequiredModal,
        RestartModal,
        Modal,
        FlashMessagesCollection,
        template,
        SplunkUtil,
        Keyboard,
        LoginPageUtils,
        css
    ) {
        /*
            CSS classes applied on top of the background to simulate login form on the preview container.
         */
        var LoginFormClass = {
            ENTERPRISE: "login-form-se",
            LITE: "login-form-sl",
            CLOUD: "login-form-sc"
        };

        // 20 Mb
        var MAX_FILE_SIZE = 20 * 1024 * 1024;

        // This array should match the array that is used on the server side validation.
        var AUTHORIZED_FILE_EXTENSIONS = ['jpg', 'jpeg', 'png'];

        return BaseView.extend({
            template: template,

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                this.systemSettingsURL = "systemsettings";
                this.isCloud = this.model.serverInfo.isCloud();
                this.isLite = this.model.serverInfo.isLite();

                this.model.input = new UploadModel();

                this.children.generalMessages = new FlashMessagesView();

                this.children.uploadMessages = new FlashMessagesView({
                    model: {
                        input: this.model.input
                    }
                });

                // Use this flash messages is for front end errors
                this.collection.generalMessages = new FlashMessagesCollection();
                this.collection.uploadMessages = new FlashMessagesCollection();

                this.children.generalMessagesLegacy = new FlashMessagesLegacyView({
                    collection: this.collection.generalMessages
                });
                this.children.uploadMessagesLegacy = new FlashMessagesLegacyView({
                    collection: this.collection.uploadMessages
                });

                this.loginCustomBackgroundImage = this.model.web.entry.content.get('loginCustomBackgroundImage');
                this.loginBackgroundImageOption = this.model.web.entry.content.get('loginBackgroundImageOption');

                this.animationSpeed = 300;
                this.isPreviewExpanded = false;

                // Register onKeyDown event since it should listen on the entire window.
                $(window).on('keydown.' + this.cid, function(e) {
                    this.onKeyDown(e);
                }.bind(this));

                this.model.wizard = this.model.wizard || new Backbone.Model();
                this.model.wizard.set('step', 0);
                this.model.wizard.on('change:step', function() {
                    this.visibility();
                }, this);

                this.children.success = new RestartRequiredModal({
                    model: {
                        serverInfo: this.model.serverInfo
                    },
                    message: SplunkUtil.sprintf(_("Settings successfully saved. You must restart %s for changes to take effect.").t(),
                        this.model.serverInfo.getProductName()),
                    restartCallback: function() {
                        this.model.wizard.set('step', 2);
                    }.bind(this)
                });

                this.children.success.on('hide', function(event) {
                    if (event && event.reason) {
                        this.model.wizard.set('step', 0);
                    }
                }.bind(this));

                this.children.restart = new RestartModal({
                    model: {
                        serverInfo: this.model.serverInfo
                    }
                });
            },

            events: {
                'click .upload-file-btn': function(e) {
                    e.preventDefault();
                    this.$('#inputReference').click();
                },
                'mouseup .bg-radio-btn': function(e) {
                    e.preventDefault();
                    var dataId = e.target.getAttribute('id');
                    e.target.checked = true;

                    this.changeBackgroundOptions(dataId);
                },
                'click .save-button': function(e) {
                    e.preventDefault();
                    this.savePreferences();
                },
                'click .preview-close': function(e) {
                    e.preventDefault();
                    this.hidePreview();
                },
                'click .preview-container': function(e) {
                    e.preventDefault();
                    if (this.isPreviewExpanded){
                        this.hidePreview();
                    } else {
                        this.showPreview();
                    }
                    this.isPreviewExpanded = !this.isPreviewExpanded;
                },
                'mouseup .bg-label': function(e) {
                    e.preventDefault();
                    var dataId = e.target.getAttribute('for');
                    this.$(dataId).prop("checked", true);

                    this.changeBackgroundOptions(dataId);
                }
            },

            changeBackgroundOptions: function(dataId) {
                this.collection.uploadMessages.reset();
                this.$("input:radio:checked").prop("checked", false);
                this.loginBackgroundImageOption = dataId;

                this.$(".upload-message").addClass('hide');
                // First time the user clicks the custom image radio button, no custom background image is uploaded yet, invite him to do so.
                if (this.loginBackgroundImageOption == LoginPageUtils.BACKGROUNDOPTIONS.CUSTOM_IMAGE) {
                    if (!this.loginCustomBackgroundImage) {
                        this.$(".save-button").addClass('disabled');
                    }
                    this.$(".upload-message").removeClass('hide');
                }
                else {
                    this.$(".save-button").removeClass('disabled');
                }
                this.updatePreviewBG();
            },

            onKeyDown: function(e) {
                if (e.which === Keyboard.KEYS.ESCAPE && this.isPreviewExpanded) {
                    this.hidePreview();
                }
            },

            /*
                Shows the preview of the login page.
             */
            showPreview: function() {
                var $previewContainer = this.$('.preview-container');
                this.previewPosition = $previewContainer.offset();
                this.previewClone = $previewContainer.clone();
                this.previewClone.appendTo(this.$('.formWrapper'));

                this.previewClone.css({
                    'position': 'fixed',
                    'top': this.previewPosition.top,
                    'left': this.previewPosition.left
                });

                this.previewClone
                    .animate({ 'top': 0 }, { queue: false, duration: this.animationSpeed })
                    .animate({ 'left': 0 }, { queue: false, duration: this.animationSpeed })
                    .animate({ 'border-radius': 0 }, { queue: false, duration: this.animationSpeed })
                    .animate({ height: '100%' }, { queue: false, duration: this.animationSpeed })
                    .animate({ width: '100%' }, { queue: false, duration: this.animationSpeed, complete: function() {
                        this.$('.preview-close').show();
                        this.$('.login-form-preview')
                            .animate({ height: '200px' }, { duration: this.animationSpeed })
                            .animate({ width: '684px' }, { queue: false, duration: this.animationSpeed, complete: function() {
                                // Hide hamburger
                                $('[data-role=sidenav-toggle]').hide();
                            }});
                    }.bind(this)});
            },

            /*
                 Hides the preview of the login page.
             */
            hidePreview: function() {
                // Restore hamburger
                $('[data-role=sidenav-toggle]').show();

                this.previewClone
                    .animate({ 'top': this.previewPosition.top }, { queue: false, duration: this.animationSpeed })
                    .animate({ 'left': this.previewPosition.left }, { queue: false, duration: this.animationSpeed })
                    .animate({ width: '300px' }, { queue: false, duration: this.animationSpeed})
                    .animate({ height: '200px' }, { queue: false, duration: this.animationSpeed })
                    .animate({ 'border-radius': '10px' }, { queue: false, duration: this.animationSpeed, complete: function() {
                        this.$('.preview-close').hide();
                        this.$('.login-form-preview')
                            .animate({ height: '50px' }, { duration: this.animationSpeed })
                            .animate({ width: '171px' }, { queue: false, duration: this.animationSpeed, complete: function() {
                                this.previewClone.remove();
                            }.bind(this)});
                    }.bind(this)});
            },

            getLoginCustomBackgroundImageFilename: function(confValue) {
                if (confValue) {
                    return confValue.split('/').pop();
                }
                return;
            },

            getCustomImageInfoClass: function(confValue) {
                if ((this.loginBackgroundImageOption == LoginPageUtils.BACKGROUNDOPTIONS.CUSTOM_IMAGE) && confValue) {
                    return "upload-message";
                }
                return "upload-message hide";
            },

            visibility: function() {
                var step = this.model.wizard.get('step');
                this.children.success.hide();
                this.children.restart.hide();
                switch (step) {
                    case 0:
                        break;
                    case 1:
                        $("body").append(this.children.success.render().el);
                        this.children.success.show();
                        break;
                    case 2:
                        $("body").append(this.children.restart.render().el);
                        this.children.restart.show();
                        break;
                }
            },

            render: function() {
                this.$('#inputReference').remove();

                this.$el.html(this.compiledTemplate({
                    pageTitle: this.options.pageTitle,
                    systemSettingsURL: this.systemSettingsURL,
                    NO_IMAGE_OPTION: LoginPageUtils.BACKGROUNDOPTIONS.NO_IMAGE,
                    DEFAULT_IMAGE_OPTION: LoginPageUtils.BACKGROUNDOPTIONS.DEFAULT_IMAGE,
                    CUSTOM_IMAGE_OPTION: LoginPageUtils.BACKGROUNDOPTIONS.CUSTOM_IMAGE,
                    CURRENT_FILENAME: this.getLoginCustomBackgroundImageFilename(this.loginCustomBackgroundImage),
                    CUSTOM_IMAGE_INFO_CLASS: this.getCustomImageInfoClass(this.loginCustomBackgroundImage),
                    LOGIN_FORM_CLASS: this.isLite ?
                        LoginFormClass.LITE : (this.isCloud? LoginFormClass.CLOUD : LoginFormClass.ENTERPRISE)
                }));

                this.$('.shared-general-flashmessages')
                    .html(this.children.generalMessages.render().el)
                    .append(this.children.generalMessagesLegacy.render().el);

                this.$('.shared-upload-flashmessages')
                    .append(this.children.uploadMessages.render().el)
                    .append(this.children.uploadMessagesLegacy.render().el);

                this.renderUpload.call(this);
                this.updatePreviewBG();

                this.$("#"+this.loginBackgroundImageOption).prop("checked", true);
                this.$el.append(this.children.success.render().el);
                this.$el.append(this.children.restart.render().el);
                this.visibility();
                return this;
            },

            renderUpload: function(){
                var that = this;
                var $inputReference = this.$('#inputReference');
                var file;

                $inputReference.on('change',
                    function(e){
                        file = e.target.files[0];
                        if (file && that.isInputValid(file)) {
                            that.setImage(file);
                        }
                    }
                );
            },

            setImage: function(file) {
                this.collection.uploadMessages.reset();
                var newFileName = file.name.split(' ').join('_');
                this.model.input.set('ui.name', newFileName);
                this.uploadFile(file, newFileName);
            },

            /*
                Upload the background image file.
             */
            uploadFile: function(file, filename) {
                var that = this;

                if (window.FormData) {
                    var formdata = new FormData();
                    formdata.append("image", file);
                    formdata.append("filename", filename);

                    $.ajax({
                        url: "/en-US/api/manager/uploadbgimg",
                        type: "POST",
                        data: formdata,
                        processData: false,
                        contentType: false,
                        success: function(response) {
                            var defaultApp = 'search',
                                defaultDirectory = 'logincustombg';
                            that.loginCustomBackgroundImage = defaultApp+':'+defaultDirectory+'/'+filename;
                            that.updatePreviewBG();
                            that.$(".save-button").removeClass('disabled');
                            that.$('#current-filename').html(filename);
                        },
                        error: function(response){
                            that.collection.uploadMessages.reset([{
                                key: 'waiting',
                                type: 'error',
                                html: _('Error uploading image.').t()
                            }]);
                        }
                    });
                }
            },

            savePreferences: function() {
                this.model.web.save({}, {
                    patch: true,
                    data: {
                        loginBackgroundImageOption: this.loginBackgroundImageOption,
                        loginCustomBackgroundImage: this.loginCustomBackgroundImage
                    },
                    success: function(model, response) {
                        this.collection.generalMessages.reset();
                        this.model.wizard.set('step', 1);
                        this.generateRestartMessage();
                    }.bind(this),
                    error: function(model, response) {
                        this.collection.generalMessages.reset([{
                            key: 'waiting',
                            type: 'error',
                            html: _('Error saving preferences.').t()
                        }]);
                    }.bind(this)
                });
            },

            generateRestartMessage: function(){
                var restart_required_marker = "restart_required";
                var restart = _.find(this.collection.messages.models, function(message) {
                        return message.entry.get('name') === restart_required_marker;
                });

                // Create restart message if it's not already in the collection
                if (!restart) {
                    var restartMessage = new MessageModel();
                    restartMessage.entry.content.set('name', restart_required_marker);
                    restartMessage.entry.content.set('value', _("Splunk must be restarted for changes to take effect.").t());
                    restartMessage.save();
                    // Add the newly created message to the collection.
                    // This doesn't immediately trigger render of splunkbar/messages but, within 30s render will be called as
                    // splunkbar/messages is constantly fetching the messages collection.
                    this.collection.messages.add(restartMessage);
                }
            },

            /*
                Validates the input.
             */
            isInputValid: function(file){
                // check file size
                if (file.size > MAX_FILE_SIZE){
                    var maxFileSizeMb = Math.floor(MAX_FILE_SIZE / 1024 / 1024);

                    this.collection.uploadMessages.reset([{
                        key: 'fileTooLarge',
                        type: 'error',
                        html: SplunkUtil.sprintf(_('Image did not upload, as the file size is too large. The maximum file size is %sMb.').t(), maxFileSizeMb)
                    }]);
                    return false;
                }

                // check if it's a supported image format
                if (AUTHORIZED_FILE_EXTENSIONS.indexOf(file.name.toLowerCase().split('.').pop()) == -1) {
                    this.collection.uploadMessages.reset([{
                        key: 'formatNotSupported',
                        type: 'error',
                        html: _('This format is not supported or this file is not an image.').t()
                    }]);
                    return false;
                }

                // Lastly, check the image resolution but this does not prevent image upload.
                this.readImage(file);
                return true;
            },

            readImage: function(file) {
                window.URL    = window.URL || window.webkitURL;
                var useBlob   = false && window.URL; // `true` to use Blob instead of Data-URL

                var suggestedImageDimensions = {
                    height: 640,
                    width: 1024
                };
                // Create a new FileReader instance
                // https://developer.mozilla.org/en/docs/Web/API/FileReader
                var reader = new FileReader();

                // Once a file is successfully readed:
                reader.addEventListener("load", function() {

                    // At this point `reader.result` contains already the Base64 Data-URL
                    // But we want to get that image's width and height px values!
                    // Since the File Object does not hold the size of an image
                    // we need to create a new image and assign it's src, so when
                    // the image is loaded we can calculate it's width and height:
                    var image  = new Image();
                    image.addEventListener("load", function() {
                        if (image.width < suggestedImageDimensions.width || image.height < suggestedImageDimensions.height) {
                            this.collection.uploadMessages.reset([{
                                key: 'waiting',
                                type: 'info',
                                html: SplunkUtil.sprintf(_('Image successfully uploaded, but the resolution of the file is too small to display properly. For best results, use a minimum resolution of %sx%s.').t(),
                                    suggestedImageDimensions.width, suggestedImageDimensions.height)
                            }]);
                        } else {
                            this.collection.uploadMessages.reset([{
                                key: 'waiting',
                                type: 'info',
                                html: _('Image successfully uploaded.').t()
                            }]);
                        }
                    }.bind(this));

                    image.src = useBlob ? window.URL.createObjectURL(file) : reader.result;

                    // If we set the variable `useBlob` to true:
                    // (Data-URLs can end up being really large
                    // `src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAA...........etc`
                    // Blobs are usually faster and the image src will hold a shorter blob name
                    // src="blob:http%3A//example.com/2a303acf-c34c-4d0a-85d4-2136eef7d723"
                    if (useBlob) {
                        // Free some memory for optimal performance
                        window.URL.revokeObjectURL(file);
                    }
                }.bind(this));

                // https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL
                reader.readAsDataURL(file);
            },

            /*
                Updates the preview container with the current selected option.
             */
            updatePreviewBG: function() {
                var $previewFullScreenContainer = this.$('#preview-full-screen').removeAttr("style").removeClass().addClass('preview-tile');
                if (this.loginBackgroundImageOption === LoginPageUtils.BACKGROUNDOPTIONS.DEFAULT_IMAGE) {
                    var bodyClass = this.isLite ? LoginPageUtils.BODYCLASS.LITE : (this.isCloud ? LoginPageUtils.BODYCLASS.CLOUD : LoginPageUtils.BODYCLASS.ENTERPRISE);
                    $previewFullScreenContainer.addClass(bodyClass);
                } else if (this.loginBackgroundImageOption === LoginPageUtils.BACKGROUNDOPTIONS.CUSTOM_IMAGE) {
                    // When selecting custom image for the first time, this won't be defined
                    if (this.loginCustomBackgroundImage) {
                        $previewFullScreenContainer.css('background-image', 'url(' + route.loginPageBackground(
                                this.model.application.get('root'),
                                this.model.application.get('locale'),
                                this.model.serverInfo.entry.content.get('build'),
                                this.loginCustomBackgroundImage) + ')');
                    }
                }
                // else, NO_IMAGE, the background color of the CSS class will do it.
            }
        });
    }
);
