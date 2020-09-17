define(
    [
        'module',
        'jquery',
        'underscore',
        'views/dashboard/Base',
        'dashboard/manager/FormManager'
    ],
    function(module,
             $,
             _,
             BaseDashboardView,
             FormManager) {

        return BaseDashboardView.extend({
            moduleId: module.id,
            viewOptions: {
                register: true
            },
            className: 'splunk-submit-button form-submit',
            initialize: function(options) {
                BaseDashboardView.prototype.initialize.apply(this, arguments);
                this.fieldset = options.parent;
                this.listenTo(this.model.state, 'change:mode', this._onModeChange);
            },
            render: function() {
                BaseDashboardView.prototype.render.apply(this, arguments);
                this.$button = $('<button class="btn btn-primary"></button>').appendTo(this.$el);
                this.$button.text(_('Submit').t());
                this._onModeChange();
                return this;
            },
            events: {
                'click button': function(e) {
                    e.preventDefault();
                    FormManager.submitForm({replaceState: false});
                },
                'click .delete-input': '_delete'
            },
            _submit: function(e) {
                e.preventDefault();
                this.model.controller.trigger('action:submit-tokens');
            },
            _delete: function(e) {
                e.preventDefault();
                this.fieldset.settings.set('submitButton', false); // this will remove this submit button;
                // notify controller the change
                this.model.controller.trigger('edit:fieldset', {
                    fieldsetId: this.fieldset.id,
                    fieldsetSettings: this.fieldset.settings
                });
            },
            _onModeChange: function() {
                switch (this.model.state.get('mode')) {
                    case 'view':
                        this._removeEditor();
                        break;
                    case 'edit':
                        this._renderEditor();
                        break;
                }
            },
            _removeEditor: function() {
                this.$('.edit-dropdown').remove();
            },
            _renderEditor: function() {
                this._removeEditor();
                var $editor = $('<div class="edit-dropdown"><a href="#" class="delete-input"><i class="icon-x"/></a></div>');
                $editor.find('.delete-input').attr('title', _('Delete submit button').t());
                $editor.prependTo(this.$el);
            }
        });
    });