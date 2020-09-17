define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'views/shared/controls/ControlGroup',
        'views/shared/FlashMessages',
        'views/shared/FlashMessagesLegacy',
        'splunk.util',
        'views/shared/Faq',
        'models/config',
        'collections/shared/FlashMessages',
        'uri/route',
		'contrib/text!views/add_data/input_forms/FileUpload.html',
        'contrib/text!views/add_data/input_forms/Dropzone.html',
        'views/shared/pcss/dropzone.pcss',
		'jquery.fileupload'// jquery.iframe-transport //NO IMPORT
    ],
    function (
        $,
        _,
        module,
        BaseView,
        ControlGroup,
        FlashMessagesView,
        FlashMessagesLegacyView,
        splunkUtil,
        Faq,
        ConfigModel,
        FlashMessagesCollection,
        route,
        template,
        dropzoneTemplate,
        cssDropzone
    ) {
        return BaseView.extend({
            moduleId: module.id,
            template: template,
            dropzoneTemplate: dropzoneTemplate,
            events: {
                'click .upload-file-button': function(e) {
                    e.preventDefault();
                    this.$('#inputReference').click();
                }
            },
            initialize: function (options) {
                BaseView.prototype.initialize.apply(this, arguments);
                this.maxFileSize = ConfigModel.get('MAX_UPLOAD_SIZE');

                if(this.model.input){
                    //clear set sourcetype so datapreview autodetection will work on next run
                    this.model.input.unset('ui.sourcetype');
                }

                this.children.faq = new Faq({faqList: this.faqListUpload});

                this.compiledDropzoneTemplate = _.template(this.dropzoneTemplate);

                //use this flashmessage for input model
                this.children.flashMessages = new FlashMessagesView({
                    model: {
                        input: this.model.input
                    }
                });

                //ise this flashmessages is for front end errors
                this.collection.flashMessages = new FlashMessagesCollection();
                this.children.flashMessagesLegacy = new FlashMessagesLegacyView({
                    collection: this.collection.flashMessages
                });

            },
            render: function () {
                //remove any old fileReferences
                this.$('#inputReference').remove();

                var helpLinkUpload = route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'learnmore.adddata.upload'
                );

                var helpLinkBrowser = route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'learnmore.adddata.browser'
                );

                var template = this.compiledTemplate({
                    inputMode: this.model.wizard.get("inputMode"),
                    helpLinkUpload: helpLinkUpload,
                    helpLinkBrowser: helpLinkBrowser,
                    maxFileSize:  Math.floor(this.maxFileSize/1024/1024)
                });
                this.$el.html(template);

                this.$('.dropzone-container').html(this.compiledDropzoneTemplate({
                    size: 'large',
                    dropBoxLabel: _('Drop your data file here').t()
                }));

                if (!window.File) {
                    this.$('.browserWarning').show();
                    this.$('.uploadControlWrapper').hide();
                }

                this.$('#flashmessages-placeholder')
                    .html(this.children.flashMessages.render().el)
                    .append(this.children.flashMessagesLegacy.render().el);

                this.renderUpload.call(this);

                this.$el.append(this.children.faq.render().el);

                return this;
            },
            renderUpload: function(){
                var that = this;
                var dropzone = this.$('.dropzone');
                var inputReference = this.$('#inputReference');
                var file;
                this.updateSelectedFileLabel();

                inputReference
                    .on('change', function(e){
                        file = e.target.files[0];
                        if(file){
                            that.model.input.set('ui.name', file.name);
                            that.updateSelectedFileLabel();
                            that.sendFile.apply(that, [file]);
                        }
                    });

                dropzone
                    .on('drop', function(e){
                        e.stopPropagation();
                        e.preventDefault();
                        var files = e.originalEvent.dataTransfer.files;
                        if(files.length > 1){
                            that.collection.flashMessages.reset([{
                                key: 'multiplefiles',
                                type: 'error',
                                html: _('Multiple files selected. Try again, with only one file selected.').t()
                            }]);
                        }else{
                            var file = files[0];
                            that.model.input.set('ui.name', file.name);
                            that.updateSelectedFileLabel();
                            that.sendFile.apply(that, [file]);
                        }
                    })
                    .on('dragover', function (e) {
                        e.preventDefault();
                    });
            },
            isInputValid: function(file){
                //check file size
                if(file.size > this.maxFileSize){
                    var maxFileSizeMb = Math.floor(this.maxFileSize/1024/1024);
                    var fileSizeMb = Math.floor(file.size/1024/1024);

                    this.collection.flashMessages.reset([{
                        key: 'fileTooLarge',
                        type: 'error',
                        html: splunkUtil.sprintf(_('File too large. The file selected is %sMb. Maximum file size is %sMb').t(), fileSizeMb, maxFileSizeMb)
                    }]);
                    return false;
                }

                //check if this is an archive file
                if(this.model.input.isArchive(file.name)){
                    this.model.input.set({file: file});
                    this.model.wizard.set('isArchive', true);
                    this.model.wizard.trigger('enableWizardSteps');

                    this.collection.flashMessages.reset([{
                        key: 'filearchive',
                        type: 'warning',
                        html: _('Preview is not supported for this archive file, but it can still be indexed.').t()
                    }]);

                    return false;
                } else {
                    this.model.wizard.set('isArchive', false);
                }

                return true;

            },
            sendFile: function(file){
                var that = this;
                this.model.wizard.trigger('disableWizardSteps');
                this.collection.flashMessages.reset();

                this.resetProgressBar();

                if(this.fileUploadXhr){
                    this.fileUploadXhr.abort();
                }

                if(!this.isInputValid(file)){
                    this.$('.progress').hide();
                    return;
                }

                this.inputFile = file;

                var data = new window.FormData();
                var uploadEndpoint = route.indexingPreviewUpload(this.model.application.get('root'), this.model.application.get('locale')) +'?output_mode=json&props.NO_BINARY_CHECK=1&input.path='+encodeURIComponent(file.name);
                data.append('spl-file', file);

                this.fileUploadXhr = $.ajax({
                    url: uploadEndpoint,
                    data: data,
                    cache: false,
                    contentType: false,
                    processData: false,
                    type: 'POST',
                    success: this.onSendDone.bind(this),
                    error: this.onSendFail.bind(this),
                    xhr: function(){
                        var xhr = new window.XMLHttpRequest();
                        xhr.upload.addEventListener("progress", that.onSendProgress.bind(this));
                        return xhr;
                    }.bind(this)
                });

                this.$('.progress').show();
            },
            onSendProgress: function (e) {
                if(e.lengthComputable){
                    var loaded = e.loaded || 0;
                    var total = e.total || 1;
                    var progress = Math.round((loaded / total)*100);
                    this.updateProgressBar(progress, progress+'%');
                }
            },
            onSendDone: function (data, status) {
                if (status === 'success' && data && data.messages && data.messages[0]) {
                    this.finished = true;
                    var sid = data.messages[0].text;
                    this.model.wizard.set('previewsid', sid);
                    this.model.wizard.set('isBinary', false);
                    this.model.input.set({file: this.inputFile});
                    this.model.input.validate();
                    this.model.wizard.trigger('enableWizardSteps');
                    this.updateProgressBar(100, _('Done').t(), false);
                }else{
                    this.onSendFail();
                }
            },
            onSendFail: function(e){
                var msg = '';
                this.resetProgressBar();
                if (e.responseJSON && e.responseJSON.messages && e.responseJSON.messages[0]) {
                    msg = e.responseJSON.messages[0].text;
                    this.collection.flashMessages.reset([{
                        key: 'sendfail',
                        type: 'error',
                        html: _(msg).t()
                    }]);
                }

                if (msg.indexOf('Cannot preview binary file:') === 0) {
                    this.collection.flashMessages.reset([{
                        key: 'binaryfile',
                        type: 'warning',
                        html: _('Preview is not supported for this binary file, but it can still be indexed.').t()
                    }]);
                    this.model.wizard.set('isBinary', true);
                    this.model.input.set({file: this.inputFile});
                    this.model.wizard.trigger('enableWizardSteps');
                }

                if (!e || (msg.length < 1 && e.statusText !== 'abort')){
                    this.collection.flashMessages.reset([{
                        key: 'unspecifiedfail',
                        type: 'error',
                        html: _('Unspecified upload error. Refresh and try again.').t()
                    }]);
                }
            },
            resetProgressBar: function(){
                this.finished = false;
                this.updateProgressBar(0, '', false);
                this.$('.progress').hide();
            },
            updateProgressBar: function(progress, text, spin){
                if(progress === 100 && this.finished === false){
                    text = _('Generating data preview...').t();
                    spin = true;
                }
                var $bar = this.$('.progress-bar').css('width', progress+'%');
                $bar.find('.sr-only').html(text);

                if(spin === true){
                    $bar.addClass('progress-striped active');
                }else if(spin === false){
                    $bar.removeClass('progress-striped active');
                }

            },
            updateSelectedFileLabel: function() {
                var filename = this.model.input.get('ui.name');
                if (filename) {
                    this.$('.source-label').text(filename);
                } else {
                    this.$('.source-label').text(_('No file selected').t());
                }
            },
            faqListUpload: [
                {
                    question: _('What kinds of files can Splunk index?').t(),
                    answer: _('Many kinds. Splunk recognizes many different file formats, and you can \
                    configure it to recognize many more.').t()
                },
                {
                    question: _('What is a source?').t(),
                    answer: _('A source is a file, a network stream, or a specialized output such as a Windows Event Log \
                    channel. Splunk uses the "source" field of an indexed event to identify the event\’s \
                    original location or method of input.').t()
                },
                {
                    question: _('How do I get remote data onto my Splunk instance?').t(),
                    answer: _('If the data is on a machine on the same network, you can map or mount a drive to access \
                    the data. The most popular option is to forward the data by installing a universal forwarder on \
                    the machine that contains the data.').t()
                }
            ]

        });
    }
);
