define(['underscore'], function(_) {

    var arraySlice = [].slice;

    var patch = function(obj, patches) {
        var proto = obj.prototype;
        _(patches).each(function(wrapperFn, fnName) {
            proto[fnName] = _(proto[fnName]).wrap(wrapperFn);
        });
    };

    var callHook = function(hook) {
        if(typeof hook === 'function') {
            hook.apply(null, arraySlice.call(arguments, 1));
        }
    };

    var callHookOrOriginal = function(hook, originalFn, originalObj) {
        if(typeof hook === 'function') {
            // for the hook, pass the original object as the first parameter
            return hook.apply(null, arraySlice.call(arguments, 2));
        }
        // for the original function, apply it in the scope of the original object
        return originalFn.apply(originalObj, arraySlice.call(arguments, 3));
    };

    var applyPatches = function(Highcharts) {

        patch(Highcharts.Chart, {

            firstRender: function(originalFn) {
                callHookOrOriginal(this.options.firstRenderOverride, originalFn, this);
            },

            render: function(originalFn, callback) {
                callHookOrOriginal(this.options.renderOverride, originalFn, this, callback);
            }

        });

        patch(Highcharts.Tooltip, {

            getAnchor: function(originalFn, points, mouseEvent) {
                var anchor = originalFn.call(this, points, mouseEvent);
                callHook(this.options.getAnchorPostHook, points, mouseEvent, anchor);
                return anchor;
            }

        });

        patch(Highcharts.Legend, {

            render: function(originalFn) {
                callHook(this.options.renderPreHook, this);
                originalFn.call(this);
                callHook(this.options.renderPostHook, this);
            },

            renderItem: function(originalFn, item) {
                var options = this.options,
                    allItems = this.allItems;

                if(typeof options.renderItemsPreHook === 'function' && item === allItems[0]) {
                    options.renderItemsPreHook(this);
                    originalFn.call(this, item);
                }
                else if(typeof options.renderItemsPostHook === 'function' && item === _(allItems).last()) {
                    originalFn.call(this, item);
                    options.renderItemsPostHook(this);
                }
                else {
                    originalFn.call(this, item);
                }
            }

        });

        patch(Highcharts.Series, {

            drawPoints: function(originalFn) {
                var options = this.options;
                callHook(options.drawPointsPreHook, this);
                originalFn.call(this);
            },

            plotGroup: function(originalFn, prop, name, visibility, zIndex, parent) {
                var group = originalFn.call(this, prop, name, visibility, zIndex, parent);
                callHook(this.options.plotGroupPostHook, this, group);
                return group;
            },

            render: function(originalFn) {
                originalFn.call(this);
                callHook(this.options.renderPostHook, this);
            },

            afterAnimate: function(originalFn) {
                originalFn.call(this);
                callHook(this.options.afterAnimate, this);
            },

            destroy: function(originalFn) {
                callHook(this.options.destroyPreHook, this);
                originalFn.call(this);
            }, 

            translate: function(originalFn) {
                originalFn.call(this);
                callHook(this.options.translatePostHook, this);
            }

        });

        var seriesTypes = Highcharts.seriesTypes;

        // patches to certain series types to support customized rendering routines
        // the patches to column series will affect bar series as well, since it inherits from column
        _([seriesTypes.column, seriesTypes.scatter]).each(function(seriesConstructor) {

            patch(seriesConstructor, {

                drawPoints: function(originalFn) {
                    callHookOrOriginal(this.options.drawPointsOverride, originalFn, this);
                },

                drawGraph: function(originalFn) {
                    callHookOrOriginal(this.options.drawGraphOverride, originalFn, this);
                },

                drawTracker: function(originalFn) {
                    callHookOrOriginal(this.options.drawTrackerOverride, originalFn, this);
                },

                getGraphPath: function(originalFn) {
                    return callHookOrOriginal(this.options.getGraphPathOverride, originalFn, this);
                }

            });

        });

        patch(seriesTypes.pie, {

            translate: function(originalFn) {
                callHook(this.options.translatePreHook, this);
                originalFn.call(this);
            },

            drawDataLabels: function(originalFn) {
                var dataLabelOptions = this.options.dataLabels;
                callHook(dataLabelOptions.drawDataLabelsPreHook, this);
                originalFn.call(this);
                callHook(dataLabelOptions.drawDataLabelsPostHook, this);
            }

        });

        patch(Highcharts.Axis, {

            getOffset: function(originalFn) {
                callHook(this.options.getOffsetPreHook, this);
                originalFn.call(this);
            },

            getSeriesExtremes: function(originalFn) {
                originalFn.call(this);
                callHook(this.options.getSeriesExtremesPostHook, this);
            },

            setTickPositions: function(originalFn, secondPass) {
                var options = this.options;
                callHook(options.setTickPositionsPreHook, this, secondPass);
                originalFn.call(this, secondPass);
                callHook(options.setTickPositionsPostHook, this, secondPass);
            },

            setAxisSize: function(originalFn) {
                callHook(this.options.setSizePreHook, this);
                originalFn.call(this);
            }, 

            zoom: function(originalFn, newMin, newMax) {
                return callHookOrOriginal(this.options.zoomOverride, originalFn, this, newMin, newMax);
            }

        });

        patch(Highcharts.Tick, {

            render: function(originalFn, index, old, opacity) {
                originalFn.call(this, index, old, opacity);
                callHook(this.axis.options.tickRenderPostHook, this, index, old, opacity);
            },

            handleOverflow: function(originalFn, index, xy, old) {
                return callHookOrOriginal(this.axis.options.tickHandleOverflowOverride, originalFn, this, index, xy, old);
            }, 

            getLabelSize: function(originalFn) {
                return callHookOrOriginal(this.axis.options.getLabelSizeOverride, originalFn, this);
            }

        });

        patch(Highcharts.Pointer, {

            runPointActions: function(originalFn, e) {
                var hoverSeries = this.chart.hoverSeries;
                if(hoverSeries && typeof hoverSeries.options.pointActionsPreHook === 'function') {
                    hoverSeries.options.pointActionsPreHook(hoverSeries, e);
                }
                originalFn.call(this, e);
            },

            dragStart: function(originalFn, e) {
                callHook(this.chart.options.pointerDragStartPreHook, this, e);
                originalFn.call(this, e);
            },

            drag: function(originalFn, e) {
                return callHookOrOriginal(this.chart.options.pointerDragOverride, originalFn, this, e, originalFn);
            },

            drop: function(originalFn, e) {
                // SPL-80321, due to our customizations, it's possible for the drop event of one chart to cause another
                // chart to be destroyed while its drop event handler is still pending
                // detect that the chart has been destroyed by its lack of an 'index' and suppress the drop handler
                if(this.chart.hasOwnProperty('index')) {
                    callHook(this.chart.options.pointerDropPreHook, this, e);
                    originalFn.call(this, e);
                    callHook(this.chart.options.pointerDropPostHook, this, e);
                }
            },

            pinch: function(originalFn, e){
                return callHookOrOriginal(this.chart.options.pointerPinchOverride, originalFn, this, e, originalFn);
            }

        });

    };

    return { applyPatches: applyPatches };

});