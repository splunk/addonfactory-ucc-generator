/**
 * @extends {views.shared.ModalLocalClassNames}
 * @description Creates a ModalView for an ImageTour of a particular feature.
 * Has carousel functionalities with autoplay and slide animations implemented.
 *
 * @param {Object} options
 * @param {Model} options.model
 * @param {Application} options.model.application
 */
define(
    [
        'jquery',
        'underscore',
        'module',
        'views/shared/ModalLocalClassNames',
        './Contents',
        './Master.pcssm'
    ],
    function(
        $,
        _,
        module,
        ModalView,
        ContentsView,
        css
    ) {
        return ModalView.extend({
            moduleId: module.id,
            css: _.extend({}, ModalView.prototype.css, css),
            initialize: function() {
                this.options.bodyView = new ContentsView({
                    model: this.options.model
                });
                this.options.bodyPadded = false;
                this.options.headerView = null;
                this.options.showCloseButton = false;
                this.options.onHiddenRemove = true;

                // listens to bodyView to trigger hiding the modal
                this.listenTo(this.options.bodyView, 'hide', function() {
                    this.hide();
                });
                this.listenTo(this.options.bodyView, 'focus', function() {
                    this.focus();
                });

                ModalView.prototype.initialize.apply(this, arguments);
            },

            focus: function() {
                this.$el.focus();
            }
        });
    }
);
