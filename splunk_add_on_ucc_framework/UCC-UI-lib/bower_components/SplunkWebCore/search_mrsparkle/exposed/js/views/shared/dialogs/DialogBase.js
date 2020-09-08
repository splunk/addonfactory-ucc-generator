/**
 * @author jszeto
 * @date 10/18/12
 *
 * The DialogBase class serves as the base class for all dialog classes. It provides a template that is divided into
 * three sections, the header, body and footer. It currently uses the Bootstrap modal class for appearance and
 * functionality.
 *
 * The default behaviors are as follows:
 *
 * The header displays a title and a close button. Set the title using the settings.titleLabel attribute.
 * The body doesn't have any content. Subclasses should populate the body by overriding renderBody().
 * The footer shows a primary button and a cancel button. Set the labels of these buttons using the
 * settings.primaryButtonLabel and settings.cancelButtonLabel attributes.
 *
 * If you don't want the built-in appearance for the header, body or footer, then subclasses can override the
 * renderXHtml() functions.
 */

define(
    [
        'jquery',
        'underscore',
        'backbone',
        'views/ValidatingView',
        'module',
        'util/console',
        'bootstrap.transition',
        'bootstrap.modal'
    ],
    function(
        $,
        _,
        Backbone,
        ValidatingView,
        module,
        console
        // bootstrap transition
        // bootstrap modal
        )
    {
        var ENTER_KEY = 13,
            TEXT_INPUT_SELECTOR = 'input[type="text"], input[type="password"], textarea';

        return ValidatingView.extend({
            moduleId: module.id,
            className: "modal fade",
            attributes: {tabIndex: -1},
            /**
             * A model holding the settings for the Dialog.
             *
             * {String} primaryButtonLabel - label for the primary button. If not defined, primary button isn't shown
             * {String} cancelButtonLabel - label for the cancel button. If not defined, cancel button isn't shown
             * {String} titleLabel - label for the dialog title
             */
            settings: undefined,
            /**
             * CSS class to apply to the modal-body
             */
            bodyClassName: "modal-body-scrolling",

            // Subclasses must call super.initialize()
            initialize: function(options) {
                ValidatingView.prototype.initialize.call(this, options);

                options = options || {};
                // Initialize the modal
                // TODO [JCS] Look at other dialogs and add ability to not close on outside click
                this.$el.modal({show:false, keyboard:true});

                if (!_.isUndefined(options.bodyClassName))
                    this.bodyClassName = options.bodyClassName;
                // TODO [JCS] Override remove to remove event listeners on settings
                // Setup the settings
                this.settings = new Backbone.Model();
                this.settings.set("footerTemplate",this._footerTemplate);
                this.settings.set("headerTemplate",this._headerTemplate);

                // Re-render if any of the labels have changed

                this.settings.on('change:primaryButtonLabel change:cancelButtonLabel change:titleLabel',
                                  this.debouncedRender, this);

                // Hook up click event listeners. We avoid using the events array since subclasses might clobber it
                this.$el.on("click.dialog",".btn-dialog-primary", _.bind(function(event) {
                    event.preventDefault();
                    this.primaryButtonClicked();
                }, this));
                this.$el.on("click.dialog",".btn-dialog-cancel", _.bind(function(event) {
                    event.preventDefault();
                    this.cancelButtonClicked();
                }, this));
                this.$el.on("click.dialog",".btn-dialog-close", _.bind(function(event) {
                    event.preventDefault();
                    this.closeButtonClicked();
                }, this));
                this.$el.on("keypress", _.bind(function(event) {
                    if(event.which === ENTER_KEY) {
                        this.submitKeyPressed(event);
                    }
                }, this));
                this.$el.on("shown", _.bind(function(e) {
                    if (e.target !== e.currentTarget) return;
                    this.dialogShown();
                }, this));
                this.$el.on("hide", _.bind(function(e) {
                    if (e.target !== e.currentTarget) return;
                    this.cleanup();
                }, this));
                this.$el.on("hidden", _.bind(function(e) {
                    if (e.target !== e.currentTarget) return;
                    this.trigger("hidden");
                }, this));
            },
            render: function() {
                this.$(".modal-header").detach();
                this.$(".modal-body").detach();
                this.$(".modal-footer").detach();

                var html = this.compiledTemplate({
                    bodyClassName:this.bodyClassName,
                    showFooter: this.shouldRenderFooter()});

                this.$el.html(html);

                this.renderHeader(this.$(".modal-header"));
                this.renderBody(this.$(".modal-body"));
                if (this.shouldRenderFooter())
                    this.renderFooter(this.$(".modal-footer"));

                return this;
            },
            hide: function() {
                this.$el.modal('hide');
            },
            show: function() {
                this.$el.modal('show');
            },
            /**
             * Called when the primary button has been clicked.
             */
            primaryButtonClicked: function() {
                this.trigger("click:primaryButton", this);
            },
            /**
             * Called when the cancel button has been clicked.
             */
            cancelButtonClicked: function() {
                this.trigger("click:cancelButton", this);
            },
            /**
             * Called when the close button has been clicked.
             */
            closeButtonClicked: function() {
                this.trigger("click:closeButton", this);
            },
            /**
             * Called when the "submit key" is pressed.  Currently the submit key is hard-coded to the enter key,
             * but this may become configurable in the future.
             *
             * @param event
             */
            submitKeyPressed: function(event) {
                var $target = $(event.target);
                // Only simulate a primaryButtonClick if focus is in a Text input.
                // if the currently focused element is any kind of text input,
                // make sure to blur it so that any change listeners are notified
                if($target.is(TEXT_INPUT_SELECTOR)) {
                    $target.blur();
                    // manually trigger the primary button click handler
                    this.primaryButtonClicked();
                }

            },
            /**
             * Called when the dialog has been shown. Subclasses can override with their own handlers
             */
            dialogShown: function() {
                this.trigger("show");
                // Apply focus to the first text input in the dialog. [JCS] Doesn't work without doing a debounce. Not sure why.
                _.debounce(function() {
                    this.setFocus();  
                }.bind(this), 0)();
                return;
            },
            /**
             * Applies focus to the first text input in the dialog  
             */
            setFocus: function() {
                this.$('input:text:enabled:visible:first').focus();
            }, 
            /**
             * Called when the dialog has been closed. Subclasses can override with their own cleanup logic
             */
            cleanup: function() {
                this.trigger("hide");
                return;
            },
            /**
             * Returns true if we should render the footer
             * @return {boolean}
             */
            shouldRenderFooter: function() {
                return this.settings.has("primaryButtonLabel") || this.settings.has("cancelButtonLabel");
            },
            /**
             * Render the dialog body. Subclasses should override this function
             *
             * @param $el The jQuery DOM object of the body
             */
            renderBody : function($el) {
                // No op
            },
            /**
             * Render the header.
             *
             * @param $el The jQuery DOM object of the header
             */
            renderHeader : function($el) {
                // To perform jQuery manipulation, wrap the header template in a div.
                // Insert the titleLabel into the title placeholder
                $el.html(this.settings.get("headerTemplate"));
                $el.find(".text-dialog-title").html(this.settings.get("titleLabel"));
            },
            /**
             * Renders the dialog footer. The default implementation takes the settings.footerTemplate
             * and searches for primary and cancel buttons. If a label is defined for it, then it will show the button
             * and set its label. Otherwise, it will hide the button.
             *
             * Subclasses can override this to customize the footer html.
             *
             * @param $el The jQuery DOM object of the footer
             */
            renderFooter : function($el) {
                // To perform jQuery manipulation, wrap the header template in a div.
                $el.html(this.settings.get("footerTemplate"));

                // If the primary button label is undefined, then don't show the button
                var primaryButton = $el.find(".btn-dialog-primary.label_from_data");
                if (this.settings.has("primaryButtonLabel"))
                {
                    primaryButton.html(this.settings.get("primaryButtonLabel"));
                    primaryButton.show();
                }
                else
                {
                    primaryButton.html('');
                    primaryButton.hide();
                }

                // If the cancel button label is undefined, then don't show the button
                var cancelButton = $el.find(".btn-dialog-cancel.label_from_data");
                if (this.settings.has("cancelButtonLabel"))
                {
                    cancelButton.html(this.settings.get("cancelButtonLabel"));
                    cancelButton.show();
                }
                else
                {
                    cancelButton.html('');
                    cancelButton.hide();
                }
            },
            template: '\
                <div class="modal-header"></div>\
                <div class="modal-body <%- bodyClassName %>"></div>\
                <% if (showFooter) { %>\
                    <div class="modal-footer"></div>\
                <% } %>\
            ',
            _footerTemplate: '\
                <a href="#" class="btn btn-dialog-cancel label_from_data pull-left" data-dismiss="modal"></a>\
                <a href="#" class="btn btn-primary btn-dialog-primary label_from_data pull-right"></a>\
            ',
            _headerTemplate: '\
                <button type="button" class="close btn-dialog-close" data-dismiss="modal">x</button>\
                <h3 class="text-dialog-title"></h3>\
            '
        });
    }
);
