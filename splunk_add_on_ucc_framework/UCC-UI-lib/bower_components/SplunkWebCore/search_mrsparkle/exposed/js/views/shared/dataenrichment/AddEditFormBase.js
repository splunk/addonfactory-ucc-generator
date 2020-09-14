/**
 *
 * Base class for adding/editing an entity and (optionally) previewing changes.
 *
 */

define([
            'jquery',
            'underscore',
            'module',
            'views/Base'
        ],
        function(
            $,
            _,
            module,
            Base
        ) {

    return Base.extend({

        /**
         * @constructor
         *
         * options {Object} {
         *     model: {
         *         buttonSettings {Model}, required, model used to track the state of each button
         *     },
         *     flashMessagesHelper <helpers.FlashMessagesHelper>, optional,
         *          flash messages helper to use for broadcasting errors/warnings
         * }
         */
        initialize: function() {
            Base.prototype.initialize.apply(this, arguments);
            this.flashMessagesHelper = this.options.flashMessagesHelper;
            this.listenTo(this.model.buttonSettings, 'change', this._handleButtonVisibility);
        },

        events: {

            'click .cancel-button': function(e) {
                e.preventDefault();
                this.trigger('action:cancel');
            },

            'click .delete-button': function(e) {
                e.preventDefault();
                this.trigger('action:delete');
            },

            'click .preview-button': function(e) {
                e.preventDefault();
                this.preview();
            },

            'click .save-button': function(e) {
                e.preventDefault();
                this.save();
            }
        },

        /**
         * To be overridden by subclasses to validate the local state of the entity before a preview or save.
         * Return a falsy value to abort the preview/save action.
         *
         * @returns {boolean}
         */
        performLocalValidation: function(options) { return true; },

        /**
         * Public method to be called when the view should update its preview state.  Subclasses can supply custom
         * behavior by overriding _handlePreview below.
         */
        preview: function() {
            if(this.performLocalValidation({ preview: true })) {
                $.when(this._handlePreview()).done(_(function() {
                    this.trigger.apply(this, ['action:preview'].concat(_(arguments).toArray()));
                }).bind(this));
            }
        },

        /**
         * To be overridden by subclasses to preview changes to the entity.  Can return a jQuery Promise object
         * if the action is asynchronous.
         *
         * Either the return value or the Promise resolve() arguments will become the arguments to the
         * 'action:preview' event when triggered.
         */
        _handlePreview: function() {},

        /**
         * Public method to be called when the view should save its state.  Subclasses can supply custom
         * behavior by overriding _handleSave below.
         */
        save: function() {
            if(this.performLocalValidation({ preview: false })) {
                $.when(this._handleSave()).done(_(function() {
                    this.trigger.apply(this, ['action:save'].concat(_(arguments).toArray()));
                }).bind(this));
            }
        },

        /**
         * To be overridden by subclasses to save changes to the entity.  Can return a jQuery Promise object
         * if the action is asynchronous.
         *
         * Either the return value or the Promise resolve() arguments will become the arguments to the
         * 'action:save' event when triggered.
         */
        _handleSave: function() {},

        render: function() {
            if(!this.flashMessagesHelper || this.flashMessagesHelper.getGeneralMessagesSize() === 0) {
                this.$el.html(this.compiledTemplate({}));
                this.renderEditor(this.$('.editor-container'));
                this.renderPreview(this.$('.preview-container'));
                this._handleButtonVisibility();
            }
            return this;
        },

        /**
         * To be overridden by subclasses to render the editing view(s).
         *
         * @param $container
         */
        renderEditor: function($container) {
            throw new Error('Sub-classes of AddEditFormBase must implement the renderEditor method');
        },

        /**
         * To be overridden by subclasses to render the previewing view(s).  By default previewing is not enabled
         * so the behavior of this method is to remove the container.
         *
         * @param $container
         */
        renderPreview: function($container) {
            $container.remove();
        },

        /**
         * Performs an animation to replace the current view with the given view as a drilldown action.
         * @param drillDownView
         */
        showDrillDownView: function(drillDownView) {
            var $drilldownContainer = this.$('.drill-down-view');
            drillDownView.replaceContentsOf($drilldownContainer);
            $drilldownContainer.animate({marginRight: "0%"}, 350, function() {
                drillDownView.invalidateReflow();
            });
            this.$('.main-view').animate({marginLeft: "-100%"}, 350);
        },

        /**
         * Performs an animation hide the given drilldown view and restore the original content.
         * @param drillDownView
         */
        hideDrillDownView: function(drillDownView) {
           $('.main-view').animate({marginLeft: "0%"}, 350);
           $('.drill-down-view').animate({marginRight: "-100%"}, 350, function() {
               drillDownView.remove();
           });
        },

        template: '\
            <div class="main-view-and-drill-down-view-container">\
                <div class="main-view">\
                    <div class="editor-container"></div>\
                    <div class="buttons-container">\
                        <a href="#" class="delete-button btn"><%- _("Delete").t() %></a>\
                        <a href="#" class="cancel-button btn"><%- _("Cancel").t() %></a>\
                        <a href="#" class="preview-button btn"><%- _("Preview").t() %></a>\
                        <a href="#" class="save-button btn btn-primary"><%- _("Save").t() %></a>\
                    </div>\
                    <div class="preview-container"></div>\
                </div>\
                <div class="drill-down-view"></div>\
            </div>\
        ',

        _handleButtonVisibility: function() {
            var updateButton = _(function(selector, modelKey) {
                var $button = this.$(selector);
                if(this.model.buttonSettings.get(modelKey) === 'show') {
                    $button.show();
                }
                else {
                    $button.hide();
                }
            }).bind(this);

            updateButton('.delete-button', 'delete');
            updateButton('.cancel-button', 'cancel');
            updateButton('.preview-button', 'preview');
            updateButton('.save-button', 'save');
        }

    });

});