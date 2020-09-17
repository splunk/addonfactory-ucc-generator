define(
        [
            'jquery',
            'underscore',
            'module',
            'views/shared/controls/Control',
            'util/general_utils',
            'bootstrap.tooltip'
        ],
        function(
            $,
            _,
            module,
            Control,
            util
            // bootstrap tooltip
            ) {
    /**
     * @constructor
     * @memberOf views
     * @name SyntheticRadioControl
     * @description Synthetic Radio Button Bar a-la iPhone
     * @extends {views.Control}
     *
     * @param {Object} options
     * @param {Backbone.Model} options.model The model to operate on
     * @param {String} options.modelAttribute The attribute on the model to observe and update on selection
     * @param {Object[]} options.items An array of one-level deep data structures, for example:
     *
     *     {label: 'Foo Bar', value: 'foo', icon: 'bar', className: 'foo'}
     *
     *     @param {String} options.items[].label textual display
     *     @param {Any} options.items[].value value to store in the model
     *     @param {String} options.items[].icon icon name to show in menu and button label
     *     @param {String} options.items[].className class attribute to be applied
     *     @param {String} options.items[].tooltip Text to display in the tooltip
     * @param {String} [options.buttonClassName = btn] Class attribute to each button element.
     * @param {Boolean} [options.elastic = false] Automatically assigns percentage width to children
     * to completely fill the parent.
     * @param {String} [options.additionalClassNames] Class attribute(s) to add to control
     * @param {Boolean} [options.showAsButtonGroup] If true, will show as a button (classic radio look)
     */
    return Control.extend(/** @lends views.SyntheticRadioControl.prototype */{
        className: 'control',
        moduleId: module.id,
        initialize: function(options) {
            var defaults = {
                buttonClassName: 'btn',
                linkClassName: 'btn-radio',
                elastic: false,
                showAsButtonGroup: true
            };

            _.defaults(this.options, defaults);


            // dunno if this should be the default but it was hard coded before so defaulting for legacy
            var itemDefaults = {iconSize: 'icon-large'};
            // attempt to default iconSize for each item
            _.each(this.options.items, function(el, i, list){
                _.defaults(el, itemDefaults);
            });
            this.$el.addClass(this.options.showAsButtonGroup ? 'btn-group btn-group-radio' : '');

            Control.prototype.initialize.call(this, this.options);

        },
        events: {
            'click button, a': function(e) {
                if (this.options.enabled)
                    this.buttonClicked($(e.currentTarget).data('value'));
                e.preventDefault();
            }

        },
        disable: function() {
            this.options.enabled = false;
            this.$('button, a').attr('disabled', 'disabled');
        },
        enable: function() {
            this.options.enabled = true;
            this.$('button, a').removeAttr('disabled');
        },
        buttonClicked: function(value) {
            this.setValue(value, true);
        },
        render: function(){
            if (!this.el.innerHTML) {
                var template = _.template(this.template, {
                                items: this.options.items,
                                itemClassName: this.options.showAsButtonGroup ? this.options.buttonClassName : this.options.linkClassName,
                                tag: this.options.showAsButtonGroup ? 'button' : 'a',
                                help: this.options.help,
                                elastic: this.options.elastic,
                                enabled: this.options.enabled,
                                modelAttribute: this.options.modelAttribute
                        });
                this.$el.html(template);
                this.$('[rel="tooltip"]').tooltip({animation:false, container: 'body', trigger: 'hover'});

                //bind that values to the items
                var items = this.options.items;
                this.$el.find('button, a').each(function(i, el) {
                    $(el).attr('data-value', items[i].value).data('value', items[i].value);
                });
            }

            var value = this._value;

            this.$el.find('button, a').each(function(i, el) {
                var $el = $(el);
                $el[util.checkEquality($el.data('value'), value) ? 'addClass' : 'removeClass']('active');
            });

            var additionalClassNames = this.options.additionalClassNames;
            if(additionalClassNames) {
                this.$el.addClass(additionalClassNames);
            }

            return this;
        },
        remove: function() {
            this.$('[rel="tooltip"]').tooltip('destroy');
            Control.prototype.remove.call(this);
        },
        template: '\
            <% _.each(items, function(item, index){ %>\
                <<%= tag %> name="<%- modelAttribute || "" %>" \
                        <% if (elastic) { %> style="width:<%- Math.round(100*(1/items.length)) %>%" <% } %> \
                        <% if (item.tooltip) { %> rel="tooltip" title="<%=item.tooltip%>" <% } %>\
                        class="<%= itemClassName %> <%- item.className || "" %>" \
                        <% if (!enabled) { %> disabled="disabled" <% } %>>\
                    <% if (item.icon) { %> <i class="icon-<%-item.icon%> <%-item.iconSize%>"></i><% } %>\
                    <% if (item.svg) { %> <%= item.svg %> <% } %>\
                    <% if(item.label){ %> <%= item.label%> <%}%>\
                </<%= tag %>>\
            <% }) %>\
        '
    });
});
