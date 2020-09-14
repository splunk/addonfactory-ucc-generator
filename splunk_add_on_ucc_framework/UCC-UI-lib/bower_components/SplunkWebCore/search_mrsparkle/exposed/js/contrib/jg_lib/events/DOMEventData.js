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
	var Global = require("../utils/Global");

	return Class(module.id, EventData, function(DOMEventData, base)
	{

		// Public Properties

		this.originalEvent = null;
		this.timeStamp = 0;
		this.view = null;

		// Constructor

		this.constructor = function(attributes)
		{
			if (attributes)
			{
				this.timeStamp = attributes.timeStamp || new Date().getTime();
				this.view = attributes.view || Global.window || null;
			}
		};

	});

});
