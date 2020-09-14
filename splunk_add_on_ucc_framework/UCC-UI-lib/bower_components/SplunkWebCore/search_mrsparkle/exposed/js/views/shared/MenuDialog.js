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
 * @param {View Object} [options.contentView = undefined] - the contents of the menu.
 */

define(
    [
        'underscore',
        'jquery',
        'module',
        'views/Base',
        'views/shared/delegates/Popdown',
        './MenuDialog.pcssm'
    ],
    function(
        _,
        $,
        module,
        BaseView,
        Popdown,
        css
    ){
        return BaseView.extend({
            moduleId: module.id,
            attributes: {'data-popdown-role': 'dialog'},
            useLocalClassNames: true,
            constructor: function(options) {
                _.extend(this, _.pick(options || {}, 'useLocalClassNames'));

                // children can disable useLocalClassNamess and therefore this.css should not be set.
                if (this.useLocalClassNames && this.css === undefined) {
                    this.css = css;
                }

                // remove inheritted 'control' className
                if (this.useLocalClassNames) {
                    this.className = '';
                }

                BaseView.apply(this, arguments);
            },
            initialize: function() {

                BaseView.prototype.initialize.apply(this, arguments);

                this.options.contentView && (this.children.content = this.options.contentView);

                return this;
            },
            set: function(options) {
                _.extend(this.options, options);
                if (this.children.content !== this.options.contentView) {
                    this.children.content.remove();
                    this.children.content = this.options.contentView;
                }

                this.render();

                return this;
            },
            render: function () {
                if (!this.el.innerHTML) {
                    this.$el.html(this.compiledTemplate({
                        css:this.css
                    }));
                }

                if (this.children.content) {
                    this.children.content.render().appendTo(this.$el);
                }

                return this;
            },
            template: '<div class="<%-css.arrow%>" data-popdown-role="arrow"></div>'
        });
    });
