define([
            'jquery',
            'underscore',
            '../helpers/EventMixin',
            '../util/color_utils',
            '../util/parsing_utils'
        ], 
        function(
            $,
            _,
            EventMixin, 
            colorUtils,
            parsingUtils
        ) {

    var Visualization = function(container, properties) {
        this.container = container;
        this.$container = $(container);
        this.properties = $.extend(true, {}, properties);
        this.id = _.uniqueId('viz_');
        this._isDirty = false;
        this.updateDimensions();
        this.lastDrawnWidth = null;
        this.lastDrawnHeight = null;
        // used for performance profiling
        this.benchmarks = [];
    };

    Visualization.prototype = $.extend({}, EventMixin, {

        requiresExternalColors: false,

        getWidth: function() {
            return this.$container.width();
        },

        getHeight: function() {
            return this.$container.height();
        },

        getCurrentDisplayProperties: function() {
            return this.properties;
        },

        isDirty: function() {
            return this._isDirty;
        },

        // To be called before a draw or resize, updates local values of the container width and height.
        updateDimensions: function() {
            this.width = this.getWidth();
            this.height = this.getHeight();
        },

        // To be called after a successful draw or resize, caches the most recent drawn dimensions
        // to be used in resize() below.
        cacheDrawnDimensions: function() {
            this.lastDrawnWidth = this.width;
            this.lastDrawnHeight = this.height;
        },

        getClassName: function() {
            return (this.type + '-chart');
        },

        prepare: function(dataSet, properties) {
            var oldProperties = $.extend(true, {}, this.properties);
            // properties is an optional parameter, will layer on top of
            // the properties passed to the constructor
            if(properties) {
                $.extend(true, this.properties, properties);
                if(!_.isEqual(this.properties, oldProperties)) {
                    this._isDirty = true;
                }
            }
            this.dataSet = dataSet;
            this.updateDimensions();
            this.processProperties();
        },

        draw: function(callback) {
            var that = this,
                dfd = $.Deferred();

            this.handleDraw(function() {
                that._isDirty = false;
                if(callback) {
                    callback.apply(null, arguments);
                }
                dfd.resolve.apply(dfd, arguments);
            });
            return dfd;
        },

        prepareAndDraw: function(dataSet, properties, callback) {
            this.prepare(dataSet, properties);
            return this.draw(callback);
        },

        requiresExternalColorPalette: function() {
            return this.requiresExternalColors;
        },

        processProperties: function() {
            this.type = this.properties.chart || 'column';

            // set up the color skinning
            this.backgroundColor = this.properties['chart.backgroundColor']
                || this.properties.backgroundColor || 'rgb(255, 255, 255)';
            this.foregroundColor = this.properties['chart.foregroundColor']
                || this.properties.foregroundColor || 'rgb(0, 0, 0)';
            this.fontColor = this.properties['chart.fontColor'] || this.properties.fontColor || '#555555';
            this.foregroundColorSoft = colorUtils.addAlphaToColor(this.foregroundColor, 0.25);
            this.foregroundColorSofter = colorUtils.addAlphaToColor(this.foregroundColor, 0.15);
            if (this.properties['chart.foregroundColor'] || this.properties.foregroundColor) {
                this.axisColorSoft = this.foregroundColorSoft;
                this.axisColorSofter = this.foregroundColorSofter;
            }
            else {
                this.axisColorSoft = '#d9dce0';
                this.axisColorSofter = '#ebedef'; 
            }

            // handle special modes
            this.testMode = (parsingUtils.normalizeBoolean(this.properties['chart.testMode'])
                || parsingUtils.normalizeBoolean(this.properties.testMode));
            this.exportMode = (parsingUtils.normalizeBoolean(this.properties['chart.exportMode'])
                || parsingUtils.normalizeBoolean(this.properties.exportMode));
        },

        resize: function() {
            this.updateDimensions();
            if(!this.width || !this.height || (this.width === this.lastDrawnWidth && this.height === this.lastDrawnHeight)) {
                return;
            }
            this.setSize(this.width, this.height);
        },

        // stub methods to be overridden by sub-classes
        handleDraw: function(callback) { },
        destroy: function() { },
        getSVG: function() { },

        // this method is a no-op if we're not in test mode, otherwise adds an entry to the list of benchmarks
        benchmark: function(name) {
            if(!this.testMode) {
                return;
            }
            if(this.benchmarks.length === 0) {
                this.benchmarks.push([name, (new Date()).getTime()]);
            }
            else {
                var lastTimestamp = _(this.benchmarks).reduce(function(time, mark) { return time + mark[1]; }, 0);
                this.benchmarks.push([name, (new Date()).getTime() - lastTimestamp]);
            }
        }

    });

    return Visualization;

});