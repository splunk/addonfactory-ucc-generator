/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var Class = require("../Class");

	return Class(module.id, function(Placement)
	{

		// Public Static Constants

		Placement.CENTER = "center";
		Placement.TOP = "top";
		Placement.RIGHT = "right";
		Placement.BOTTOM = "bottom";
		Placement.LEFT = "left";

	});

});
