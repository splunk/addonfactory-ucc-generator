/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var Class = require("../Class");
	var Map = require("../utils/Map");

	return Class(module.id, function(MDOMTarget)
	{

		// Private Static Properties

		var _domElementMap = new Map();
		var _domTargetMap = new Map();

		// Public Properties

		this.isDOMTarget = true;

		// Public Methods

		this.bindDOMElement = function(domElement)
		{
			if (domElement == null)
				throw new Error("Parameter domElement must be non-null.");
			if (_domElementMap.has(this))
				throw new Error("Target already bound.");
			if (_domTargetMap.has(domElement))
				throw new Error("DOMElement already bound.");

			_domElementMap.set(this, domElement);
			_domTargetMap.set(domElement, this);
		};

		this.unbindDOMElement = function()
		{
			var domElement = _domElementMap.get(this);
			if (!domElement)
				return;

			_domElementMap.del(this);
			_domTargetMap.del(domElement);
		};

		this.getDOMElement = function()
		{
			return _domElementMap.get(this) || null;
		};

		this.fromDOMElement = function(domElement)
		{
			return _domTargetMap.get(domElement) || null;
		};

	});

});
