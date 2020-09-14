define([
        'jquery',
        'underscore',
        'backbone',
        'module',
        'models/services/authentication/User',
        'views/Base',
        'views/shared/timerangepicker/dialog/Presets',
        'views/shared/timerangepicker/dialog/Relative',
        'views/shared/timerangepicker/dialog/RealTime',
        'views/shared/timerangepicker/dialog/dateandtimerange/Master',
        'views/shared/timerangepicker/dialog/advanced/Master',
        'views/shared/delegates/Accordion',
        './Master.pcss'
    ],
    function($, _, Backbone, module, UserModel, Base, Presets, Relative, RealTime, DateAndTimeRange, Advanced, Accordion, css) {
        /**
         * @param {Object} options {
         *     model: {
         *          timeRange: <models.TimeRange>,
         *          user: <models.services.authentication.User>,
         *          application: <models.Application>
         *     },
         *     collection (Optional): <collections.services.data.ui.TimesV2>
         *     showPresets (Optional): hide or show the Presets panel.
         *     showPresetsRealTime (Optional): hide or show RealTime in the Presets panel.
         *     showPresetsRealTimeOnly (Optional): Only show RealTime in the Presets panel.
         *     showPresetsRelative (Optional): hide or show the Relative in the Presets panel.
         *     showPresetsAllTime (Optional): hide or show All Time in the Presets panel.
         *     showCustom (Optional): hide or show all the Custom panels.
         *     showCustomRealTime (Optional): hide or show the RealTime panel.
         *     showCustomRelative (Optional): hide or show the Relative panel.
         *     showCustomDate (Optional): hide or show the Date Range panel.
         *     showCustomDateTime (Optional): hide or show the Date Time Range panel.
         *     showCustomAdvanced (Optional): hide or show the Advanced panel.
         *     enableCustomAdvancedRealTime (optional): allows the advanced inputs to accept realtime values
         * }
         */
        return Base.extend({
            moduleId: module.id,
            className: 'accordion view-new-time-range-picker-dialog',
            initialize: function() {
                this.model.user = this.model.user || new UserModel();
                var canRTSearch = this.model.user.canRTSearch(),
                    defaults = {
                        showPresets:true,
                        showPresetsRealTime: canRTSearch,
                        showPresetsRealTimeOnly:false,
                        showPresetsRelative:true,
                        showPresetsAllTime:true,
                        showCustom:true,
                        showCustomRealTime: canRTSearch,
                        showCustomRelative:true,
                        showCustomDate:true,
                        showCustomDateTime:true,
                        showCustomAdvanced:true,
                        enableCustomAdvancedRealTime: canRTSearch,
                        appendSelectDropdownsTo: 'body'
                    };

                _.defaults(this.options, defaults);
                Base.prototype.initialize.apply(this, arguments);

                this.renderedDfd = $.Deferred();

                //Panels
                if (this.options.showPresets && this.collection) {
                    this.children.presets = new Presets({
                        collection: this.collection,
                        model: this.model.timeRange,
                        showRealTime:this.options.showPresetsRealTime,
                        showRealTimeOnly:this.options.showPresetsRealTimeOnly,
                        showRelative:this.options.showPresetsRelative,
                        showAllTime:this.options.showPresetsAllTime
                    });
                }
                if (this.options.showCustom) {
                    if (this.options.showCustomRelative) {
                        this.children.relative = new Relative({
                            model: this.model.timeRange,
                            appendSelectDropdownsTo: this.options.appendSelectDropdownsTo
                        });
                    }
                    if (this.options.showCustomRealTime) {
                        this.children.realtime = new RealTime({
                            model: this.model.timeRange,
                            appendSelectDropdownsTo: this.options.appendSelectDropdownsTo
                        });
                    }
                    if (this.options.showCustomDate) {
                        this.children.daterange = new DateAndTimeRange({
                            model: this.model.timeRange,
                            canSetTime: false,
                            label: _("Date Range").t(),
                            appendSelectDropdownsTo: this.options.appendSelectDropdownsTo
                        });
                    }
                    if (this.options.showCustomDateTime) {
                        this.children.dateandtimerange = new DateAndTimeRange({
                            model: this.model.timeRange,
                            canSetTime: true,
                            label: _("Date & Time Range").t(),
                            appendSelectDropdownsTo: this.options.appendSelectDropdownsTo
                        });
                    }
                    if (this.options.showCustomAdvanced) {
                        this.children.advanced = new Advanced({
                            model: {
                                timeRange: this.model.timeRange,
                                application: this.model.application
                            },
                            enableCustomAdvancedRealTime: this.options.enableCustomAdvancedRealTime
                        });
                    }
                }

                this.activate({skipOnChange: true});
            },
            startListening: function() {
                //note this listens for changes on earliest_epoch and latest_epoch because they change after the ajax request completes.
                this.listenTo(this.model.timeRange, 'change:earliest_epoch change:latest_epoch', _.debounce(this.onChange, 0));

                if (this.collection) {
                    this.listenTo(this.collection, 'reset', this.onChange);
                }
            },
            activate: function(options) {
                options = options || {};
                if (this.active) {
                    return Base.prototype.activate.apply(this, arguments);
                }

                Base.prototype.activate.apply(this, arguments);

                if (!options.skipOnChange) {
                    this.onChange();
                }

                return this;
            },
            onChange: function() {
                $.when(this.renderedDfd).then(function() {
                    return this.$el.is(":visible") ? false : this.children.accordion.show(this.getBestGroup(), false);
                }.bind(this));

            },
            getBestGroup: function() {
                var bestPanel = false;

                _.each(this.children, function(panel, key) {
                    if (bestPanel) return false;
                    bestPanel = panel.supportsRange() ? panel : bestPanel;
                }, this);

                bestPanel = bestPanel || this.children.presets || this.children.advanced || this.children.daterange || this.children.dateandtimerange || this.children.relative || this.children.realtime;

                return bestPanel.$el.closest('.accordion-group');
            },
            render: function() {
                var template = _.template(this.template, {
                    cid: this.cid,
                    panels: this.children
                });
                this.$el.html(template);

                _.each(this.children, function(panel, key) {
                    panel.render().appendTo(this.$("#" + key + "_" + this.cid + ' .accordion-body'));
                }, this);

                this.children.accordion = new Accordion({el: this.el, defaultGroup: this.getBestGroup()});
                this.renderedDfd.resolve();
                return this;
            },
            onShown: function() {
                this.$('.accordion-group.active a.accordion-toggle').focus();
            },
            template: '\
                <% _.each(panels, function(panel, key) { %> \
                <div class="accordion-group" id="<%- key + "_" + cid %>">\
                    <div class="accordion-heading">\
                      <a class="accordion-toggle" href="#">\
                        <i class="icon-accordion-toggle"></i><%- panel.label %>\
                      </a>\
                    </div>\
                    <div class="accordion-body">\
                    </div>\
                </div>\
                <% }); %> \
            '
      });
  }
);
