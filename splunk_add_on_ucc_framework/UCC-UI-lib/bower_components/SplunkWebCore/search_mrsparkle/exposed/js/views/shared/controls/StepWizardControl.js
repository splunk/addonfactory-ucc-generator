define([
            'jquery',
            'underscore',
            'module',
            'backbone',
            'views/shared/controls/Control',
            './StepWizardControl.pcss'
        ],
        function(
            $,
            _,
            module,
            Backbone,
            Control,
            css
        ) {

    /**
     * @constructor
     * @memberOf views
     * @name StepWizardControl
     * @extends {views.Control}
     *
     * @param {Object} options
     * @param {Backbone.Model} options.model the model to be used by the Control logic to maintain
     * the state of wizard
     * @param {String} options.modelAttribute the attribute name to use when changing the control
     * model
     * @param {String} [options.label] a text label to show to the left of the control itself
     * @param {Boolean} [options.exitButton = false] whether to render an Exit button
     * @param {Backbone.Collection} options.collection a Collection to represent the steps in the flow, each
     * step model should define:
     *     @param {String} options.collection[].value the value to set on the control model when the active step changes
     *     @param {String} options.collection[].label the label to display to the user
     *     @param {Boolean} [options.collection[].visible = true] whether the step is currently vissible
     *     @param {Boolean} [options.collection[].enabled = true] whether the step is currently enabled
     *     @param {String} [options.collection[].nextLabel = 'Next'] the label to the show in the next button (not including the '>' icon)
     *     @param {String} [options.collection[].previousLabel] the label to the show in the previous button (not including the '<' icon)
     *     @param {Boolean} [options.collection[].showNextButton = true] whether to show the next button
     *     @param {Boolean} [options.collection[].showPreviousButton = true] whether to show the previous button
     *     @param {Function} [options.collection[].validate] an optional callback that is called before the control
     *     leaves the step. The function should return a promise. Once that promise is resolved, the
     *     control moves to the next step. If the promise is rejected, it remains in the current
     *     step.
     *
     *     validateSourceStep: function(stepModel, isSteppingNext) {
     *         if (isSteppingNext) { // User has pressed Next button
     *             var fetchDeferred = this.model.fetch();
     *             return fetchDeferred.promise();
     *         }
     *     }
     */
    return Control.extend(/** @lends views.StepWizardControl.prototype */{

        moduleId: module.id,

        events: {
            'click .previous-button': function(e) {
                e.preventDefault();
                if(!$(e.currentTarget).is('.disabled')) {
                    this.stepBack();
                }
            },
            'click .next-button': function(e) {
                e.preventDefault();
                if(!$(e.currentTarget).is('.disabled')) {
                    this.stepForward();
                }
            },
            'click .exit-button': function(e) {
                e.preventDefault();
                if(!$(e.target).is('.disabled')) {
                    this.trigger('exit');
                }
            }
        },

        initialize: function() {
            Control.prototype.initialize.apply(this, arguments);
            this._disabled = false;
            this.$el.addClass('step-wizard');
            if(!(this.collection instanceof Backbone.Collection)) {
                throw new Error('You must pass a collection for the wizard steps');
            }
            this.listenTo(this.collection, 'add remove reset change', this.debouncedRender);
            this.listenTo(this.model, 'stepBack', this.stepBack);
            this.listenTo(this.model, 'stepForward', this.stepForward);
            this.listenTo(this.model, 'enablePrev', this.enablePrev);
            this.listenTo(this.model, 'enableNext', this.enableNext);
            this.listenTo(this.model, 'disableNext', this.disableNext);

        },

        enable: function() {
            this._disabled = false;
            this.updateNavButtons();
            this.$('.exit-button').removeClass('disabled');
        },

        disableCurrent: function() {
            this.collection.at(this.getCurrIndex()).set('enabled', false);
        },

        disablePrev: function() {
            this.collection.at(this.getPrevIndex()).set('enabled', false);
        },

        disable: function() {
            this._disabled = true;
            this.$('.next-button, .previous-button, .exit-button').addClass('disabled');
        },

        disableNext: function() {
            this.collection.at(this.getNextIndex()).set('enabled', false);
        },

        enablePrev: function() {
            this.collection.at(this.getPrevIndex()).set('enabled', true);
        },

        enableNext: function() {
            this.collection.at(this.getNextIndex()).set('enabled', true);
        },

        getCurrIndex: function() {
            var selectedValue = this.getValue();
            var selectedModel = this.collection.findWhere({ value: selectedValue });
            return this.collection.indexOf(selectedModel);
        },
        
        getPrevIndex: function() {
            var selectedValue = this.getValue();
            var selectedModel = this.collection.findWhere({ value: selectedValue });
            var prevIndex = this.collection.indexOf(selectedModel) - 1;
            var prevVisible = false;
            if (this.collection.at(prevIndex)) {
                prevVisible = this.collection.at(prevIndex).get('visible');
            }
            while (prevVisible === false && prevIndex >= 1) {
                prevIndex -= 1;
                prevVisible = this.collection.at(prevIndex).get('visible');
            }
            return prevIndex;
        },

        getNextIndex: function() {
            var selectedValue = this.getValue();
            var selectedModel = this.collection.findWhere({ value: selectedValue });
            var nextIndex = this.collection.indexOf(selectedModel) +1;
            var nextVisible = false;
            if (this.collection.at(nextIndex)) {
                nextVisible = this.collection.at(nextIndex).get('visible');
            }
            while (nextVisible === false && nextIndex < this.collection.length) {
                nextIndex += 1;
                nextVisible = this.collection.at(nextIndex).get('visible');
            }
            return nextIndex;
        },

        stepBack: function() {
            this.stepWithPromise(this.getPrevIndex(), false);
        },

        stepForward: function() {
            if (this.options.validateNext && this.options.validateNext() == false) {
                return;
            }
            this.stepWithPromise(this.getNextIndex(), true);
        },

        stepWithPromise: function(newIndex, isSteppingNext) {
            var selectedModel = this.collection.findWhere({ value: this.getValue() });
            var validateFn = selectedModel.get("validate");
            var validatePromise;

            if (_(validateFn).isFunction()) {
                validatePromise = validateFn(selectedModel, isSteppingNext);
                if (!_(validatePromise).isUndefined()) {
                    validatePromise.done(_(function() {
                        this.step(newIndex);
                    }).bind(this));
                } else {
                    this.step(newIndex);
                }
            } else {
                this.step(newIndex);
            }
        },

        step: function(newIndex) {
            this.setValue(this.collection.at(newIndex).get('value'), true);
        },


        updateSelectedStep: function() {
            var selectedValue = this.getValue(),
                $stepContainers = this.$('.step-container'),
                $selectedContainer = $stepContainers.filter('[data-value="' + selectedValue + '"]'),
                selectedIndex = $selectedContainer.index();

            $stepContainers.removeClass('active').removeClass('completed');
            $selectedContainer.addClass('active');
            $stepContainers.slice(0, selectedIndex).addClass('completed');
        },

        updateNavButtons: function() {
            var selectedValue = this.getValue(),
                selectedModel = this.collection.findWhere({ value: selectedValue }),
                selectedIndex = this.collection.indexOf(selectedModel),
                nextIndex = this.getNextIndex(),
                prevIndex = this.getPrevIndex(),
                nextIsVisible = selectedModel.get("showNextButton") !== false,
                nextIsValid = (nextIndex < this.collection.length),
                nextEnabled = nextIsValid && this.collection.at(nextIndex).get('enabled') !== false,
                prevIsVisible = selectedModel.get("showPreviousButton") !== false,
                prevIsValid = (prevIndex >= 0),
                prevEnabled = prevIsValid && this.collection.at(prevIndex).get('enabled') !== false,
                $nextButton = this.$('.next-button'),
                $previousButton = this.$('.previous-button');

            if(nextEnabled && !this._disabled) {
                $nextButton.removeClass('disabled');
            }
            else {
                $nextButton.addClass('disabled');
            }
            if(prevEnabled && !this._disabled) {
                $previousButton.removeClass('disabled');
            }
            else {
                $previousButton.addClass('disabled');
            }
            if (nextIsVisible) {
                $nextButton.show();
            }
            else {
                $nextButton.hide();
            }
            if (prevIsVisible) {
                $previousButton.show();
            }
            else {
                $previousButton.hide();
            }

            $nextButton.find('.button-text').text(this.collection.at(selectedIndex).get('nextLabel') || _('Next').t());
            $previousButton.find('.button-text').text(this.collection.at(selectedIndex).get('previousLabel') || '');
        },

        render: function() {
            var filteredCollection = this.collection.filter(function(model) {
                var visible = model.get('visible');
                return (typeof visible === 'undefined') || (visible == true);
            });
            this.$el.html(this.compiledTemplate({
                label: this.options.label,
                steps: filteredCollection,
                exitButton: this.options.exitButton
            }));
            this.updateSelectedStep();
            this.updateNavButtons();
            return this;
        },

        template: '\
            <% if(label) { %>\
                <div class="wizard-label"><%- label %></div>\
            <% } %>\
            <% _.each(steps, function(step, i) { %>\
                <% var isFirst = (i === 0) %>\
                <% var isLast = (i === steps.length - 1) %>\
                <div class="step-container <%- isLast ? "last" : "" %> <%- isFirst ? "first" : "" %>" data-value="<%- step.get("value") %>">\
                    <div class="step-indicator">\
                        <div class="connector left">\
                            <div></div>\
                            <div></div>\
                        </div>\
                        <div class="circle">\
                            <% if(isLast) { %>\
                                <i class="finished-icon icon-check"></i>\
                            <% } %>\
                        </div>\
                        <div class="connector right">\
                            <div></div>\
                            <div></div>\
                        </div>\
                    </div>\
                    <div><span class="step-label"><%- step.get("label") %></span></div>\
                </div>\
            <% }) %>\
            <div class="nav-buttons">\
                <a href="#" class="btn previous-button">\
                    <i class="icon-chevron-left"></i>\
                    <span class="button-text"></span>\
                </a> <a href="#" class="btn btn-primary next-button">\
                    <span class="button-text"></span>\
                    <i class="icon-chevron-right"></i>\
                </a>\
                <% if(exitButton) { %>\
                    <a href="#" class="btn exit-button">\
                        <i class="icon-x"></i>\
                        <%- _("Exit").t() %>\
                    </a>\
                <% } %>\
            </div>\
            <div class="clearfix"></div>\
        '

    });

});
