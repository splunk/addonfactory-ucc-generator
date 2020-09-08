/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var ImageSource = require("./ImageSource");
	var Class = require("../Class");
	var Element = require("../display/Element");
	var ObservableProperty = require("../properties/ObservableProperty");

	return Class(module.id, Element, function(Image, base)
	{

		// Public Properties

		this.source = new ObservableProperty("source", ImageSource, null)
			.onChange(function(e)
			{
				var source = this.getInternal(this.source);
				var url = (source && source.toString());
				if (url)
					this.element.setAttribute("src", url);
				else
					this.element.removeAttribute("src");
			});

		this.contentProperty = "source";

		// Constructor

		this.constructor = function(source)
		{
			base.constructor.call(this, "img");

			if (source != null)
				this.set(this.source, source);
		};

	});

});
