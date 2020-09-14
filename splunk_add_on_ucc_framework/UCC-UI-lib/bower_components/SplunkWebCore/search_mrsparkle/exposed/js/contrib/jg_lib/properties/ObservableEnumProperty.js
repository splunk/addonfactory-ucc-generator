/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var EnumProperty = require("./EnumProperty");
	var MObservableProperty = require("./MObservableProperty");
	var Class = require("../Class");

	return Class(module.id, EnumProperty, function(ObservableEnumProperty, base)
	{

		Class.mixin(this, MObservableProperty);

		// Constructor

		this.constructor = function(name, type, values, defaultValue)
		{
			base.constructor.call(this, name, type, values, defaultValue);

			this.initChangeEvent();
		};

		// Protected Methods

		this.writeValue = function(context, value)
		{
			var oldValue = context.value;

			base.writeValue.call(this, context, value);

			this.notifyChange(context, oldValue, value);
		};

		this.needsWrite = function(context, value)
		{
			return this.hasChange(context, context.value, value);
		};

	});

});
