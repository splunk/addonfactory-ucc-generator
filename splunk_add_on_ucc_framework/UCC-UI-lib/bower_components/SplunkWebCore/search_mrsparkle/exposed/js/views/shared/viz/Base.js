/**
 * A common base class for a Backbone View that wraps a visualization.  The visualization can be a
 * mod viz defined in an app or a built-in visualization.
 *
 * This base class uses managed asynchronous passes to batch rendering and processing operations.
 * To integrate these passes with the surrounding system, this class changes the behavior of
 * the activate/deactivate/invalidateReflow methods to make them "pass aware".  More details
 * in inline comments below.
 *
 * The goal of this class is to provide a tiered API.  A simple subclass can only implement
 * the updateView method and do all data processing and rendering there.  Or a more advanced
 * subclass can break these out into distinct data process and rendering passes, and override
 * the change handlers to control when those passes are invalidated.
 */

define([
            'underscore',
            'jg/async/MPassTarget',
            'jg/async/Pass',
            'jg/Class',
            'jg/utils/Set',
            'views/Base',
            'util/console',
            'helpers/Printer',
            'jquery.resize'
        ],
        function(
            _,
            MPassTarget,
            Pass,
            Class,
            Set,
            BaseView,
            console,
            Printer,
            undefined
        ) {

    // Define a custom subclass of the built-in asynchronous pass object that
    // integrates with the activate/deactivate lifecycle.
    var DeactivatingPass = Class(Pass, function(DeactivatingPass, base) {

        // Check whether or not its target is active when the pass is invalidated.
        // If the target is not active, the pass does not go into the processing queue
        // and instead broadcasts itself to the target view to be dealt with
        // if/when the view is activated later.
        this.invalidate = function(target) {
            if (target instanceof SplunkVisualizationBase && !target.active) {
                target.enqueueInvalidPass(this);
                return;
            }
            base.invalidate.apply(this, arguments);
        };

        // If a pass comes out of the processing queue while the view is deactivated
        // (i.e. it was invalidated right before the view was deactivated) it marks
        // itself valid without running its method and broadcasts itself to be
        // dealt with if/when the view is activated later.
        this.validate = function(target) {
            if (target instanceof SplunkVisualizationBase && !target.active) {
                this.markValid(target);
                target.enqueueInvalidPass(this);
                return;
            }
            base.validate.apply(this, arguments);
        };

    });

    var FORMAT_DATA_PASS_ORDER = -1,
        UPDATE_VIEW_PASS_ORDER = FORMAT_DATA_PASS_ORDER + 0.1,
        REFLOW_PASS_ORDER = UPDATE_VIEW_PASS_ORDER + 0.1;

    var SplunkVisualizationBase = BaseView.extend(_.extend({}, MPassTarget, {

        formatDataPass: new DeactivatingPass('_formatData', FORMAT_DATA_PASS_ORDER),
        updateViewPass: new DeactivatingPass('_updateView', UPDATE_VIEW_PASS_ORDER),
        reflowPass: new DeactivatingPass('reflow', REFLOW_PASS_ORDER),

        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model.searchData, 'change', this.onDataChange);
            this.listenTo(this.model.config, 'change', function(configModel) {
                this.onConfigChange(
                    configModel.changedAttributes(),
                    configModel.previousAttributes()
                );
            });
            this.$el.on('elementResize', this.onContainerSizeChange.bind(this));
            this.listenTo(Printer, Printer.PRINT_START, this.onPrintStart.bind(this));
            this.listenTo(Printer, Printer.PRINT_END, this.onPrintEnd.bind(this));
            this._pendingPasses = new Set();
            this._formattedData = null;
            this._setupView = _.once(function() { this.setupView(); });
            this.activate();
        },

        remove: function() {
            this.markValid();
            this.$el.off('elementResize');
            return BaseView.prototype.remove.apply(this, arguments);
        },

        // By default, any data change invalidates the formatDataPass.
        // Subclasses can override this method for more fine-grained control.
        onDataChange: function() {
            this.invalidate('formatDataPass');
        },

        // By default, any config change invalidates the formatDataPass.
        // Subclasses can override this method for more fine-grained control, making use of the
        // given changed and previous attributes to determine the most efficient way to handle the change.
        //
        // For example, it's common for certain config attributes to have no effect on the formatDataPass,
        // so a subclass could avoid needless work by invalidating the updateViewPass instead.
        onConfigChange: function(changedAttributes, previousAttributes) {
            this.invalidate('formatDataPass');
        },

        onContainerSizeChange: function() {
            this.invalidate('reflowPass');
        },

        onPrintStart: function() {
            this.invalidate('reflowPass');
            this.validate();
        },

        onPrintEnd: function() {
            this.invalidate('reflowPass');
            this.validate();
        },

        // The formatDataPass will call the subclass-specific formatData routine and store
        // the result as an instance variable to be used later by the updateViewPass.
        // It then invalidates the updateViewPass so that the visualization is updated with the new data.
        //
        // In certain cases, a subclass might want to avoid invalidating the updateViewPass.
        // This can be accomplished by overriding the _shouldUpdateViewOnDataChange method.
        _formatData: function() {
            var rawData = this.model.searchData.pick('fields', 'rows', 'columns', 'results', 'meta');
            var previousData = this._formattedData;
            this._formattedData = this.formatData(rawData, this.model.config.toJSON());
            if (this._shouldUpdateViewOnDataChange(this._formattedData, previousData)) {
                this.invalidate('updateViewPass');
            }
        },
        
        _shouldUpdateViewOnDataChange: function(data, previousData) {
            return true;
        },

        // Override to implement as custom data processing routine
        formatData: function(data, config) {
            return data;
        },

        // The updateViewPass takes care of calling the one-time setupView routine,
        // followed by the updateView routine.
        //
        // By default, the updateView routine is assumed to execute synchronously, so upstream consumers
        // will be notified of the update immediately after it runs.  If a subclass has an
        // asynchronous updateView routine, it must call the `async` function, which will
        // return a callback to invoke when the update completes, e.g.:
        //
        // updateView: function(data, config, async) {
        //     var done = async();
        //     // render some stuff hidden, ready to animate into view
        //     $renderedStuff.slideDown(500, function() {
        //         // the rendered stuff has finished animating
        //         done();
        //     });
        // }
        _updateView: function() {
            this._setupView();
            var syncRender = true;
            var updateError = false;

            var async = function() {
                syncRender = false;
                return function() {
                    if (!updateError) {
                        this._onViewUpdated();
                    }
                    this.stopListening(this, 'error', errorListener);
                }.bind(this);
            }.bind(this);

            var errorListener = function() {
                updateError = true;
            };

            this.listenTo(this, 'error', errorListener);

            this.updateView(
                this._formattedData,
                this.model.config.toJSON(),
                async
            );
            if (syncRender) {
                if (!updateError) {
                    this._onViewUpdated();
                }
                this.stopListening(this, 'error', errorListener);
            }
        },

        _onViewUpdated: function() {
            this.trigger('rendered');
        },

        // Override for one-time view setup code
        setupView: function() {},
 
        // Override to render something
        updateView: function(data, config, async) {
            console.log('Modular component does not override updateView');
        },

        // Support the existing pattern of creating a view with pre-populated models
        // and then calling render when it's ready to go into the DOM.
        render: function() {
            this.invalidate('formatDataPass');
            this.invalidate('updateViewPass');
            return this;
        },

        // Override to reflow
        reflow: function() {},

        enqueueInvalidPass: function(pass) {
            this._pendingPasses.add(pass);
        },

        getValidateDepth: BaseView.prototype.getReflowDepth,

        // Modify the behavior of activate and deactivate to work with the passes.
        // The activate method should run any passes that were invalidated while the
        // view was deactivated.  And the deactivate method should not unbind event
        // listeners.
        activate: function() {
            if (this.active) {
                return BaseView.prototype.activate.apply(this, arguments);
            }
            BaseView.prototype.activate.apply(this, arguments);
            _(this._pendingPasses.entries()).each(this.invalidate, this);
            this._pendingPasses.clear();
            return this;
        },

        deactivate: function(options) {
            options = _.extend({}, options, { stopListening: false });
            return BaseView.prototype.deactivate.call(this, options);
        },

        wake: function() {
            return this.activate();
        },

        sleep: function() {
            return this.deactivate();
        },

        // Intercept calls to invalidateReflow and re-map them to invalidation
        // of the reflow pass.
        invalidateReflow: function() {
            this.invalidate('reflowPass');
        }

    }));

    return SplunkVisualizationBase;
});