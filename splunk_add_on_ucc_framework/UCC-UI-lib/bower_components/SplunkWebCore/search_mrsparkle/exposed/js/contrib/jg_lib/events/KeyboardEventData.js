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

	return Class(module.id, DOMEventData, function(KeyboardEventData, base)
	{

		// Public Properties

		this.keyCode = 0;
		this.charCode = 0;
		this.ctrlKey = false;
		this.shiftKey = false;
		this.altKey = false;
		this.metaKey = false;

		// Constructor

		this.constructor = function(attributes)
		{
			if (attributes)
			{
				base.constructor.call(this, attributes);

				this.keyCode = attributes.keyCode || 0;
				this.charCode = attributes.charCode || 0;
				this.ctrlKey = (attributes.ctrlKey === true);
				this.shiftKey = (attributes.shiftKey === true);
				this.altKey = (attributes.altKey === true);
				this.metaKey = (attributes.metaKey === true);
			}
		};

	});

});
