/**
 * Created by rtran on 3/28/16.
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/Base',
    'views/shared/FlashMessagesLegacy',
    'collections/shared/FlashMessages',
    'contrib/text!views/add_data/input_forms/Dropzone.html',
    'views/shared/pcss/dropzone.pcss',
    './SelectAppFile.pcss'
], function(
    $,
    _,
    Backbone,
    module,
    BaseView,
    FlashMessagesLegacyView,
    FlashMessagesCollection,
    DropzoneTemplate,
    css
) {
    var LABELS = {
        title: _('Select App File').t(),
        description: _('Choose a file by either browsing your computer or dropping the file into the target box below.').t(),
        dropBoxLabel: _('Drop your app file here').t(),
        btnLabel: _('Select App File').t()
    };

    /**
     * options:
     * viewSize:[small|large] option for small or large view (generally, small is used for dialogs)
     */
    return BaseView.extend({
        dropzoneTemplate: DropzoneTemplate,
        moduleId: module.id,

        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            this.viewSize = this.options.viewSize;

            this.collection = this.collection || {};
            this.collection.flashMessages = this.collection.flashMessages || new FlashMessagesCollection();
            this.model = this.model || {};

            this.hasWizard = !!this.model.wizard;
            this.compiledDropzoneTemplate = _.template(this.dropzoneTemplate);

            if (this.hasWizard) {
                this.listenTo(this.model.wizard, 'clearFile', function() {
                    this.updateFile(null);
                });
            }
        },

        events: {
            'click .file-upload-button': function(e) {
                e.preventDefault();
                this.$('.input-reference').click();
            },

            'change .file-input': function(e) {
                var file = e.target.files[0];
                if (file) {
                    this.collection.flashMessages.reset();
                    this.updateFile(file);
                }
            },

            'drop .dropzone': function(e) {
                e.stopPropagation();
                e.preventDefault();
                var files = e.originalEvent.dataTransfer.files;
                if (files.length > 1) {
                    this.updateFile(null);
                    this.collection.flashMessages.reset([{
                        type: 'error',
                        html: _.escape(_('Multiple files selected. Try again, with only one file selected.').t())
                    }]);
                } else {
                    this.collection.flashMessages.reset();
                    var file = files[0];
                    this.updateFile(file);
                }
            },

            'dragover .dropzone': function(e) {
                e.preventDefault();
            }
        },

        updateFile: function(file) {
            if (!file) {
                if (this.hasWizard) { this.model.wizard.trigger('disableNext'); }
                this.model.appModel.entry.content.unset('data');
                this.$('.file-name').text(_('No file selected').t());
            } else {
                if (this.hasWizard) { this.model.wizard.trigger('enableNext'); }
                this.model.appModel.entry.content.set('data', file);
                this.$('.file-name').text(file.name);
            }
        },

        render: function() {
            this.$el.append(this.compiledTemplate({
                title: LABELS.title,
                description: LABELS.description,
                btnLabel: LABELS.btnLabel
            }));

            this.$('.dropzone-container').append(this.compiledDropzoneTemplate({
                size: this.viewSize,
                dropBoxLabel: LABELS.dropBoxLabel
            }));

            return this;
        },
        template: '\
        <div class="content-section upload-app-section">\
            <h3 class="content-title"><%- title %></h3>\
        </div>\
        <div class="content-body upload-app-body">\
            <p><%- description %></p>\
            <p>Selected file: <span class="file-name">No file selected</span></p>\
            <a class="btn file-upload-button file-button"><%- btnLabel %></a>\
            <input type="file" class="file-input input-reference hide" />\
            <div class="dropzone-container"></div>\
        </div>'
    });
});