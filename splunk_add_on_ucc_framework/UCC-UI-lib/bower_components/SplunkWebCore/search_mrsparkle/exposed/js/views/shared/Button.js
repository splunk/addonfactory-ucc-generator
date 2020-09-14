/* REUSE WITH CAUTION
/* ----------------------------------------------------------
/* This a CSS Module based view should be considered as Beta.
/* API is likely to change       */

/**
 * All options can be set during initialization or later, by using set().
 * @initialize or @set
 *
 * @param {Object} [options]
 * @param {String} [options.label = ''] - The contents of the label tag.
 * @param {String} [options.html = ''] - Alternative to label that allows html and is not escaped.
 * @param {String} [options.style = 'default'] - default, primary, pill, or pillSquare.
 * @param {String} [options.size = 'default'] - mini, small, normal or large.
 * @param {Boolean} [options.fullWidth = false] - if false, inline. if true 100% width block.
 * @param {String} [options.href = '#'] - Contents of the href.
 * @param {Boolean} [options.preventDefault = false] - when true, href does not link.
 * @param {Boolean} [options.action = undefined] - sets the data-action attribute
 * @param {String} [options.title = options.label] - change the title attribute of a link. Mainly useful for icon only buttons.
 * @param {Boolean} [options.enabled = false] - enable or disable
 * @param {Boolean} [options.active = false] - add data-active=true
 * @param {Boolean} [options.menu = false] - Show or hide the caret.
 * @param {String} [options.icon = undefined] - icon to show to the left.
 * @param {Number} [options.iconSize = 1] - relative size of the icon.
 * @param {object} [options.dataAttributes = {} ] - data attributes to add.
 */

define([
    'jquery',
    'underscore',
    'module',
    'views/Base',
    'views/shared/Icon',
    './Button.pcssm'
], function(
    $,
    _,
    module,
    BaseView,
    Icon,
    css
){
    return BaseView.extend({
        moduleId: module.id,
        tagName: 'a',
        css: css,
        initialize: function(options){
            var defaults = {
              label:     '',
              html:      '',
              style:     'default',
              size:      'default',
              fullWidth: false,

              href:      '#',
              preventDefault: true,
              action:    undefined,
              active:    false,
              dataAttributes: {},

              title:     undefined,
              enabled:   true,

              menu:      false,
              icon:      undefined,
              iconSize:  1
              //external:  false     /* Not implemented yet */
              //tooltip:   false     /* Not implemented yet */
            };

            _.defaults(this.options, defaults);

            this.options.title || (this.options.title = this.options.label);

            BaseView.prototype.initialize.apply(this, arguments);
        },
        events: {
            'click': function(e) {
                if (this.options.preventDefault) {
                    this.trigger('click');
                    e.preventDefault();
                }
            }
        },
        set: function(options) {
            _.extend(this.options, options);
            this.render();
        },
        _setOrRemoveAttr: function(attr, value) {
            if (value === false) {
                this.$el.removeAttr(attr);
            } else {
                this.$el.attr(attr, value);
            }
        },
        render: function() {
            var className = (this.className || this.css[this.options.style]),
                sizeClassName = {
                        mini: this.css.mini,
                        small: this.css.small,
                        'default': '',
                        large: this.css.large
                    }[this.options.size],
                blockClassName = this.options.fullWidth ? this.css.block : this.css.inline;

            // Attributes
            this.$el.attr('href', this.options.href);
            this.$el.attr('class', className + ' ' + sizeClassName + ' ' + blockClassName );
            this._setOrRemoveAttr('disabled', this.options.enabled ? false : 'disabled');
            this._setOrRemoveAttr('title', this.options.title || this.options.label);
            this._setOrRemoveAttr('data-action', this.options.action);
            this._setOrRemoveAttr('data-active', this.options.active ? 'active' : false);

            // Contents
            var contents = (this.options.html) ? this.options.html : _.escape(this.options.label);
            if (!this.el.innerHTML) {
                this.$el.html('<span class="' + this.css.label + '" data-role="label">' +
                    contents + '</span>');
            } else {
                this.$('[data-role=label]').html(contents);
            }

            // Caret
            if (this.options.menu) {
                this.children.caret = this.children.caret || new Icon({icon: 'caret'});
                this.children.caret.render().appendTo(this.$el);
            } else if (this.children.caret) {
                this.children.caret.$el.detach();
            }

            // Icon
            if (this.options.icon) {
                this.children.icon = this.children.icon || new Icon();
                this.children.icon.set({icon: this.options.icon, size: this.options.iconSize});
                this.children.icon.render().prependTo(this.$el);
            } else if (this.children.icon) {
                this.children.icon.$el.detach();
            }

            // Badge
            this.$('[data-role=badge]').remove();
            if (this.options.badgeLabel) {
                var $badge = $('<span class="' + this.css.badge + '" data-role="badge">' +
                    _.escape(this.options.badgeLabel) + '</span>');
                $badge.prependTo(this.$el);
            }

            // Data Attributes
            _.each(this.options.dataAttributes, function(value, key){
                var dataAttr = 'data-' + key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
                this._setOrRemoveAttr(dataAttr, value);
            }, this);
            return this;
        }
    });
});
