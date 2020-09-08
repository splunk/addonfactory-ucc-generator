define(
    [
        'module',
        'jquery',
        'underscore',
        'models/search/Report',
        'views/shared/controls/SyntheticSelectControl',
        'views/shared/jobstatus/samplingmode/Dialog',
        'splunk.util',
        'splunk.i18n',
        'util/time'
    ],
    function(
        module,
        $,
        _,
        ReportModel,
        SyntheticSelectControl,
        SampleRatioDialog,
        splunkUtil,
        i18n,
        timeUtil
    )
    {
        return SyntheticSelectControl.extend({
            moduleId: module.id,
            initialize: function(options) {    
                options.items = this.generateItems();
                options.modelAttribute = 'dispatch.sample_ratio';
                options.toggleClassName = "btn-pill dropdown-toggle-sample-ratio";
                options.menuClassName = "dropdown-menu-sample-ratio";
                options.iconClassName = "link-icon";
                SyntheticSelectControl.prototype.initialize.call(this, options);
            },

            startListening: function() {
                SyntheticSelectControl.prototype.startListening.call(this);
                this.listenTo(this.model, 'change:display.prefs.customSampleRatio', function() {
                    this.setItems(this.generateItems());
                });
                this.listenTo(this.model, 'change:dispatch.earliest_time change:dispatch.latest_time', _.debounce(this.render));
            },

            events: {
                'click a.dropdown-toggle.disabled' : function(e) {
                    e.preventDefault();
                }
            },

            deactivate: function(options) {
                this.tooltip('destroy');
                return SyntheticSelectControl.prototype.deactivate.call(this, options);
            },

            focus: function() {
                this.$(".dropdown-toggle-sample-ratio").focus();
            },

            generateItems: function() {
                var items = [];

                _.each(ReportModel.PRESET_SAMPLE_RATIOS, function(value) {
                    items.push({
                        value: value,
                        label: (value === "1" ?_('No Event Sampling').t() : splunkUtil.sprintf(_("1 : %s").t(), i18n.format_decimal(value)))
                    });
                });

                // Check if ratio is customized
                var customSampleRatio = this.model.get('display.prefs.customSampleRatio');
                if (customSampleRatio && (_.indexOf(ReportModel.PRESET_SAMPLE_RATIOS, customSampleRatio) === -1)) {
                    items.push({
                        value: customSampleRatio,
                        label: splunkUtil.sprintf(_("1 : %s (Custom)").t(), i18n.format_decimal(customSampleRatio))
                    });
                }

                items.push({ value: 'other', label: _('Custom...').t()});
                return items;
            },

            // Overrides 'click' method. If user clicks 'Other', don't set value to the model.
            click: function(e) {
                var itemValue = $(e.currentTarget).data('item-value');

                if (itemValue === "other") {
                    e.preventDefault();
                    this.trigger('openRatioDialog');
                    this.hide(); 
                } else {
                    SyntheticSelectControl.prototype.click.call(this, e);
                }
            },

            remove: function  () {
                this.tooltip('destroy');
                SyntheticSelectControl.prototype.remove.call(this);
            },

            disable: function() {
                this.options.enabled = false;
            },

            enable: function() {
                this.options.enabled = true;
            },

            // Overrides 'render' method. If the selected item is 'No Event Sampling', don't need add label 'Sampling' ahead. 
            render: function() {
                // If timerange is real-time, then show disabled view.
                var isRealTime = timeUtil.isRealtime(this.model.get('dispatch.earliest_time')) ||
                        timeUtil.isRealtime(this.model.get('dispatch.latest_time'));

                if (isRealTime) {
                    if (this.options.enabled) {
                        this.disable();

                        var template =_.template(this.disabledTemple,{
                            _:_
                        });
                        this.$el.html(template);
                        this.tooltip('destroy');
                        this.tooltip({
                            animation:false, 
                            title: _("Sampling is not supported for real-time searches.").t(),
                            container: 'body',
                            placement: 'right'
                        });
                    }
                } else  {
                    if (!this.options.enabled) {
                        this.enable();
                        this.renderList = true;
                    }

                    var selectedItem = this.selectedItem;
                    if (!selectedItem) {
                        selectedItem = this.getFirstItem();
                    }
                    
                    this.options.label = (selectedItem.value !== "1" ? "Sampling": "");
                    SyntheticSelectControl.prototype.render.call(this);
                    this.tooltip('destroy');
                    this.tooltip({
                        animation: false, 
                        title:(selectedItem.value === "1" ?  
                            _("Enable event sampling to run the search and return a random set of events.").t() : 
                            splunkUtil.sprintf(_("Each event has a 1 in %s chance of being included in the result set.").t(), i18n.format_decimal(selectedItem.value))),
                        container: 'body',
                        placement: 'right'
                    });
                }
            },

            disabledTemple: '\
                <a class="dropdown-toggle btn-pill disabled" href="#">\
                    <span class="link-label"><%- _("No Event Sampling").t() %></span><span class="caret"></span>\
                </a>\
            '
        });
    }
);
