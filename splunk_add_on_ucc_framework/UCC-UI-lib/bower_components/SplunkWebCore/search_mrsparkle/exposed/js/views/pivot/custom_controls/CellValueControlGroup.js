/**
 * @author sfishel
 *
 * A custom sub-class of ControlGroup for pivot cell config forms.
 *
 * Creates a drop-down list of value options.
 */

define([
            'underscore',
            'module',
            'views/shared/controls/ControlGroup',
            'util/pivot/config_form_utils'
        ],
        function(
            _,
            module,
            ControlGroup,
            configFormUtils
        ) {

    var STRING_ITEMS = [
        // list is currently not supported by the back end
//        {
//            value: 'list',
//            label: configFormUtils.cellValueToDisplay('list')
//        },
        {
            value: 'values',
            label: configFormUtils.cellValueToDisplay('values')
        },
        {
            value: 'earliest',
            label: configFormUtils.cellValueToDisplay('earliest')
        },
        {
            value: 'latest',
            label: configFormUtils.cellValueToDisplay('latest')
        },
        {
            value: 'count',
            label: configFormUtils.cellValueToDisplay('count')
        },
        {
            value: 'dc',
            label: configFormUtils.cellValueToDisplay('dc')
        }
    ];

    var NUMBER_ITEMS = [
        {
            value: 'sum',
            label: configFormUtils.cellValueToDisplay('sum')
        },
        {
            value: 'count',
            label: configFormUtils.cellValueToDisplay('count')
        },
        {
            value: 'avg',
            label: configFormUtils.cellValueToDisplay('avg')
        },
        {
            value: 'max',
            label: configFormUtils.cellValueToDisplay('max')
        },
        {
            value: 'min',
            label: configFormUtils.cellValueToDisplay('min')
        },
        {
            value: 'stdev',
            label: configFormUtils.cellValueToDisplay('stdev')
        },
        {
            value: 'median',
            label: configFormUtils.cellValueToDisplay('median')
        },
        // list is currently not supported by the back end
//        {
//            value: 'list',
//            label: configFormUtils.cellValueToDisplay('list')
//        },
        {
            value: 'values',
            label: configFormUtils.cellValueToDisplay('values')
        }
    ];

    var TIMESTAMP_ITEMS = [
        {
            value: 'duration',
            label: configFormUtils.cellValueToDisplay('duration')
        },
        {
            value: 'earliest',
            label: configFormUtils.cellValueToDisplay('earliest')
        },
        {
            value: 'latest',
            label: configFormUtils.cellValueToDisplay('latest')
        }
        // list is currently not supported by the back end
//        {
//            value: 'list',
//            label: configFormUtils.cellValueToDisplay('list')
//        },
        // values is currently not supported by the back end for _time
//        {
//            value: 'values',
//            label: configFormUtils.cellValueToDisplay('values')
//        }
    ];

    return ControlGroup.extend({

        moduleId: module.id,

        /**
         * @constructor
         * @param options {Object} {
         *     model {Model} the model to operate on
         *     valueItems {Array<Object>} items to pass to the SyntheticSelect control that chooses the value
         * }
         */

        initialize: function() {
            this.options.label = _('Value').t();
            var selectItems = this.determineSelectItems(this.model.get('type'));
            if(this.options.hasOwnProperty('outputType')) {
                selectItems = _(selectItems).filter(function(item) {
                    return (configFormUtils.cellValueToOutputType(item.value) === this.options.outputType);
                }, this);
            }
            this.options.controls = [
                {
                    type: 'SyntheticSelect',
                    options: {
                        model: this.model,
                        modelAttribute: 'value',
                        toggleClassName: 'btn',
                        menuWidth: 'narrow',
                        items: selectItems,
                        popdownOptions: {
                            detachDialog: true
                        }
                    }
                }
            ];
            ControlGroup.prototype.initialize.call(this, this.options);
        },

        determineSelectItems: function(dataType) {
            switch(dataType) {
                case 'string':
                case 'ipv4':
                    return STRING_ITEMS;
                case 'number':
                    return NUMBER_ITEMS;
                case 'timestamp':
                    return TIMESTAMP_ITEMS;
                default:
                    return [];
            }
        }

    });

});
