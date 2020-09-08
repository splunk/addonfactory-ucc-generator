package com.splunk.particles.layout
{

	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.layout.DistributedStackLayoutPolicy;
	import com.jasongatt.layout.LayoutSprite;
	import com.jasongatt.layout.Orientation;
	import flash.geom.Matrix;
	import flash.geom.Rectangle;

	public class CenteredDistributedStackLayoutPolicy extends DistributedStackLayoutPolicy
	{

		// Private Properties

		private var _centerIndex:ObservableProperty;

		// Constructor

		public function CenteredDistributedStackLayoutPolicy(centerIndex:Number = NaN)
		{
			this._centerIndex = new ObservableProperty(this, "centerIndex", Number, centerIndex);
		}

		// Public Getters/Setters

		public function get centerIndex() : Number
		{
			return this._centerIndex.value;
		}
		public function set centerIndex(value:Number) : void
		{
			this._centerIndex.value = value;
		}

		// Public Methods

		public override function render(parent:LayoutSprite, renderMatrix:Matrix) : Matrix
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
				return renderMatrix;

			var centerIndex:Number = this._centerIndex.value;
			if (centerIndex != centerIndex)
				centerIndex = numLayoutChildren / 2;
			else if (centerIndex > numLayoutChildren)
				centerIndex = numLayoutChildren;
			else if (centerIndex < 0)
				centerIndex = 0;

			var layoutBounds:Rectangle = parent.layoutBounds;
			var actualBounds:Rectangle = parent.actualBounds;
			var offset:Number = 0;
			if (super.orientation == Orientation.X)
			{
				for each (child in layoutChildren)
				{
					if (centerIndex < 1)
						break;

					offset += child.measuredWidth;
					centerIndex--;
				}

				offset += child.measuredWidth * centerIndex;

				renderMatrix.tx += Math.round(layoutBounds.x + (layoutBounds.width / 2) - offset) - actualBounds.x;
			}
			else
			{
				for each (child in layoutChildren)
				{
					if (centerIndex < 1)
						break;

					offset += child.measuredHeight;
					centerIndex--;
				}

				offset += child.measuredHeight * centerIndex;

				renderMatrix.ty += Math.round(layoutBounds.y + (layoutBounds.height / 2) - offset) - actualBounds.y;
			}

			return renderMatrix;
		}

	}

}
