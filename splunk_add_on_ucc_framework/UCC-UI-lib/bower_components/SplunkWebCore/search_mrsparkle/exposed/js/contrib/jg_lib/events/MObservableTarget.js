/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var Event = require("./Event");
	var EventData = require("./EventData");
	var Class = require("../Class");

	return Class(module.id, function(MObservableTarget)
	{

		// Public Properties

		this.isObservableTarget = true;

		// Public Events

		this.change = new Event("change", EventData);

	});

});
