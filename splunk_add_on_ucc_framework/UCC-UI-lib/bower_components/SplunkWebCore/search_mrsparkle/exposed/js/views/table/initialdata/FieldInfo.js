define(
    [
        'jquery',
        'underscore',
        'module',
        'views/shared/PopTart',
        'splunk.i18n'
    ],
    function(
        $,
        _,
        module,
        PopTartView,
        i18n
    ) {
        return PopTartView.extend({
            moduleId: module.id,
            className: 'popdown-dialog initial-data-fieldinfo',

            initialize: function() {
                PopTartView.prototype.initialize.apply(this, arguments);
            },

            events: $.extend({}, PopTartView.prototype.events, {
                'mouseleave': function(e) {
                    this.hide(e);
                    e.preventDefault();
                }
            }),

            render: function() {
                var html = this.compiledTemplate({
                    field: this.model.field,
                    fieldsSummary: this.model.fieldsSummary,
                    _:_,
                    i18n: i18n
                });

                this.$el.html(PopTartView.prototype.template);
                this.$('.popdown-dialog-body').html(html);

                return this;
            },

            template: '\
                <h2 class="field-info-header"><span class="fields-type-icon font-icon"><%- field.isNumeric() ? "#" : "a" %></span><%- field.get("name") %></h2>\
                <p>\
                    <%- field.get("is_exact") ? "" : ">" %>\
                    <%- field.get("distinct_count") %> <%- (field.get("distinct_count")>1) ?  _("Values").t(): _("Value").t() %>, \
                    <%= i18n.format_percent(fieldsSummary.frequency(field.get("name"))) %> <%- _("of events").t() %>\
                </p>\
                <table class="table table-condensed table-dotted">\
                    <thead>\
                        <tr>\
                            <% if (field.get("modes").length >= 10) { %>\
                                <th class="value"><strong><%- _("Top 10 Values").t() %></strong></th>\
                            <% } else { %>\
                                <th class="value"><strong><%- _("Values").t() %></strong></th>\
                            <% } %>\
                            <td class="percent">%</td>\
                        </tr>\
                    </thead>\
                    <tbody>\
                        <% var modes_len = field.get("modes").length %>\
                        <% _.each(field.get("modes"), function(mode) { %>\
                            <tr>\
                                <td class="value" data-report="fieldvalue" data-field="<%- field.get("name") %>" data-value="<%- mode.value %>"><%- mode.value %></td>\
                                <% var percent = mode.count/field.get("count") %>\
                                <td class="percent"><%- format_percent(percent) %></td>\
                            </tr>\
                        <% }); %>\
                    </tbody>\
                </table>\
            '
        });
    }
);
