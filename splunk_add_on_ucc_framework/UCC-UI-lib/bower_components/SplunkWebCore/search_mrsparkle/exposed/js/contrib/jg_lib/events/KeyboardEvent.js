/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var DOMEvent = require("./DOMEvent");
	var KeyboardEventData = require("./KeyboardEventData");
	var Class = require("../Class");

	return Class(module.id, DOMEvent, function(KeyboardEvent, base)
	{

		// Constructor

		this.constructor = function(name, type, bubbles, cancelable, domName)
		{
			if (type == null)
				type = KeyboardEventData;
			else if (!Class.isFunction(type))
				throw new Error("Parameter type must be of type Function.");
			else if ((type !== KeyboardEventData) && !Class.isSubclassOf(type, KeyboardEventData))
				throw new Error("Parameter type must be a subclass of " + Class.getName(KeyboardEventData) + ".");

			base.constructor.call(this, name, type, bubbles, cancelable, domName);
		};

		// Protected Methods

		this.domEventToEventData = function(context, domEvent)
		{
			var eventData = base.domEventToEventData.call(this, context, domEvent);

			var isPress = (this.domName() === "keypress");

			eventData.keyCode = !isPress ? (domEvent.keyCode || 0) : 0;
			eventData.charCode = isPress ? (domEvent.charCode || domEvent.keyCode || 0) : 0;
			eventData.ctrlKey = (domEvent.ctrlKey === true);
			eventData.shiftKey = (domEvent.shiftKey === true);
			eventData.altKey = (domEvent.altKey === true);
			eventData.metaKey = (domEvent.metaKey === true);

			return eventData;
		};

	});

});
