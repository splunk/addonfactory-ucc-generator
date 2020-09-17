define([
    'jquery',
    'underscore',
    'backbone',
    "module",
    "views/Base",
    "views/shared/timerangepicker/dialog/advanced/timeinput/Hint",
    "util/time"
],
function(
    $,
    _,
    Backbone,
    module,
    Base,
    Hint,
    time_utils
){
        return Base.extend({
            className: 'timeinput pull-left',
            moduleId: module.id,
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);

                this.children.hint = new Hint({
                    model: {
                        timeParser: this.model.timeParser
                    }
                });
                
                this.$el.addClass(this.options.modelAttribute || 'earliest');

                this.activate();
            },
            startListening: function() {
                this.listenTo(this.model.working, 'change:' + this.options.modelAttribute, function() {
                    this.update_value();
                    this.update_hint();
                });              
            },
            events: {
                'keyup input[type="text"]': 'handleInputChange',
                'focusout input[type="text"]': 'handleInputChange'
            },
            handleInputChange: function (e) {
                if (this.options.setValueOnWorkingModel) {
                    this.model.working.set(this.options.modelAttribute, this.$('input').val() || "");
                } else {
                    this.update_hint(e);
                }
            },
            update_hint: function(event) {
                var time = time_utils.stripRTSafe((this.$('input').val() || this.options.blankValue), this.options.isLatest) || 'now';

                this.model.timeParser.fetch({
                    data: {
                        time: time
                    }
                });
            },
            update_value: function() {
                var time = this.model.working.get(this.options.modelAttribute) || "";
                if (time !== this.options.blankValue){
                    this.$('input').val(time);
                }
            },
            render: function() {
                var template = _.template(this.template, {
                    _: _,
                    cid: this.cid,
                    label: this.options.label,
                    time: this.model.working.get(this.options.modelAttribute) || ""
                });
                this.$el.html(template);

                //hint
                this.children.hint.render().replaceContentsOf(this.$("#hint_" + this.cid));
                this.update_hint();

                return this;
            },
            template: '\
            <div class="time-advanced">\
                <label class="control-label" for="<%- cid %>" title="<%- label %><%- _(":").t() %>"><%- label %><%- _(":").t() %></label>\
                <div class="controls">\
                    <input type="text" size="18" value="<%- time %>" id="<%- cid %>"/>\
                    <span id="hint_<%- cid %>" class="help-block help-block-timestamp"></span>\
                </div>\
            </div>\
            '
        });
    }
);
