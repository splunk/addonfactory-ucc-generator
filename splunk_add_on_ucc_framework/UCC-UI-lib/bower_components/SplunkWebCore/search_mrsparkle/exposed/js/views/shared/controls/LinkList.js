define([
            'jquery',
            'underscore',
            'backbone',
            'module',
            'views/shared/controls/Control',
            'bootstrap.tooltip'
       ],
       function(
            $,
            _,
            Backbone,
            module,
            Control
       ) {
       return Control.extend({
            moduleId: module.id,
            className: "splunk-linklist splunk-choice-input",
            initialize: function() {
                this._selections = new Backbone.Model();
                Control.prototype.initialize.apply(this, arguments);
            },
            events: {
                'click a': function(e) {
                    e.preventDefault();
                    if (this.options.enabled) {
                        var value = $(e.target).attr('data-value');
                        this.setValue( value, true);
                    }
                }
            },
            setValue: function(value, render, options) {
                this.$('a.active').removeClass('active');
                if (value == null) {
                    this.$('a:not([data-value])').addClass('active');
                } else {
                    this.$('a[data-value="' + value + '"]').addClass('active');
                }
                Control.prototype.setValue.apply(this, arguments);
            },
            disable: function() {
                this.options.enabled = false;
                this.$('a').addClass('disabled');
            },
            enable: function() {
                this.options.enabled = true;
                this.$('a').removeClass('disabled');
            },

            render: function() {
                this.$el.empty();
                this.$el.append($("<fieldset class='splunk-linklist-choices'/>"));
                if (!this.options || this.options.length === 0) {
                   this.options  = [{value: "", label: _("N/A").t()}];
                }

                _.each(this.options.items, function(entry, idx) {
                    if (!entry.label || entry.label.match(/\S/) === null) { // check if null or only whitespace
                        entry.label = entry.value;
                    }
                    var input = $('<a href="#" class="btn-pill" data-toggle="tooltip" data-placement="top">' + _.escape(entry.label) + '</a>')
                       .attr({"data-value": entry.value}).attr({"data-original-title": _.escape(entry.label)});
                    $(input).tooltip({
                       delay: {"show":500, "hide": 0} 
                    });
                    this.$el.append(input);
                }, this);
                this.setValue(this._value, false);

                return this;
            },
                
            remove: function() {
                this.$('a').tooltip('destroy');
                Control.prototype.remove.call(this);
            }
    });
 });
