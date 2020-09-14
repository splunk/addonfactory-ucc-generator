/**
 * @author ykou
 * @date 01/30/2014
 *
 * @description This is a component for time range setting. The core structure is 'a textfield + a unit drop-down list'.
 *              The input data would be automatically converted to seconds. For example, if user input '1 day', the data
 *              stored in the model would be 3600
 */

define(
        [
                'underscore',
                'models/Base',
                'views/Base',
                'views/shared/controls/Control',
                'views/shared/controls/SyntheticSelectControl',
                'views/shared/controls/TextControl',
                'module'
        ],
        function (
                _,
                BaseModel,
                BaseView,
                Control,
                SyntheticSelectControl,
                TextControl,
                module
        ) {
        var YEAR = 31536000;
        var MONTH = 2592000;
        var WEEK = 604800;
        var DAY = 86400;
        var HOUR = 3600;
        var MINUTE = 60;
        var SECOND = 1;

        return Control.extend({
            moduleId: module.id,

            initialize: function () {
                var defaults = {
                    enabled: true
                };
                _.defaults(this.options, defaults);
                
                // we need this mediator because we need to convert seconds to 'number unit' combination.
                var timeRangeMediator = new BaseModel();

                // populate data to the input fields.
                this.convertTimeRange(this.model, timeRangeMediator);

                var numberName = this.options.modelAttribute + '-number';
                var unitName = this.options.modelAttribute + '-unit';

                this.children.number = new TextControl({
                    model: timeRangeMediator,
                    modelAttribute: numberName,
                    enabled: !!this.options.enabled
                });

                this.children.unit = new SyntheticSelectControl({
                    model: timeRangeMediator,
                    modelAttribute: unitName,
                    toggleClassName: 'btn',
                    items: [
                            {label: _('second(s)').t(), value: SECOND},
                            {label: _('minute(s)').t(), value: MINUTE},
                            {label: _('hour(s)').t(), value: HOUR},
                            {label: _('day(s)').t(), value: DAY},
                            {label: _('week(s)').t(), value: WEEK},
                            {label: _('month(s)').t(), value: MONTH},
                            {label: _('year(s)').t(), value: YEAR}
                    ],
                    popdownOptions: {
                        attachDialogTo: '.modal:visible',
                        scrollContainer: '.modal:visible .modal-body:visible'
                    },
                    enabled: !!this.options.enabled
                });

                // TODO: validate 'number' and 'unit'
                var listenString = 'change:' + numberName + ' change:' + unitName + ' reset:' + numberName + ' reset:' + unitName;
                this.listenTo(timeRangeMediator, listenString, function(){
                    var number = parseInt(timeRangeMediator.get(numberName), 10) || 0;
                    var unit = parseInt(timeRangeMediator.get(unitName), 10) || 1;
                    this.model.set(this.options.modelAttribute, number * unit);
                });
            },

            /**
             * convert time range from seconds to other units.
             * @param  {model} timeRangeModel    this.model
             * @param  {model} timeRangeMediator the mediator
             * @return {[type]}                   [description]
             */
            convertTimeRange: function (timeRangeModel, timeRangeMediator) {
                var timeRange = parseInt(timeRangeModel.get(this.options.modelAttribute), 10) || 0;
                var unit = ((timeRange >= YEAR) && (timeRange % YEAR == 0)) ? YEAR:
                           ((timeRange >= MONTH) && (timeRange % MONTH == 0)) ? MONTH:
                           ((timeRange >= WEEK) && (timeRange % WEEK == 0)) ? WEEK:
                           ((timeRange >= DAY) && (timeRange % DAY == 0)) ? DAY:
                           ((timeRange >= HOUR) && (timeRange % HOUR == 0)) ? HOUR:
                           ((timeRange >= MINUTE) && (timeRange % MINUTE == 0)) ? MINUTE: SECOND;
                var number = timeRange / unit;
                timeRangeMediator.set(this.options.modelAttribute + '-number', number);
                timeRangeMediator.set(this.options.modelAttribute + '-unit', unit);
            },
            
            enable: function() {
                Control.prototype.enable.apply(this, arguments);
                this.options.enabled = true;
                this.children.number.enable();
                this.children.unit.enable();
            },
            
            disable: function() {
                Control.prototype.disable.apply(this, arguments);
                this.options.enabled = false;
                this.children.number.disable();
                this.children.unit.disable();
            },

            render: function() {

                // TODO: move these styles to CSS file
                // style the input box, to make sure it looks like 'input-append' style.
                this.$el.addClass('input-append').css('margin-bottom', '0px');
                this.children.number.$el.css('float', 'left');
                this.children.unit.$el.css('float', 'right');

                this.$el.append(this.children.number.render().el);
                this.$el.append(this.children.unit.render().el);
                return this;
            }
        });
    }
);