define(
[
    'jquery',
    'underscore',
    'models/SplunkDBase',
    'splunk.util',
    'util/splunkd_utils',
    'util/htmlcleaner'
],
function(
    $,
    _,
    SplunkDBase,
    splunk_util,
    splunkd_utils,
    HtmlCleaner
) {
    var Tour = SplunkDBase.extend({
        url: 'data/ui/ui-tour',

        bootstrap: function(tourDeferred, app, owner, tourName) {
            var tourUrl = splunkd_utils.fullpath(
                    this.url + "/" + encodeURIComponent(tourName),
                    {
                        app: app,
                        owner: owner
                    }
                 ),
                 proxyTourModel = new Tour();

            proxyTourModel.fetch({
                url: tourUrl,
                success: function(model, response) {
                    app = (app === splunkd_utils.SYSTEM) ? 'search' : app;
                    this.fetch({
                        data: {
                            app: app,
                            owner: owner
                        },
                        success: function(model, response) {
                            var data = $.extend(true, {name: tourName}, proxyTourModel.entry.content.toJSON());
                            this.entry.content.set(data);
                            this.entry.set('name', tourName);
                            tourDeferred.resolve();
                        }.bind(this),
                        error: function(model, response) {
                            tourDeferred.resolve();
                        }.bind(this)
                    });
                 }.bind(this),
                 error: function(model, response) {
                     tourDeferred.resolve();
                 }.bind(this)
            });
        },

        getTourApp: function() {
            // returns the tour's app origin
            return this.entry.acl.get('app');
        },

        getName: function() {
            return this.entry.get("name") || '';
        },

        getLabel: function() {
            return this.entry.content.get('label') || '';
        },

        getTourType: function() {
            return this.entry.content.get('type') || '';
        },

        firstTimeCheck: function() {
            return this.entry.content.has('firstTimeCheck');
        },

        viewed: function() {
            return splunk_util.normalizeBoolean(this.entry.content.get('viewed'));
        },

        isDisabled: function() {
            return splunk_util.normalizeBoolean(this.entry.content.get('disabled'));
        },

        useTour: function() {
            return this.entry.content.get('useTour');
        },

        getInfo: function() {
            return this.entry.content.get('info') || '';
        },

        getUri: function(includeTourName) {
            var link = undefined;
            if (this.entry.content.has("uri")) {
                link = this.entry.content.get("uri");

                if (includeTourName) {
                    var name = this.getName();
                    if (name) {
                        //check to see if link already has query args
                        if (link.indexOf("?") == -1) {
                            link = link + "?tour=" + name;
                        } else {
                            link = link + "&tour=" + name;
                        }
                    }   
                }
            }    
            return link;
        },

        getLink: function(linkType, collection) {
            var linkedModel = this.getLinkedModel(linkType, collection);
            if (linkedModel) {
                return linkedModel.getUri(true);
            }
            return null;
        },

        getLinkedModel: function(linkType, collection) {
            var linkedModel;

            if (!(linkType === 'next' || linkType === 'previous')) {
                return null;
            }

            if (this.entry.content.has(linkType) && collection) {
                var linkTourName = this.entry.content.get(linkType);
                linkedModel = collection.getTourModel(linkTourName);
            }

            return linkedModel;
        },

        getNextLink: function(collection) {
            return this.getLink('next', collection);
        },

        getPreviousLink: function(collection) {
            return this.getLink('previous', collection);
        },

        getExitLink: function() {
            return this.entry.content.get('exitLink') || '/';
        },

        endTour: function() {
            this.trigger("endTour");
        },

        // Image Tour
        isImgTour: function() {
            return splunk_util.normalizeBoolean(this.getTourType() == 'image');
        },

        getImageContext: function() {
            return this.entry.content.get('context');
        },

        getImgPath: function() {
            return this.entry.content.get('imgPath');
        },

        getImages: function() {
            var images = [],
                imageTotal = this.getImageTotal();

            for (var i = 1; i < imageTotal + 1; i++) {
                var image = this.getImageName(i);
                images.push(image);
            }

            return images;
        },

        getImageCaptions: function() {
            var captions = [],
                imageTotal = this.getImageTotal();

            for (var i = 1; i < imageTotal + 1; i++) {
                var imageCaption = (this.getImageCaption(i)) ? HtmlCleaner.clean('<span>' + this.getImageCaption(i) + '</span>') : ' ';
                captions.push(imageCaption);
            }

            return captions;
        },

        getImageTotal: function() {
            var maxImgs = 30,
                curImg = 0;

            for (var i = 1; i < maxImgs; i++) {
                var hasImg = this.entry.content.has('imageName' + i);
                if (hasImg) {
                    curImg++;
                } else {
                    break;
                }
            }

            return curImg;
        },

        getImageName: function(imgNum) {
            return this.entry.content.get('imageName' + imgNum);
        },

        getImageCaption: function(imgNum) {
            var caption = this.entry.content.get('imageCaption' + imgNum);
            return (caption) ? _(caption).t() : '';
        },

        getImageOrder: function(imgNum) {
            return this.entry.content.get('imageOrder' + imgNum);
        },

        getImageData: function(imgNum) {
            return this.entry.content.get('imageData' + imgNum);
        },

        // Interactive Tour
        isInteractive: function() {
            return splunk_util.normalizeBoolean(this.getTourType() == 'interactive');
        },

        getNextTour: function() {
            return this.entry.content.get('nextTour');
        },

        getTourPage: function() {
            return this.entry.content.get('tourPage') || '';
        },

        getTourURLData: function() {
            return this.entry.content.get('urlData');
        },

        getIntroText: function() {
            var introText = (this.entry.content.get('intro')) ? HtmlCleaner.clean('<span>' + _(this.entry.content.get('intro')).t() + '</span>') : '';
            return introText;
        },

        getNumSteps: function() {
            var maxSteps = 50,
                curStep = 0;

            for (var i = 1; i < maxSteps; i++) {
                var hasStep = this.entry.content.has('stepText' + i);
                if (hasStep) {
                    curStep++;
                } else {
                    break;
                }
            }

            return curStep;
        },

        getSteps: function() {
            var steps = [],
                numSteps = this.getNumSteps();

            if (numSteps > 0) {
                for (var i = 1; i < numSteps + 1; i++) {
                    if (this.entry.content.has('stepText' + i)) {
                        var stepText = HtmlCleaner.clean('<span>' + _(this.entry.content.get('stepText' + i)).t() + '</span>'),
                            stepEl = this.entry.content.get('stepElement' + i) || null,
                            stepPos = this.entry.content.get('stepPosition' + i) || '',
                            stepCallbackEvent = this.entry.content.get('stepClickEvent' + i) || null,
                            stepCallbackEventEl = this.entry.content.get('stepClickElement' + i) || null,
                            stepCallback = {};

                        if (stepCallbackEvent || stepCallbackEventEl) {
                            stepCallback = {
                                eventEl: stepCallbackEventEl,
                                eventType: stepCallbackEvent
                            };
                        }

                        steps.push({element: stepEl, intro: stepText, position: stepPos, callback: stepCallback});
                    } else {
                        break;
                    }
                }
            }

            return steps;
        },

        isLightTour: function() {
            return splunk_util.normalizeBoolean(this.getName() == 'light-product-tour');
        },

        isValidTour: function() {
            if (this.isDisabled()) {
                return false;
            } else if (this.firstTimeCheck()) {
                return !this.viewed();
            }

            return true;
        }
    });
    return Tour;
});
