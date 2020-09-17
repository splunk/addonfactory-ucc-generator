/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var MouseEvent = require("./MouseEvent");
	var MouseEventData = require("./MouseEventData");
	var Class = require("../Class");

	return Class(module.id, function(MMouseTarget)
	{

		// Public Properties

		this.isMouseTarget = true;

		// Public Events

		this.click = new MouseEvent.Click("click", MouseEventData, true, true);
		this.doubleClick = new MouseEvent.Click("doubleClick", MouseEventData, true, true, "dblclick");
		this.contextMenu = new MouseEvent.Click("contextMenu", MouseEventData, true, true);
		this.mouseDown = new MouseEvent("mouseDown", MouseEventData, true, true);
		this.mouseUp = new MouseEvent("mouseUp", MouseEventData, true, true);
		this.mouseMove = new MouseEvent("mouseMove", MouseEventData, true, true);
		this.mouseOver = new MouseEvent.OverOut("mouseOver", MouseEventData, true, true);
		this.mouseOut = new MouseEvent.OverOut("mouseOut", MouseEventData, true, true);
		this.mouseEnter = new MouseEvent.EnterLeave("mouseEnter", MouseEventData, false, false);
		this.mouseLeave = new MouseEvent.EnterLeave("mouseLeave", MouseEventData, false, false);
		this.mouseWheel = new MouseEvent.Wheel("mouseWheel", MouseEventData, true, true);

	});

});
