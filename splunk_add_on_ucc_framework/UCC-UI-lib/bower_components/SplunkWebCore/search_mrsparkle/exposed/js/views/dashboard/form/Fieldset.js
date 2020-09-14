define(
    [
        'module',
        'jquery',
        'underscore',
        'views/dashboard/Base',
        'views/dashboard/editor/FieldsetEditor',
        './Fieldset.pcss'
    ],
    function(module,
             $,
             _,
             BaseDashboardView,
             FieldsetEditor) {

        return BaseDashboardView.extend({
            moduleId: module.id,
            viewOptions: {
                register: true
            },
            className: 'fieldset',
            initialize: function() {
                BaseDashboardView.prototype.initialize.apply(this, arguments);

                this.listenTo(this.model.state, 'change:mode', this._updateState);
            },
            addChild: function(child) {
                child.render().$el.appendTo(this.$el);
                this._updateState();
                this.$el.trigger('structureChanged');
            },
            render: function() {
                BaseDashboardView.prototype.render.apply(this, arguments);
                this._updateState();
            },
            getInputs: function() {
                return this.getChildElements('.input');
            },
            getHTMLElements: function() {
                return this.getChildElements('.html');
            },
            isEmpty: function() {
                return this.getInputs().length === 0 && this.getHTMLElements().length === 0;
            },
            events: {
                'updateState': '_updateState'
            },
            _updateState: function() {
                var inputWithLabel = _.find(this.getInputs(), function(input) {
                    return input.settings.has('label');
                }, this);

                if(inputWithLabel) {
                    this.$el.removeClass('hide-label');
                } else {
                    this.$el.addClass('hide-label');
                }

                if(this.isEmpty()) {
                    this.$el.addClass('empty');
                } else {
                    this.$el.removeClass('empty');
                }

                if(this.shouldHideFilters()) {
                    this.hide();
                } else {
                    this.show();
                }
                this.$el.removeClass('editable');
                var editable = this.model.state.has('editable') ? this.model.state.get('editable') : true;
                if (editable) {
                    this.$el.addClass('editable');
                }
                return this;
            },
            shouldHideFilters: function() {
                return !this.isEditMode() && this.isEmpty();
            },
            resetFieldsetEditor: function() {
                if (this.children.fieldsetEditor) {
                    this.children.fieldsetEditor.remove();
                    this.children.fieldsetEditor = null;
                }
            },
            renderFieldsetEditor: function() {
                this.resetFieldsetEditor();
                this.children.fieldsetEditor = new FieldsetEditor({
                    model: this.model,
                    parent: this
                });
                this.children.fieldsetEditor.render().$el.prependTo(this.$el);
            }
        });
    }
);
