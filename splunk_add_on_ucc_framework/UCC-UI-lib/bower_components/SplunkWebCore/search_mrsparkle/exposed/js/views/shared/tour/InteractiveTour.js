define(
    [
        'jquery',
        'underscore',
        'backbone',
        'module',
        'views/Base',
        'splunk.util',
        'uri/route',
        'intro'
    ],
    function(
        $,
        _,
        backbone,
        module,
        BaseView,
        splunk_util,
        route,
        Intro
    ){
        return BaseView.extend({
            moduleId: module.id,
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                if (!this.model.tour) {
                    return;
                }

                this.tourOptions = {};
                this.interactiveTour = new Intro();
                this.steps = this.model.tour.getSteps();

                this.tourOptions = {
                    steps: this.steps,
                    nextLabel: '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="22px" height="40px" viewBox="0 0 612 792" enable-background="new 0 0 612 792" xml:space="preserve">\
                        <g>\
                            <polygon points="114.484,792 91.5,769.643 455.045,396 91.5,22.357 114.484,0 499.793,396  " />\
                        </g>\
                    </svg>',
                    prevLabel: '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="22px" height="40px" viewBox="0 0 612 792" enable-background="new 0 0 612 792" xml:space="preserve">\
                        <g>\
                            <polygon points="476.81,-0.002 499.794,22.355 136.249,395.998 499.794,769.641 476.81,791.998 91.501,395.998  " />\
                        </g>\
                    </svg>',
                    skipLabel: _('Skip tour').t(),
                    doneLabel: _('Try it now').t(),
                    showStepNumbers: false,
                    exitOnOverlayClick: false,
                    scrollToElement: false,
                    overlayOpacity: 0.6
                };
                
                this.nextTour = this.model.tour.getNextTour();

                if (this.nextTour && this.collection.tours) {
                    this.setNextTour();
                }

                this.interactiveTour.setOptions(this.tourOptions);

                if (!this.model.tour.viewed()) {
                    this.setViewed();
                }
            },

            setNextTour: function() {
                this.model.nextTour = this.collection.tours.getTourModel(this.nextTour);
                var page, data, url, label;

                if (this.model.nextTour) {
                    page = this.model.nextTour.getTourPage();
                    data = splunk_util.queryStringToProp(this.model.nextTour.getTourURLData() || '');
                    data.tour = this.nextTour;
                    url = route.page(
                        this.model.application.get('root'),
                        this.model.application.get('locale'),
                        this.model.application.get('app'),
                        page,
                        { data: data }
                    );
                    label = this.model.nextTour.getLabel();

                    this.tourOptions.nextTourLabel = label;
                    this.tourOptions.nextTourURL = url;
                }
            },

            renderTour: function() {
                this.interactiveTour.start();
                
                this.interactiveTour.onbeforechange(function() {
                    this.nextStepSetup();
                }.bind(this));

                this.interactiveTour.onafterchange(function() {
                    this.interactiveTour.refresh();
                }.bind(this));
            },

            setViewed: function() {
                this.model.tour.entry.content.set('viewed', true);
                this.model.tour.trigger('viewed');
            },

            nextStepSetup: function() {
                this.killPoptarts();

                var curStep = this.interactiveTour._currentStep,
                    step = this.interactiveTour._introItems[curStep],
                    stepElement = this.steps[curStep].element,
                    stepPos = this.steps[curStep].position || 'auto',
                    nextElement;

                this.checkforCallBack(curStep);

                nextElement = (typeof(stepElement) === 'string') ? $(stepElement)[0] : stepElement;

                if (nextElement) {
                    step.element = nextElement;
                    step.position = stepPos;
                }
            },

            killPoptarts: function() {
                // necessary to remove generated poptarts
                $('body').trigger('mousedown');

                if ($('.modalize-table-overlay')[0]) {
                    $('.modalize-table-overlay').click();
                }
            },

            checkforCallBack: function(curStep) {
                if (!$.isEmptyObject(this.steps[curStep].callback)) {
                    var triggerElement = this.steps[curStep].callback.eventEl,
                        type = this.steps[curStep].callback.eventType;
                    $(triggerElement).trigger(type);
                }
            },

            render: function() {
                this.renderTour();
                return this;
            }
        });
    }
);
