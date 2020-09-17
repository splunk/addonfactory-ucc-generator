/* REUSE WITH CAUTION
/* ----------------------------------------------------------
/* This a CSS Module based view should be considered as Beta.
/* API is likely to change       */

/**
 * All options can be set during initialization or later, by using set().
 * @initialize or @set
 *
 * @param {Object} [options]
 * @param {String} [options.mode = 'menu'] - 'menu' or 'dialog'.
 * @param {View Object} [options.toggleView = 1.0] -  the toggle view, such as an
 * instance of a button. Must have an attribute of data-action="toggle".
 * @param {View Object} [options.contentView = undefined] - the contents of the
 * popdown menu.
 */

define(
    [
        'underscore',
        'jquery',
        'module',
        'views/Base',
        'views/shared/MenuDialog',
        'views/shared/delegates/Popdown',
        './Menu.pcssm'
    ],
    function(
        _,
        $,
        module,
        BaseView,
        MenuDialogView,
        Popdown,
        css
    ){
        return BaseView.extend({
            moduleId: module.id,
            attributes: {'data-popdown-role': 'popdown'},
            css: css,
            initialize: function() {
                var defaults = {
                    mode: 'menu'
                };
                _.defaults(this.options, defaults);

                BaseView.prototype.initialize.apply(this, arguments);

                this.children.dialog = new MenuDialogView({
                    contentView: this.options.contentView
                });
                this.children.toggle = this.options.toggleView;
                this.startListening();

                return this;
            },

            startListening: function() {
                this.stopListening();

                this.options.contentView && this.listenTo(this.options.contentView, 'close', this.close);
                this.children.dialog && this.listenTo(this.children.dialog, 'close', this.close);
                BaseView.prototype.startListening.apply(this, arguments);
            },

            set: function(options) {
                _.extend(this.options, options);
                if (this.children.toggle !== this.options.toggleView) {
                    this.children.toggle.remove();
                    this.children.toggle = this.options.toggleView;
                }
                this.children.dialog.set({
                    contentView: this.options.contentView
                });

                this.render(); // could cause a double render of the dialog contents;
                this.startListening();

                return this;
            },
            close: function() {
                this.children.popdown.hide();
            },
            render: function () {
                if (!this.el.innerHTML) {
                    this.children.popdown = new Popdown({el: this.el, mode: this.options.mode});
                    this.children.dialog.appendTo(this.$el);
                }
                this.$el.attr('class', this.css.view);

                this.children.toggle.render().prependTo(this.$el);
                this.children.dialog.render();

                return this;
            }
        });
    });
