/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var KeyboardEvent = require("./KeyboardEvent");
	var KeyboardEventData = require("./KeyboardEventData");
	var Class = require("../Class");

	return Class(module.id, function(MKeyboardTarget)
	{

		// Public Properties

		this.isKeyboardTarget = true;

		// Public Events

		this.keyDown = new KeyboardEvent("keyDown", KeyboardEventData, true, true);
		this.keyUp = new KeyboardEvent("keyUp", KeyboardEventData, true, true);
		this.keyPress = new KeyboardEvent("keyPress", KeyboardEventData, true, true);

	});

});
