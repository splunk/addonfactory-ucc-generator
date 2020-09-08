/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var MObservableProperty = require("./MObservableProperty");
	var Property = require("./Property");
	var Class = require("../Class");

	return Class(module.id, Property, function(ObservableProperty, base)
	{

		Class.mixin(this, MObservableProperty);

		// Constructor

		this.constructor = function(name, type, defaultValue)
		{
			base.constructor.call(this, name, type, defaultValue);

			this.initChangeEvent();
		};

		// Protected Methods

		this.setupContext = function(context)
		{
			base.setupContext.call(this, context);

			this.setupDependencySupport(context);
		};

		this.teardownContext = function(context)
		{
			this.teardownDependencySupport(context);

			base.teardownContext.call(this, context);
		};

		this.writeValue = function(context, value)
		{
			var oldValue = context.value;

			this.teardownDependencyChangeHandler(context);

			base.writeValue.call(this, context, value);

			if ((value != null) && value.isEventTarget && value.isObservableTarget && (value !== this.defaultValue()))
				this.setupDependencyChangeHandler(context, [ { target: value, event: value.change } ]);

			this.notifyChange(context, oldValue, value);
		};

		this.needsWrite = function(context, value)
		{
			return this.hasChange(context, context.value, value);
		};

	});

});
