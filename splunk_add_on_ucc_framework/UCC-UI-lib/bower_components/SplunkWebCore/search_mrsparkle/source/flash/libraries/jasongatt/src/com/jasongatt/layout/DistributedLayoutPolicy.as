package com.jasongatt.layout
{

	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.core.ValidatePass;
	import flash.display.DisplayObject;
	import flash.geom.Rectangle;

	public class DistributedLayoutPolicy extends AbstractLayoutPolicy
	{

		// Private Properties

		private var _orientation:ObservableProperty;

		// Constructor

		public function DistributedLayoutPolicy(orientation:String = "y")
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
					measureSize.width = Math.max(measureSize.width, child.measuredWidth);
					measureSize.height = Math.max(measureSize.height, child.measuredHeight);
				}
				measureSize.width = Math.min(measureSize.width * numLayoutChildren, availableSize.width);
				measureSize.height = Math.min(measureSize.height, availableSize.height);
			}
			else
			{
				childSize = new Size(availableSize.width, availableSize.height / numLayoutChildren);
				for each (child in layoutChildren)
				{
					child.measure(childSize);
					measureSize.width = Math.max(measureSize.width, child.measuredWidth);
					measureSize.height = Math.max(measureSize.height, child.measuredHeight);
				}
				measureSize.width = Math.min(measureSize.width, availableSize.width);
				measureSize.height = Math.min(measureSize.height * numLayoutChildren, availableSize.height);
			}

			return measureSize;
		}

		public override function layout(parent:LayoutSprite, layoutSize:Size) : Size
		{
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
				return layoutSize;

			var childBounds:Rectangle;
			if (this._orientation.value == Orientation.X)
			{
				childBounds = new Rectangle(0, 0, layoutSize.width / numLayoutChildren, layoutSize.height);
				for each (child in layoutChildren)
				{
					child.layout(childBounds);
					childBounds.x += childBounds.width;
				}
			}
			else
			{
				childBounds = new Rectangle(0, 0, layoutSize.width, layoutSize.height / numLayoutChildren);
				for each (child in layoutChildren)
				{
					child.layout(childBounds);
					childBounds.y += childBounds.height;
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
