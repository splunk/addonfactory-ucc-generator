define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'views/search/initialhelp/datasummary/table/QuickReportMenu',
        'uri/route',
        'util/time',
        'splunk.i18n'
    ],
    function(
        $,
        _,
        module,
        Base,
        QuickReportMenu,
        route,
        time_utils,
        i18n
    )
    {
        return Base.extend({
            moduleId: module.id,
            tagName: 'tr',
            /**
             * @param {Object} options {
             *     model: {
             *          result: <models.services.search.jobs.ResultV2>
             *          application: <models.Application>
             *     }
             * }
             */
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
            },
            events: {
                'click a.type-link': function(e) {
                    e.preventDefault();
                    
                    var field = $(e.currentTarget).attr('data-type'),
                        value = this.model.result.get(field)[0];
                    
                    this.model.intentionsParser.fetch({
                        data: {
                            q: ' ',
                            action: 'fieldvalue',
                            field: field,
                            value: value,
                            app: this.model.application.get('app'),
                            owner: this.model.application.get('owner')
                        }
                    });
                },
                'click a.quick-reports': function(e) {
                    var $target = $(e.currentTarget);
                    this.model.state.set("quickReportOpen", true);
                    
                    this.children.quickReportMenu = new QuickReportMenu({
                        model: {
                            result: this.model.result,
                            intentionsParser: this.model.intentionsParser,
                            application: this.model.application
                        },
                        scrollContainer: this.$el.closest(".scroll-table-wrapper"),
                        onHiddenRemove: true,
                        mode: "menu",
                        type: this.options.type
                    });

                    var appendElement = this.model.serverInfo.isLite() ? 'body' : '.modal:visible';
                    $(appendElement).append(this.children.quickReportMenu.render().el);
                    this.children.quickReportMenu.show($target);
                    
                    this.children.quickReportMenu.on("hidden", function(){
                        this.model.state.set("quickReportOpen", false);
                    }, this);

                    e.preventDefault();
                }
            },
            render: function() {
                var template = this.compiledTemplate({
                    _: _,
                    type: this.options.type,
                    result: this.model.result,
                    date: i18n.format_datetime_microseconds(time_utils.jsDateToSplunkDateTimeWithMicroseconds(time_utils.isoToDateObject(this.model.result.get("recentTime"))), "short", "full")
                });
                
                this.$el.html(template);
                return this;
            },
            template: '\
                <td class="<%= type %>">\
                    <a class="type-link" data-type="<%- type %>" href="#">\
                        <%- result.get(type) %>\
                    </a>\
                </td>\
                <td class="quick-reports">\
                    <div class="popdown pull-left">\
                        <a class="popdown-toggle quick-reports" href="#" data-type="<%- type %>">\
                            <i class="icon-chart-column"></i><span class="caret"></span><span class="ir"><%- _("Quick Report").t() %></span>\
                        </a>\
                    </div>\
                </td>\
                <td class="count"><%- result.get("totalCount") %></td>\
                <td class="last-update"><%- date %></td>\
            '
        });
    }
);

