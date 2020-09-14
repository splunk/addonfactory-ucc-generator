define(
    [
        'jquery',
        'underscore',
        'backbone',
        'views/Base',
        'splunkjs/mvc',
        'splunkjs/mvc/settings',
        'splunk.util',
        'mixins/viewlogging'
    ],
    function($,
             _,
             Backbone,
             BaseView,
             mvc,
             Settings,
             SplunkUtil,
             ViewloggingMixin) {

        var defaultViewOptions = {
            register: true // whether to register into mvc.Components
        };

        var sprintf = SplunkUtil.sprintf;
        var BaseDashboardView = BaseView.extend(_.extend({}, ViewloggingMixin, {
            viewOptions: {},
            omitFromSettings: [],
            _uniqueIdPrefix: 'view_',
            /**
             * Creates a new view.
             *
             * @param options.id    (optional) ID of this view.
             *                      Defaults to an automatically generated ID.
             * @param options.el    (optional) Preexisting <div> in which this view
             *                      will be rendered.
             * @param options.settings
             *                      A Settings model instance to use instead of creating
             *                      our own.
             * @param options.settingsOptions
             *                      Initial options for this view's settings model.
             * @param options.*     Initial attributes for this view's settings model.
             *                      See subclass documentation for details.
             * @param settingsOptions
             *                      Initial options for this view's settings model.
             */
            constructor: function(options, settingsOptions) {
                options = options || {};
                settingsOptions = settingsOptions || {};

                options.settingsOptions = _.extend(
                    options.settingsOptions || {},
                    settingsOptions);

                // Internal property to track object lifetime.
                // With this flag we want to prevent invoking methods / code
                // on already removed instance.
                this._removed = false;

                // Get an ID or generate one
                if (!options.id) {
                    this.id = _.uniqueId(this._uniqueIdPrefix || 'view_');
                    this.autoId = true;
                } else {
                    this.id = options.id;
                    this.autoId = options.autoId || false;
                }
                this.options = _.extend({}, this.options, options);
                if (this.options.moduleId) {
                    this.moduleId = this.options.moduleId;
                }
                this.viewOptions = _.defaults(this.viewOptions, defaultViewOptions);
                var returned = BaseView.prototype.constructor.apply(this, arguments);
                // Register self in the global registry
                if (this.viewOptions.register) {
                    mvc.Components.registerInstance(this.id, this, {replace: settingsOptions.replace});
                }

                return returned;
            },
            /**
             * Initializes this view's settings model based on the contents of
             * this.options.
             *
             * Protected.
             */
            configure: function() {

                var settings = this.options.settings;
                if (settings && (settings instanceof Settings)) {
                    this.settings = settings;
                    return this;
                }

                // Reinterpret remaining view options as settings attributes.
                var localOmitFromSettings = (this.omitFromSettings || []).concat(
                    ['model', 'collection', 'el', 'attributes', 'className',
                        'tagName', 'events', 'settingsOptions', 'deferreds', 'autoId']);
                var settingsAttributes = _.omit(this.options, localOmitFromSettings);
                var settingsOptions = this.options.settingsOptions;

                // Now, we create our default settings model.
                this.settings = new Settings(settingsAttributes, settingsOptions);

                return this;
            },
            remove: function() {
                this._removed = true;

                this.settings.dispose();

                // Call our super class
                BaseView.prototype.remove.apply(this, arguments);

                // Remove it from the registry
                if (this.viewOptions.register && mvc.Components.getInstance(this.id) === this) {
                    mvc.Components.revokeInstance(this.id);
                }

                return this;
            },
            dispose: function() {
                this.remove();
            },
            bindToComponentSetting: function(settingName, fn, fnContext) {
                this.listenTo(this.settings, "change:" + settingName, function(model, value, options) {
                    var oldComponentName = this.settings.previous(settingName);
                    var newComponentName = value;

                    this.unbindFromComponent(oldComponentName, fn, fnContext);
                    this.bindToComponent(newComponentName, fn, fnContext);
                }, this);

                var initialComponentName = this.settings.get(settingName);
                this.bindToComponent(initialComponentName, fn, fnContext);
            },
            bindToComponent: function(id, fn, fnContext) {
                // Abort if required parameters are missing
                if (!id || !fn) {
                    return this;
                }

                // We register on the "change:{id}" event
                this.listenTo(mvc.Components, "change:" + id, fn, fnContext);

                // However, it could be that the component already exists,
                // in which case, we will invoke the callback manually
                if (mvc.Components.has(id)) {
                    var ctx = mvc.Components.get(id);
                    _.defer(_.bind(function() {
                        if (!this._removed) {
                            fn.apply(fnContext, [mvc.Components, ctx, {}]);
                        }
                    }, this));
                }

                return this;
            },
            unbindFromComponent: function(id, fn, fnContext) {
                id && (mvc.Components.off("change:" + id, fn, fnContext));
                return this;
            },
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                this.configure();
            },
            createOrFind: function(classes, parent, tag) {
                classes = classes.split(' ');
                parent = parent || this.$el;
                tag = tag || "div";
                var selector = _(classes).map(function(clazz) {
                    return "." + clazz;
                }).join(' ');
                var $dom = parent.children(selector);
                if (!$dom.length) {
                    var domStr = sprintf('<%s class="%s"></%s>', tag, classes.join(' '), tag);
                    $dom = $(domStr).prependTo(parent);
                }
                return $dom;
            },
            addChild: function(component) {
                component.render().$el.appendTo(this.$el);
            },
            getChildElements: function(selector) {
                return _(this.$el.find(selector)).chain()
                    .map(function(el) {
                        return $(el).attr('id');
                    })
                    .map(_.bind(mvc.Components.get, mvc.Components))
                    .filter(_.identity)
                    .value();
            },
            render: function() {
                BaseView.prototype.render.apply(this, arguments);
                return this;
            },
            isEditMode: function() {
                return this.model.state.get('mode') == 'edit';
            },
            // layout manager will actually show or hide it
            show: function() {
                this.$el.removeClass('hidden').trigger('elementVisibilityChanged');
            },
            hide: function() {
                this.$el.addClass('hidden').trigger('elementVisibilityChanged');
            }
        }));
        return BaseDashboardView;
    }
);
