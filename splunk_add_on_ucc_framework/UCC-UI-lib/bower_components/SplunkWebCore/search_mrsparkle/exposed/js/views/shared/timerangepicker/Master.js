define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'views/shared/timerangepicker/dialog/Master',
        'views/shared/delegates/Popdown',
        'collections/SplunkDsBase',
        'splunk.util',
        'util/console',
        './Master.pcss'
    ],
    function($, _, module, Base, Dialog, Popdown, SplunkDsBaseCollection, splunk_util, console, css) {
        /**
         * @param {Object} options {
         *      model: {
         *          state: <models.Backbone> earliest and latest time is set on this model when timerange is selected.,
         *          timeRange: <models.TimeRange>,
         *          user: <models.services.admin.User>,
         *          application: <models.Application>
         *      },
         *      collection: <collections.services.data.ui.TimesV2>
         *      {String} timerangeClassName (Optional) Class attribute to the button element. Default is btn.
         *      {Object} dialogOptions: (Optional) Keys and values passed to the dialog for customization. See views/shared/timerangepicker/dialog/Master.
         *      {Object} popdownOptions: (Optional) Keys and values passed to the popdown for customization.
         *      {Boolean} forceTimerangeChange: (Optional) Force timerange change event when applied
         *                    is triggered on the timeRange model even if timerange has not changed. default false.
         * }
         */
        return Base.extend({
            moduleId: module.id,
            initialize: function(options) {
                var defaults = {
                    timerangeClassName: 'btn'
                };

                _.defaults(this.options, defaults);
                this.timeRangeAttrNames = _.extend({
                    earliest: 'dispatch.earliest_time',
                    latest: 'dispatch.latest_time'
                }, this.options.timeRangeAttrNames);

                Base.prototype.initialize.call(this, options);

                this.children.dialog = new Dialog(
                    $.extend(
                        {
                            model: {
                                timeRange: this.model.timeRange,
                                user: this.model.user,
                                application: this.model.application
                            },
                            collection: this.collection
                        },
                        this.options.dialogOptions || {}
                     )
                );

                this.activate({skipSetLabel: true});
            },
            startListening: function() {
                if (this.collection) {
                    this.listenTo(this.collection, 'reset', function(){
                        console.warn("timerangepicker setting label because of collection reset");
                        this.setLabel();
                    });
                }

                this.listenToModels();
            },
            listenToModels: function() {
                this.listenTo(this.model.timeRange, 'change:earliest change:latest', _.debounce(function() {
                    if (this.active) {
                        this.timeRangeChange();
                    }
                }, 0));

                this.listenTo(this.model.timeRange, 'applied', function() {
                    var stateModelAttrs = {};
                    this.children.popdown.hide();
                    
                    if (this.options.forceTimerangeChange && !this.model.timeRange.hasChanged('earliest') && !this.model.timeRange.hasChanged('latest')) {
                        this.model.state.unset(this.timeRangeAttrNames.earliest, {silent: true});
                        this.model.state.unset(this.timeRangeAttrNames.latest, {silent: true});
                        stateModelAttrs[this.timeRangeAttrNames.earliest] = this.model.timeRange.get('earliest');
                        stateModelAttrs[this.timeRangeAttrNames.latest] = this.model.timeRange.get('latest');
                        this.model.state.set(stateModelAttrs);
                    }
                });

                this.listenTo(this.model.timeRange, 'change:earliest_epoch change:latest_epoch change:earliest change:latest', _.debounce(function() {
                    if (this.active) {
                        this.setLabel();
                    }
                }, 0));

                this.listenTo(this.model.state, 'change:' + this.timeRangeAttrNames.earliest + ' change:' + this.timeRangeAttrNames.latest, _.debounce(function(){
                    if (this.active) {
                        this.stateChange();
                    }
                }, 0));
            },
            stopListeningToModels: function() {
                this.stopListening(this.model.timeRange);
                this.stopListening(this.model.state);
            },
            activate: function(options) {
                options = options || {};

                if (this.active) {
                    return Base.prototype.activate.apply(this, arguments);
                }

                if (!options.skipSetLabel) {
                    this.setLabel();
                }

                Base.prototype.activate.apply(this, arguments);

                this.model.timeRange.trigger("prepopulate");

                return this;
            },
            stateChange: function() {
                this.stopListeningToModels();
                this.model.timeRange.clear({silent:true, setDefaults: true});
                this.model.timeRange.save(
                    {
                        'earliest': this.model.state.get(this.timeRangeAttrNames.earliest),
                        'latest':this.model.state.get(this.timeRangeAttrNames.latest)
                    },
                    {
                        wait: true,
                        success: function(model, response) {
                            this.listenToModels();
                            this.setLabel();
                        }.bind(this),
                        error: function(model, response) {
                            this.listenToModels();
                            this.setLabel();
                        }.bind(this)
                    }
                );
            },
            timeRangeChange: function() {
                var stateModelAttrs = {};
                this.stopListeningToModels();
                stateModelAttrs[this.timeRangeAttrNames.earliest] = this.model.timeRange.get('earliest');
                stateModelAttrs[this.timeRangeAttrNames.latest] = this.model.timeRange.get('latest');
                this.model.state.set(stateModelAttrs);
                this.listenToModels();
            },
            setLabel: function() {
                if (this.$el.html()) {
                    var timeLabel = this.model.timeRange.generateLabel(this.collection || new SplunkDsBaseCollection());
                    this.$el.children('a').find(".time-label").text(_(timeLabel).t()).attr('title', _(timeLabel).t());
                }
            },
            render: function() {
                if (this.$el.html()) {
                    return this;
                }

                this.$el.html(this.compiledTemplate({
                    options: this.options
                }));

                this.children.dialog.render().appendTo(this.$('.popdown-dialog'));

                this.children.popdown = new Popdown(_.extend({
                    el: this.el,
                    toggle:'> a',
                    mode: "dialog",
                    attachDialogTo: 'body',
                    dialogResizes: true,
                    ignoreClasses: [
                        "ui-datepicker",
                        "ui-datepicker-header",
                        "dropdown-menu"
                    ]
                }, this.options.popdownOptions || {}));

                this.children.popdown.on('shown', function() {
                    if (this.children.dialog.$(".accordion-group.active").length){
                        this.children.dialog.onShown();
                        return;
                    }
                    var timePanel = "presets";
                    this.children.dialog.children[timePanel].$el.closest(".accordion-group").find(".accordion-toggle").first().click();
                    this.children.dialog.onShown();
                }, this);

                this.setLabel();

                return this;
            },
            template: '\
                <a class=" splBorder splBorder-nsew splBackground-primary <%- options.timerangeClassName %>" href="#"><span class="time-label"></span><span class="caret"></span></a>\
                <div class="popdown-dialog">\
                    <div class="arrow"></div>\
                </div>\
                '
        });
    }
);
