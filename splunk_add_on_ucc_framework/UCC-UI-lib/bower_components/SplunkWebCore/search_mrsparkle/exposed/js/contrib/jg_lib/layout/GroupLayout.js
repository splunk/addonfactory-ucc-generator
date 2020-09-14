/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var LayoutElement = require("./LayoutElement");
	var Size = require("./Size");
	var Class = require("../Class");

	return Class(module.id, LayoutElement, function(GroupLayout, base)
	{

		// Constructor

		this.constructor = function()
		{
			// call base constructor without parameters so tagName can't be overridden
			base.constructor.call(this);
		};

		// Protected Methods

		this.measureOverride = function(contentConstraint)
		{
			var measuredWidth = 0;
			var measuredHeight = 0;

			var children = this.getLayoutChildren();
			var child;
			var childConstraint = contentConstraint.clone();
			var childSize;

			for (var i = 0, l = children.length; i < l; i++)
			{
				child = children[i];
				childSize = child.measure(childConstraint);
				measuredWidth = Math.max(measuredWidth, childSize.width);
				measuredHeight = Math.max(measuredHeight, childSize.height);
			}

			return new Size(measuredWidth, measuredHeight);
		};

		this.layoutOverride = function(contentBounds)
		{
			var children = this.getLayoutChildren();
			var childBounds = contentBounds.clone();

			for (var i = 0, l = children.length; i < l; i++)
				children[i].layout(childBounds);

			return contentBounds;
		};

		this.onChildAdded = function(child)
		{
			this.invalidate(this.measurePass);
		};

		this.onChildRemoved = function(child)
		{
			this.invalidate(this.measurePass);
		};

		this.onChildInvalidated = function(child, pass)
		{
			if (pass === child.measurePass)
				this.invalidate(this.measurePass);
		};

	});

});
