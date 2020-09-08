/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var Property = require("./Property");
	var Class = require("../Class");

	return Class(module.id, function(MPropertyTarget)
	{

		// Public Properties

		this.isPropertyTarget = true;

		// Public Methods

		this.get = function(property)
		{
			property = Property.resolve(this, property);

			return property.get(this);
		};

		this.set = function(property, value)
		{
			property = Property.resolve(this, property);

			if (property.readOnly())
				throw new Error("Property \"" + property.name() + "\" is read-only.");
			if (!property.isValidType(value))
				throw new Error("Value assigned to property \"" + property.name() + "\" must be of type " + property.getTypeName() + ".");

			property.set(this, value);

			return this;
		};

		// Protected Methods

		this.getInternal = function(property)
		{
			property = Property.resolve(this, property);

			return property.getInternal(this);
		};

		this.setInternal = function(property, value)
		{
			property = Property.resolve(this, property);

			if (!property.isValidType(value))
				throw new Error("Value assigned to property \"" + property.name() + "\" must be of type " + property.getTypeName() + ".");

			property.setInternal(this, value);

			return this;
		};

	});

});
