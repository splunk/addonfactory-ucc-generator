/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var Class = require("../Class");

	return Class(module.id, function(ScaleMode)
	{

		// Public Static Constants

		ScaleMode.FILL = "fill";
		ScaleMode.UNIFORM_FILL = "uniformFill";
		ScaleMode.UNIFORM_FILL_WIDTH = "uniformFillWidth";
		ScaleMode.UNIFORM_FILL_HEIGHT = "uniformFillHeight";
		ScaleMode.FIT = "fit";
		ScaleMode.UNIFORM_FIT = "uniformFit";
		ScaleMode.UNIFORM_FIT_WIDTH = "uniformFitWidth";
		ScaleMode.UNIFORM_FIT_HEIGHT = "uniformFitHeight";
		ScaleMode.NONE = "none";

	});

});
