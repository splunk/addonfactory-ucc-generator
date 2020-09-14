package com.jasongatt.layout
{

	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.core.ValidatePass;
	import flash.display.DisplayObject;
	import flash.geom.Matrix;
	import flash.geom.Rectangle;

	public class LayoutContainer extends LayoutSprite
	{

		// Private Properties

		private var _layoutPolicy:ObservableProperty;

		// Constructor

		public function LayoutContainer()
		{
			this._layoutPolicy = new ObservableProperty(this, "layoutPolicy", ILayoutPolicy, null, this.invalidates(LayoutSprite.MEASURE));
		}

		// Public Getters/Setters

		public function get layoutPolicy() : ILayoutPolicy
		{
			return this._layoutPolicy.value;
		}
		public function set layoutPolicy(value:ILayoutPolicy) : void
		{
			this._layoutPolicy.value = value;
		}

		// Protected Methods

		protected override function measureOverride(availableSize:Size) : Size
		{
			var layoutPolicy:ILayoutPolicy = this._layoutPolicy.value;
			if (layoutPolicy)
				return layoutPolicy.measure(this, availableSize);

			var measureSize:Size = new Size();
			var childSize:Size = availableSize.clone();
			var numChildren:int = this.numChildren;
			var child:LayoutSprite;
			for (var i:int = 0; i < numChildren; i++)
			{
				child = this.getChildAt(i) as LayoutSprite;
				if (child)
				{
					child.measure(childSize);
					measureSize.width = Math.max(measureSize.width, child.measuredWidth);
					measureSize.height = Math.max(measureSize.height, child.measuredHeight);
				}
			}
			measureSize.width = Math.min(measureSize.width, availableSize.width);
			measureSize.height = Math.min(measureSize.height, availableSize.height);
			return measureSize;
		}

		protected override function layoutOverride(layoutSize:Size) : Size
		{
			var layoutPolicy:ILayoutPolicy = this._layoutPolicy.value;
			if (layoutPolicy)
				return layoutPolicy.layout(this, layoutSize);

			var childBounds:Rectangle = new Rectangle(0, 0, layoutSize.width, layoutSize.height);
			var numChildren:Number = this.numChildren;
			var child:LayoutSprite;
			for (var i:int = 0; i < numChildren; i++)
			{
				child = this.getChildAt(i) as LayoutSprite;
				if (child)
					child.layout(childBounds);
			}
			return layoutSize;
		}

		protected override function renderOverride(renderMatrix:Matrix) : Matrix
		{
			var layoutPolicy:ILayoutPolicy = this._layoutPolicy.value;
			if (layoutPolicy)
				return layoutPolicy.render(this, renderMatrix);

			return renderMatrix;
		}

		protected override function onChildAdded(child:DisplayObject) : void
		{
			var layoutPolicy:ILayoutPolicy = this._layoutPolicy.value;
			if (layoutPolicy)
			{
				layoutPolicy.onChildAdded(this, child);
				return;
			}

			this.invalidate(LayoutSprite.MEASURE);
		}

		protected override function onChildRemoved(child:DisplayObject) : void
		{
			var layoutPolicy:ILayoutPolicy = this._layoutPolicy.value;
			if (layoutPolicy)
			{
				layoutPolicy.onChildRemoved(this, child);
				return;
			}

			this.invalidate(LayoutSprite.MEASURE);
		}

		protected override function onChildOrderChanged() : void
		{
			var layoutPolicy:ILayoutPolicy = this._layoutPolicy.value;
			if (layoutPolicy)
				layoutPolicy.onChildOrderChanged(this);
		}

		protected override function onChildInvalidated(child:DisplayObject, pass:ValidatePass) : void
		{
			var layoutPolicy:ILayoutPolicy = this._layoutPolicy.value;
			if (layoutPolicy)
			{
				layoutPolicy.onChildInvalidated(this, child, pass);
				return;
			}

			switch (pass)
			{
				case LayoutSprite.MEASURE:
					this.invalidate(LayoutSprite.MEASURE);
					break;
			}
		}

	}

}
