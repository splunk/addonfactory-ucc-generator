/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var Class = require("../Class");

	return Class(module.id, Object, function(EventData, base)
	{

		// Public Properties

		this.event = null;
		this.target = null;
		this.currentEvent = null;
		this.currentTarget = null;

		// Private Properties

		this._isDefaultPrevented = false;
		this._isPropagationStopped = false;
		this._isImmediatePropagationStopped = false;

		// Constructor

		this.constructor = function()
		{
			// noop
		};

		// Public Methods

		this.preventDefault = function()
		{
			this._isDefaultPrevented = true;
		};

		this.stopPropagation = function()
		{
			this._isPropagationStopped = true;
		};

		this.stopImmediatePropagation = function()
		{
			this._isImmediatePropagationStopped = true;
			this.stopPropagation();
		};

		this.isDefaultPrevented = function()
		{
			return this._isDefaultPrevented;
		};

		this.isPropagationStopped = function()
		{
			return this._isPropagationStopped;
		};

		this.isImmediatePropagationStopped = function()
		{
			return this._isImmediatePropagationStopped;
		};

		this.resetPropagation = function()
		{
			this._isPropagationStopped = false;
			this._isImmediatePropagationStopped = false;
		};

	});

});
