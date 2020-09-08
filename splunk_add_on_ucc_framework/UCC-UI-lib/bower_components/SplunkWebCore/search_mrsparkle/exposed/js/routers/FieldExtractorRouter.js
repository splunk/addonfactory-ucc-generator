define([
            'underscore',
            'jquery',
            'routers/Base',
            'collections/services/data/props/Extractions',
            'collections/knowledgeobjects/Sourcetypes',
            'collections/services/authorization/Roles',
            'models/services/data/props/Extraction',
            'models/search/Job',
            'models/services/search/jobs/Summary',
            'models/services/search/jobs/Result',
            'views/shared/FlashMessages',
            'views/field_extractor/FieldExtractorMaster',
            'util/splunkd_utils',
            'util/field_extractor_utils',
            'splunk.util'
        ],
        function(
            _,
            $,
            BaseRouter,
            Extractions,
            Sourcetypes,
            Roles,
            Extraction,
            Job,
            Summary,
            Result,
            FlashMessages,
            FieldExtractorMaster,
            splunkdUtils,
            fieldExtractorUtils,
            splunkUtils
        ) {

    var JOB_FETCH_ERROR = 'job-fetch-error',
        EXTRACTION_FETCH_ERROR = 'extraction-fetch-error',
        JOB_SOURCETYPE_ERROR = 'job-sourcetype-error',
        BAD_REQUEST = 'bad-request';

    return BaseRouter.extend({

        initialize: function() {
            BaseRouter.prototype.initialize.apply(this, arguments);
            this.fetchUser = true;
            this.setPageTitle(_('Field Extractor').t());
            this.collection.extractions = new Extractions();
            this.collection.sourcetypes = new Sourcetypes();
            this.collection.roles = new Roles();
            this.collection.sourcetypes.fetchData.set({
                count: 200
            }, { silent: true });
            this.model.extraction = new Extraction();
        },

        page: function(locale, app, page) {
            BaseRouter.prototype.page.apply(this, arguments);
            this.model.classicurl.fetch().done(_(function() {
                // No matter what, we'll need the roles and apps.
                var bootstrapDfd = $.when(this.bootstrapRoles(), this.deferreds.pageViewRendered, this.deferreds.serverInfo, this.deferreds.user);
                // NOTE: all branches must ensure that this.sourcetype is set correctly (or correctly not set)
                //       when bootstrapDfd is resolved.
                if(this.model.classicurl.has('sid')) {
                    // When operating from an sid, we need to determine which sourcetypes should be available.
                    this.sid = this.model.classicurl.get('sid');
                    bootstrapDfd = $.when(
                        bootstrapDfd,
                        // If we have a reference to a specific event, we will use its sourcetype so no need to fetch the list.
                        this.model.classicurl.has('offset') || this.fetchAllowedSourcetypes().then(_(function(allowedSourcetypes) {
                            // If there is only one sourcetype, just use it, no need to fetch the list (SPL-88198).
                            if(allowedSourcetypes.length === 1) {
                                this.sourcetype = allowedSourcetypes[0];
                                return $.Deferred().resolve();
                            }
                            return this.bootstrapSourcetypes(allowedSourcetypes);
                        }).bind(this))
                    );
                    if(this.model.classicurl.has('offset')) {
                        bootstrapDfd = $.when(
                            bootstrapDfd,
                            this.bootstrapEventByOffset()
                        );
                    }
                }
                else {
                    // When loading an existing extraction, use its sourcetype.
                    if(this.model.classicurl.has('extractionId')) {
                        var extractionDfd = this.bootstrapExtractionById(this.model.classicurl.get('extractionId'));
                        bootstrapDfd = $.when(bootstrapDfd, extractionDfd.then(_(function() {
                            this.sourcetype = this.model.extraction.entry.content.get('stanza');
                        }).bind(this)));
                    }
                    // When not loading from an sid or an existing extraction, either use the sourcetype from the URL,
                    // or if there is not one, load all available sourcetypes.
                    else {
                        if(this.model.classicurl.has('sourcetype')) {
                            this.sourcetype = this.model.classicurl.get('sourcetype');
                        }
                        else {
                            bootstrapDfd = $.when(bootstrapDfd, this.bootstrapSourcetypes());
                        }
                    }
                }
                bootstrapDfd
                    .done(_(function() {
                        $.when(this.bootstrapExtractions()).done(
                            _(function() {
                                if(this.shouldRender) {
                                    $('.preload').replaceWith(this.pageView.el);
                                }
                                if(this.masterView) {
                                    this.stopListening(this.masterView);
                                    this.masterView.remove();
                                }
                                this.masterView = new FieldExtractorMaster({
                                    sourcetype: this.sourcetype,
                                    sid: this.sid,
                                    existingExtractions: this.existingExtractions,
                                    masterEvent: this.masterEvent,
                                    model: {
                                        application: this.model.application,
                                        user: this.model.user,
                                        extraction: this.model.extraction,
                                        serverInfo: this.model.serverInfo
                                    },
                                    collection: {
                                        extractions: this.collection.extractions,
                                        sourcetypes: this.collection.sourcetypes,
                                        roles: this.collection.roles
                                    }
                                });
                                this.masterView.render().appendTo(this.pageView.$('.main-section-body'));
                                this.onAfterPageRender();
                            }).bind(this)
                        );
                    }).bind(this))
                    .fail(_(this.displayLoadError).bind(this));
            }).bind(this));
        },

        bootstrapSourcetypes: function(allowedSourcetypes) {
            var fetchData = this.model.application.pick('app', 'owner');
            if(allowedSourcetypes) {
                fetchData.search = _(allowedSourcetypes)
                    .map(function(sourcetype) { return 'name=' + splunkUtils.searchEscape(sourcetype); })
                    .join(' OR ');
            }
            return this.collection.sourcetypes.fetch({ data: fetchData }).then(
                _(function() {
                    if(this.collection.sourcetypes.length === 0) {
                        return $.Deferred().reject(JOB_SOURCETYPE_ERROR);
                    }
                }).bind(this),
                function() {
                    return JOB_SOURCETYPE_ERROR;
                }
            );
        },

        bootstrapExtractions: function() {
            if (this.sourcetype) {
                var extractionSearch = 'type=inline AND stanza=' + this.sourcetype;
                this.collection.extractions.fetchData.set({
                    search: extractionSearch,
                    count: 0
                }, { silent: true });
                return this.collection.extractions.fetch({ data: this.model.application.pick('app', 'owner') }).done(_(function() {
                    // Filter out extractions that are using the <regex> in <field> syntax, we only want extractsion from _raw.
                    var filteredModels = this.collection.extractions.filter(function(model) {
                        return !/ in [a-zA-Z0-9_]+$/.test(model.entry.content.get('value'));
                    });
                    this.collection.extractions.reset(filteredModels);
                }).bind(this));
            }
        },

        bootstrapRoles: function() {
            return this.collection.roles.fetch({ data: this.model.application.pick('app', 'owner') });
        },

        bootstrapExtractionById: function(id) {
            this.model.extraction.clear();
            this.model.extraction.set(this.model.extraction.idAttribute, id);
            return this.model.extraction.fetch().then(
                null,
                function() {
                    return EXTRACTION_FETCH_ERROR;
                }
            );
        },

        fetchAllowedSourcetypes: function() {
            var summary = new Summary();
            summary.set(
                summary.idAttribute,
                splunkdUtils.fullpath(
                    Job.prototype.url + '/' + this.sid + '/summary',
                    this.model.application.pick('app', 'owner')
                )
            );
            var summaryFetch = summary.fetch({ data: { top_count: 100, f: 'sourcetype' } });
            return summaryFetch.then(
                _(function() {
                    var sourcetypeSummary = summary.fields.get('sourcetype');
                    if(!sourcetypeSummary) {
                        return $.Deferred().reject(JOB_SOURCETYPE_ERROR);
                    }
                    return _(sourcetypeSummary.get('modes')).pluck('value');
                }).bind(this),
                function() {
                    return JOB_FETCH_ERROR;
                }
            );
        },

        bootstrapEventByOffset: function() {
            var result = new Result();
            result.set(
                result.idAttribute,
                splunkdUtils.fullpath(
                    Job.prototype.url + '/' + this.sid + '/events',
                    this.model.application.pick('app', 'owner')
                )
            );
            var fetchData = {
                offset: this.model.classicurl.get('offset'),
                count: 1,
                field_list: '_raw,sourcetype',
                max_lines: fieldExtractorUtils.MAX_EVENT_LINES
            };
            return result.fetch({ data: fetchData }).then(
                _(function() {
                    var eventInfo = result.results.at(0);
                    if(!eventInfo.has('sourcetype')) {
                        return $.Deferred().reject(JOB_SOURCETYPE_ERROR);
                    }
                    this.masterEvent = eventInfo.get('_raw')[0];
                    this.sourcetype = eventInfo.get('sourcetype')[0];

                    var extractionSearch = 'type=inline AND stanza=' + this.sourcetype,
                        extractions = new Extractions();
                    extractions.fetchData.set({
                        search: extractionSearch,
                        count: 0
                    }, { silent: true });
                    return extractions.fetch({ data: this.model.application.pick('app', 'owner') }).then(_(function() {
                        // Filter out extractions that are using the <regex> in <field> syntax, we only want extractsion from _raw.
                        var filteredModels = extractions.filter(function(model) {
                            return !/ in [a-zA-Z0-9_]+$/.test(model.entry.content.get('value'));
                        });
                        extractions.reset(filteredModels);

                        var search = 'search index=* sourcetype=' + splunkUtils.searchEscape(this.sourcetype),
                            field_list = [];
                        // Add a rex command for each existing extraction.
                        (extractions).each((function(extraction, i) {
                            var pipeToRex = splunkUtils.sprintf(
                                ' | rex field=_raw %s' + ' offset_field=%s' + i,
                                //splunkUtils.searchEscape('_raw'),
                                splunkUtils.searchEscape(extraction.entry.content.get('value'), { forceQuotes: true }),
                                fieldExtractorUtils.OFFSET_FIELD_NAME
                            );
                            field_list.push(fieldExtractorUtils.OFFSET_FIELD_NAME + i);
                            search += pipeToRex;
                        }).bind(this));

                        var extractionResults = new Result();
                        extractionResults.set(
                            extractionResults.idAttribute,
                            splunkdUtils.fullpath(
                                Job.prototype.url + '/' + this.sid + '/events',
                                this.model.application.pick('app', 'owner')
                            )
                        );
                        fetchData = {
                            offset: this.model.classicurl.get('offset'),
                            count: 1,
                            field_list: field_list.join(),
                            search: search,
                            max_lines: fieldExtractorUtils.MAX_EVENT_LINES
                        };
                        return extractionResults.fetch({data: fetchData}).then(
                            _(function() {
                                // Set existing extractions
                                var extraction = extractionResults.results.at(0),
                                    boundingGroup,
                                    boundingGroups = [];
                                for (var i = 0; i < field_list.length; i++){
                                    boundingGroup = extraction.get(field_list[i]) ? extraction.get(field_list[i])[0] : null;
                                    boundingGroups = boundingGroups.concat(boundingGroup ? fieldExtractorUtils.parseBoundingGroupString(boundingGroup, true) : []);
                                }

                                this.existingExtractions = _(boundingGroups).sortBy('startIndex');
                                return $.Deferred().resolve();
                            }).bind(this),
                            _(function(response, errorType, errorMessage){
                                if('responseText' in response){
                                    var respObj = JSON.parse(response.responseText);
                                    if ('messages' in respObj
                                        && respObj.messages.length > 0
                                        && 'text' in respObj.messages[0]) {
                                            this.displayLoadError(BAD_REQUEST, respObj.messages[0].text);
                                    }
                                }
                            }).bind(this)
                        );
                    }).bind(this)
                    );
                }).bind(this),
                function() {
                    return JOB_FETCH_ERROR;
                }
            );
        },

        displayLoadError: function(errorType, errorMsg) {
            var messages = [],
                flashMessages = new FlashMessages();

            if(errorType === JOB_FETCH_ERROR) {
                messages.push(splunkUtils.sprintf(_('Unknown sid: %s').t(), _.escape(this.sid)));
            }
            else if(errorType === EXTRACTION_FETCH_ERROR) {
                messages.push(splunkUtils.sprintf(_('Extraction not found: %s').t(), _.escape(this.model.extraction.id)));
            }
            else if(errorType === JOB_SOURCETYPE_ERROR) {
                messages.push(splunkUtils.sprintf(_('The events associated with this job have no sourcetype information: %s').t(), _.escape(this.sid)));
            }else if(errorType === BAD_REQUEST) {
                messages.push(_(_.escape(errorMsg)).t());
            }
            _(messages).each(function(message) {
                flashMessages.flashMsgHelper.addGeneralMessage(_.uniqueId('field-extractor-error'), {
                    type: splunkdUtils.ERROR,
                    html: message
                });
            });
            $.when(this.deferreds.pageViewRendered).done(_(function() {
                this.pageView.replaceAll($('.preload'));
                flashMessages.render().appendTo(this.pageView.$('.main-section-body'));
            }).bind(this));
        },

        onAfterPageRender: function() {
            // If we're doing things based on an existing job, make sure to keep that job alive.
            if(this.sid) {
                var job = new Job({}, { delay: Job.DEFAULT_LONG_POLLING_INTERVAL, processKeepAlive: true });
                job.set(job.idAttribute, this.sid);
                job.fetch({ data: this.model.application.pick('app', 'owner') }).done(_(function() {
                    // In the success handler, poll the job if it's not already done.
                    if(!job.isDone()) {
                        job.startPolling();
                        job.stopKeepAlive();
                    }
                }).bind(this));
            }
        }

    });

});
