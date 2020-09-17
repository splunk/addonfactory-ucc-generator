define(function(require, exports, module) {

    var _ = require('underscore');
    var $ = require('jquery');
    var console = require('util/console');
    var mvc = require('../../../mvc');
    var Dashboard = require('../controller');
    var DashboardInput = require('../../simpleform/input/base');
    var SubmitButton = require('../../simpleform/input/submit');
    var TimeRangePickerInput = require('../../simpleform/input/timerange');
    var PopTartView = require('views/shared/PopTart');
    var FormUtils = require('../../simpleform/formutils');

    var AddFormMenuView = PopTartView.extend({

        moduleId: module.id,
        className: 'dropdown-menu',

        initialize: function() {
            PopTartView.prototype.initialize.apply(this, arguments);
            this.listenTo(mvc.Components, 'change:submit', this.render);
        },

        events: {
            'click a.add-text': function(e) {
                e.preventDefault();
                this.hide();
                this.remove();
                addInput("text");
            },
            'click a.add-radio': function(e) {
                e.preventDefault();
                this.hide();
                this.remove();
                addInput("radio");
            },
            'click a.add-dropdown': function(e) {
                e.preventDefault();
                this.hide();
                this.remove();
                addInput("dropdown");
            },
            'click a.add-checkbox': function(e) {
                e.preventDefault();
                this.hide();
                this.remove();
                addInput("checkbox");
            },
            'click a.add-multiselect': function(e) {
                e.preventDefault();
                this.hide();
                this.remove();
                addInput("multiselect");
            },
            'click a.add-link': function(e) {
                e.preventDefault();
                this.hide();
                this.remove();
                addInput("link");
            },
            'click a.add-trp': function(e) {
                e.preventDefault();
                this.hide();
                this.remove();
                addInput("timerangepicker");
            },
            'click a.add-submit': function(e) {
                e.preventDefault();
                if ($(e.currentTarget).is(".disabled")) {
                    return;
                }
                this.hide();
                this.remove();
                addInput("submit");
            }
        },

        render: function() {
            var fieldset = $('body>.dashboard-body>.fieldset');
            var submitButton = fieldset.find('.form-submit');

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

    var getNextFieldId = function() {
        // Get max N for all fieldN of input IDs or token names
        return _(mvc.Components.toJSON()).chain()
            .filter(FormUtils.isFormInput)
            .map(function(component) { return [component.id, component.settings.get('token')]; })
            .flatten()
            .filter(function(id) { return id && /^field\d+$/.test(id); })
            .map(function(id) { return parseInt(id.slice('field'.length), 10); })
            .push(0)
            .max()
            .value();
    };

    // TODO: move the logic in these functions to controller

    var addInput = function(type) {
        var $inputEl;
        var fieldset = $('body>.dashboard-body>.fieldset');

        // add submit button at the end
        if (type === "submit") {
            $inputEl = $('<div></div>');
            $inputEl.appendTo(fieldset);
        // add other inputs before time range picker or submit button, if they exist
        } else {
            $inputEl = $(_.template('<div class="input input-<%- type %>"><label>&nbsp;</label></div>', { type: type }));
            var submitButton = fieldset.find('.form-submit');
            if (submitButton.length) {
                $inputEl.insertBefore(submitButton);
            } else {
                $inputEl.appendTo(fieldset);
            }
        }

        // Avoid ID or token collisions with other elements
        var seq = (getNextFieldId() || 0) + 1, id;
        do {
            id = 'field' + (seq++);
        } while(mvc.Components.has(id));

        if (type === "submit") {
            addInputSubmit(id, $inputEl);
        } else if (type === "timerangepicker") {
            addInputTime(id, $inputEl);
        } else {
            addInputByType(type, id, $inputEl);
        }

        Dashboard.trigger('formupdate');
    };

    var addInputSubmit = function(id, $inputEl) {
        var input = new SubmitButton({
            id: 'search_btn',
            el: $inputEl
        }, {tokens: true}).render();

        input.on("submit", function() {
            FormUtils.submitForm();
        });

        Dashboard.model.view.updateFormSettings({ submitButton: true }).fail(function(){
            input.remove();
        });
    };

    var addInputTime = function(id, $inputEl) {
        var input = new TimeRangePickerInput({
            id: id,
            el: $inputEl,
            earliest_time: "$form." + id + ".earliest$",
            latest_time: "$form." + id + ".latest$",
            "default": {
                earliest_time: '0',
                latest_time: ''
            }
        }, {tokens: true}).render();

        input.on('change', function() {
            FormUtils.handleValueChange(input);
        });

        Dashboard.trigger("addInput", input.settings);
    };

    var addInputByType = function(type, id, $inputEl) {
        var vizSpecificOptions;
        var vizSettings = FormUtils.getInputType(type);
        if(vizSettings.multiValue) {
            vizSpecificOptions = {
                valuePrefix: '',
                valueSuffix: '',
                delimiter: ' '
            };
        }
        var input = new DashboardInput(_.extend({
            type: type,
            id: id,
            el: $inputEl,
            label: id,
            value: "$form." + id + "$"
        }, vizSpecificOptions), {tokens: true}).render();

        input.on('change', function() {
            FormUtils.handleValueChange(input);
        });

        Dashboard.trigger("addInput", input.settings);
    };

    return AddFormMenuView;

});
