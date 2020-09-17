define(
    [
        'underscore',
        'jquery',
        'module',
        'views/shared/PopTart',
        'splunk.util',
        'splunk.i18n'
    ],
    function(
        _,
        $,
        module,
        PopTart,
        splunkUtil,
        i18n
    ) {
        return PopTart.extend({
            moduleId: module.id,
            className: 'dropdown-menu',
            initialize: function(options) {
                PopTart.prototype.initialize.call(this, options);

                _.defaults(this.options, {
                    header: splunkUtil.sprintf('Field: %s = %s', this.options.field, this.options.value)
                });

                if (this.model.field) {
                    this.fieldsModes = this.model.field.get('modes');
                    this.fieldMode = _.findWhere(this.fieldsModes, {value: this.options.value});
                    if (this.fieldMode) {
                        this.valueCount = this.fieldMode.count || 0;
                        this.notValueCount = (this.model.field.get('count') || 0) - this.valueCount;
                        this.notValueCount = (this.notValueCount < 0) ? 0 : this.notValueCount;
                    }
                }
            },
            events: {
                'click .curr_inc_val': function(e) {
                    this.fieldDrilldown(e);
                },
                'click .curr_inc_val_secondary': function(e) {
                    this.fieldDrilldown(e, { newTab: true });
                },
                'click .curr_exc_val': function(e) {
                    this.fieldDrilldown(e, { negate: true });
                },
                'click .curr_exc_val_secondary': function(e) {
                   this.fieldDrilldown(e, { negate: true, newTab: true });
                },
                'click .remove_val': function(e) {
                    this.fieldDrilldown(e);
                },
                'click .remove_val_secondary': function(e) {
                    this.fieldDrilldown(e, { newTab: true });
                },
                'click .only_val': function(e) {
                    this.options.action = 'fieldvalue';
                    this.fieldDrilldown(e, { search: '*' });
                },
                'click .only_val_secondary': function(e) {
                    this.options.action = 'fieldvalue';
                    this.fieldDrilldown(e, { search: '*', newTab: true });
                }
            },
            fieldDrilldown: function(e, options) {
                e.preventDefault();
                options = options || {};
                var q = options.search ? options.search : this.model.report.entry.content.get('search');

                this.model.state.trigger('drilldown', {
                    data: {
                        q: q,
                        stripReportsSearch: false,
                        negate: options.negate,
                        action: this.options.action,
                        field: this.options.field,
                        value: this.options.value,
                        app: this.model.application.get('app'),
                        owner: this.model.application.get('owner'),
                        usespath: this.options.usespath
                     },
                     event: e,
                     idx: this.options.idx,
                     newTab: options.newTab,
                     stateModel: this.model.state
                });

                this.hide();
            },
            render: function() {
                var template = this.compiledTemplate({
                    _:_,
                    fieldMode: this.fieldMode,
                    valueCount: i18n.format_decimal(this.valueCount),
                    notValueCount: i18n.format_decimal(this.notValueCount),
                    splunkUtil: splunkUtil,
                    removable: (this.options.action === 'removefieldvalue')
                });

                this.$el.html(PopTart.prototype.template_menu);
                this.$el.append(template);

                return this;
            },
            template: '\
                <ul>\
                    <% if (!removable) { %>\
                        <li>\
                            <a class="curr_inc_val primary-link" href="#">\
                                <%- _("Add to search").t()%>\
                                <% if (fieldMode) { %>\
                                    <span class="info"><%- splunkUtil.sprintf(_("%s events").t(), valueCount) %></span>\
                                <% } %>\
                            </a>\
                            <a class="curr_inc_val_secondary secondary-link" href="#"><i class="icon-external"></i></a>\
                        </li>\
                        <li>\
                            <a class="curr_exc_val primary-link" href="#">\
                                <%- _("Exclude from search").t() %>\
                                <% if (fieldMode) { %>\
                                    <span class="info"><%- splunkUtil.sprintf(_("%s events").t(), notValueCount) %></span>\
                                <% } %>\
                            </a>\
                            <a class="curr_exc_val_secondary secondary-link" href="#"><i class="icon-external"></i></a>\
                        </li>\
                    <% } else { %>\
                        <li>\
                            <a class="remove_val primary-link" href="#"><%- _("Remove from search").t() %></a>\
                            <a class="remove_val_secondary secondary-link" href="#"><i class="icon-external"></i></a>\
                        </li>\
                    <% } %>\
                    <li>\
                        <a class="only_val primary-link" href="#"><%- _("New search").t() %></a>\
                        <a class="only_val_secondary secondary-link" href="#"><i class="icon-external"></i></a>\
                    </li>\
                </ul>\
            '
        });
    }
);
