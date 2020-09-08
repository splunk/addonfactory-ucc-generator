/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var Class = require("../Class");

	return Class(module.id, function(Visibility)
	{

		// Public Static Constants

		Visibility.VISIBLE = "visible";
		Visibility.HIDDEN = "hidden";
		Visibility.COLLAPSED = "collapsed";

	});

});
