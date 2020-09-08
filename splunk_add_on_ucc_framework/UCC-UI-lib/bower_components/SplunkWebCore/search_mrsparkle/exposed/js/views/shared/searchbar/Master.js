define(
    [
        'jquery',
        'underscore',
        'backbone',
        'module',
        'views/Base',
        'views/shared/searchbar/Apps',
        'views/shared/searchbarinput/Master',
        'views/shared/timerangepicker/Master', 
        'splunk.util',
        './Master.pcss'
    ],
    function($, _, Backbone, module, BaseView, Apps, Input, TimeRangePicker, splunkUtils, css) {
        return BaseView.extend({
            moduleId: module.id,
            className: 'search-bar-wrapper',
            /**
             * @param {Object} options {
             *     model: {
             *         state: <models.Backbone> A model with the attr 'search', dispatch.earliest_time (if showTimeRangePicker), dispatch.latest_time (if showTimeRangePicker), display.prefs.searchContext (if collection.apps). 
             *                 The value of 'search' populates the search bar on initialize, activate and change.
             *                 The value of 'search' is set on submit.
             *                 Triggering 'applied' on this model calls submit.
             *         user: <models.services.authentication.User>,
             *         application: <models.Application>,
             *         timeRange: <models.TimeRange> (Optional) only needed if showTimeRangePicker,
             *         searchBar: <models.search.SearchBar> (Optional) created if not passed in.
             *                    This represents the state of the search string in the text area.
             *                    Listens to change of search attribute and updates text area.
             *     },
             *     collection: {
             *         searchBNFs: <collections/services/configs/SearchBNFs>,
             *         times (Optional): <collections.services.data.ui.TimesV2>,
             *         apps (Optional): <collections.services.AppsLocals>
             *     },
             *     showTimeRangePicker: <Boolean> determines if time range picker is shown.
             *     shared/searchbarinput/Master options: All options passed to this view are passed to the searchbarinput.
             * }
             */
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                _.defaults(this.options, {
                    showTimeRangePicker:true,
                    submitOnBlur: false,
                    giveFocusOnRender: true,
                    forceChangeEventOnSubmit: true,
                    submitEmptyString: false
                });
                this.showTimeRangePicker = this.options.showTimeRangePicker;

                if (this.collection && this.collection.apps) {
                    this.children.apps = new Apps({
                        collection: this.collection.apps,
                        model: this.model.state,
                        applicationModel: this.model.application
                    });
                }
                
                this.children.searchInput = new Input($.extend(true, {}, this.options, {
                    model: {
                        user: this.model.user,
                        content: this.model.state,
                        application: this.model.application,
                        searchBar: this.model.searchBar
                    },
                    collection: {
                        searchBNFs: this.collection.searchBNFs
                    }
                }));
                
                if (this.options.showTimeRangePicker) {
                    this.children.timeRangePicker = new TimeRangePicker({
                        model: {
                            state: this.model.state,
                            timeRange: this.model.timeRange,
                            user: this.model.user,
                            application: this.model.application
                        },
                        collection: this.collection.times,
                        className: 'btn-group',
                        timerangeClassName: 'btn',
                        forceTimerangeChange: true
                    });
                }

            },
            
            events: {
                'click .search-button > .btn': function(e) {
                    e.preventDefault();
                    this.submit();
                }
            },

            startListening: function() {
                this.listenTo(this.children.searchInput, 'changedAutoOpenAssistant', function(value) {
                    this.trigger('changedAutoOpenAssistant', value);
                });
            },
            
            /**
             * Disable the search input, make the search string unwritable.
             */
            disable: function() {
                this.children.searchInput.disable();
            },
            
            /**
             * Enable the search input, make the search string editable.
             * If option disableOnSubmit this must be called to re enable the input.
             */
            enable: function() {
                this.children.searchInput.enable();
            },
            
            /**
             * Updates the text value in the searchbar input. The text is not submitted. 
             * @param {string} search
             */
            setText: function(search) {
                this.children.searchInput.setText(search);
            },
            
            /**
             * Returns the text value in the searchbar input. The text is not necessarily submitted. 
             * @return {string} search
             */
            getText: function() {
                return this.children.searchInput.getText();
            },
            
            /**
             * Sets the autoOpenAssistant option.
             * @param {boolean} value
             */
            setAutoOpenAssistantOption: function (value) {
                this.options.autoOpenAssistant = splunkUtils.normalizeBoolean(value);
                this.children.searchInput.setAutoOpenAssistantOption(value);
            },
            
            /**
             * Sets the search attribute on the content model to the text value in the search bar input.
             * @param {object} options {
             *     forceChangeEvent: <Boolean> Determines if a change event is triggered on submit if 
             *         the search string has not changed. If set to true the event will fire.
             *         Default to the view's option forceChangeEventOnSubmit which defaults to true.
             * }
             */
            submit: function(options) {
                this.children.searchInput.submit(options);
            },
            
            render: function() {
                if (!this.$el.html()) {
                    var template = _.template(this.template, {showTimeRangePicker: this.options.showTimeRangePicker});
                    this.$el.html(template);

                    if (this.children.apps) {
                        this.children.apps.render().appendTo(this.$('.search-apps'));
                    }
                    
                    this.children.searchInput.render().appendTo(this.$('.search-input'));
                    
                    if (this.children.timeRangePicker) {
                        this.children.timeRangePicker.render().appendTo(this.$('.search-timerange'));
                    }
                }
                return this;
            },
            template: '\
                <form method="get" action="" class="search-form">\
                    <table class="search-bar">\
                        <tbody>\
                            <tr>\
                                <td class="search-input" width="100%"></td>\
                                <td class="search-apps"></td>\
                                <% if (showTimeRangePicker) { %>\
                                    <td class="search-timerange"></td>\
                                <% } %>\
                                <td class="search-button">\
                                    <a class="btn" href="#"><i class="icon-search-thin"></i></a>\
                                </td>\
                            </tr>\
                        </tbody>\
                    </table>\
                </form>\
            '
        });
    }
);
