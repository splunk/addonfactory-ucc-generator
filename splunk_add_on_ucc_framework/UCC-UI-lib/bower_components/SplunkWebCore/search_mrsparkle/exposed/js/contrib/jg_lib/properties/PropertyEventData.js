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

	return Class(module.id, EventData, function(PropertyEventData, base)
	{

		// Public Properties

		this.property = null;
		this.oldValue = null;
		this.newValue = null;

		// Constructor

		this.constructor = function(property, oldValue, newValue)
		{
			this.property = property;
			this.oldValue = oldValue;
			this.newValue = newValue;
		};

	});

});
