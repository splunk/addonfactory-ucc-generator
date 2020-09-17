/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var Class = require("../Class");
	var EventData = require("../events/EventData");

	return Class(module.id, EventData, function(ClockEventData, base)
	{

		// Public Properties

		this.time = 0;
		this.deltaTime = 0;

		// Constructor

		this.constructor = function(time, deltaTime)
		{
			this.time = time;
			this.deltaTime = deltaTime;
		};

	});

});
