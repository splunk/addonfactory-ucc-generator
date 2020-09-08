/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var EventData = require("./EventData");
	var Class = require("../Class");

	return Class(module.id, EventData, function(ErrorEventData, base)
	{

		// Public Properties

		this.error = null;

		// Constructor

		this.constructor = function(error)
		{
			this.error = error;
		};

	});

});
