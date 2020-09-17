define(
    [
        'underscore',
        'jquery',
        'module',
        'views/dashboard/form/Fieldset',
        'views/dashboard/form/Submit',
        './GlobalFieldset.pcss'
    ],
    function(_,
             $,
             module,
             FieldsetView,
             Submit) {

        return FieldsetView.extend({
            moduleId: module.id,
            initialize: function() {
                FieldsetView.prototype.initialize.apply(this, arguments);

                this.listenTo(this.settings, 'change:submitButton', this._updateSubmitButton);
                this.listenTo(this.model.state, 'change:mode', this._recreateToggleLink);
                this.listenTo(this.model.page, 'change:hideFilters', this._updateState);
            },
            events: {
                'click [data-action=hide-filters]': function (e) {
                    e.preventDefault();
                    this.model.controller.trigger('action:hideFilters');
                }
            },
            addChild: function(input) {
                if (this.children.submit) {
                    input.render().$el.insertBefore(this.children.submit.$el);
                } else {
                    input.render().$el.appendTo(this.$el);
                }
                this.$el.trigger('structureChanged');
                this._recreateToggleLink();
                this._updateState();
            },
            shouldHideFilters: function() {
                // overrides shouldHideFilters in Fieldset.js, modifying a fieldset's filters visibility
                var neverHideInEditMode = !this.isEditMode(),
                    hideBasedOnAttr = (this.model.page.get('hideFilters') || this.isEmpty());

                return neverHideInEditMode && hideBasedOnAttr;
            },
            _updateState: function() {
                FieldsetView.prototype._updateState.apply(this, arguments);

                this.model.controller.trigger('state:globalFieldsetChildren', {isEmpty: this.isEmpty()});
            },
            isEmpty: function() {
                return FieldsetView.prototype.isEmpty.apply(this, arguments) && !this.children.submit;
            },
            _updateSubmitButton: function() {
                var submit = this.settings.get('submitButton');
                if (submit) {
                    if (!this.children.submit) {
                        //render submit button
                        this.children.submit = new Submit({
                            id: 'submit', // fix id that required in formutils.js
                            model: _.extend({}, this.model),
                            parent: this
                        });
                        this.children.submit.render().$el.appendTo(this.$el);
                        this.$el.trigger('inputCreated');
                        this._recreateToggleLink();
                        this._updateState();
                    }
                } else {
                    if (this.children.submit) {
                        this.children.submit.remove();
                        this.children.submit = null;
                        this.$el.trigger('inputRemoved');
                        this._updateState();
                    }
                }
            },
            show: function() {
                this.$el.show();
            },
            hide: function() {
                this.$el.hide();
            },
            _renderToggleLink: function() {
                if(!this.isEditMode()) {
                    var $toggleFiltersLink = $('<a class="hide-global-filters" data-action="hide-filters" href="#">' + _("Hide Filters").t() + '</a>');

                    this.$el.append($toggleFiltersLink);
                }
            },
            _recreateToggleLink: function() {
                var $link = this.$el.find('.hide-global-filters');

                if ($link.length > 0) { $link.remove(); }

                this._renderToggleLink();
            },
            render: function() {
                FieldsetView.prototype.render.apply(this, arguments);
                this._renderToggleLink();
                this._updateSubmitButton();
                return this;
            }
        });
    }
);
