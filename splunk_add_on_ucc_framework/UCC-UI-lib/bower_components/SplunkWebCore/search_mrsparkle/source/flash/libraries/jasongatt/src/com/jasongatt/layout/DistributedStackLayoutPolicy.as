package com.jasongatt.layout
{

	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.core.ValidatePass;
	import flash.display.DisplayObject;
	import flash.geom.Rectangle;

	public class DistributedStackLayoutPolicy extends AbstractLayoutPolicy
	{

		// Private Properties

		private var _orientation:ObservableProperty;

		// Constructor

		public function DistributedStackLayoutPolicy(orientation:String = "y")
		{
			switch (orientation)
			{
				case Orientation.X:
				case Orientation.Y:
					break;
				default:
					orientation = Orientation.Y;
					break;
			}
			this._orientation = new ObservableProperty(this, "orientation", String, orientation);
		}

		// Public Getters/Setters

		public function get orientation() : String
		{
			return this._orientation.value;
		}
		public function set orientation(value:String) : void
		{
			switch (value)
			{
				case Orientation.X:
				case Orientation.Y:
					break;
				default:
					value = Orientation.Y;
					break;
			}
			this._orientation.value = value;
		}

		// Public Methods

		public override function measure(parent:LayoutSprite, availableSize:Size) : Size
		{
			var measureSize:Size = new Size();
			var numChildren:Number = parent.numChildren;
			var child:LayoutSprite;
			var i:int;

			var layoutChildren:Array = new Array();
			for (i = 0; i < numChildren; i++)
			{
				child = parent.getChildAt(i) as LayoutSprite;
				if (child)
					layoutChildren.push(child);
			}

			var numLayoutChildren:int = layoutChildren.length;
			if (numLayoutChildren == 0)
				return measureSize;

			var childSize:Size;
			if (this._orientation.value == Orientation.X)
			{
				childSize = new Size(availableSize.width / numLayoutChildren, availableSize.height);
				for each (child in layoutChildren)
				{
					child.measure(childSize);
					measureSize.width += child.measuredWidth;
					measureSize.height = Math.max(measureSize.height, child.measuredHeight);
				}
				measureSize.height = Math.min(measureSize.height, availableSize.height);
			}
			else
			{
				childSize = new Size(availableSize.width, availableSize.height / numLayoutChildren);
				for each (child in layoutChildren)
				{
					child.measure(childSize);
					measureSize.width = Math.max(measureSize.width, child.measuredWidth);
					measureSize.height += child.measuredHeight;
				}
				measureSize.width = Math.min(measureSize.width, availableSize.width);
			}

			return measureSize;
		}

		public override function layout(parent:LayoutSprite, layoutSize:Size) : Size
		{
			var childBounds:Rectangle = new Rectangle();
			var numChildren:Number = parent.numChildren;
			var child:LayoutSprite;
			var i:int;
			if (this._orientation.value == Orientation.X)
			{
				for (i = 0; i < numChildren; i++)
				{
					child = parent.getChildAt(i) as LayoutSprite;
					if (child)
					{
						childBounds.width = child.measuredWidth;
						childBounds.height = layoutSize.height;
						child.layout(childBounds);
						childBounds.x += childBounds.width;
					}
				}
			}
			else
			{
				for (i = 0; i < numChildren; i++)
				{
					child = parent.getChildAt(i) as LayoutSprite;
					if (child)
					{
						childBounds.width = layoutSize.width;
						childBounds.height = child.measuredHeight;
						child.layout(childBounds);
						childBounds.y += childBounds.height;
					}
				}
			}
			return layoutSize;
		}

		public override function onChildAdded(parent:LayoutSprite, child:DisplayObject) : void
		{
			parent.invalidate(LayoutSprite.MEASURE);
		}

		public override function onChildRemoved(parent:LayoutSprite, child:DisplayObject) : void
		{
			parent.invalidate(LayoutSprite.MEASURE);
		}

		public override function onChildOrderChanged(parent:LayoutSprite) : void
		{
			parent.invalidate(LayoutSprite.LAYOUT);
		}

		public override function onChildInvalidated(parent:LayoutSprite, child:DisplayObject, pass:ValidatePass) : void
		{
			switch (pass)
			{
				case LayoutSprite.MEASURE:
					parent.invalidate(LayoutSprite.MEASURE);
					break;
			}
		}

	}

}
