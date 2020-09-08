/*
 * Intended for use via the class-level API in models/shared/Job.js
 *
 * A helper to manage relationships between a running job and its "search artifacts".  Artifacts include
 * results, events, timeline, and summary information.
 *
 * The intention is that by providing a static helper API to associate jobs and search artifacts, some
 * internal caching logic can be included at the "sync" level (not tied to a particular job instance,
 * but based on the job's sid).
 *
 * This helper is not responsible for polling the job itself, only ensuring that as the job shows progress,
 * the related artifacts are also kept up-to-date.
 */

define([
            'jquery',
            'underscore',
            'backbone'
        ],
        function(
            $,
            _,
            Backbone
        ) {

    var cache = [];

    /*
     * The next two methods are intentionally defined anonymously but intended to be called
     * in the scope of an artifact model.  This allows us to use Backbone's event API to unbind
     * listeners for only a certain artifact model, without having to maintain a registry of
     * which artifact model has bound to which job.
     */

    var jobProgressHandler = function(link, job) {
        if (shouldFetchArtifact(job)) {
            this.safeFetch();
        }
    };

    var jobLinkChangeHandler = function(linkModel, newValue) {
        this.set(this.idAttribute, newValue);
    };

    var shouldFetchArtifact = function(job) {
        return job.entry.content.get('isPreviewEnabled') || job.isDone();
    };

    var ArtifactFetchManager = $.extend({}, Backbone.Events, {

        /**
         * @param artifactModel - can be any model that has an internal `fetchData` model and implements `safeFetch`
         * @param job <models/search/Job> - an instance of an existing job
         * @param linkKey - a valid job.entry.links key ("results", "results_preview", "events", etc.)
         */

        registerArtifactModel: function(artifactModel, job, linkKey) {
            job.on('jobProgress:' + linkKey, jobProgressHandler, artifactModel);
            job.entry.links.on('change:' + linkKey, jobLinkChangeHandler, artifactModel);
            this.listenToOnce(job, 'destroy', this._jobDestroyHandler);
            this.listenTo(artifactModel, 'request', function(artifactModel, response, fetchOptions) {
                this._artifactRequestHandler(artifactModel, response, fetchOptions, job);
            });

            if (job.entry.links.has(linkKey)) {
                artifactModel.set(artifactModel.idAttribute, job.entry.links.get(linkKey));
                var cachedPayload = this._getCachedPayload(artifactModel);
                if (cachedPayload) {
                    // Consumers might not expect this call to synchronously populate the model,
                    // so defer the operation to make it async.
                    _.defer(function() {
                        artifactModel.set(
                            artifactModel.parse($.extend(true, {}, cachedPayload))
                        );
                    });
                }
                else if(!job.isPreparing() && shouldFetchArtifact(job)) {
                    artifactModel.safeFetch();
                }
            }
        },

        unregisterArtifactModel: function(artifactModel, job) {
            job.off(null, jobProgressHandler, artifactModel);
            job.entry.links.off(null, jobLinkChangeHandler, artifactModel);
            artifactModel.fetchAbort();
            this.stopListening(artifactModel);
        },

        _jobDestroyHandler: function(job) {
            cache = _(cache).reject(function(entry) {
                return job.entry.links.has(entry.link);
            });
            job.off(null, jobProgressHandler);
            job.entry.links.off(null, jobLinkChangeHandler);
        },

        _artifactRequestHandler: function(artifactModel, request, fetchOptions, job) {
            if (job.isDone()) {
                request.done(_(function(response) {
                    this._writeToCache(artifactModel, response, fetchOptions);
                }).bind(this));
            }
        },

        _getCachedPayload: function(artifactModel) {
            var matchingEntry = this._findMatchingCacheEntry(artifactModel, artifactModel.fetchData.toJSON());
            return matchingEntry && matchingEntry.payload;
        },

        _writeToCache: function(artifactModel, response, fetchOptions) {
            var fetchData = fetchOptions.data,
                matchingEntry = this._findMatchingCacheEntry(artifactModel, fetchData);

            if (matchingEntry) {
                cache = [matchingEntry].concat(_(cache).without(matchingEntry));
            } else {
                var newEntry = {
                    link: artifactModel.id,
                    payload: $.extend(true, {}, response),
                    fetchParams: $.extend(true, {}, fetchData)
                };
                cache = [newEntry].concat(cache.slice(0, ArtifactFetchManager.CACHE_SIZE_LIMIT - 1));
            }
        },

        _findMatchingCacheEntry: function(artifactModel, fetchData) {
            return _(cache).find(function(entry) {
                return (
                    this._normalizeArtifactId(entry.link) === this._normalizeArtifactId(artifactModel.id) &&
                    _.isEqual(entry.fetchParams, fetchData)
                );
            }, this);
        },

        _normalizeArtifactId: function(link) {
            return link.replace(/^\/services\//, '/servicesNS/nobody/search/');
        },

        // FOR TESTING ONLY
        _clearCache: function() {
            cache = [];
        }

    });

    // VISIBLE FOR TESTING ONLY
    ArtifactFetchManager.CACHE_SIZE_LIMIT = 5;

    return ArtifactFetchManager;

});