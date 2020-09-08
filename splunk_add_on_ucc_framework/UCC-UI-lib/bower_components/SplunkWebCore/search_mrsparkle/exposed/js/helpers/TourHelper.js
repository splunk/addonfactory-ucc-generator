define([
    'jquery',
    'views/shared/tour/TourBar',
    'views/shared/tour/ImageTour/Master',
    'views/shared/tour/InteractiveTour',
    'views/shared/tour/FirstTimeTour/Master'
], function(
        $,
       TourBar,
        ImageTour,
        InteractiveTour,
        FirstTimeTour
        ) {

    var TourHelper = {
        renderTour: function(tourModel, applicationModel, userModel, toursCollection) {
            if (tourModel && tourModel.entry.get('name') && !tourModel.isDisabled()) {
                this.tour = {};
                var imgTour = tourModel.isImgTour(),
                    interactiveTour = tourModel.isInteractive(),
                    firstTime = tourModel.firstTimeCheck();

                if (firstTime) {
                    var viewed = tourModel.viewed(),
                        curApp = applicationModel.get('app'),
                        tourApp = tourModel.getTourApp(),
                        isLightTour = tourModel.isLightTour();

                    if (!viewed && ((curApp == tourApp) || isLightTour)) {
                        this.tour = new FirstTimeTour({
                            model: {
                                tour: tourModel,
                                application: applicationModel,
                                user: userModel || {} 
                            },
                            tourName: tourModel.entry.get('name'),
                            introText: tourModel.getIntroText(),
                            backdrop: 'static'
                        });

                        this.tour.render();
                        this.tour.show();
                    } else {
                        tourModel = null;
                        this.tour = null;
                    }
                } else if (interactiveTour) {
                    this.tour = new InteractiveTour({
                        model: {
                            tour: tourModel,
                            application: applicationModel
                        },
                        collection: {
                            tours: toursCollection || {}
                        }
                    });
                    this.tour.render();
                } else if (tourModel.isImgTour()) {
                    this.tour = new ImageTour({
                        model: {
                            tour: tourModel,
                            application: applicationModel
                        },
                        onHiddenRemove: true,
                        backdrop: 'static'
                    });
                    $('body').append('<div class="splunk-components image-tour"></div>');
                    $('.image-tour').append(this.tour.render());
                    this.tour.show();
                } else {
                    this.tour = new TourBar({
                        model: {
                            tour: tourModel
                        },
                        collection: {
                            tours: toursCollection || {}
                        }
                    });
                    $('header').after(this.tour.render());
                }
            }
        },
        killTour: function() {
            if (this.tour) {
                this.tour.hide();
            }
        }
    };
    return TourHelper;
});