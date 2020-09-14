define(
    [
        'underscore',
        'jquery',
        'module',
        'models/services/search/IntentionsParser',
        'views/shared/PopTart'
    ],
    function(_, $, module, IntentionsParserModel, PopTartView) {
        return PopTartView.extend({
            className: 'dropdown-menu',
            moduleId: module.id,
            initialize: function() {
                PopTartView.prototype.initialize.apply(this, arguments);
                
                this.model.firstPassIntentionsParser = new IntentionsParserModel();
            },
            events: {
                'click a.all-time-link': function(e) {
                    e.preventDefault();
                    this.kickOffSearch($(e.currentTarget).attr('data-type'), null);
                },
                'click a.count-events-over-time': function(e) {
                    e.preventDefault();
                    this.kickOffSearch($(e.currentTarget).attr('data-type'), 'countbytime');
                },
                'click a.count-events': function(e) {
                    e.preventDefault();
                    this.kickOffSearch($(e.currentTarget).attr('data-type'), 'count');
                }
            },
            kickOffSearch: function(field, secondaryAction) {
                var value = this.model.result.get(field)[0];
                this.model.firstPassIntentionsParser.fetch({
                    data: {
                        q: " ",
                        action: 'fieldvalue',
                        field: field,
                        value: value,
                        app: this.model.application.get('app'),
                        owner: this.model.application.get('owner')
                    },
                    success: function(model, response) {
                        if (!secondaryAction) {
                            this.model.intentionsParser.set({
                                reportsSearch: this.model.firstPassIntentionsParser.get('reportsSearch'),
                                eventsSearch: this.model.firstPassIntentionsParser.get('eventsSearch')
                            });
                            this.model.intentionsParser.trigger("sync", this.model.intentionsParser);
                        } else {
                            this.model.intentionsParser.fetch({
                                data: {
                                    q: this.model.firstPassIntentionsParser.fullSearch(),
                                    action: secondaryAction,
                                    app: this.model.application.get('app'),
                                    owner: this.model.application.get('owner')
                                }
                            });
                        }
                    }.bind(this)
                });                
            },
            render: function() {
                this.$el.html(PopTartView.prototype.template_menu);
                
                var template = this.compiledTemplate({
                    _: _,
                    type: this.options.type
                });
                
                this.$el.append(template);
                return this;
            },
            template: '\
            <ul>\
                <li>\
                    <a href="#" class="count-events" data-type="<%= type %>"><%- _("Count of Events").t() %></a>\
                </li>\
                <li>\
                    <a href="#" class="count-events-over-time" data-type="<%= type %>"><%- _("Count of Events over time").t() %></a>\
                </li>\
                <li>\
                    <a href="#" class="all-time-link" data-type="<%= type %>"><%- _("List of All Events").t() %></a>\
                </li>\
            </ul>\
            '
        });
    }
);
