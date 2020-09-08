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
	var ObservableEnumProperty = require("../properties/ObservableEnumProperty");

	return Class(module.id, LayoutElement, function(StackLayout, base)
	{

		// Public Properties

		this.orientation = new ObservableEnumProperty("orientation", String, [ "vertical", "horizontal" ])
			.onChange(function(e)
			{
				this.invalidate(this.measurePass);
			});

		// Constructor

		this.constructor = function(orientation)
		{
			base.constructor.call(this);

			if (orientation != null)
				this.set(this.orientation, orientation);
		};

		// Protected Methods

		this.measureOverride = function(contentConstraint)
		{
			var measuredWidth = 0;
			var measuredHeight = 0;

			var children = this.getLayoutChildren();
			var childCount = children.length;
			var child;
			var childConstraint = contentConstraint.clone();
			var childSize;
			var i;

			if (this.getInternal(this.orientation) === "horizontal")
			{
				childConstraint.width = Infinity;
				for (i = 0; i < childCount; i++)
				{
					child = children[i];
					childSize = child.measure(childConstraint);
					measuredWidth += childSize.width;
					measuredHeight = Math.max(measuredHeight, childSize.height);
				}
			}
			else
			{
				childConstraint.height = Infinity;
				for (i = 0; i < childCount; i++)
				{
					child = children[i];
					childSize = child.measure(childConstraint);
					measuredWidth = Math.max(measuredWidth, childSize.width);
					measuredHeight += childSize.height;
				}
			}

			return new Size(measuredWidth, measuredHeight);
		};

		this.layoutOverride = function(contentBounds)
		{
			var children = this.getLayoutChildren();
			var childCount = children.length;
			var child;
			var childSize;
			var childBounds = contentBounds.clone();
			var i;

			if (this.getInternal(this.orientation) === "horizontal")
			{
				for (i = 0; i < childCount; i++)
				{
					child = children[i];
					childSize = child.getInternal(child.measuredSize);
					childBounds.width = childSize.width;
					child.layout(childBounds);
					childBounds.x += childBounds.width;
				}
			}
			else
			{
				for (i = 0; i < childCount; i++)
				{
					child = children[i];
					childSize = child.getInternal(child.measuredSize);
					childBounds.height = childSize.height;
					child.layout(childBounds);
					childBounds.y += childBounds.height;
				}
			}

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

		this.onChildReordered = function(child, oldIndex, newIndex)
		{
			this.invalidate(this.layoutPass);
		};

		this.onChildInvalidated = function(child, pass)
		{
			if (pass === child.measurePass)
				this.invalidate(this.measurePass);
		};

	});

});
