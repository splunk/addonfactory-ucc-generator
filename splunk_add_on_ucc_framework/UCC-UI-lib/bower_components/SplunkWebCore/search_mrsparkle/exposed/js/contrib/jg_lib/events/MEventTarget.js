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

	return Class(module.id, function(MEventTarget)
	{

		// Public Properties

		this.isEventTarget = true;

		// Public Methods

		this.on = function(event, listener, scope, priority)
		{
			event = Event.resolve(this, event);

			if (listener == null)
				throw new Error("Parameter listener must be non-null.");
			if (!Class.isFunction(listener))
				throw new Error("Parameter listener must be of type Function.");
			if ((priority != null) && !Class.isNumber(priority))
				throw new Error("Parameter priority must be of type Number.");

			if (scope == null)
				scope = this;
			if ((priority == null) || isNaN(priority))
				priority = 0;

			event.on(this, listener, scope, priority);

			return this;
		};

		this.off = function(event, listener, scope)
		{
			if (scope != null)
			{
				event = Event.resolve(this, event);

				if (listener == null)
					throw new Error("Parameter listener must be non-null.");
				if (!Class.isFunction(listener))
					throw new Error("Parameter listener must be of type Function.");

				event.off(this, listener, scope);
			}
			else if (listener != null)
			{
				event = Event.resolve(this, event);

				if (!Class.isFunction(listener))
					throw new Error("Parameter listener must be of type Function.");

				event.off(this, listener, this);
			}
			else if (event != null)
			{
				event = Event.resolve(this, event);

				event.offAll(this);
			}
			else
			{
				Event.offAll(this);
			}

			return this;
		};

		this.fire = function(event, eventData)
		{
			event = Event.resolve(this, event);

			if (eventData == null)
				eventData = event.createEventData();
			else if (!event.isValidType(eventData))
				throw new Error("Data fired on event \"" + event.name() + "\" must be of type " + event.getTypeName() + ".");

			return event.fire(this, eventData);
		};

		this.hasListeners = function(event)
		{
			if (event != null)
			{
				event = Event.resolve(this, event);

				return event.hasListeners(this);
			}
			else
			{
				return Event.hasListeners(this);
			}
		};

		this.getBubbleTarget = function()
		{
			return null;
		};

	});

});
