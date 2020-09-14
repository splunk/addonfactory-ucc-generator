/**
 * Manual Mode editor containing text area for manual regex input and other controls.
 * Clicking '.preview-button' causes MatchResultsTableMaster to display highlighting from current manual regex.
 */
define([
            'jquery',
            'underscore',
            'module',
            'models/Base',
            'views/Base',
            'views/shared/controls/ControlGroup',
            'util/keyboard',
            'uri/route',
            'util/field_extractor_utils'
        ],
        function(
            $,
            _,
            module,
            BaseModel,
            BaseView,
            ControlGroup,
            keyboardUtils,
            route,
            fieldExtractorUtils
        ) {

    return BaseView.extend({

        moduleId: module.id,
        className: 'manual-extraction-editor',

        events: {
            'click .save-button': function(e) {
                e.preventDefault();
                if(this.isEnabled('.save-button')){
                    this.preview();
                    this.trigger('action:save');
                }
            },
            'click .preview-button': function(e) {
                e.preventDefault();
                if(this.isEnabled('.preview-button')){
                    this.preview();
                }
            },
            'keydown .regex-text-area': function(e) {
                if(e.which === keyboardUtils.KEYS.ENTER) {
                    e.preventDefault();
                    $(e.target).trigger('change');
                    this.preview();
                }
            },
            'click .preview-in-search-button': function(e) {
                e.preventDefault();
                if(this.isEnabled('.preview-in-search-button')){
                    this.preview();
                    this.trigger('action:previewInSearch');
                }
            },
            'click .automatic-mode-button': function(e) {
                e.preventDefault();
                this.trigger('action:selectAutomaticMode');
            }
        },

        /**
         * @constructor
         *
         * @param options {Object} {
         *     model: {
         *         state {Model} model to track the state of the editing process
         *     }
         * }
         */

        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);

            this.model.regexMediator = new BaseModel(this.model.state.pick('regex'));
            this.children.regexEditor = new ControlGroup({
                controls: {
                    type: 'Textarea',
                    options: {
                        model: this.model.regexMediator,
                        modelAttribute: 'regex',
                        textareaClassName: 'regex-text-area'
                    }
                }
            });
            this.listenTo(this.model.state, 'change:interactiveMode', this.render);
            this.listenTo(this.model.state, 'change:regex', function() {
                this.model.regexMediator.set(this.model.state.pick('regex'));
            });
            this.listenTo(this.model.state, 'change:errorState', function() {
                this.updateSaveAndSearch();
            });
        },

        isValidRegex: function() {
            var regex = this.children.regexEditor.$('textarea').val(),//this.model.regexMediator.get('regex'), -- not always up to date
                fieldNames = fieldExtractorUtils.getCaptureGroupNames(regex);
            return (fieldNames.length > 0) && !this.model.state.get('errorState');
        },

        preview: function() {
            this.model.state.set(this.model.regexMediator.pick('regex'));
            this.disablePreview();
        },

        disableSaveAndSearch: function() {
            this.$('.save-button').addClass('disabled');
            this.$('.preview-in-search-button').addClass('disabled');
        },

        enableSaveAndSearch: function() {
            this.$('.save-button').removeClass('disabled');
            this.$('.preview-in-search-button').removeClass('disabled');
        },

        updateSaveAndSearch: function() {
            if(this.isValidRegex()){
                this.enableSaveAndSearch();
            }else{
                this.disableSaveAndSearch();
            }
        },

        disablePreview: function() {
            if(!$('.preview-button').hasClass('disabled')){
                this.$('.preview-button').addClass('disabled');
            }
        },

        enablePreview: function() {
            this.$('.preview-button').removeClass('disabled');
        },

        onInputChange: function() {
            this.enablePreview();
            this.updateSaveAndSearch();
        },

        isEnabled: function(className) {
            var button = this.$(className);
            return (button && !button.hasClass('disabled'));
        },

        cleanupState: function() {
            this.model.regexMediator.set(this.model.state.pick('regex'));
        },

        render: function() {
            this.children.regexEditor.detach();
            var requiredText = "";
            if(this.model.state.get('requiredText')) {
                requiredText = this.model.state.get('requiredText');
            }
            this.$el.html(this.compiledTemplate({
                requiredText: requiredText,
                regexHelpHref: route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'learnmore.about.regex'
                )
            }));
            this.children.regexEditor.render().appendTo(this.$('.regex-editor-wrapper'));

            if(!this.model.state.get('regex') || !this.isValidRegex()){
                this.disableSaveAndSearch();
            }

            this.$('.regex-text-area').on('input', _.bind(function() {
                this.onInputChange();
            }, this));

            return this;
        },

        template: '\
            <div class="manual-extraction-editor-header">\
                <div class="alert alert-warning edit-regex-warning" style="display:none"><i class="icon-alert"></i>\
                    <%- _("If you manually edit and then preview the regular expression below, you cannot return to the automatic field extraction workflow.").t() %>\
                </div>\
                <% if(requiredText) { %>\
                    <div class="alert alert-info required-text-warning"><i class="icon-alert"></i>\
                        <%- _("When editing the Regular Expression, required text is not highlighted in the Preview panel.").t() %>\
                    </div>\
                <% } %>\
                <div class="instruction">\
                    <%- _("Use the event listing below to validate the field extractions produced by your regular expression.").t() %>\
                </div>\
                <h4 class="input-title"><%- _("Regular Expression").t() %></h4>\
                <a href="#" class="preview-in-search-button">\
                    <%- _("View in Search").t() %>\
                    <i class="icon-external"></i>\
                </a>\
                <a href="<%- regexHelpHref %>" class="regex-docs-link" target="_blank">\
                    <%- _("Regular Expression Reference").t() %>\
                    <i class="icon-external"></i>\
                </a>\
            </div>\
            <div class="regex-editor-wrapper"></div>\
            <div class="manual-extraction-editor-footer">\
                <!-- These buttons are floating right, so they are in reverse order -->\
                <a href="#" class="btn btn-primary save-button"><%- _("Save").t() %></a>\
                <a href="#" class="btn preview-button disabled"><%- _("Preview").t() %></a>\
            </div>\
            <div class="clearfix"></div>\
        '

    });

});
