define(function(require, exports, module) {

    var _ = require('underscore');
    var $ = require('jquery');
    var console = require('util/console');
    var mvc = require('../../../mvc');
    var Base = require('views/Base');
    var Concertina = require('views/shared/delegates/Concertina');
    var ControlGroup = require('views/shared/controls/ControlGroup');

    return Base.extend({

        moduleId: module.id,

        className: 'concertina',

        render: function() {
            if (!this.children.concertina) {
                this.$el.html(this.template);
                this.children.concertina = new Concertina({ el: this.el });

                _(this.options.panels || []).each(function(panelOptions, i) {
                    this.renderPanel(panelOptions);
                }, this);
            }

            return this;
        },

        renderPanel: function(panelOptions) {
            var $panel = $(_.template(this.templatePanel, panelOptions));
            var $panelBody = $panel.find(".concertina-group-body");

            _(panelOptions.controls || []).each(function(controlOptions, i) {
               controlOptions.controlOptions.model = this.model;
               var controlTypeClass = controlOptions.controlTypeClass || ControlGroup;
               var control = this.children[_.uniqueId("control_")] = new controlTypeClass(controlOptions);
               $panelBody.append(control.render().$el);
            }, this);

            this.$(".concertina-body").append($panel);
        },

        activate: function(){
            if (this.children.concertina) {
                this.children.concertina.reset();
            }
        },

        template: '\
            <div class="concertina-dock-top"></div>\
            <div class="concertina-body"></div>\
            <div class="concertina-dock-bottom"></div>\
        ',

        templatePanel: '\
            <div class="concertina-group">\
            <div class="concertina-heading <%- headingClassName || \'\' %>">\
                <a href="#" class="concertina-toggle">\
                    <%- title %>\
                </a>\
            </div>\
            <div class="concertina-group-body panel-body <%- headingClassName ? (headingClassName + \'-body\') : \'\' %>">\
            </div>\
            </div>\
        '

    });

});
