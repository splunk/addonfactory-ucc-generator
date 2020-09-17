package com.splunk.charting.layout
{

	import com.jasongatt.core.ValidatePass;
	import com.jasongatt.layout.LayoutSprite;
	import com.jasongatt.layout.Orientation;
	import com.jasongatt.layout.Size;
	import flash.display.DisplayObject;
	import flash.geom.Rectangle;

	public class CartesianLayout extends LayoutSprite
	{

		// Private Properties

		private var _leftChildren:Array;
		private var _rightChildren:Array;
		private var _topChildren:Array;
		private var _bottomChildren:Array;
		private var _centerChildren:Array;
		private var _leftSize:Number;
		private var _rightSize:Number;
		private var _topSize:Number;
		private var _bottomSize:Number;

		// Constructor

		public function CartesianLayout()
		{
		}

		// Protected Methods

		protected override function measureOverride(availableSize:Size) : Size
		{
			var leftChildren:Array = new Array();
			var rightChildren:Array = new Array();
			var topChildren:Array = new Array();
			var bottomChildren:Array = new Array();
			var centerChildren:Array = new Array();

			var leftSize:Number = 0;
			var rightSize:Number = 0;
			var topSize:Number = 0;
			var bottomSize:Number = 0;

			var child:LayoutSprite;
			var placementChild:IPlacement;
			var placement:String;
			var childSize:Size;
			var i:int;

			var numChildren:int = this.numChildren;
			for (i = 0; i < numChildren; i++)
			{
				child = this.getChildAt(i) as LayoutSprite;
				if (child)
				{
					placementChild = child as IPlacement;
					placement = placementChild ? placementChild.placement : null;
					switch (placement)
					{
						case Placement.LEFT:
							leftChildren.push(child);
							break;
						case Placement.RIGHT:
							rightChildren.push(child);
							break;
						case Placement.TOP:
							topChildren.push(child);
							break;
						case Placement.BOTTOM:
							bottomChildren.push(child);
							break;
						default:
							centerChildren.push(child);
							break;
					}
				}
			}

			// measure left, right, top, and bottom children twice
			for (i = 0; i < 2; i++)
			{
				childSize = new Size(Infinity, Math.max(availableSize.height - topSize - bottomSize, 0));
				leftSize = 0;
				rightSize = 0;
				for each (child in leftChildren)
				{
					child.measure(childSize);
					leftSize += child.measuredWidth;
				}
				for each (child in rightChildren)
				{
					child.measure(childSize);
					rightSize += child.measuredWidth;
				}

				childSize = new Size(Math.max(availableSize.width - leftSize - rightSize, 0), Infinity);
				topSize = 0;
				bottomSize = 0;
				for each (child in topChildren)
				{
					child.measure(childSize);
					topSize += child.measuredHeight;
				}
				for each (child in bottomChildren)
				{
					child.measure(childSize);
					bottomSize += child.measuredHeight;
				}
			}

			var size:Size = new Size(leftSize + rightSize, topSize + bottomSize);

			// measure center children
			childSize = new Size(Math.max(availableSize.width - size.width, 0), Math.max(availableSize.height - size.height, 0));
			for each (child in centerChildren)
				child.measure(childSize);

			this._leftChildren = leftChildren;
			this._rightChildren = rightChildren;
			this._topChildren = topChildren;
			this._bottomChildren = bottomChildren;
			this._centerChildren = centerChildren;
			this._leftSize = leftSize;
			this._rightSize = rightSize;
			this._topSize = topSize;
			this._bottomSize = bottomSize;

			return size;
		}

		protected override function layoutOverride(layoutSize:Size) : Size
		{
			var child:LayoutSprite;
			var childBounds:Rectangle = new Rectangle();

			childBounds.y = this._topSize;
			childBounds.height = layoutSize.height - this._topSize - this._bottomSize;

			childBounds.x = this._leftSize;
			for each (child in this._leftChildren)
			{
				childBounds.width = child.measuredWidth;
				childBounds.x -= childBounds.width;
				child.layout(childBounds);
			}

			childBounds.x = Math.max(layoutSize.width - this._rightSize, this._leftSize);
			for each (child in this._rightChildren)
			{
				childBounds.width = child.measuredWidth;
				child.layout(childBounds);
				childBounds.x += childBounds.width;
			}

			childBounds.x = this._leftSize;
			childBounds.width = layoutSize.width - this._leftSize - this._rightSize;

			childBounds.y = this._topSize;
			for each (child in this._topChildren)
			{
				childBounds.height = child.measuredHeight;
				childBounds.y -= childBounds.height;
				child.layout(childBounds);
			}

			childBounds.y = Math.max(layoutSize.height - this._bottomSize, this._topSize);
			for each (child in this._bottomChildren)
			{
				childBounds.height = child.measuredHeight;
				child.layout(childBounds);
				childBounds.y += childBounds.height;
			}

			childBounds.x = this._leftSize;
			childBounds.y = this._topSize;
			childBounds.width = Math.max(layoutSize.width - this._leftSize - this._rightSize, 0);
			childBounds.height = Math.max(layoutSize.height - this._topSize - this._bottomSize, 0);

			for each (child in this._centerChildren)
				child.layout(childBounds);

			return layoutSize;
		}

		protected override function onChildAdded(child:DisplayObject) : void
		{
			this.invalidate(LayoutSprite.MEASURE);
		}

		protected override function onChildRemoved(child:DisplayObject) : void
		{
			this.invalidate(LayoutSprite.MEASURE);
		}

		protected override function onChildOrderChanged() : void
		{
			this.invalidate(LayoutSprite.MEASURE);
		}

		protected override function onChildInvalidated(child:DisplayObject, pass:ValidatePass) : void
		{
			switch (pass)
			{
				case LayoutSprite.MEASURE:
					this.invalidate(LayoutSprite.MEASURE);
					break;
				case LayoutSprite.LAYOUT:
					if (child is IPlacement)
						this.invalidate(LayoutSprite.MEASURE);
					break;
			}
		}

	}

}
