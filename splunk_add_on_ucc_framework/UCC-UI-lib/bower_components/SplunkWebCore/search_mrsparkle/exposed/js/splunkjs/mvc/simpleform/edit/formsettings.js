define(function(require, exports, module) {
    var _ = require('underscore');
    var $ = require('jquery');
    var Backbone = require('backbone');
    var BaseView = require('views/Base');
    var Dashboard = require('../../simplexml/controller');

    return BaseView.extend({
        className: 'form-settings',
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            this.model = new Backbone.Model({
                value: !!Dashboard.model.view.isFormAutoRun()
            });
            this.listenTo(this.model, 'change', this.update);
            this.listenTo(this.model, 'change:value', function(model, value) {
                Dashboard.model.view.updateFormSettings({ autoRun: value }).fail(function(){
                    // Revert if persisting XML failed
                    model.set('value', !value);
                });
            });
            this.listenTo(Dashboard.model, 'change:rootNodeName', this.render);
        },
        events: {
            'click label': function(e) {
                e.preventDefault();
                if (!this.model.get('disabled')) {
                    this.model.set('value', !this.model.get('value'));
                }
            },
            'click .btn': function(e) {
                e.preventDefault();
            }
        },
        update: function() {
            this.$('i.icon-check')[this.model.get('value') ? 'show' : 'hide']();
            this.$('label,.btn')[this.model.get('disabled') ? 'addClass' : 'removeClass']('disabled');
        },
        render: function() {
            if(Dashboard.model.get('rootNodeName') === 'form') {
                this.$el.html(this.compiledTemplate({
                    label: _('Autorun dashboard').t(),
                    checked: this.model.get('value')
                }));
            } else {
                this.$el.empty();
            }
            return this;
        },
        template: '\
            <label class="checkbox">\
                  <a href="#" class="btn"><i class="icon-check" <% if (!checked) {%>style="display:none"<% } %>></i></a>\
                  <%= label%>\
            </label>\
        '
    });

});