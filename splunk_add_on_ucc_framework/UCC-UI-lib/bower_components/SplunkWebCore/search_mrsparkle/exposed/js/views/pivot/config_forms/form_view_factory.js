define([
            'models/pivot/elements/BaseElement',
            './ConfigFormBase',
            'helpers/pivot/PivotVisualizationManager'
        ],
        function(
            BaseElementModel,
            ConfigFormBase,
            pivotVizManager
        ) {

    var VALIDATION_SCHEMA = {
        'filter': { 'string': true, 'number': true, 'boolean': true, 'ipv4': true },
        'cell': { 'string': true, 'number': true, 'timestamp': true, 'objectCount': true, 'childCount': true, 'ipv4': true },
        'row': { 'string': true, 'number': true, 'boolean': true, 'timestamp': true, 'ipv4': true },
        'column': { 'string': true, 'number': true, 'boolean': true, 'timestamp': true, 'ipv4': true }
    };

    return ({

        /**
         * A factory for constructing the corresponding pivot form view for the given options.
         *
         * @param options the options to pass to the view constructor, consists of:
         *
         *      model {required} the pivot element model, its elementType and type attributes will be used to
         *                          select the correct view
         *
         * @return a pivot form view instance of the corresponding type
         */

        create: function(options) {
            options = options || {};
            var elementModel = options.model.element;
            if(!(elementModel instanceof BaseElementModel)) {
                throw 'options.model must an instance of models/pivot/elements/BaseElement';
            }

            var elementType = elementModel.get('elementType');
            if(!VALIDATION_SCHEMA.hasOwnProperty(elementType)) {
                throw ('un-supported element type ' + elementType);
            }

            var dataType = elementModel.get('type');
            if(!VALIDATION_SCHEMA[elementType].hasOwnProperty(dataType)) {
                throw ('un-supported elementType - dataType combination ' + elementType + ', ' + dataType);
            }

            var pivotFormElements;
            if (elementType === pivotVizManager.FILTER) {
                pivotFormElements = pivotVizManager.FILTER_FORM_ELEMENTS;
            } else if (elementType === pivotVizManager.ROW_SPLIT) {
                pivotFormElements = pivotVizManager.ROW_SPLIT_FORM_ELEMENTS;
            } else if (elementType === pivotVizManager.COLUMN_SPLIT) {
                pivotFormElements = pivotVizManager.COLUMN_SPLIT_FORM_ELEMENTS;
            } else {
                pivotFormElements = pivotVizManager.CELL_VALUE_FORM_ELEMENTS;
            }
            options.panel = { pivotFormElements: pivotFormElements };
            return new ConfigFormBase(options);
        }

    });

});