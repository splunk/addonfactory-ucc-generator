define(function(require, exports, module) {

    var $ = require('jquery');
    var _ = require('underscore');
    var Leaflet = require('leaflet');
    var Class = require('jg/Class');
    var LatLon = require('splunk/mapping/LatLon');
    var ControlBase = require('splunk/mapping/controls/ControlBase');
    var Rect = require('splunk/vectors/Rect');
    var Text = require('splunk/vectors/Text');
    var Viewport = require('splunk/vectors/Viewport');

    return Class(module.id, ControlBase, function(ResetZoomControl, base) {

        // Constructor

        this.constructor = function(options) {
            this.leafletOptions = options;
            base.constructor.call(this);
        };

        // Public Methods

        this.setOriginalZoom = function(originalZoom) {
            this.leafletControl.originalZoom = parseInt(originalZoom, 10);
        };

        this.setOriginalCenter = function(originalCenter) {
            originalCenter = originalCenter.replace('(', '');
            originalCenter = originalCenter.replace(')', '');
            var latLonArr = originalCenter.split(',');
            var lat = parseFloat(latLonArr[0]);
            var lon = parseFloat(latLonArr[1]);
            this.leafletControl.originalCenter = new LatLon(lat, lon);
        };

        // Protected Methods

        this.createLeafletControl = function() {
            return new LeafletResetZoom(this.leafletOptions);
        };

        this.onAddedToMap = function(map) {
            base.onAddedToMap.call(this, map);
            this.leafletControl.setMap(map);
        };

        // Private Nested Classes

        var LeafletResetZoom = Leaflet.Control.extend({

            options: {
                position: 'topleft'
            },

            linkTemplate: '<a class="leaflet-reset-zoom" href="#" title="<%= resetZoomText %>" style="width: 15px; height:15px; padding: 2px; "> <svg version="1.1"\
                    id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"\
                    width="15px" height="15px" viewBox="0 0 15 15" enable-background="new 0 0 15 15" xml:space="preserve">\
                    <g>\
                        <ellipse fill="#333333" cx="7.586" cy="7.287" rx="2.313" ry="2.33"/>\
                        <path fill="#333333" d="M7.586,13.525c-3.384,0-6.136-2.753-6.136-6.136s2.753-6.136,6.136-6.136c3.385,0,6.136,2.753,6.136,6.136\
                            S10.969,13.525,7.586,13.525z M7.586,2.712c-2.579,0-4.677,2.098-4.677,4.677s2.098,4.677,4.677,4.677\
                            c2.58,0,4.677-2.098,4.677-4.677S10.165,2.712,7.586,2.712z"/>\
                        <rect y="6.429" fill="#333333" width="2.143" height="2.143"/>\
                        <rect x="12.857" y="6.429" fill="#333333" width="2.143" height="2.143"/>\
                        <rect x="6.429" y="12.857" fill="#333333" width="2.143" height="2.143"/>\
                        <rect x="6.429" fill="#333333" width="2.143" height="2.143"/>\
                    </g>\
                </svg></a>',

            initialize: function(options) {
                this._button = {};
                this.setButton();
                var mouseOverText = _('Reset to original position and zoom').t();
                this.linkTemplate = _.template(this.linkTemplate);
                this.linkTemplate = this.linkTemplate({resetZoomText: mouseOverText});

                this.originalZoom = options.originalZoom ? parseInt(options.originalZoom, 10) : 2;
                if (options.originalCenter) {
                    this.originalCenter = options.originalCenter.replace('(','');
                    this.originalCenter = this.originalCenter.replace(')','');
                    var latLonArr = this.originalCenter.split(',');
                    var lat = parseFloat(latLonArr[0]);
                    var lon = parseFloat(latLonArr[1]);
                    this.originalCenter = new LatLon(lat, lon);
                } else {
                    this.originalZoom = 2;
                }
            },

            onAdd: function(map) {
                this._map = map;
                var container = Leaflet.DomUtil.create('div', 'leaflet-reset-zoom leaflet-control-zoom');
                this._container = container;
                this._update();
                return this._container;
            },

            setButton: function() {
                var button = {
                    'text': _('Reset Zoom').t()
                };
                this._button = button;
                this._update();
            },

            _update: function() {
                if (!this._map) {
                    return;
                }
                this._container.innerHTML = '';
                this._makeButton(this._button);
            },

            _makeButton: function(button) {
                 var newButton = Leaflet.DomUtil.create('div', 'leaflet-reset-zoom', this._container);

                 if (button.text !== '') {
                     $(newButton).append(this.linkTemplate);
                 }
                $(newButton).find('a').on('focus', function() {
                    $(this).css('background-color', 'rgba(212, 221, 254, 0.75)');
                });

                $(newButton).find('a').on('focusout', function() {
                    $(this).css('background-color', 'rgba(255, 255, 255, 0.75');
                });

                $(newButton).on('click', function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    this.map.set('center', this.originalCenter);
                    this.map.set('zoom', this.originalZoom);
                }.bind(this));
                $(newButton).dblclick(function(e){
                    e.stopPropagation();
                });
            },

            setMap: function(map) {
                this.map = map;
            }

        });

    });

});
