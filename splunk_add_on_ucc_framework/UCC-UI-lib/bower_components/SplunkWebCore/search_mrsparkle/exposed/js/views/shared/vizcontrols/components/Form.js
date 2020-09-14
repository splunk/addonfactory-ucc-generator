/*
 * This view renders a single list of form elements for editing a visualization.
 *
 * This view is the implementation of the rendering aspects of the form element schema described in
 * https://confluence.splunk.com/display/PROD/Internal+Mod+Viz+ERD#InternalModVizERD-VisualizationEditorSchema.
 * It is responsible for constructing the control group views correctly, and managing their visible and
 * enabled states dynamically.
 */

define([
            'jquery',
            'underscore',
            'module',
            'views/Base',
            'views/shared/controls/Control',
            'views/shared/controls/ControlGroup'
        ],
        function(
            $,
            _,
            module,
            BaseView,
            Control,
            ControlGroup
        ) {

    return BaseView.extend({

        moduleId: module.id,

        tagName: 'form',

        events: {
            'submit': function(e) {
                e.preventDefault();
            }
        },

        /**
         * @constructor
         * @param options {
         *     model: {
         *         visualization: <models.shared.Visualization>
         *     }
         *     formElements: a list of form elements from the visualization editor schema
         *         see https://confluence.splunk.com/display/PROD/Internal+Mod+Viz+ERD#InternalModVizERD-VisualizationEditorSchema
         * }
         */
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            // Create copy of formElements array input
            this.formElements = $.extend(true, [], this.options.formElements || []);
            this.htmlElements = {};
            _(this.formElements).each(function(formElement) {
                if (!_.isString(formElement) && !formElement.html) {
                    this.children[formElement.name] = this._createControlGroup(formElement);
                }
                if (formElement.html) {
                    this.htmlElemCounter = this.htmlElemCounter ? (this.htmlElemCounter + 1) : 1;
                    formElement.name = 'htmlElem' + this.htmlElemCounter;
                    this.htmlElements[formElement.name] = $(formElement.html);
                }
            }, this);
            
            this.dynamicallyEnabledElements = _(this.formElements).filter(_.property('enabledWhen'));
            if (this.dynamicallyEnabledElements.length > 0) {
                this.listenTo(this.model.visualization, 'change', this._refreshControlGroupsEnabledState);
            }

            this.dynamicallyVisibleElements = _(this.formElements).filter(function(formElement) { return formElement.visibleWhen && !formElement.html; });
            this.dynamicallyVisibleHtmlElements = _(this.formElements).filter(function(formElement) { return formElement.visibleWhen && formElement.html; });
            if (this.dynamicallyVisibleElements.length > 0 || this.dynamicallyVisibleHtmlElements.length > 0) {
                this.listenTo(this.model.visualization, 'change', this._refreshControlGroupsVisibileState);
            }
        },

        render: function() {
            _(this.formElements).each(function(formElement) {
                if (_.isString(formElement)) {
                    this.$el.append(formElement);
                } else {
                    if (formElement.html) {
                        $(this.htmlElements[formElement.name]).appendTo(this.$el);
                    } else {
                        this.children[formElement.name].render().appendTo(this.el);
                    }
                }
            }, this);
            if (this.dynamicallyEnabledElements.length > 0) {
                this._refreshControlGroupsEnabledState();
            }
            if (this.dynamicallyVisibleElements.length > 0 || this.dynamicallyVisibleHtmlElements.length > 0) {
                this._refreshControlGroupsVisibileState();
            }
        },

        _createControlGroup: function(formElement) {
            if (formElement.control) {
                var control = new formElement.control(_.extend({
                    model: this.model.visualization,
                    modelAttribute: formElement.name
                }, formElement.controlOptions));

                return new ControlGroup(_.extend({
                    label: formElement.label,
                    controls: [control]
                }, formElement.groupOptions));
            }
            return new formElement.group(_.extend({
                label: formElement.label,
                model: this.model.visualization,
                modelAttribute: formElement.name
            }, formElement.groupOptions));
        },

        _refreshControlGroupsEnabledState: function() {
            _(this.dynamicallyEnabledElements).each(function(element) {
                if (this._modelPassesPredicate(this.model.visualization, element.enabledWhen)) {
                    this.children[element.name].enable();
                } else {
                    this.children[element.name].disable();
                }
            }, this);
        },

        _refreshControlGroupsVisibileState: function() {
            _(this.dynamicallyVisibleElements).each(function(element) {
                if (this._modelPassesPredicate(this.model.visualization, element.visibleWhen)) {
                    this.children[element.name].$el.show();
                } else {
                    this.children[element.name].$el.hide();
                }
            }, this);

            _(this.dynamicallyVisibleHtmlElements).each(function(element) {
                if (this._modelPassesPredicate(this.model.visualization, element.visibleWhen)) {
                    this.htmlElements[element.name].show();
                } else {
                    this.htmlElements[element.name].hide();
                }
            }, this);
        },

        _modelPassesPredicate: function(model, predicate) {
            if (_(predicate).isFunction()) {
                return predicate(model);
            }
            return _(predicate).all(function(whitelist, attrName) {
                whitelist = _(whitelist).isArray() ? whitelist : [whitelist];
                return _(whitelist).contains(model.get(attrName));
            });
        }

    });

});
