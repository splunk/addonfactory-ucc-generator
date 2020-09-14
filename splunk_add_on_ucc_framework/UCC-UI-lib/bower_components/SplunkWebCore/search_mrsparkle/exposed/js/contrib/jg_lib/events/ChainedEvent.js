/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var Event = require("./Event");
	var Class = require("../Class");

	return Class(module.id, Event, function(ChainedEvent, base)
	{

		// Private Properties

		this._parentEvent = null;

		// Constructor

		this.constructor = function(name, parentEvent, type, bubbles, cancelable)
		{
			if (parentEvent == null)
				throw new Error("Parameter parentEvent must be non-null.");
			if (!(parentEvent instanceof Event))
				throw new Error("Parameter parentEvent must be of type " + Class.getName(Event) + ".");

			var parentType = parentEvent.type();
			if (type == null)
				type = parentType;
			else if (!Class.isFunction(type))
				throw new Error("Parameter type must be of type Function.");
			else if ((type !== parentType) && !Class.isSubclassOf(type, parentType))
				throw new Error("Parameter type must be a subclass of " + (Class.getName(parentType) || "parentEvent.type") + ".");

			if (bubbles == null)
				bubbles = parentEvent.bubbles();
			if (cancelable == null)
				cancelable = parentEvent.cancelable();

			base.constructor.call(this, name, type, bubbles, cancelable);

			this._parentEvent = parentEvent;
		};

		// Public Accessor Methods

		this.parentEvent = function()
		{
			return this._parentEvent;
		};

		// Public Methods

		this.notifyListeners = function(target, eventData)
		{
			base.notifyListeners.call(this, target, eventData);
			if (!eventData.isPropagationStopped())
				this._parentEvent.notifyListeners(target, eventData);
		};

		this.notifyBubbleListeners = function(bubbleTargets, eventData)
		{
			if (this.bubbles())
				base.notifyBubbleListeners.call(this, bubbleTargets, eventData);
			else
				this._parentEvent.notifyBubbleListeners(bubbleTargets, eventData);
		};

		this.getBubbleTargets = function(target)
		{
			if (this.bubbles())
				return base.getBubbleTargets.call(this, target);
			else
				return this._parentEvent.getBubbleTargets(target);
		};

	});

});
