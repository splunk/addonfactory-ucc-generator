define([
            'underscore',
            'module',
            'views/Base',
            'views/shared/DropDownMenu',
            'views/shared/vizcontrols/custom_controls/MapTileUrlControlGroup',
            'views/shared/vizcontrols/custom_controls/MapTileMinZoomControlGroup',
            'views/shared/vizcontrols/custom_controls/MapTileMaxZoomControlGroup'
        ],
        function(
            _,
            module,
            Base,
            DropDownMenu,
            MapTileUrlControlGroup,
            MapTileMinZoomControlGroup,
            MapTileMaxZoomControlGroup
        ) {

    return Base.extend({

        moduleId: module.id,

        className: 'form form-horizontal',

        vizToGeneralComponents: {
            line: [],
            area: [],
            column: [],
            bar: [],
            pie: [],
            scatter: [],
            bubble: [],
            radialGauge: [],
            fillerGauge: [],
            markerGauge: [],
            single: [],
            mapping: ['url', 'minZoom', 'maxZoom'],
            choropleth: ['url', 'minZoom', 'maxZoom']
        },

        initialize: function() {
            Base.prototype.initialize.apply(this, arguments);
            var controls = this.vizToGeneralComponents[this.model.get('viz_type')];
            if(_.contains(controls, 'url')) {
                this.children.url = new MapTileUrlControlGroup({
                    model: this.model
                });
            }
            if(_.contains(controls, 'minZoom')) {
                this.children.minZoom = new MapTileMinZoomControlGroup({
                    model: this.model
                });
            }
            if(_.contains(controls, 'maxZoom')) {
                this.children.maxZoom = new MapTileMaxZoomControlGroup({
                    model: this.model
                });
            }
            this.children.tilePresetsMenu = new DropDownMenu({
                label: _('Populate from preset configuration').t(),
                className: '',
                dropdownClassName: 'dropdown-menu-narrow',
                anchorClassName: 'btn-pill',
                popdownOptions: { attachDialogTo: 'body' },
                items: [
                    { label: _('Splunk Tiles').t(), value: 'splunk', url: '', minZoom: '0', maxZoom: '7' },
                    { label: _('Open Street Map').t(), value: 'osm', url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', minZoom: '0', maxZoom: '19' }
                ]
            });

            this.listenTo(this.children.tilePresetsMenu, 'itemClicked', function(type, itemData) {
                this.model.set({
                    'display.visualizations.mapping.tileLayer.url': itemData.url,
                    'display.visualizations.mapping.tileLayer.minZoom': itemData.minZoom,
                    'display.visualizations.mapping.tileLayer.maxZoom': itemData.maxZoom
                });
            });
        },

        render: function() {
            this.children.url && this.children.url.render().appendTo(this.$el);
            this.children.minZoom && this.children.minZoom.render().appendTo(this.$el);
            this.children.maxZoom && this.children.maxZoom.render().appendTo(this.$el);
            this.$el.append(this.compiledTemplate());
            this.children.tilePresetsMenu.render().appendTo(this.$('.populate-button-container'));
            return this;
        },

        template: '\
            <div class="populate-button-container"></div>\
        '

    });

});