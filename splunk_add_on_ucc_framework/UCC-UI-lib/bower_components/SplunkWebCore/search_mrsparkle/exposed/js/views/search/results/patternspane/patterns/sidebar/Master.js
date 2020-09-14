define(
    [
        'jquery',
        'underscore',
        'module',
        'models/search/Report',
        'views/Base',
        'views/search/actions/eventtype/Master',
        'views/shared/alertcontrols/dialogs/saveas/Master',
        'views/search/results/patternspane/patterns/sidebar/EstimatedEvents',
        'uri/route',
        'splunk.i18n',
        'splunk.util'
    ],
    function($, _, module, ReportModel, Base, EventTypeDialog, AlertDialog, EstimatedEvents, route, i18n, splunkUtil){
        return Base.extend({
            moduleId: module.id,
            className: 'pattern-details',
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);

                this.children.estimatedEvents = new EstimatedEvents({
                    model: {
                        patternData: this.model.patternData,
                        searchJob: this.model.searchJob,
                        state: this.model.state
                    }
                });
            },
            startListening: function() {
                this.listenTo(this.model.patternData, 'sync', this.render);
                
                this.listenTo(this.model.patternJob, 'restart', function() {
                    this.model.state.unset('selectedPattern');
                });

                this.listenTo(this.model.state, 'change:selectedPattern', this.debouncedRender);

                this.listenTo(this.model.state, 'updateCenter', this.setDetailsSinglePosition);
            },
            activate: function(options) {
                if (this.active) {
                    return Base.prototype.activate.apply(this, arguments);
                }
                
                this.render();
                
                $(window).on('scroll .' + this.moduleId, function(e) {
                    if (this.pattern) {
                        this.setDetailsSinglePosition();
                    }
                }.bind(this));
                
                return Base.prototype.activate.apply(this, arguments);
            },
            deactivate: function(options) {
                if (!this.active) {
                    return Base.prototype.deactivate.apply(this, arguments);
                }

                $(window).off('.' + this.moduleId);

                Base.prototype.deactivate.apply(this, arguments);
                delete this.pattern;

                return this;
            },
            events: {
                'click .close': function(e) {
                    e.preventDefault();
                    this.model.state.trigger('unselectPattern', this.pattern.cid);
                    this.model.state.unset('selectedPattern');
                },
                'click .save-event-type': function(e) {
                    e.preventDefault();
                    var patternReport = new ReportModel();
                    patternReport.entry.content.set('search', this.pattern.getExampleSearch());
                    this.children.eventTypeDialog = new EventTypeDialog({
                        model:  {
                            application: this.model.application,
                            user: this.model.user,
                            report: patternReport
                        },
                        showSearch: true,
                        onHiddenRemove: true
                    });

                    this.children.eventTypeDialog.render().appendTo($('body')).show();
                    this.children.eventTypeDialog.show();
                },
                'click .save-alert': function(e) {
                    e.preventDefault();
                    var patternReport = new ReportModel();
                    patternReport.fetch({
                        data: {
                            app: this.model.application.get("app"),
                            owner: this.model.application.get("owner")
                        },
                        success: function(model, response){
                            patternReport.entry.content.set('search', this.pattern.getExampleSearch());
                            this.children.alertDialog = new AlertDialog({
                                model:  {
                                    report: patternReport,
                                    application: this.model.application,
                                    user: this.model.user,
                                    serverInfo: this.model.serverInfo
                                },
                                collection: {
                                    times: this.collection.times
                                },
                                showSearch: true,
                                onHiddenRemove: true
                            });
                            
                            this.children.alertDialog.render().appendTo($('body')).show();
                            this.children.alertDialog.show();
                        }.bind(this)
                    });
                },
                'click a.view-events': function(e) {
                    e.preventDefault();
                    this.model.report.entry.content.set({
                        'search': this.pattern.getExampleSearch(),
                        'display.page.search.tab': 'events'
                    });
                },
                'click .refresh': function(e) {
                    e.preventDefault();
                    this.model.patternJob.trigger('restart');
                    this.render();
                } 
            },
            setDetailsSinglePosition: function() {
                if (this.$detailsSingle) {
                    var $eventType = this.$detailsSingle.find('.event-type'),
                        detailsSingleHeight = this.$detailsSingle.outerHeight(),
                        eventTypeHeight = $eventType.outerHeight(),
                        maxHeight = Math.max($(window).height() - (detailsSingleHeight - eventTypeHeight), 30),
                        maxTop = this.$el.height() - detailsSingleHeight, 
                        centeredTop = this.model.state.get('selectedRowCenter') - Math.floor(detailsSingleHeight / 2),
                        detailsSingleTop = centeredTop,
                        minWindowTop = $(window).scrollTop() - this.$el.offset().top,
                        maxWindowTop = Math.min(minWindowTop + $(window).height(), this.$el.outerHeight()) - this.$detailsSingle.outerHeight();

                    $eventType.css('max-height', maxHeight + 'px');
    
                    if (centeredTop > maxTop) {
                        detailsSingleTop = maxTop;
                    }
    
                    if (centeredTop < 0) {
                        detailsSingleTop = 0;
                    }
    
                    detailsSingleTop = Math.max(Math.min(Math.max(detailsSingleTop, minWindowTop), maxWindowTop), 0);
    
                    this.$detailsSingle.css('top', detailsSingleTop);
                    this.$arrow.css('top', this.model.state.get('selectedRowCenter') - this.$arrow.outerHeight() / 2);

                    this.model.state.trigger('sidebarHeightUpdated', this.$detailsSingle.outerHeight() - 20);
                }
            },
            render: function() {
                this.pattern = this.model.patternData.results.get(this.model.state.get('selectedPattern'));
                var search = this.pattern && this.pattern.getExampleSearch(),
                    numNewEvents = parseInt(this.model.searchJob.entry.content.get('eventCount'), 10) - this.model.patternJob.getParentEventCount(),
                    root = this.model.application.get('root'),
                    locale = this.model.application.get('locale'),
                    searchHref, docHref; 
                
                if (this.pattern) {
                    if (search) {
                        searchHref = route.search(
                            root,
                            locale,
                            this.model.application.get('app'),
                            {
                                data: {
                                    q: this.pattern.getExampleSearch(),
                                    earliest: this.model.report.entry.content.get('dispatch.earliest_time'),
                                    latest: this.model.report.entry.content.get('dispatch.latest_time')
                                }
                            }
                        );
                    }
                    
                    this.$el.addClass('dark');
                    this.$el.html(this.compiledTemplate({
                        _: _,
                        i18n: i18n,
                        splunkUtil: splunkUtil,
                        includeTerms: this.pattern.getIncludeTerms(),
                        excludeTerms: this.pattern.getExcludeTerms(),
                        numInPattern: this.pattern.getNumInPattern(),
                        search: search,
                        searchHref: searchHref,
                        eventtypeable: this.pattern.isEventTypeable(),
                        canAlert: this.model.user.canUseAlerts() && this.model.user.canScheduleSearch(),
                        numNewEvents: numNewEvents
                    }));
                    if (search) {
                        this.$el.find('.estimated-events-container').html(this.children.estimatedEvents.render().$el);
                    }
                    this.$detailsSingle = this.$('.pattern-details-single');
                    this.$arrow = this.$('.arrow');
                    this.setDetailsSinglePosition();
                } else {
                    docHref = route.docHelp(root, locale, 'learnmore.search.event.patterns');
                    this.$el.removeClass('dark');
                    this.$el.html(_.template(this.instructionsTemplate, { docHref: docHref }));
                }

                return this;
            },
            instructionsTemplate: '\
                <a href="<%- docHref %>" target="_blank" class="documentation" title="<%- _("Documentation").t() %>"><%- _("Documentation").t() %> <i class="icon-external"></i></a>\
                <div class="pattern-details-none">\
                    <div class="instruction">\
                        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="1068 790.8 99.9 103" enable-background="new 1068 790.8 99.9 103" xml:space="preserve">\
                            <polygon points="1166.4,886.2 1139.9,858.6 1154.5,850.6 1098.9,821.8 1125.2,878.9 1133.5,864.5 1160.2,892.3 "/>\
                            <g>\
                                <path d="M1098.9,844.8c-0.7,0-1.3,0-2-0.1"/>\
                                <path stroke-dasharray="3.9362,6.8884" d="M1090.2,843.1c-8.4-3.4-14.3-11.7-14.3-21.3c0-12.7,10.3-23,23-23c10.8,0,19.9,7.5,22.4,17.6"/>\
                                <path d="M1121.8,819.8c0.1,0.7,0.1,1.3,0.1,2"/>\
                            </g>\
                        </svg>\
                        <div><%- _("Click a pattern for more information.").t() %></div>\
                    </div>\
                </div>\
            ',
            template: '\
                <div class="arrow"></div>\
                <div class="pattern-details-single">\
                    <a href="#" class="pull-right close"><i class="icon-close"></i></a>\
                    <% if (search) { %>\
                        <div class="info-group">\
                            <div class="subtitle"><%- _("Estimated Events").t() %></div>\
                            <div class="estimated-events-container"></div>\
                            <% if (search) { %>\
                                <a href="<%= searchHref %>" class="view-events"><%- _("View Events").t() %></a>\
                            <% } %>\
                        </div>\
                        <div class="info-group">\
                            <div class="subtitle"><%- _("Search").t() %></div>\
                            <div class="event-type"><%- search %></div>\
                            <% if (eventtypeable) { %>\
                                <a class="save-event-type" href="#"><%- _("Save as event type").t() %></a>\
                            <% } %>\
                            <% if (canAlert) { %>\
                                <a class="save-alert" href="#"><%- _("Create alert").t() %></a>\
                            <% } %>\
                        </div>\
                        <% if (includeTerms.length) { %>\
                            <div class="info-group">\
                                <div class="subtitle"><%- _("Included Keywords").t() %></div>\
                                <div class="terms-group">\
                                    <% _(includeTerms).each(function(term) { %>\
                                        <div><%- term %></div>\
                                    <% }) %>\
                                </div>\
                            </div>\
                        <% } %>\
                        <% if (excludeTerms.length) { %>\
                            <div class="info-group">\
                                <div class="subtitle"><%- _("Excluded Keywords").t() %></div>\
                                <div class="terms-group">\
                                    <% _(excludeTerms).each(function(term) { %>\
                                        <div><%- term %></div>\
                                    <% }) %>\
                                </div>\
                            </div>\
                        <% } %>\
                    <% } else { %>\
                        <div class="info-group">\
                            <div class="alert alert-warning %>">\
                                <i class="icon-alert"></i>\
                                <p><%- _("There were too few events in the sample to generate a pattern.").t() %></p>\
                                <p><%- _("Try generating fewer patterns by adjusting the slider above.").t() %></p>\
                                <% if (numNewEvents) { %>\
                                    <p><a href="#" class="refresh">\
                                        <%- _("Try regenerating the patterns with the latest events.").t() %>\
                                    </a></p>\
                                <% } %>\
                            </div>\
                        </div>\
                    <% } %>\
                </div>\
            '
        });
    }
);
