define(
    [
        'jquery',
        'underscore',
        'backbone',
        'module',
        'views/Base',
        'views/shared/Button',
        'views/shared/ModalLocalClassNames',
        'models/services/data/ui/Tour',
        'contrib/text!views/shared/tour/ImageTour/Contents.html',
        'splunk.util',
        'uri/route',
        'views/shared/tour/ImageTour/Contents.pcssm'
    ],
    function(
        $,
        _,
        backbone,
        module,
        BaseView,
        ButtonView,
        ModalView,
        TourModel,
        TourTemplate,
        splunk_util,
        route,
        css
    ) {
        return BaseView.extend({
            moduleId: module.id,
            className: [ ModalView.prototype.className, css.tourModal ].join(' '),
            template: TourTemplate,
            css: css,
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.imgCheck = $.Deferred();
                this.nextTourCheck = $.Deferred();
                this.root = this.model.application.get('root');
                this.locale = this.model.application.get('locale');
                this.liteTour = this.model.tour.entry.get('name') === 'light-product-tour';

                this.assetsUrl = splunk_util.make_url('/static/img/tour/assets');
                this.tourId = this.cid;
                this.images = this.model.tour.getImages();
                // add css modules class to retrieved captions
                this.captions = _.map(this.model.tour.getImageCaptions(), function(caption) {
                    var captionEl = $($.parseHTML(caption));
                    captionEl.find('a').addClass(this.css.gutterLink);
                    return captionEl.prop('outerHTML');
                }.bind(this));
                this.nextTour = this.model.tour.getNextTour();
                this.imageContext = this.model.tour.getImageContext();

                this.localPathString = '';

                if (this.imageContext && this.imageContext != 'system') {
                    this.localPathString = '/app/' + this.imageContext;
                }

                this.imageRoot = splunk_util.make_url('static' + this.localPathString + '/img/');

                this.imgUrl = this.imageRoot + ((this.model.tour) ? this.model.tour.getImgPath() : this.options.imgPath);
                this.imgUrlLocalized = this.imgUrl + '/' + this.locale;
                this.testImg = this.imgUrlLocalized + '/' + this.images[0];

                this.skipTourLabel = _('Skip Tour').t();

                this.children.tryItNowButton = new ButtonView({
                    label: _('Try it now').t(),
                    action: 'try-it-now',
                    style: 'primary'
                });

                // for locking this.slide() during an animation
                this.isAnimating = false;

                // Check for localized version of image tour.
                $('<img src="' + this.testImg + '" />')
                .load(function() {
                    this.imgCheck.resolve();
                }.bind(this))
                .error(function() {
                    this.imgUrlLocalized = this.imgUrl;
                    this.imgCheck.resolve();
                }.bind(this));

                if (this.nextTour) {
                    this.setNextTour();
                } else {
                    this.nextTourCheck.resolve();
                }

                if (!this.model.tour.viewed()) {
                    this.setViewed();
                }

                // places left/right keyup listener for carousel navigation
                $('body').on('keyup.image-tour', function(e) {
                    if (e.keyCode == 39) {
                        this.advance();
                    } else if (e.keyCode == 37) {
                        this.$('[data-slide=prev]:visible').click();
                    }
                }.bind(this));
            },

            events: $.extend({}, ModalView.prototype.events, {
                'click [data-action=skip-tour]': function(e) {
                    e.preventDefault();
                    this.hideContents();
                },

                'click [data-action=try-it-now]': function(e) {
                    e.preventDefault();
                    this.hideContents();
                },

                'click [data-active=true] img': function() {
                    this.advance();
                },

                'click [data-action=next-tour]': function(e) {
                    e.preventDefault();
                    window.location = this.nextTourURL;
                },

                'click [data-slide=next]': function(e) {
                    e.preventDefault();
                    this.slide(this.getActiveIndex() + 1);
                },

                'click [data-slide=prev]': function(e) {
                    e.preventDefault();
                    this.slide(this.getActiveIndex() - 1);
                },

                'click [data-slide-to]': function(e) {
                    // when you click on indicator, reads 'data-slide-to' index
                    e.preventDefault();
                    this.slide(Number.parseInt($(e.target).attr('data-slide-to')));
                }
            }),

            hideContents: function() {
                $('body').off('keyup.image-tour');
                this.trigger('hide');
            },

            advance: function() {
                // for ease of 'this' resolution for the carousel autoplay
                this.$('[data-slide=next]:visible').click();
            },

            getActiveIndex: function() {
                this.active = this.$('[data-active=true]');
                this.items = this.active.parent().children();
                return this.items.index(this.active);
            },

            // takes in a 'next' position and handles going there from the current position
            slide: function(next) {
                var activeIndex = this.getActiveIndex();

                // select and reset data-active=true image and indicator element
                var activeImage = this.$('[data-carousel=items] > [data-active=true]');
                var activeIndicator = this.$('[data-carousel=indicators] > [data-active=true]');
                activeImage.removeAttr('data-active');
                activeIndicator.removeAttr('data-active');

                // select and update all image items and indicator elements
                var items = this.$('[data-carousel=items]').children();
                var nextImage = items.eq(next);
                var nextIndicator = this.$('[data-carousel=indicators]').children().eq(next);
                nextImage.attr('data-active', 'true');
                nextIndicator.attr('data-active', 'true');

                // handles the toggling of buttons and the try-it-now button
                this.$('[data-slide=prev]').show();
                this.$('[data-slide=next]').show();
                this.$('[data-action=skip-tour]').show();
                this.$('[data-action=next-tour]').hide();
                this.$('[data-carousel=try-it-now]').hide();
                if (items.eq(0).is('[data-active]') && activeIndex !== 0) {
                    this.$('[data-slide=prev]').hide();
                    this.trigger('focus');
                } else if (items.eq(-1).is('[data-active]') && activeIndex !== items.length-1) {
                    this.$('[data-slide=next]').hide();
                    this.$('[data-carousel=try-it-now]').show();
                    this.$('[data-action=skip-tour]').hide();
                    if (this.nextTour) {
                        this.$('[data-action=next-tour]').show();
                    }
                    this.trigger('focus');
                }
            },

            setNextTour: function() {
                var app = this.model.application.get('app'),
                    owner = this.model.application.get('owner'),
                    nextTour = this.nextTour,
                    tourDfd = $.Deferred(),
                    page, data, url, label;

                this.model.nextTour = new TourModel();
                this.model.nextTour.bootstrap(tourDfd, app, owner, nextTour);

                $.when(tourDfd).then(function() {
                    page = this.model.nextTour.getTourPage();
                    data = splunk_util.queryStringToProp(this.model.nextTour.getTourURLData() || '');
                    label = _(this.model.nextTour.getLabel()).t() || _('next tour').t();

                    data.tour = nextTour;
                    url = route.page(
                        this.model.application.get('root'),
                        this.model.application.get('locale'),
                        this.model.application.get('app'),
                        page,
                        { data: data }
                    );

                    this.nextTourLabel = label;
                    this.nextTourURL = url;
                    this.continueLabel = splunk_util.sprintf('Continue to %s', this.nextTourLabel);
                    this.nextTourCheck.resolve();
                }.bind(this));
            },

            setViewed: function() {
                this.model.tour.entry.content.set('viewed', true);
                this.model.tour.trigger('viewed');
            },

            render: function() {
                $.when(this.imgCheck, this.nextTourCheck).then(function() {
                    this.$el.html(this.compiledTemplate({
                        _: _,
                        css: this.css,
                        images: this.images,
                        imgUrl: this.imgUrl,
                        imgUrlLocalized: this.imgUrlLocalized,
                        assetsUrl: this.assetsUrl,
                        captions: this.captions,
                        liteTour: this.liteTour,
                        imageTourId: this.tourId,
                        nextTourLabel: this.nextTourLabel,
                        skipTourLabel: this.skipTourLabel,
                        continueLabel: this.continueLabel
                    }));

                    this.children.tryItNowButton.render().insertAfter($('[data-slide=next]'));
                    this.children.tryItNowButton.$el.addClass(css.tryItNow);
                    this.children.tryItNowButton.$el.attr('data-carousel', 'try-it-now');
                }.bind(this));

                return this;
            }
        });
    }
);
