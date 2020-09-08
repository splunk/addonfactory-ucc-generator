define(function(require, exports, module) {

    var $ = require("jquery");
    var BaseView = require("views/Base");

    var template = require("contrib/text!views/authentication_users/tiles/ScrollButton.html");

    return BaseView.extend({

        moduleId: module.id,
        template: template,
        tagName: "a",

        events: {
            "mousedown": function(e) {
                e.preventDefault();

                this._onMouseDown();
            },
            "click": function(e) {
                e.preventDefault();
            }
        },

        _isScrolling: false,
        _scrollInterval: 0,

        initialize: function(options) {
            BaseView.prototype.initialize.apply(this, arguments);

            if (options.direction === "left") {
                this.$el.addClass("scroll-button-left");
            } else {
                this.$el.addClass("scroll-button-right");
            }

            this._onMouseDown = this._onMouseDown.bind(this);
            this._onMouseUp = this._onMouseUp.bind(this);
        },

        render: function() {
            if (!this.el.innerHTML) {
                this.$el.html(this.compiledTemplate({
                    direction: this.options.direction
                }));
            }
            return this;
        },

        _onMouseDown: function() {
            if (!this._isScrolling) {
                this._isScrolling = true;
                this._scrollInterval = setInterval(this._onMouseDown, 1000 / 60);
                $(document).on("mouseup", this._onMouseUp);
            }

            this.trigger("scroll");
        },

        _onMouseUp: function() {
            if (this._isScrolling) {
                this._isScrolling = false;
                clearInterval(this._scrollInterval);
                $(document).off("mouseup", this._onMouseUp);
            }
        }

    });

});
