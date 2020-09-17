/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var ImageSource = require("./ImageSource");
	var Pattern = require("./Pattern");
	var Class = require("../Class");
	var ObservableProperty = require("../properties/ObservableProperty");
	var NumberUtil = require("../utils/NumberUtil");

	return Class(module.id, function(MImageBrush)
	{

		// Public Properties

		this.source = new ObservableProperty("source", ImageSource, null);

		this.opacity = new ObservableProperty("opacity", Number, 1)
			.writeFilter(function(value)
			{
				return (value <= Infinity) ? NumberUtil.minMax(value, 0, 1) : 1;
			});

		this.repeat = new ObservableProperty("repeat", Boolean, true);

		this.contentProperty = "source";

		this.isImageBrush = true;

		// Protected Methods

		this.getImagePattern = function(properties)
		{
			return new Pattern(properties.source, properties.opacity, properties.repeat);
		};

	});

});
