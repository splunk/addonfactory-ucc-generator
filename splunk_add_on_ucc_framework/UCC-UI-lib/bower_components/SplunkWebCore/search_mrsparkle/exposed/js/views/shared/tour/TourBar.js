define(
    [
        'jquery',
        'underscore',
        'module',
        'backbone',
        'splunk.util',
        'views/Base',
        'contrib/text!views/shared/tour/TourBar.html'
    ],
    function(
        $,
        _,
        module,
        Backbone,
        splunk_util,
        BaseView,
        template
    ) {
    
        return BaseView.extend({
            template: template,
            moduleId: module.id,
            initialize: function(options) {
                BaseView.prototype.initialize.call(this, options);
                this.fixedHeight = this.options.fixedHeight || 0;
            },

            events: {
                "click .next"       : "handleNext",
                "click .previous"   : "handlePrevious"
            },

            setFixedHeight: function(height) {
                this.fixedHeight = height;
            },

            removeHighlight: function() {
                // if an element is currently highlighted, remove that highlight
                if (this._currentHighlightedSelector) {
                    var currentElement = $(this._currentHighlightedSelector);
                    currentElement.removeClass('tour-highlight');
                    this._currentHighlightedSelector = undefined;
                }
                this._highlightSelector = undefined;
            },

            highlightElement: function(selector) {
                if (selector) {
                    this._highlightSelector = selector;
                }
    
                if (this._highlightSelector) {
                    var element = $(this._highlightSelector);
                    if (!element.hasClass('tour-highlight')) {
                        if (element) {
                            element.addClass('tour-highlight');
                            this._currentHighlightedSelector = this._highlightSelector;
                        } 

                        setTimeout(function() {
                            this.highlightElement(); 
                        }.bind(this), 250);
                    }
                }
            },

            handleNext: function(e) {
                // TODO - add functionality to not reload page
            },

            handlePrevious: function(e) {
                // TODO - add functionality to not reload page
            },

            render: function() {
                this.removeHighlight();

                var selector = this.model.tour.entry.content.get("highlightSelector");
                if (selector) {
                    this.highlightElement(selector);
                }

                var info = this.model.tour.getInfo(),
                    nextLink = this.model.tour.getNextLink(this.collection.tours),
                    previousLink = this.model.tour.getPreviousLink(this.collection.tours),
                    exitLink = this.model.tour.getExitLink(),
                    html = this.compiledTemplate({
                        previousLink: previousLink,
                        nextLink: nextLink,
                        exitLink: exitLink,
                        info: _(info).t(),
                        fixedHeight: this.fixedHeight
                    });

                this.$el.html(html);

                return this;
            }
        });
    }
);

