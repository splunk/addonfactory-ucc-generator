define(
    [
        'underscore',
        'models/services/data/ui/Tour', 
        'collections/SplunkDsBase'
    ],
    function(_, Model, CollectionBase) {
        return CollectionBase.extend({
            url: 'data/ui/ui-tour',
            model: Model,
        
            getTourModel: function(tourName) {
                if (this.length == 0 || this.models.length == 0) {
                    return undefined;
                }

                var model = this.find(function(modelCandidate) {
                        return (modelCandidate.getName() === tourName);
                    }),
                    useTour = (model && model.useTour()) ? model.useTour() : false;

                // check for linked tour
                if (useTour) {
                    // preventing an infinite loop of linking tours
                    if (useTour !== tourName && useTour !== this.previousTour) {
                        this.previousTour = tourName;
                        return this.getTourModel(useTour);
                    }
                }

                if (model && model.isDisabled()) {
                    return null;
                }

                return model;
            },

            checkTours: function(serverInfo) {
                if (serverInfo) {
                    var productType = serverInfo.getProductType(),
                        instanceType = serverInfo.getInstanceType(),
                        isLite = serverInfo.isLite(),
                        tourIdentifier = productType + ((instanceType) ? ':' + instanceType : ''),
                        searchTour = this.getTourModel('search-tour:' + tourIdentifier),
                        adddataTour = this.getTourModel('adddata-tour:' + tourIdentifier),
                        dashboardsTour = this.getTourModel('dashboards-tour:' + tourIdentifier),
                        liteTour = this.getTourModel('light-product-tour');

                    if (searchTour || adddataTour || dashboardsTour) {
                        return true;
                    }

                    if (isLite && liteTour) {
                        return true;
                    }

                    return false;
                }

                return false;
            }
        });
    }
);
