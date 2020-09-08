/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var ResizeEvent = require("./ResizeEvent");
	var Class = require("../Class");

	return Class(module.id, function(MResizeTarget)
	{

		// Public Properties

		this.isResizeTarget = true;

		// Public Events

		this.resize = new ResizeEvent("resize");

	});

});
