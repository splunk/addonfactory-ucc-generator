package com.jasongatt.layout
{

	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.utils.NumberUtil;
	import flash.geom.Matrix;
	import flash.geom.Rectangle;
	import flash.utils.Dictionary;

	public class ScrollableStackLayout extends StackLayout implements IScrollable
	{

		// Private Properties

		private var _scrollPosition:ObservableProperty;
		private var _scrollSize:ObservableProperty;
		private var _contentSize:ObservableProperty;

		private var _lineSize:Number = 0;
		private var _pageSize:Number = 0;

		private var _orientation:String = Orientation.Y;
		private var _layoutWidth:Number = 0;
		private var _layoutHeight:Number = 0;
		private var _children:Array;

		// Constructor

		public function ScrollableStackLayout()
		{
			this._scrollPosition = new ObservableProperty(this, "scrollPosition", Number, 0, this.invalidates(LayoutSprite.RENDER));
			this._scrollSize = new ObservableProperty(this, "scrollSize", Number, 0);
			this._contentSize = new ObservableProperty(this, "contentSize", Number, 0);

			this._children = new Array();

			this.focusRect = false;
			this.clip = true;
		}

		// Public Getters/Setters

		public function get scrollPosition() : Number
		{
			return this._scrollPosition.value;
		}
		public function set scrollPosition(value:Number) : void
		{
			this._scrollPosition.value = value;
		}

		public function get scrollSize() : Number
		{
			return this._scrollSize.value;
		}

		public function get contentSize() : Number
		{
			return this._contentSize.value;
		}

		// Public Methods

		public function getLineSize(lineCount:Number = 1) : Number
		{
			this.validate(LayoutSprite.RENDER);

			return this._lineSize * lineCount;
		}

		public function getPageSize(pageCount:Number = 1) : Number
		{
			this.validate(LayoutSprite.RENDER);

			return this._pageSize * pageCount;
		}

		// Protected Methods

		protected override function measureOverride(availableSize:Size) : Size
		{
			var measuredSize:Size = super.measureOverride(availableSize);
			measuredSize.width = Math.min(availableSize.width, measuredSize.width);
			measuredSize.height = Math.min(availableSize.height, measuredSize.height);

			var orientation:String = this._orientation = this.orientation;

			var children:Array = this._children = new Array();
			var numChildren:int = this.numChildren;
			var child:LayoutSprite;
			var i:int;
			for (i = 0; i < numChildren; i++)
			{
				child = this.getChildAt(i) as LayoutSprite;
				if (child && (child.visibility != Visibility.COLLAPSED))
					children.push(child);
			}

			numChildren = children.length;

			var scrollSize:Number = 0;
			var sizeRemaining:Number;
			if (orientation == Orientation.X)
			{
				sizeRemaining = measuredSize.width;
				for (i = numChildren - 1; i >= 0; i--)
				{
					child = children[i];
					sizeRemaining -= child.measuredWidth;
					if (sizeRemaining > 0)
					{
						scrollSize++;
					}
					else
					{
						scrollSize += 1 + (sizeRemaining / child.measuredWidth);
						break;
					}
				}
			}
			else
			{
				sizeRemaining = measuredSize.height;
				for (i = numChildren - 1; i >= 0; i--)
				{
					child = children[i];
					sizeRemaining -= child.measuredHeight;
					if (sizeRemaining > 0)
					{
						scrollSize++;
					}
					else
					{
						scrollSize += 1 + (sizeRemaining / child.measuredHeight);
						break;
					}
				}
			}

			this._contentSize.value = numChildren;
			this._scrollSize.value = numChildren - scrollSize;

			return measuredSize;
		}

		protected override function layoutOverride(layoutSize:Size) : Size
		{
			layoutSize = super.layoutOverride(layoutSize);

			this._layoutWidth = layoutSize.width;
			this._layoutHeight = layoutSize.height;

			return layoutSize;
		}

		protected override function renderOverride(renderMatrix:Matrix) : Matrix
		{
			var children:Array = this._children;
			var numChildren:int = children.length;

			var scrollPosition:Number = this._scrollPosition.value;
			var scrollIndex:int = NumberUtil.maxMin(Math.floor(scrollPosition), numChildren - 1, 0);

			var scrollMatrix:Matrix = new Matrix();
			var lineSize:Number = (numChildren > 0) ? 1 : 0;
			var pageSize:Number = 0;
			var sizeRemaining:Number;
			var child:LayoutSprite;
			var childBounds:Rectangle;
			if (numChildren > 0)
			{
				child = children[scrollIndex];
				childBounds = child.layoutBounds;
				if (this._orientation == Orientation.X)
				{
					scrollMatrix.tx = -Math.round(childBounds.x + childBounds.width * (scrollPosition - scrollIndex));

					pageSize = (scrollPosition < 0) ? -(scrollPosition % 1) : 1 - (scrollPosition % 1);
					sizeRemaining = this._layoutWidth - childBounds.width * pageSize;
					scrollIndex = Math.floor(scrollPosition) + 1;
					while (sizeRemaining > 0)
					{
						if ((scrollIndex > 0) && (scrollIndex < numChildren))
						{
							child = children[scrollIndex];
							childBounds = child.layoutBounds;
						}
						else if (childBounds.width <= 0)
						{
							break;
						}
						pageSize++;
						scrollIndex++;
						sizeRemaining -= childBounds.width;
					}
					if (sizeRemaining < 0)
						pageSize += sizeRemaining / childBounds.width;
				}
				else
				{
					scrollMatrix.ty = -Math.round(childBounds.y + childBounds.height * (scrollPosition - scrollIndex));

					pageSize = (scrollPosition < 0) ? -(scrollPosition % 1) : 1 - (scrollPosition % 1);
					sizeRemaining = this._layoutHeight - childBounds.height * pageSize;
					scrollIndex = Math.floor(scrollPosition) + 1;
					while (sizeRemaining > 0)
					{
						if ((scrollIndex > 0) && (scrollIndex < numChildren))
						{
							child = children[scrollIndex];
							childBounds = child.layoutBounds;
						}
						else if (childBounds.height <= 0)
						{
							break;
						}
						pageSize++;
						scrollIndex++;
						sizeRemaining -= childBounds.height;
					}
					if (sizeRemaining < 0)
						pageSize += sizeRemaining / childBounds.height;
				}
			}

			for each (child in children)
				child.render(scrollMatrix);

			this._lineSize = lineSize;
			this._pageSize = pageSize;

			return renderMatrix;
		}

	}

}
