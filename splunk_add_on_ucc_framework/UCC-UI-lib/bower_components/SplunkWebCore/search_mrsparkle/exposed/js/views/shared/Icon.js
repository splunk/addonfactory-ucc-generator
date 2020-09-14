/* REUSE WITH CAUTION
/* ----------------------------------------------------------
/* This a CSS Module based view should be considered as Beta.
/* API is likely to change       */

/**
 * All options can be set during initialization or later, by using set().
 * @initialize or @set
 *
 * @param {Object} [options]
 * @param {String} [options.icon = 'space'] - see icons.pcssm for full list of icons.
 * @param {Number} [options.iconSize = 1.0] - relative size of the icon.
 */

define([
    'underscore',
    'module',
    'views/Base',
    './Icon.pcssm'
],
    function(
        _,
        module,
        BaseView,
        css
    ) {
        return BaseView.extend({
            moduleId: module.id,
            tagName: 'i',
            css: css,
            initialize: function(options){
                var defaults = {
                  icon: 'space',
                  size: 1.0
                };
                _.defaults(this.options, defaults);

                BaseView.prototype.initialize.apply(this, arguments);
            },
            set: function(options) {
                _.extend(this.options, options);
                this.render();
                return this;
            },
            render: function() {
                this.$el.attr('class', css.view + ' ' + css[this.options.icon]);
                this.$el.attr('data-icon', this.options.icon);
                this.$el.css({
                        fontSize: this.options.size + 'em',
                        verticalAlign: (this.options.size == 1 ? '' : 'middle')
                    });
                return this;
            }
        });
    }
);
