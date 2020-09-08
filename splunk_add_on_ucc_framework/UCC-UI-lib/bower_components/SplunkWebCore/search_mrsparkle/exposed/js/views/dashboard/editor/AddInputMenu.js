define(
    [
        'module',
        'jquery',
        'underscore',
        'views/shared/PopTart',
        'splunkjs/mvc',
        'views/dashboard/form/Input'
    ],
    function(module,
             $,
             _,
             PopTartView,
             mvc,
             InputView) {

        var getMaxFieldToken = function() {
            // Get max N for all fieldN of input IDs or token names
            return _(mvc.Components.toJSON()).chain()
                .filter(function(cmp) { return cmp instanceof InputView; })
                .map(function(component) { return [component.id, component.settings.get('token')]; })
                .flatten()
                .filter(function(id) { return id && /^field\d+$/.test(id); })
                .map(function(id) { return parseInt(id.slice('field'.length), 10); })
                .push(0)
                .max()
                .value();
        };
        
        return PopTartView.extend({
            moduleId: module.id,
            className: 'dropdown-menu',
            initialize: function(options) {
                PopTartView.prototype.initialize.apply(this, arguments);
                this.model = options.model;
            },
            events: {
                'click a.add-text': function(e) {
                    e.preventDefault();
                    this.hide();
                    this.remove();
                    this._addInput("text");
                },
                'click a.add-radio': function(e) {
                    e.preventDefault();
                    this.hide();
                    this.remove();
                    this._addInput("radio");
                },
                'click a.add-dropdown': function(e) {
                    e.preventDefault();
                    this.hide();
                    this.remove();
                    this._addInput("dropdown");
                },
                'click a.add-checkbox': function(e) {
                    e.preventDefault();
                    this.hide();
                    this.remove();
                    this._addInput("checkbox");
                },
                'click a.add-multiselect': function(e) {
                    e.preventDefault();
                    this.hide();
                    this.remove();
                    this._addInput("multiselect");
                },
                'click a.add-link': function(e) {
                    e.preventDefault();
                    this.hide();
                    this.remove();
                    this._addInput("link");
                },
                'click a.add-trp': function(e) {
                    e.preventDefault();
                    this.hide();
                    this.remove();
                    this._addInput("time");
                },
                'click a.add-submit': function(e) {
                    e.preventDefault();
                    if ($(e.currentTarget).is(".disabled")) {
                        return;
                    }
                    this.hide();
                    this._addSubmit();
                    this.remove();
                }
            },
            _addSubmit: function() {
                this.model.controller.trigger('new:submit-button');
            },
            _addInput: function(type) {
                var token = 'field' + ((getMaxFieldToken() || 0) + 1);
                var settings = {
                    token: token
                };

                if (type === 'time') {
                    _.extend(settings, {
                        label: '',
                        'default': {
                            earliest_time: this.model.userPrefGeneralDefault.entry.content.get("default_earliest_time"),
                            latest_time: this.model.userPrefGeneralDefault.entry.content.get("default_latest_time")
                        }
                    });
                } else {
                    _.extend(settings, {
                        label: token,
                        populating_earliest_time: this.model.userPrefGeneralDefault.entry.content.get("default_earliest_time"),
                        populating_latest_time: this.model.userPrefGeneralDefault.entry.content.get("default_latest_time")
                    });
                }

                this.model.controller.trigger('new:input', {
                    type: type + '-input',
                    settings: settings
                });
            },
            render: function() {
                var submitButton = $('.fieldset>.form-submit');
                var renderModel = {
                    showAddSubmit: !submitButton.length,
                    _: _
                };
                var html = this.compiledTemplate(renderModel);
                this.$el.html(PopTartView.prototype.template_menu);
                this.$el.append(html);
                return this;
            },
            template: '\
            <ul>\
                <li><a class="add-text" href="#"><i class="icon-text"></i> <%- _("Text").t() %></a></li>\
                <li><a class="add-radio" href="#"><i class="icon-boolean"></i> <%- _("Radio").t() %></a></li>\
                <li><a class="add-dropdown" href="#"><i class="icon-triangle-down-small"></i> <%- _("Dropdown").t() %></a></li>\
                <li><a class="add-checkbox" href="#"><i class="icon-box-checked"></i> <%- _("Checkbox").t() %></a></li>\
                <li><a class="add-multiselect" href="#"><i class="icon-triangle-down-small"></i> <%- _("Multiselect").t() %></a></li>\
                <li><a class="add-link" href="#"><i class="icon-link"></i> <%- _("Link List").t() %></a></li>\
                <li><a class="add-trp" href="#"><i class="icon-clock"></i> <%- _("Time").t() %></a></li>\
                <li>\
                    <% if (showAddSubmit) { %>\
                        <a class="add-submit" href="#">\
                    <% } else {%>\
                        <a class="add-submit disabled" href="#" title="<%- _("You cannot add more than one Submit Button.").t() %>">\
                    <% } %>\
                    <i class="icon-search"></i> <%- _("Submit").t() %></a>\
                </li>\
            </ul>\
        '
        });
    });