define([
    'jquery',
    'underscore',
    'backbone',
    'views/Base',
    'views/table/commandeditor/listpicker/Master',
    'module',
    'bootstrap.tooltip'
],
function(
    $,
    _,
    Backbone,
    BaseView,
    ListPicker,
    module,
    tooltip
){
   /**
    * List Picker Overlay
    *
    *  List Picker Overlay adds the ability to slidein and slide out a List Picker with "< Back" and "OK" controls.
    *
    *     {Boolean} slideOutOnChange (Optional) When multiselect=false, whether to hide the overlay when the user selects an item. Defaults true.
    *
    *  See 'views/table/commandeditor/listpicker/Master' for full list of parameters.
    *
    */
    return ListPicker.extend({
        className: 'list-picker-overlay',
        moduleId: module.id,

        initialize: function(options) {
            var defaults = {
                slideOutOnChange: true
            };
            _.defaults(this.options, defaults);

            ListPicker.prototype.initialize.apply(this, arguments);
        },

        events: _.extend(ListPicker.prototype.events, {
            'click .list-picker-back': function(e) {
                e.preventDefault();
                this._handleClickBack();
            },
            'click .list-picker-ok': function(e) {
                e.preventDefault();
                this.slideOut(true);
            }
        }),

        _handleClickBack: function() {
            this.revertSelectedValues();
            this.changed = false;
            this.slideOut(true);
            this.trigger('listPickerBackSelected');
        },

        _selectionDidChange: function() {
            this.changed = true;

            if(this.options.multiselect) {
                this.$('.list-picker-ok')[this.selectedValues.length === 0 ? 'addClass' : 'removeClass']('disabled');
            } else if (this.options.slideOutOnChange) {
                this.slideOut();
            } else {
                this.trigger('selectionDidChange');
                this.changed = false; // after the notification this must be false.
            }
        },

        _show: function(animate) {
            this.changed = false;
            this.saveSelectedValues();

            this.trigger('overlayWillShow');
            if (animate) {
                this.$el.width();
                this.$el.css({left: 0, transform: ''});

                this.$el.one('transitionend', function(){
                    this.trigger('overlayDidShow');
                }.bind(this));

            } else {
                this.$el.hide().css('left', 0).width();
                this.$el.css({display: '', transform: ''});
                this.trigger('overlayDidShow');
            }
        },
        show: function() {
            this._show(false);
        },
        slideIn: function() {
            this._show(true);
        },

        _hide: function(animate) {
            if (this.changed) {
                this.trigger('selectionDidChange');
            }
            if (animate) {
                this.$el.width(); //ensure render;
                this.$el.css('left', '');

                this.$el.one('transitionend', function(){
                    this.$el.css('transform', 'scale(0)');
                    this.trigger('overlayDidHide');
                    this.render();
                }.bind(this));

            } else {
                this.$el.css({left: '', transform: 'scale(0)'});
                this.trigger('overlayDidHide');
                this.render();
            }
        },
        hide: function() {
            this._hide(false);
        },
        slideOut: function() {
            this._hide(true);
        },

        render: function() {
            ListPicker.prototype.render.apply(this, arguments);

            this.$('.list-picker-buttons')[(!this.options.required || this.hasSelection() || this.options.multiselect || (this.items.length === 0)) ? 'removeClass' : 'addClass']('hidden');
            this.$('.list-picker-back')[(this.options.required && !this.hasSelection() && (this.items.length !== 0)) ? 'addClass' : 'removeClass']('hidden');

            return this;
        },

        template:  '\
            <div class="list-picker-buttons" >\
                <a class="list-picker-back"><i class="icon-chevron-left"></i> <%- _("Back").t() %></a>\
                <% if (options.multiselect) { %><a class="list-picker-ok <%- !hasValue && options.required ? "disabled" : "" %>"><%- _("OK").t() %></a><% } %>\
            </div>\
        ' + ListPicker.prototype.template
    }, {
        PAGINATOR_TYPES: {
            SEARCH_RESULTS: ListPicker.PAGINATOR_TYPES.SEARCH_RESULTS,
            SPLUNKD_COLLECTION: ListPicker.PAGINATOR_TYPES.SPLUNKD_COLLECTION
        }
    });
});
