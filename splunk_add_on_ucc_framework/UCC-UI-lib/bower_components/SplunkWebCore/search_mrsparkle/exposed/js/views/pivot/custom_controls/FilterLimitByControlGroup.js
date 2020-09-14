define([
            'underscore',
            'module',
            'views/shared/controls/SyntheticSelectControl',
            './FieldPickerControlGroup'
        ],
        function(
            _,
            module,
            SyntheticSelectControl,
            FieldPickerControlGroup
        ) {

    var FieldPickerControl = FieldPickerControlGroup.prototype.control;

    return FieldPickerControlGroup.extend({

        moduleId: module.id,

        control: FieldPickerControl.extend({

            moduleId: module.id,

            initialize: function() {
                this.options.modelAttribute = 'limitBy';
                this.options.popdownOptions = {
                    detachDialog: true
                };
                FieldPickerControl.prototype.initialize.call(this, this.options);
            },

            // TODO [sff] inheritance got a little weird here, look into cleaning up super class interface
            updateModel: function(options) {
                return SyntheticSelectControl.prototype.updateModel.call(this, options);
            },

            getUpdatedModelAttributes: function() {
                // in addition to setting the limitBy, also need to look up the data type and display name for that attribute
                var that = this,
                    item = _(this.options.items).find(function(item) { return item.value === that._value; });

                return ({
                    limitBy: this._value,
                    limitByOwner: item.owner,
                    limitByDataType: item.type,
                    limitByDisplayName: item.label
                });
            }

        }),

        /**
         * @constructor
         * @param options {
         *     report <models/pivot/PivotReport> the current pivot report
         *     dataModel <models/services/datamodel/DataModel> the current data model
         *     model: <sub class of models/pivot/elements/BaseElement> the report element
         * }
         */

        initialize: function() {
            this.options.label = _('Limit By').t();
            this.options.dataTypes = ['string', 'ipv4', 'number', 'objectCount', 'childCount'];
            this.options.showRemoveButton = false;
            FieldPickerControlGroup.prototype.initialize.call(this, this.options);
        },

        generateMenuItems: function() {
            var items = FieldPickerControlGroup.prototype.generateMenuItems.call(this);
            var thisItem = _(items).find(function(item) {
                return item.fieldName === this.model.get('fieldName');
            }, this);

            if(thisItem) {
                thisItem.label = _('This field').t();
                thisItem.icon = 'none';
                items = _.union([thisItem], _(items).without(thisItem));
            }
            return items;
        }

    });

});