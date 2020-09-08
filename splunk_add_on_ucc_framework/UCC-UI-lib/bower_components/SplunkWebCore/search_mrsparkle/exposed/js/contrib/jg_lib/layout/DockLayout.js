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
	var Rectangle = require("../geom/Rectangle");
	var ObservableEnumProperty = require("../properties/ObservableEnumProperty");

	return Class(module.id, LayoutElement, function(DockLayout, base)
	{

		// Public Static Properties

		DockLayout.placement = new ObservableEnumProperty("DockLayout.placement", String, [ "center", "top", "right", "bottom", "left" ])
			.onChange(function(e)
			{
				if (!(this instanceof LayoutElement))
					return;

				var layoutParent = this.layoutParent();
				if (!layoutParent || !(layoutParent instanceof DockLayout))
					return;

				layoutParent.invalidate(layoutParent.measurePass);
			});

		// Constructor

		this.constructor = function()
		{
			// call base constructor without parameters so tagName can't be overridden
			base.constructor.call(this);
		};

		// Protected Methods

		this.measureOverride = function(contentConstraint)
		{
			var constraintWidth = contentConstraint.width;
			var constraintHeight = contentConstraint.height;
			var stackedWidth = 0;
			var stackedHeight = 0;
			var offsetWidth = 0;
			var offsetHeight = 0;

			var children = this.getLayoutChildren();
			var child;
			var childConstraint = new Size();
			var childSize;

			for (var i = 0, l = children.length; i < l; i++)
			{
				child = children[i];
				childConstraint.width = Math.max(constraintWidth - stackedWidth, 0);
				childConstraint.height = Math.max(constraintHeight - stackedHeight, 0);
				childSize = child.measure(childConstraint);
				switch (child.getInternal(DockLayout.placement))
				{
					case "left":
					case "right":
						stackedWidth += childSize.width;
						offsetHeight = Math.max(offsetHeight, stackedHeight + childSize.height);
						break;
					case "top":
					case "bottom":
						stackedHeight += childSize.height;
						offsetWidth = Math.max(offsetWidth, stackedWidth + childSize.width);
						break;
					default:
						offsetWidth = Math.max(offsetWidth, stackedWidth + childSize.width);
						offsetHeight = Math.max(offsetHeight, stackedHeight + childSize.height);
						break;
				}
			}

			return new Size(Math.max(stackedWidth, offsetWidth), Math.max(stackedHeight, offsetHeight));
		};

		this.layoutOverride = function(contentBounds)
		{
			var boundsX = contentBounds.x;
			var boundsY = contentBounds.y;
			var boundsWidth = contentBounds.width;
			var boundsHeight = contentBounds.height;
			var left = 0;
			var top = 0;
			var right = 0;
			var bottom = 0;

			var children = this.getLayoutChildren();
			var child;
			var childSize;
			var childBounds = new Rectangle();

			for (var i = 0, l = children.length; i < l; i++)
			{
				child = children[i];
				childSize = child.getInternal(child.measuredSize);
				switch (child.getInternal(DockLayout.placement))
				{
					case "left":
						childBounds.x = boundsX + left;
						childBounds.y = boundsY + top;
						childBounds.width = childSize.width;
						childBounds.height = Math.max(boundsHeight - top - bottom, 0);
						left += childSize.width;
						break;
					case "right":
						right += childSize.width;
						childBounds.x = boundsX + boundsWidth - right;
						childBounds.y = boundsY + top;
						childBounds.width = childSize.width;
						childBounds.height = Math.max(boundsHeight - top - bottom, 0);
						break;
					case "top":
						childBounds.x = boundsX + left;
						childBounds.y = boundsY + top;
						childBounds.width = Math.max(boundsWidth - left - right, 0);
						childBounds.height = childSize.height;
						top += childSize.height;
						break;
					case "bottom":
						bottom += childSize.height;
						childBounds.x = boundsX + left;
						childBounds.y = boundsY + boundsHeight - bottom;
						childBounds.width = Math.max(boundsWidth - left - right, 0);
						childBounds.height = childSize.height;
						break;
					default:
						childBounds.x = boundsX + left;
						childBounds.y = boundsY + top;
						childBounds.width = Math.max(boundsWidth - left - right, 0);
						childBounds.height = Math.max(boundsHeight - top - bottom, 0);
						break;
				}
				child.layout(childBounds);
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
			this.invalidate(this.measurePass);
		};

		this.onChildInvalidated = function(child, pass)
		{
			if (pass === child.measurePass)
				this.invalidate(this.measurePass);
		};

	});

});
