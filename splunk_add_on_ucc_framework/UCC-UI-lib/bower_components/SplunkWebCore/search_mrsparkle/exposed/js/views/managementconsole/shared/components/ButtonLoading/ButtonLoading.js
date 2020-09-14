define([
    'underscore',
    'jquery',
    'backbone',
    'module',

    'views/Base',
    'views/shared/waitspinner/Master',

    './ButtonLoading.pcss'
], function(_,
            $,
            Backbone,
            module,

            BaseView,
            WaitSpinner) {
    var POSITION = {
        LEFT: 'left',
        RIGHT: 'right'
    };

    var ButtonLoading = BaseView.extend({
        moduleId: module.id,
        className: 'loading-button',
        tagName: 'span',

        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);

            this.btnTemplate = this.options.btnTemplate;
            this.btnTemplateOptions = this.options.btnTemplateOptions || {};

            this.compiledBtnTemplate = _.template(this.btnTemplate);

            this.position = this.options.position;

            this.spinnerComponent = new WaitSpinner();
            this._currentlySpinning = false;
        },

        _enableBtn: function() {
            var btn = this.$('.btn');
            btn.prop('disabled', false);
            btn.removeClass('disabled');
        },

        _disableBtn: function() {
            var btn = this.$('.btn');
            btn.prop('disabled', true);
            btn.addClass('disabled');
        },

        _showLoadingIndicator: function() {
            this.spinnerComponent.$el.show();
            this.spinnerComponent.start();
        },

        _hideLoadingIndicator: function() {
            this.spinnerComponent.$el.hide();
            this.spinnerComponent.stop();
        },

        startSpinning: function() {
            this._currentlySpinning = true;

            _.delay(function() {
                // if stopSpinning wasn't called in last 100 ms, start spinning animation
                // NOTE: this is designed to remove any animation flicker
                if (this._currentlySpinning) {
                    this._showLoadingIndicator();
                    this._disableBtn();
                }

            }.bind(this), 100);
        },

        stopSpinning: function() {
            this._currentlySpinning = false;

            this._hideLoadingIndicator();
            this._enableBtn();
        },

        render: function() {
            this.$el.html(this.compiledBtnTemplate(this.btnTemplateOptions));

            this.spinnerComponent.render();
            this.spinnerComponent.$el.hide();
            if (this.position === POSITION.LEFT) {
                this.spinnerComponent.$el.insertBefore(this.$('.btn'));
                this.spinnerComponent.$el.addClass('left');
            } else if (this.position === POSITION.RIGHT) {
                this.spinnerComponent.$el.insertAfter(this.$('.btn'));
                this.spinnerComponent.$el.addClass('right');
            }

            return this;
        }
    });

    return ButtonLoading;
});