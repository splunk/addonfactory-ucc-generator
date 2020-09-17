define([
            'underscore',
            'module',
            'views/shared/controls/SyntheticSelectControl'
        ],
        function(
            _,
            module,
            SyntheticSelectControl
        ) {

    return SyntheticSelectControl.extend({

        moduleId: module.id,

        initialize: function() {
            this.options = _.extend({
                menuWidth: "narrow",
                className: "btn-group pull-left",
                items: [
                    {value: '10', label: _('10 per page').t()},
                    {value: '20', label: _('20 per page').t()},
                    {value: '50', label: _('50 per page').t()},
                    {value: '100', label: _('100 per page').t()}
                ],
                modelAttribute: 'count',
                toggleClassName: 'btn-pill'
            }, this.options);
            SyntheticSelectControl.prototype.initialize.apply(this);
        }

    });

});