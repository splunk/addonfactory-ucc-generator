// footer nav
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/Base'
],
function(
    $,
    _,
    Backbone,
    module,
    Base
){
    return Base.extend({
        tagName: 'span',
        className: "view-time-range-picker-time-and-date-range-hours-minutes-seconds pull-left",
        moduleId: module.id,
        initialize: function() {
            Base.prototype.initialize.apply(this, arguments);
            this.activate();
        },
        startListening: function() {
            this.listenTo(this.model, "attributeValidated:second", function(isValid, key, error) {
                if (isValid) {
                    this.$("input").removeClass("error");
                } else {
                    this.$("input").addClass("error");
                }
            });
            
            this.listenTo(this.model, "change", this.updateTime);
        },
        events: {
            'keyup input[type="text"]': function(){
                this.stopListening(this.model, "change", this.updateTime);
                this.model.setHoursMinSecFromStr(this.$('input').val(), {validate: true});
                this.listenTo(this.model, "change", this.updateTime);
            }
        },
        updateTime: function() {
            var time = this.model.time();
            this.$('input').val(time).removeClass("error");
        },
        render: function() {
            var time = this.model.time();

            var template = _.template(this.template, {
                time: time
            });
            this.$el.html(template);

            return this;
        },
        template: '\
            <input type="text" class="hms-input" value="<%- time %>"/>\
            <span class="help-block"><%- _("HH:MM:SS.SSS").t() %></span>\
            '
    });
});
