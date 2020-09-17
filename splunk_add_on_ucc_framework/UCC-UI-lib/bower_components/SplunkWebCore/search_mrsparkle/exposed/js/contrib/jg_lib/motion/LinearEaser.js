/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var Easer = require("./Easer");
	var Class = require("../Class");

	return Class(module.id, Easer, function(LinearEaser, base)
	{

		// Public Methods

		this.ease = function(ratio)
		{
			return ratio;
		};

	});

});
