define(
    [
        'module',
        'jquery',
        'underscore',
        'views/Base'
    ],
    function(module,
             $,
             _,
             BaseView) {

        return BaseView.extend({
            moduleId: module.id,
            className: 'form-settings',
            initialize: function(options) {
                BaseView.prototype.initialize.apply(this, arguments);
                this.fieldset = options.parent;
                this.settings = options.parent.settings;
                this.listenTo(this.settings, 'change:autoRun', this.render);
            },
            render: function() {
                this.$el.html(this.compiledTemplate({
                    label: _('Autorun dashboard').t(),
                    checked: this.settings.get('autoRun')
                }));
                return this;
            },
            events: {
                'click label': '_updateState',
                'click .btn': function(e) {
                    e.preventDefault();
                }
            },
            _updateState: function(e) {
                e.preventDefault();
                var to = !this.settings.get('autoRun');
                this.settings.set('autoRun', to);
                this.model.controller.trigger('edit:fieldset', {
                    fieldsetId: this.fieldset.id
                });
            },
            template: '\
            <label class="checkbox">\
                  <a href="#" class="btn"><i class="icon-check" <% if (!checked) {%>style="display:none"<% } %>></i></a>\
                  <%= label%>\
            </label>\
        '
        });
    });