define([
            'underscore',
            'module',
            'models/shared/TimeRange',
            'views/shared/controls/Control',
            'views/shared/controls/ControlGroup',
            'views/shared/timerangepicker/dialog/Master',
            'views/shared/delegates/Popdown'
        ],
        function(
            _,
            module,
            TimeRange,
            Control,
            ControlGroup,
            DialogMaster,
            Popdown
        ) {

    var TimeRangeControl = Control.extend({

        initialize: function() {
            this.options.modelAttribute = 'label';
            Control.prototype.initialize.call(this, this.options);

            this.children.timeRangeDialog = new DialogMaster({
                model: {
                    timeRange: this.model.timeRange,
                    application: this.options.application,
                    appLocal: this.options.appLocal,
                    user: this.options.user
                },
                collection: this.model.timePresets
            });
            this.children.popdown = new Popdown({
                el: this.el,
                mode: 'dialog',
                detachDialog: true,
                minMargin: 120,
                ignoreClasses: [
                    "ui-datepicker",
                    "ui-datepicker-header",
                    "dropdown-menu"
                ]
            });

            this.listenTo(this.children.popdown, 'shown', function() {
                this.children.timeRangeDialog.onShown();
            });
            this.listenTo(this.model.timeRange, 'applied', function() {
                this.children.popdown.hide();
            });
        },

        render: function() {
            if(this.el.innerHTML) {
                this.$('.link-label').text(this.model.get('label'));
                this.children.popdown.hide();
            }
            else {
                this.$el.html(this.compiledTemplate({ model: this.model, options: this.options }));
                this.$popdownWrapper = this.$('.popdown-dialog');
                this.$popdownWrapper.append(this.children.timeRangeDialog.render().el);
                // TODO [sff]: try to avoid hard-coding this
                this.$popdownWrapper.width(640);
            }
        },

        template: '\
            <a href="#" class="popdown-toggle <%- options.toggleClassName %>">\
                <span class="link-label"><%- model.get("label") %></span><span class="caret"></span>\
            </a>\
            <div class="popdown-dialog">\
                <div class="arrow"></div>\
            </div>\
        '

    });

    return ControlGroup.extend({

        moduleId: module.id,

        /**
         * @constructor
         * @param options {
         *     model <models/pivot/elements/filters/TimestampFilter> the current report element
         *     collection <collections/services/data/ui/Times> the user's time presets collection
         * }
         */

        initialize: function() {
            var control = new TimeRangeControl({
                model: this.model,
                collection: this.collection,
                application: this.options.application,
                appLocal: this.options.appLocal,
                user: this.options.user,
                toggleClassName: 'btn'
            });
            this.options.controls = [control];
            this.options.label = _('Range').t();
            ControlGroup.prototype.initialize.call(this, this.options);
        }

    });

});