define([
            'underscore',
            'module',
            'views/shared/controls/ControlGroup',
            'views/shared/controls/TextControl'
        ],
        function(
            _,
            module,
            ControlGroup,
            TextControl
        ) {

    var LAT_LON_REGEX = /^\(([^,\s]*)\s*,\s*([^,\s]*)\)$/;

    var MapCenterControl = TextControl.extend({

        initialize: function() {
            TextControl.prototype.initialize.apply(this, arguments);
            this.$el.addClass(this.options.mode);
        },

        setValueFromModel: function(render) {
            var latLon = this.readLatLon();
            this._setValue(this.options.mode === MapCenterControlGroup.LATITUDE ? latLon.lat : latLon.lon, render);
            return this;
        },

        getUpdatedModelAttributes: function() {
            var latLon = this.readLatLon(),
                updateAttrs = {};

            if(this.options.mode === MapCenterControlGroup.LATITUDE) {
                latLon.lat = this._value;
            }
            else {
                latLon.lon = this._value;
            }
            updateAttrs[this.getModelAttribute()] = '(' + latLon.lat + ',' + latLon.lon + ')';
            return updateAttrs;
        },

        readLatLon: function() {
            var matches = LAT_LON_REGEX.exec(this.model.get(this.getModelAttribute()));
            if(!matches || matches.length < 3) {
                return { lat: 0, lon: 0 };
            }
            return { lat: matches[1], lon: matches[2] };
        }

    });

    var MapCenterControlGroup = ControlGroup.extend({

        moduleId: module.id,

        /**
         * @constructor
         * @param options {Object} {
         *     model {Model} the model to operate on
         *     mode {latitude | longitude} which attribute of the center point to control
         * }
         */

        initialize: function() {
            this.options.label = this.options.mode === MapCenterControlGroup.LATITUDE ? _("Latitude").t() : _("Longitude").t();
            this.options.controls = [
                new MapCenterControl({
                    model: this.model,
                    modelAttribute: 'display.visualizations.mapping.map.center',
                    mode: this.options.mode,
                    inputClassName: 'input-medium'
                })
            ];
            ControlGroup.prototype.initialize.call(this, this.options);
        }

    },
    {
        LATITUDE: 'latitude',
        LONGITUDE: 'longitude'
    });

    return MapCenterControlGroup;

});
