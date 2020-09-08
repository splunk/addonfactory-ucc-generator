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

	return Class(module.id, EventData, function(PassEventData, base)
	{

		// Public Properties

		this.pass = null;

		// Constructor

		this.constructor = function(pass)
		{
			this.pass = pass;
		};

	});

});
