package com.jasongatt.layout
{

	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.core.ValidatePass;
	import com.jasongatt.utils.NumberUtil;
	import flash.display.DisplayObject;
	import flash.geom.Rectangle;

	public class GroupLayoutPolicy extends AbstractLayoutPolicy
	{

		// Private Properties

		private var _padding:ObservableProperty;

		// Constructor

		public function GroupLayoutPolicy()
		{
			this._padding = new ObservableProperty(this, "padding", Margin, new Margin());
		}

		// Public Getters/Setters

		public function get padding() : Margin
		{
			return this._padding.value.clone();
		}
		public function set padding(value:Margin) : void
		{
			value = value ? value.clone() : new Margin();
			if (!value.equals(this._padding.value))
				this._padding.value = value;
		}

		// Public Methods

		public override function measure(parent:LayoutSprite, availableSize:Size) : Size
		{
			var padding:Margin = this._padding.value;
			var paddingX:Number = padding.left + padding.right;
			var paddingY:Number = padding.top + padding.bottom;

			var measureSize:Size = new Size();
			var childSize:Size = new Size(Math.max(availableSize.width - paddingX, 0), Math.max(availableSize.height - paddingY, 0));
			var numChildren:int = parent.numChildren;
			var child:LayoutSprite;
			for (var i:int = 0; i < numChildren; i++)
			{
				child = parent.getChildAt(i) as LayoutSprite;
				if (child)
				{
					child.measure(childSize);
					measureSize.width = Math.max(measureSize.width, child.measuredWidth);
					measureSize.height = Math.max(measureSize.height, child.measuredHeight);
				}
			}
			measureSize.width = NumberUtil.maxMin(measureSize.width + paddingX, availableSize.width, 0);
			measureSize.height = NumberUtil.maxMin(measureSize.height + paddingY, availableSize.height, 0);

			return measureSize;
		}

		public override function layout(parent:LayoutSprite, layoutSize:Size) : Size
		{
			var padding:Margin = this._padding.value;
			var paddingX:Number = padding.left + padding.right;
			var paddingY:Number = padding.top + padding.bottom;

			var childBounds:Rectangle = new Rectangle(padding.left, padding.top, Math.max(layoutSize.width - paddingX, 0), Math.max(layoutSize.height - paddingY, 0));
			var numChildren:Number = parent.numChildren;
			var child:LayoutSprite;
			for (var i:int = 0; i < numChildren; i++)
			{
				child = parent.getChildAt(i) as LayoutSprite;
				if (child)
					child.layout(childBounds);
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
