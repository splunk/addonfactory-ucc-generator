define(
[
    'jquery',
    'module',
    'views/shared/splunkbar/help/Master',
    'views/shared/tour/ProductTours/Master',
    'views/shared/tour/ImageTour/Master',
    'models/services/data/ui/Tour',
    'uri/route',
    'splunk.util'
],
function(
    $,
    module,
    HelpMenu,
    ProductToursModal,
    ImageTour,
    TourModel,
    route,
    splunk_utils
){
    return HelpMenu.extend({
        moduleId: module.id,
        initialize: function(){
            this.options.showIcon = true;
            this.options.hasTours = (this.collection && this.collection.tours) ? this.collection.tours.checkTours(this.model.user.serverInfo) : false;
            HelpMenu.prototype.initialize.apply(this, arguments);
            this.options.mode = 'menu';
            this.options.toggleView.set({label: ' '});
        },

        events: $.extend({}, HelpMenu.prototype.events, {
            'click [data-action=splunk-tours]': function(e) {
                e.preventDefault();
                this.renderToursModal();
            }
        }),

        renderToursModal: function() {
            this.children.toursModal = new ProductToursModal({
                canAddData: this.model.user.canAddData(),
                model: {
                    application: this.model.application,
                    serverInfo: this.model.user.serverInfo
                },
                onHiddenRemove: true
            });

            $('body').append(this.children.toursModal.render().el);
            this.children.toursModal.show();

            this.children.toursModal.on('product-tour', this.renderProductTour, this);
        },

        renderProductTour: function() {
            var app = this.model.application.get('app'),
                owner = this.model.application.get('owner'),
                tourDfd = $.Deferred();

            this.model.tour = new TourModel();
            this.model.tour.bootstrap(tourDfd, app, owner, 'light-product-tour');

            $.when(tourDfd).then(function() {
                this.children.imageTour = new ImageTour({
                    model: {
                        application: this.model.application,
                        tour: this.model.tour
                    },
                    backdrop: 'static',
                    onHiddenRemove: true,
                    liteTour: true
                });

                $('body').append(this.children.imageTour.render().el);
                this.children.imageTour.show();
            }.bind(this));
        }
    });
});
