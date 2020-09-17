/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var PropertyEventData = require("./PropertyEventData");
	var Class = require("../Class");
	var ChainedEvent = require("../events/ChainedEvent");
	var MObservableTarget = require("../events/MObservableTarget");
	var ErrorUtil = require("../utils/ErrorUtil");
	var FunctionUtil = require("../utils/FunctionUtil");
	var Set = require("../utils/Set");

	return Class(module.id, function(MObservableProperty)
	{

		// Public Events

		this.change = null;

		// Public Properties

		this.isObservableProperty = true;

		// Private Properties

		this._changeComparator = null;
		this._onChange = null;

		// Public Accessor Methods

		this.changeComparator = function(value)
		{
			if (!arguments.length)
				return this._changeComparator;

			if ((value != null) && !Class.isFunction(value))
				throw new Error("Parameter changeComparator must be of type Function.");

			this._changeComparator = value || null;

			return this;
		};

		this.onChange = function(value)
		{
			if (!arguments.length)
				return this._onChange;

			if ((value != null) && !Class.isFunction(value))
				throw new Error("Parameter onChange must be of type Function.");

			this._onChange = value || null;

			return this;
		};

		// Protected Methods

		this.initChangeEvent = function()
		{
			this.change = new PropertyChangeEvent(this);
		};

		this.setupDependencySupport = function(context)
		{
			context._dependencyList = null;
			context._dependencyChangingSet = null;
			context._dependencyChangeHandler = null;
		};

		this.teardownDependencySupport = function(context)
		{
			this.teardownDependencyChangeHandler(context);

			context._dependencyChangingSet = null;
			context._dependencyChangeHandler = null;
		};

		this.setupDependencyChangeHandler = function(context, dependencyList)
		{
			if (context._dependencyList || (dependencyList.length === 0))
				return;

			var target = context.target;
			if (!target.isEventTarget || !target.isListenerTarget)
				return;

			dependencyList = context._dependencyList = dependencyList.concat();

			if (!context._dependencyChangingSet)
				context._dependencyChangingSet = new Set();

			var dependencyChangeHandler = context._dependencyChangeHandler;
			if (!dependencyChangeHandler)
				dependencyChangeHandler = context._dependencyChangeHandler = FunctionUtil.bind(this.dependencyChangeHandler, this, context);

			var dependencyInfo;
			for (var i = 0, l = dependencyList.length; i < l; i++)
			{
				dependencyInfo = dependencyList[i];
				target.listenOn(dependencyInfo.target, dependencyInfo.event, dependencyChangeHandler, this, -Infinity);
			}
		};

		this.teardownDependencyChangeHandler = function(context)
		{
			var dependencyList = context._dependencyList;
			if (!dependencyList)
				return;

			var target = context.target;
			var dependencyChangeHandler = context._dependencyChangeHandler;
			var dependencyInfo;
			for (var i = dependencyList.length - 1; i >= 0; i--)
			{
				dependencyInfo = dependencyList[i];
				target.listenOff(dependencyInfo.target, dependencyInfo.event, dependencyChangeHandler, this);
			}

			context._dependencyList = null;
		};

		this.dependencyChangeHandler = function(context, eventData)
		{
			if (context.isWriting || eventData.isPropagationStopped())
				return;

			var dependencyChangingSet = context._dependencyChangingSet;
			if (dependencyChangingSet.has(eventData))
				return;

			try
			{
				dependencyChangingSet.add(eventData);

				context.target.fire(this.change, eventData);
			}
			finally
			{
				dependencyChangingSet.del(eventData);
			}
		};

		this.notifyChange = function(context, oldValue, newValue)
		{
			var target = context.target;
			if (target.isEventTarget)
				target.fire(this.change, new PropertyEventData(this, oldValue, newValue));
		};

		this.hasChange = function(context, oldValue, newValue)
		{
			if (this._changeComparator)
				return this._changeComparator.call(context.target, oldValue, newValue) ? true : false;

			// default comparison that handles NaN
			return ((oldValue !== newValue) && ((oldValue === oldValue) || (newValue === newValue)));
		};

		// Private Nested Classes

		var PropertyChangeEvent = Class(ChainedEvent, function(PropertyChangeEvent, base)
		{

			// Private Properties

			this._property = null;

			// Constructor

			this.constructor = function(property)
			{
				base.constructor.call(this, property.name() + ".change", MObservableTarget.change);

				this._property = property;
			};

			// Public Methods

			this.notifyListeners = function(target, eventData)
			{
				// manually invoke the property onChange handler to avoid the performance and
				// memory overhead of adding it as an actual listener

				var onChange = this._property._onChange;
				if (onChange)
				{
					var originalCurrentEvent = eventData.currentEvent;
					var originalCurrentTarget = eventData.currentTarget;

					eventData.currentEvent = this;
					eventData.currentTarget = target;

					try
					{
						onChange.call(target, eventData);
					}
					catch (e)
					{
						ErrorUtil.nonBlockingThrow(e);
					}

					eventData.currentEvent = originalCurrentEvent;
					eventData.currentTarget = originalCurrentTarget;

					if (eventData.isImmediatePropagationStopped())
						return;
				}

				base.notifyListeners.call(this, target, eventData);
			};

		});

	});

});
