/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var Event = require("./Event");
	var MDOMTarget = require("./MDOMTarget");
	var Class = require("../Class");
	var FunctionUtil = require("../utils/FunctionUtil");
	var ObjectUtil = require("../utils/ObjectUtil");
	var Set = require("../utils/Set");

	return Class(module.id, Event, function(DelegateEvent, base)
	{

		// Private Static Methods

		var _getBubbleTarget = function(target, isDOMTarget)
		{
			if (target.isEventTarget)
			{
				target = target.getBubbleTarget();
				return (target && target.isEventTarget) ? target : null;
			}

			if (!isDOMTarget)
				return null;

			var domElement = target.parentNode;
			if (domElement)
			{
				target = MDOMTarget.fromDOMElement(domElement);
				return (target && target.isEventTarget) ? target : domElement;
			}

			return null;
		};

		// Private Properties

		this._sourceEvent = null;
		this._targetType = null;
		this._targetSelector = null;
		this._excludeNested = null;
		this._delegateContext = null;

		// Constructor

		this.constructor = function(name, sourceEvent, targetType)
		{
			if (sourceEvent == null)
				throw new Error("Parameter sourceEvent must be non-null.");
			if (!(sourceEvent instanceof Event))
				throw new Error("Parameter sourceEvent must be of type " + Class.getName(Event) + ".");
			if (sourceEvent instanceof DelegateEvent)
				throw new Error("Parameter sourceEvent must NOT be of type " + Class.getName(DelegateEvent) + ".");

			base.constructor.call(this, name, sourceEvent.type(), sourceEvent.bubbles(), sourceEvent.cancelable());

			this._sourceEvent = sourceEvent;

			if (targetType != null)
				this.targetType(targetType);
		};

		// Public Accessor Methods

		this.sourceEvent = function()
		{
			return this._sourceEvent;
		};

		this.targetType = function(value)
		{
			if (!arguments.length)
				return this._targetType;

			if ((value != null) && !Class.isFunction(value))
				throw new Error("Parameter targetType must be of type Function.");

			this._targetType = value || null;

			return this;
		};

		this.targetSelector = function(value)
		{
			if (!arguments.length)
				return this._targetSelector;

			if ((value != null) && !Class.isFunction(value))
				throw new Error("Parameter targetSelector must be of type Function.");

			this._targetSelector = value || null;

			return this;
		};

		this.excludeNested = function(value)
		{
			if (!arguments.length)
				return this._excludeNested;

			if ((value != null) && !Class.isString(value))
				throw new Error("Parameter excludeNested must be of type String.");

			this._excludeNested = value || null;

			return this;
		};

		// Public Methods

		this.notifyListeners = function(target, eventData)
		{
			var context = this.getContext(target, false);
			if (!context)
				return;

			var isDOMTarget = (target.isDOMTarget && (target.getDOMElement() != null));
			var targetType = this._targetType;
			var targetSelector = this._targetSelector;
			var excludeNested = this._excludeNested;

			// if excludeNested is specified, build set of nested targets to exclude
			var nestedTargetSet;
			if (excludeNested)
			{
				nestedTargetSet = new Set();

				var nestedTarget = eventData[excludeNested];
				while (nestedTarget)
				{
					nestedTargetSet.add(nestedTarget);

					if (nestedTarget === target)
						break;

					nestedTarget = _getBubbleTarget(nestedTarget, isDOMTarget);
				}
			}

			// build list of 'current' targets to delegate for
			var currentTargetList = [];
			var currentTarget = eventData.target;
			while (currentTarget)
			{
				if (nestedTargetSet && nestedTargetSet.has(currentTarget))
					break;

				if (!targetType || (currentTarget instanceof targetType))
				{
					if (!targetSelector || targetSelector.call(target, currentTarget))
						currentTargetList.push(currentTarget);
				}

				if (currentTarget === target)
					break;

				currentTarget = _getBubbleTarget(currentTarget, isDOMTarget);
			}

			if (!currentTargetList.length)
				return;

			var hasOriginalDelegateTarget = ObjectUtil.has(eventData, "delegateTarget");
			var originalDelegateTarget = hasOriginalDelegateTarget ? eventData.delegateTarget : null;

			eventData.delegateTarget = target;

			for (var i = 0, l = currentTargetList.length; i < l; i++)
			{
				this._delegateContext = context;
				base.notifyListeners.call(this, currentTargetList[i], eventData);
				if (eventData.isPropagationStopped())
					break;
			}

			if (hasOriginalDelegateTarget)
				eventData.delegateTarget = originalDelegateTarget;
			else
				delete eventData.delegateTarget;
		};

		// Protected Methods

		this.getContext = function(target, create)
		{
			var delegateContext = this._delegateContext;
			if (delegateContext)
			{
				this._delegateContext = null;
				return delegateContext;
			}

			return base.getContext.call(this, target, create);
		};

		this.setupContext = function(context)
		{
			base.setupContext.call(this, context);

			context._sourceEventHandler = FunctionUtil.bind(this._sourceEventHandler, this, context);
			context.target.on(this._sourceEvent, context._sourceEventHandler, this, -Infinity);
		};

		this.teardownContext = function(context)
		{
			context.target.off(this._sourceEvent, context._sourceEventHandler, this);
			context._sourceEventHandler = null;

			base.teardownContext.call(this, context);
		};

		// Private Methods

		this._sourceEventHandler = function(context, eventData)
		{
			if (!eventData.isPropagationStopped())
				this.notifyListeners(context.target, eventData);
		};

	});

});
