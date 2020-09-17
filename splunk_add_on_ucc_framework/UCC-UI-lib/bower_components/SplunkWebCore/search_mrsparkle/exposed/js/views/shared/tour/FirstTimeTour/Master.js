/**
 * @extends {views.shared.ModalLocalClassNames}
 * @description Creates a ModalView for the modal that pops up the first time
 * that a user opens up Splunk Lite.
 *
 * @param {Model} model
 * @param {Application} model.application
 * @param {User} model.user
 * @param {Tour} model.tour
 * @param {Object} options
 * @param {Collection} options.collection
 * @param {Model} options.model
 * @param {String} options.tourName
 * @param {String} options.introText - OPTIONAL
 */
define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'views/shared/Button',
        'views/shared/ModalLocalClassNames',
        'views/shared/tour/ImageTour/Master',
        'views/shared/tour/InteractiveTour',
        'uri/route',
        './Contents',
        'splunk.util'
    ],
    function(
        $,
        _,
        module,
        BaseView,
        ButtonView,
        ModalView,
        ImageTour,
        InteractiveTour,
        route,
        ContentsView,
        splunk_utils
    ) {
        return ModalView.extend({
            moduleId: module.id,
            initialize: function() {
                if (!this.model.tour) {
                    return;
                }

                var name = this.model.user.entry.content.get('realname'),
                    username = this.model.user.entry.get('name'),
                    fullname = name || username || '';

                fullname = _.escape(fullname);
                this.welcomeText = splunk_utils.sprintf(_('Welcome, %s').t(), fullname);
                this.introText = this.options.introText || _('It looks like this is your first time on this page. Would you like to take a quick tour?').t();
                this.on('hidden', function() {
                    if (this.model.tour.get('skipSetViewed')) {
                        return;
                    }
                    this.setViewed();
                });

                this.options.showCloseButton = false;
                this.options.closeOnEscape = false;
                this.options.showFooter = true;
                this.options.onHiddenRemove = true;
                this.options.title = this.welcomeText;
                this.options.bodyView = new ContentsView({
                    introText: this.introText
                });
                this.options.buttonsLeft = [
                    new ButtonView({
                        href: '#',
                        label: 'Skip',
                        style: 'default',
                        action: 'skip'
                    })
                ];
                this.options.buttonsRight = [
                    new ButtonView({
                        href: '#',
                        label: 'Continue to Tour',
                        style: 'primary',
                        action: 'continue'
                    })
                ];

                ModalView.prototype.initialize.apply(this, arguments);
            },

            events: $.extend({}, ModalView.prototype.events, {
                'click [data-action=continue]': 'runTour',

                'click [data-action=skip]': function(e) {
                    e.preventDefault();
                    this.trigger('hidden');
                    this.hide();
                }
            }),

            setViewed: function() {
                this.model.tour.entry.content.set('viewed', true);
                this.model.tour.trigger('viewed');
            },

            runTour: function(e) {
                e.preventDefault();
                // roundabout way of implementing this.hide(), otherwise
                // ImageTour would disappear because it's part of this.children
                $('[data-modal-state=open]').hide();
                this.trigger('hidden');

                var isImgTour = this.model.tour.isImgTour();

                if (isImgTour) {
                    this.children.tour = new ImageTour({
                        model: {
                            tour: this.model.tour,
                            application: this.model.application
                        },
                        onHiddenRemove: true,
                        backdrop: 'static'
                    });
                    $('body').append(this.children.tour.render().el);
                    this.children.tour.show();
                } else {
                    var qs = this.model.tour.getTourURLData(),
                        qsData, tourLink;

                    if (qs) {
                        qsData = splunk_utils.queryStringToProp(qs);

                        qsData.tour = this.options.tourName;
                        tourLink = route.page(
                            this.model.application.get('root'),
                            this.model.application.get('locale'),
                            'search',
                            this.model.tour.getTourPage(),
                            { data: qsData }
                        );
                        window.location = tourLink;
                    } else {
                        this.children.tour = new InteractiveTour({
                            model: {
                                tour: this.model.tour,
                                application: this.model.application
                            },
                            collection: {
                                tours: this.collection.tours
                            }
                        });
                        this.children.tour.render();
                    }
                }
            }
        });
    }
);
