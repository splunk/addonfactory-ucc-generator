/**
 * @author ykou
 * @date 01/28/2014
 *
 * SyntheticSelectControl to choose a timezone
 * Please refer to SyntheticSelectControl.js for documentations.
 *
 * Note 1: this view should be used together with collections/shared/TimeZones.js, which includes models
 *                that have {label: 'xxx', id: 'yyy', offset: '123'} format. 
 * Note 2: this view could only use 'id' as 'value'. If 'offset' is needed, additional logic needs to be added.
 *         The reason is that, 'id' is unique, while 'offset' is not, i.e., different timezones may have the same offset. 
 *         Please don't try to do something like: 
 *             {modelAttribute: 'offset'}. 
 *         Instead, please do use it in some way like:
 *             {modelAttribute: 'timeZone'};
 *             someview.listenTo(this.mdoel, 'change:timeZone reset:timeZone', function(whatever) {
 *                 var timeZones = new TimeZones();
 *                 this.model.offset = timeZones.get(whatever).get(offset);
 *             })    
 */


define(
    [
        'jquery',
        'underscore',
        'collections/shared/TimeZones',
        'views/shared/controls/SyntheticSelectControl',
        'module'
    ],
    function(
        $,
        _,
        TimeZones,
        SyntheticSelectControl,
        module
        )
    {

        return SyntheticSelectControl.extend({
            moduleId: module.id,
            className: 'control btn-group select-field-type',

            initialize: function () {

                var timeZones = new TimeZones();
                var items = _.map(timeZones.models, function (item) {
                    return {label: _.unescape(_(item.get('label')).t()), value: item.get('id')};
                    // for example: 
                    // {label: '(GMT-11:00) Midway Island, Samoa', id: 'Pacific/Midway'}
                });

                $.extend(this.options, {
                    toggleClassName: 'btn',
                    items: items,
                    label: (this.options.showDefaultLabel !== false) ? _('Time Zone:').t() : ''
                });
                SyntheticSelectControl.prototype.initialize.call(this, this.options);
            }

        });
    });
