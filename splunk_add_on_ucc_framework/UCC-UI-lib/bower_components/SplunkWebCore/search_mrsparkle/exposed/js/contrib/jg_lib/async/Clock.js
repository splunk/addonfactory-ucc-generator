/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var ClockEventData = require("./ClockEventData");
	var Class = require("../Class");
	var Event = require("../events/Event");
	var MEventTarget = require("../events/MEventTarget");

	return Class(module.id, Object, function(Clock, base)
	{

		Class.mixin(this, MEventTarget);

		// Public Events

		this.tick = new Event("tick", ClockEventData);

		// Constructor

		this.constructor = function()
		{
			// noop
		};

	});

});
