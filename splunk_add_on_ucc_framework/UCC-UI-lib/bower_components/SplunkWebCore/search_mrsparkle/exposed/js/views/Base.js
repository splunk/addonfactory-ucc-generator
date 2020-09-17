define([
    'jquery',
    'backbone',
    'underscore',
    'mixins/viewlogging',
    'util/console',
    'global/GlobalReflowQueue'
],
function(
    $,
    Backbone,
    _,
    viewloggingmixin,
    console,
    GlobalReflowQueue
){
    /**
     * @namespace views
     */
    /**
     * @constructor
     * @memberOf views
     * @name Base
     * @description A collection of Backbone.View utilities and conventions to assist with template
     * compilation and cacheing, noop nested views and className naming conventions. The general
     * rule of thumb is to not override native Backbone.View methods but to complement the core API
     * with simple and useful patterns.
     * @extends {Backbone.View}
     * @mixes viewlogging
     *
     * @param {Object} options
     * @param {String} [options.moduleId] An id (commonly the requirejs module.id) that is formatted
     * and appended as a className to the root view el. Added as an instance member if passed in via
     * the constructor.
     *
     * @param {String} [options.template] An _.template that is passed through the compileTemplate
     * method. Added as an instance member if passed including an additional compiledTemplate
     * instance member (see compileTemplate for specification).
     */
    var BaseView = Backbone.View.extend(/** @lends views.Base.prototype */{
        awake: true,
        touch: false,
        active: false,
        isReflowValid: true,

        constructor: function(options) {
            this.options = options || {};
            this.children = {};

            if (this.options.moduleId) {
                this.moduleId = this.options.moduleId;
            }
            if (this.options.template) {
                this.template = this.options.template;
            }
            if (this.template) {
                this.compiledTemplate = this.compileTemplate(this.template);
            }

            if (this.css && Object.keys(this.css) && !this.className) {
                this.options.dontAddModuleIdAsClass = true;
            }
            // Clone css to allow local overrides.
            if (this.css) {
                this.css = _.clone(this.css);
            }

            Backbone.View.apply(this, arguments);
        },
        initialize: function() {
            var render = this.render;
            this.render = _.bind(function() {
                var start = (new Date()).getTime(),
                    end;
                if (this.awake) {
                    render.apply(this, arguments);
                } else {
                    this.touch = true;
                }
                end = (new Date()).getTime();
                if(this.options.instrument !== false) {
                    this.$el.attr('data-render-time', (end - start)/1000);
                }
                return this;
            }, this);

            this.$el.attr('data-cid', this.cid);
            if (this.moduleId) {
                var className = this.cssNamespace();

                if (!this.options.dontAddModuleIdAsClass) {
                    this.$el.addClass(className);
                }
                this.$el.attr('data-view', this.moduleId);
            }

            // Add view class automatically
            if (this.css && this.css.view) {
                this.$el.addClass(this.css.view);
            }
        },

        /**
         * Calls the method named by methodName on each child of the view.
         * @param {Function} method
         * @param {...Any} [args] Any extra arguments will be passed to method on invocation
         */
        invokeOnChildren: function(method) {
            if (!_.isString(method)) {
                throw new Error('Your method must be a string');
            }
            var argsForMethod = Array.prototype.slice.call(arguments, 1);

            _.each(this.children, function(child) {
                if (_.isArray(child)) {
                    _.each(child, function(view) {
                        if (_.isFunction(view[method])) {
                            view[method].apply(view, argsForMethod);
                        }
                    });
                } else {
                    if (child && _.isFunction(child[method])) {
                        child[method].apply(child, argsForMethod);
                    }
                }
            });
        },

        /**
         * Iterates over the children of this view, yielding each in turn to an iterator function.
         * @param {Function} iterator Each invocation of iterator is called with one argument:
         * (child).
         * @param {Any} [context] The iterator is bound to the context object, if one is passed.
         */
        eachChild: function(iterator, context) {
            if (!_.isFunction(iterator)) {
                throw new Error('Your iterator must be a function');
            }

            _.each(this.children, function(child){
                if (_.isArray(child)) {
                    _.each(child, function(view){
                        iterator.call(context, view);
                    });
                } else {
                    iterator.call(context, child);
                }
            });
        },

        /**
         * Replaces render noop proxy to original render routine. Additionally traverses
         * a special children attribute that consists of an object collection of views and
         * calls wake if that method exists.
         *
         * @param {Object} options
         *      @param {Boolean} [options.syncRender] Call the standard (sync) render method over
         *      async (debouncedRender) variant.
         *
         */
        wake: function(options) {
            options || (options = {});
            this.awake = true;
            if (this.touch) {
                this.touch = false;
                if (options.syncRender) {
                    this.render();
                } else {
                    this.debouncedRender();
                }
            }
            this.invokeOnChildren('wake', options);
            return this;
        },
        /**
         * Stops any subsequent calls to render and proxies them to a noop routine. Additionally
         * traverses a special children attribute that consists of an object collection of views and
         * calls sleep if that method exists.
         */
        sleep: function() {
            this.awake = false;
            this.invokeOnChildren('sleep');
            return this;
        },

        /**
         * Postpone the execution of render until after the input has stopped arriving. Useful for
         * assigning to model/collection change event listeners that should only happen after the
         * input has stopped arriving.
         */
        debouncedRender: function() {
            if (!this._debouncedRender) {
                this._debouncedRender = _.debounce(this.render, 0);
            }
            this._debouncedRender.apply(this, arguments);
        },

        /**
         * Compiles and memoizes an [_.template]{@link http://underscorejs.org/#template} string
         * into a function that can be evaulated for rendering.
         *
         * @param {String} templateStr An _.template string for compilation into a function.
         * @return {Function} A function that can be evaluated for rendering, pass in a data object
         * that that has properties corresponding to the template's free variables.
         * @function
         */
        compileTemplate: _.memoize(function(templateStr) {
            return _.template(templateStr);
        }),
        /**
         * Tailored for the requirejs module.id format converting into a safe and legal css
         * class attribute. For example the following module id '/views/shared/SkidRow'
         * would be converted to 'views-shared-skdrow'.
         */
        cssNamespace: function() {
            return (this.moduleId || '').toLowerCase()
                .replace(/\//g, '-')
                .replace(/\_/g, '')
                .replace(/^views-/, '')
                .replace(/-master$/, '');
        },
        /**
         * Generates a unique namespace that can be humanly cross-referenced to the view.
         */
        uniqueNS: function() {
            return (this.moduleId || 'unidentified').toLowerCase().replace(/\//g, '-') + '-' + this.cid;
        },

        /**
         * Subscribe listeners.
         * implement as necessary
         */
        startListening: function() {
        },

        stopListening: function() {
            if(arguments.length === 0) {
                this.modelsOff(this.model);
                this.collectionsOff(this.collection);
            }
            Backbone.View.prototype.stopListening.apply(this, arguments);
        },

        remove: function() {
            this.removeChildren();
            if (this._isAddedToDocument) {
                this.onRemovedFromDocument();
                this._isAddedToDocument = false;
            }
            this.stopListening();
            this.$el.remove();
            GlobalReflowQueue.remove(this);
            return this;
        },

        debouncedRemove: function(options) {
            options || (options = {});
            var defaults = {
                detach: false
            };
            _.defaults(options, defaults);
            if (options.detach) {
                this.$el.detach();
            }
            if (!this._debouncedRemove) {
                this._debouncedRemove = _.debounce(this.remove, 0);
            }
            this._debouncedRemove.apply(this, arguments);
            return this;
        },

        removeChildren: function() {
            this.invokeOnChildren('remove');
        },

        ensureDeactivated: function(options) {
            if (this.active) {
                this.deactivate(options);
            }
        },

        activate: function(options) {
            options || (options = {});
            // the options for startListening and trigger are always shallow
            var clonedOptions = _.extend({startListening: true, trigger: true}, options);
            delete options.startListening;
            delete options.trigger;
            if (!this.active && clonedOptions.startListening) {
                this.startListening();
            }
            if (this.active) {
                console.debug("Calling activate again on view:" + this.moduleId, this.cid);
            } else {
                this.active = true;
                if (clonedOptions.trigger) {
                    this.trigger("activated");
                }
            }
            //children get activated after the parent
            if (options.deep) {
                this.invokeOnChildren('activate', options);
            }
            return this;
        },

        deactivate: function(options) {
            options || (options = {});
            // the options for stopListening and trigger are always shallow
            var clonedOptions = _.extend({stopListening: true, trigger: true}, options);
            delete options.stopListening;
            delete options.trigger;
            //children get deactivated before the parent
            if (options.deep) {
                this.invokeOnChildren('deactivate', options);
            }
            if (this.active && clonedOptions.stopListening) {
                this.stopListening();
            }
            if (!this.active) {
                console.debug("Calling deactivate again on view:" + this.moduleId, this.cid);
            } else {
                this.active = false;
                if (clonedOptions.trigger) {
                    this.trigger("deactivated");
                }
            }
            return this;
        },

        /**
         *  Helper function for deepDestroy, recursively calls off() on its model(s)
         */
        modelsOff: function (model) {
            if (model instanceof Backbone.Model) {
                _.isFunction(model.associatedOff) && model.associatedOff(null, null, this);
                model.off(null, null, this);
            } else if (_.isArray(model) || $.isPlainObject(model)) { // SPL-90156
                _(model).each(function(mod) {
                    this.modelsOff(mod);
                }, this);
            } else if (model instanceof Backbone.Collection) { // TODO: revisit this logic after Dash release
                console.warn("Warning: trying to call modelsOff() on a Backbone.Collection object, please move it to this.collection instead.");
                this.collectionsOff(model);
            } else if (model != null) {
                console.warn('Warning: trying to call modelsOff() on non-Backbone.Model object! Maybe move it to this.options?');
            }
            return this;
        },
        /**
         *  Helper function for deepDestroy, recursively calls off() on its collections(s)
         */
         collectionsOff: function(collection) {
            if (collection instanceof Backbone.Collection) {
                collection.off(null, null, this);
            } else if (_.isArray(collection) || $.isPlainObject(collection)) {
                _(collection).each(function(coll) {
                    this.collectionsOff(coll);
                }, this);
            } else if (collection instanceof Backbone.Model) { // TODO: revisit this logic after Dash release
                console.warn("Warning: trying to call collectionsOff() on a Backbone.Model object, pleaes move it to this.model instead.");
                this.modelsOff(collection);
            } else if (collection != null) {
                console.warn('Warning: trying to call collectionsOff() on non-Backbone.Collection object! Maybe move it to this.options?');
            }
            return this;
        },

        /**
         * Helper function for removing the view from the DOM while a render occurs. If you call this on subviews in
         * a render function, jQuery will remove all of the subview's event listeners
         */
        detach: function() {
            if (this._isAddedToDocument) {
                this.onRemovedFromDocument();
                this._isAddedToDocument = false;
            }
            this.$el.detach();
        },

        // add instance methods for all commonly used jQuery attachment methods
        //replaceContentsOf is the analog of $.html($container)
        replaceContentsOf: function($container) {
            if(_.isString($container)) {
                throw new Error('replaceContentsOf does not support selectors or HTML strings');
            }

            // ensure the given $container parameter is a jQuery object
            $container = $($container);
            $container.empty();
            return this.attachToDocument($container, 'appendTo');
        },
        appendTo: function($container) { return this.attachToDocument($container, 'appendTo'); },
        prependTo: function($container) { return this.attachToDocument($container, 'prependTo'); },
        replaceAll: function($container) { return this.attachToDocument($container, 'replaceAll'); },
        insertAfter: function($container) { return this.attachToDocument($container, 'insertAfter'); },
        insertBefore: function($container) { return this.attachToDocument($container, 'insertBefore'); },

        /**
         * Attach the view to the given DOM element using the given method.
         * If afterward the view is attached to the document element, the onAddedToDocument method will be called.
         * If the view was already attached to the document element, and the given DOM element is different than
         * the view's current parent element, the onRemovedFromDocument method will be called first.
         *
         * Not meant to be called directly, only as a helper for the more specific attachment methods above.
         *
         * @param {DOM|jQuery} $container The target element
         * @param {String} attachmentMethod a valid jQuery DOM attachment method name
         */
        attachToDocument: function($container, attachmentMethod) {
            if(_.isString($container)) {
                throw new Error(attachmentMethod + ' does not support selectors or HTML strings');
            }

            // ensure the given $container parameter is a jQuery object
            $container = $($container);

            // if no container, abort
            if ($container.length === 0) {
                return this;
            }

            // get the raw DOM container
            var container = $container[0];

            // call onRemovedFromDocument if needed
            var oldParent = this.el.parentNode;
            if (oldParent && (oldParent !== container)) {
                if (this._isAddedToDocument) {
                    this.onRemovedFromDocument();
                    this._isAddedToDocument = false;
                }
            }

            // do the attachment
            this.$el[attachmentMethod]($container);

            // call onAddedToDocument if needed
            if (oldParent !== container) {
                if ($.contains(document.documentElement, this.el)) {
                    this._isAddedToDocument = true;
                    this.onAddedToDocument();
                }
            }

            return this;
        },

        /**
         * Called when this view is added to the document. Recursively calls
         * onAddedToDocument on all child views. Override this method with custom code
         * that should be run when this view is added to the document. Make sure to call
         * the base implementation when overriding.
         *
         * This method is automatically called and should not be called directly.
         */
        onAddedToDocument: function() {
            this.invalidateReflow();
            this.eachChild(function(child) {
                if (_.isFunction(child.onAddedToDocument) && this.isAncestorOf(child) && !child._isAddedToDocument) {
                    child._isAddedToDocument = true;
                    child.onAddedToDocument();
                }
            }, this);
            this.trigger('addedToDocument');
        },

        /**
         * Called when this view is removed from the document. Recursively calls
         * onRemovedFromDocument on all child views. Override this method with custom
         * code that should be run when this view is removed from the document. Make
         * sure to call the base implementation when overriding.
         *
         * This method is automatically called and should not be called directly.
         */
        onRemovedFromDocument: function() {
            this.isReflowValid = true;
            GlobalReflowQueue.remove(this);
            this.eachChild(function(child) {
                if (_.isFunction(child.onRemovedFromDocument) && this.isAncestorOf(child) && child._isAddedToDocument) {
                    child.onRemovedFromDocument();
                    child._isAddedToDocument = false;
                }
            }, this);
            this.trigger('removedFromDocument');
        },

        /**
         * Returns a boolean indicating whether the view is currently attached to the document element
         */
        isAddedToDocument: function() {
            return this._isAddedToDocument;
        },

        /**
         * Returns true if this view is an ancestor of the given view; false otherwise;
         *
         * @param {Backbone.View} descendant A Backbone.View instance to test against.
         */
        isAncestorOf: function(descendant) {
            return descendant.el ? $.contains(this.el, descendant.el) : false;
        },

        /**
         * Returns true if this view is a descendant of the given view; false otherwise;
         *
         * @param {Backbone.View} ancestor A Backbone.View instance to test against.
         */
        isDescendantOf: function(ancestor) {
            return ancestor.el ? $.contains(ancestor.el, this.el) : false;
        },

        /**
         * Instruct the view to re-flow itself in its current container.
         *
         * Override this method to do any work that is required when the view needs to adjust to its container size.
         */
        reflow: function() {
        },

        /**
         * Helper function that returns the paths of ancestor Backbone views. The algorithm
         * traverses the DOM up the parent chain and the data-view attribute of each DOM element
         * with a data-view attribute. The data-view attribute is added to the DOM tree root of
         * each views/Base.
         *
         * The array is sorted starting with the top-most DOM element's data-view string
         *
         * This function will only return the full ancestor list once it has been added to a DOM
         *
         * @param depth {Number} specifies the maximum number of ancestors to return
         * @return {Array}
         */
        getAncestors: function(depth) {
            var results = [];
            var parent = this.$el;

            while (true) {
                parent = parent.parent();

                if (parent.length > 0) {
                    var dataView = parent.attr("data-view");
                    if (!_(dataView).isUndefined() && !_(dataView).isEmpty())
                        results.unshift(dataView);
                } else {
                    break;
                }

                if (!_(depth).isUndefined() && depth == results.length)
                    break;
            }

            return results;
        },

        invalidateReflow: function() {
            if (this.isReflowValid) {
                this.isReflowValid = false;
                GlobalReflowQueue.add(this);
            }
        },

        validateReflow: function(force) {
            if (!this.isReflowValid || force) {
                this.reflow();
                this.isReflowValid = true;
                GlobalReflowQueue.remove(this);
            }
            this.invokeOnChildren('validateReflow');
        },

        getReflowDepth: function() {
            var depth = 0;
            for (var parentNode = this.el.parentNode; parentNode; parentNode = parentNode.parentNode) {
                depth++;
            }
            return depth;
        }
    });

    _.extend(BaseView.prototype, viewloggingmixin);

    return BaseView;

});
