/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var Class = require("../Class");

	return Class(module.id, function(AutoResize)
	{

		// Public Static Constants

		AutoResize.NONE = "none";
		AutoResize.WIDTH = "width";
		AutoResize.HEIGHT = "height";
		AutoResize.BOTH = "both";

	});

});
