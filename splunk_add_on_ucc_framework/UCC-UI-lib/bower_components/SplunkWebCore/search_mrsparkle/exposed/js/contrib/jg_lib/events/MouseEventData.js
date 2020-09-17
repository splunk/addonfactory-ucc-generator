/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var DOMEventData = require("./DOMEventData");
	var Class = require("../Class");

	return Class(module.id, DOMEventData, function(MouseEventData, base)
	{

		// Public Properties

		this.screenX = 0;
		this.screenY = 0;
		this.clientX = 0;
		this.clientY = 0;
		this.pageX = 0;
		this.pageY = 0;
		this.ctrlKey = false;
		this.shiftKey = false;
		this.altKey = false;
		this.metaKey = false;
		this.button = 0;
		this.relatedTarget = null;
		this.deltaX = 0;
		this.deltaY = 0;

		// Constructor

		this.constructor = function(attributes)
		{
			if (attributes)
			{
				base.constructor.call(this, attributes);

				this.screenX = attributes.screenX || 0;
				this.screenY = attributes.screenY || 0;
				this.clientX = attributes.clientX || 0;
				this.clientY = attributes.clientY || 0;
				this.pageX = attributes.pageX || 0;
				this.pageY = attributes.pageY || 0;
				this.ctrlKey = (attributes.ctrlKey === true);
				this.shiftKey = (attributes.shiftKey === true);
				this.altKey = (attributes.altKey === true);
				this.metaKey = (attributes.metaKey === true);
				this.button = attributes.button || 0;
				this.relatedTarget = attributes.relatedTarget || null;
				this.deltaX = attributes.deltaX || 0;
				this.deltaY = attributes.deltaY || 0;
			}
		};

	});

});
