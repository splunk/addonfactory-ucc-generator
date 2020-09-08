package com.splunk.controls
{

	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.core.PropertyChangedEvent;
	import com.jasongatt.graphics.brushes.GradientFillBrush;
	import com.jasongatt.graphics.brushes.IBrush;
	import com.jasongatt.layout.GroupLayout;
	import com.jasongatt.layout.LayoutSprite;
	import com.jasongatt.layout.Margin;
	import com.jasongatt.layout.Orientation;
	import com.jasongatt.layout.Size;
	import com.jasongatt.layout.Visibility;
	import com.jasongatt.utils.NumberUtil;
	import com.jasongatt.utils.PointUtil;
	import flash.display.DisplayObject;
	import flash.display.GradientType;
	import flash.display.Graphics;
	import flash.display.Stage;
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.filters.DropShadowFilter;
	import flash.geom.Matrix;
	import flash.geom.Point;
	import flash.geom.Rectangle;

	public class Tooltip extends GroupLayout
	{

		// Public Static Constants

		public static const LEFT:String = "left";
		public static const RIGHT:String = "right";
		public static const TOP:String = "top";
		public static const BOTTOM:String = "bottom";
		public static const LEFT_RIGHT:String = "leftRight";
		public static const TOP_BOTTOM:String = "topBottom";

		// Private Properties

		private var _backgroundBrush:ObservableProperty;
		private var _targetBounds:ObservableProperty;
		private var _placement:ObservableProperty;
		private var _showPointer:ObservableProperty;
		private var _followMouse:ObservableProperty;

		private var _mouseBounds:Rectangle;
		private var _dropShadowFilter:DropShadowFilter;
		private var _stage:Stage;
		private var _layoutWidth:Number = 0;
		private var _layoutHeight:Number = 0;
		private var _pointerLength:Number = 7;
		private var _pointerThickness:Number = 14;

		// Constructor

		public function Tooltip()
		{
			var backgroundBrush:GradientFillBrush = new GradientFillBrush(GradientType.LINEAR, [ 0x333333, 0x000000 ], [ 1, 1 ], [ 0, 255 ]);
			backgroundBrush.tileTransform = new Matrix(0, 1, -1, 0);

			this._backgroundBrush = new ObservableProperty(this, "backgroundBrush", IBrush, backgroundBrush, this.invalidates(LayoutSprite.RENDER));
			this._targetBounds = new ObservableProperty(this, "targetBounds", Rectangle, new Rectangle(), this.invalidates(LayoutSprite.RENDER));
			this._placement = new ObservableProperty(this, "placement", String, Tooltip.LEFT_RIGHT, this.invalidates(LayoutSprite.RENDER));
			this._showPointer = new ObservableProperty(this, "showPointer", Boolean, true, this.invalidates(LayoutSprite.RENDER));
			this._followMouse = new ObservableProperty(this, "followMouse", Boolean, true, this._followMouse_changed);

			this._mouseBounds = new Rectangle(0, 0, 15, 25);
			this._dropShadowFilter = new DropShadowFilter(4, 45, 0x000000, 0.3, 4, 4, 1, 3);

			this.filters = [ this._dropShadowFilter ];
			this.mouseEnabled = false;
			this.margin = new Margin(10, 10, 10, 10);
			this.visibility = Visibility.COLLAPSED;
			this.snap = true;

			this.addEventListener(Event.ADDED_TO_STAGE, this._self_addedToStage, false, int.MAX_VALUE);
			this.addEventListener(Event.REMOVED_FROM_STAGE, this._self_removedFromStage, false, int.MAX_VALUE);
		}

		// Public Getters/Setters

		public function get backgroundBrush() : IBrush
		{
			return this._backgroundBrush.value;
		}
		public function set backgroundBrush(value:IBrush) : void
		{
			this._backgroundBrush.value = value;
		}

		public function get targetBounds() : Rectangle
		{
			return this._targetBounds.value.clone();
		}
		public function set targetBounds(value:Rectangle) : void
		{
			if (value)
			{
				value = value.clone();
				if (value.width < 0)
				{
					value.x += value.width;
					value.width = -value.width;
				}
				if (value.height < 0)
				{
					value.y += value.height;
					value.height = -value.height;
				}
			}
			else
			{
				value = new Rectangle();
			}
			this._targetBounds.value = value;
			this._followMouse.value = false;
		}

		public function get placement() : String
		{
			return this._placement.value;
		}
		public function set placement(value:String) : void
		{
			switch (value)
			{
				case Tooltip.LEFT:
				case Tooltip.RIGHT:
				case Tooltip.TOP:
				case Tooltip.BOTTOM:
				case Tooltip.LEFT_RIGHT:
				case Tooltip.TOP_BOTTOM:
					break;
				default:
					value = Tooltip.LEFT_RIGHT;
					break;
			}
			this._placement.value = value;
		}

		public function get showPointer() : Boolean
		{
			return this._showPointer.value;
		}
		public function set showPointer(value:Boolean) : void
		{
			this._showPointer.value = value;
		}

		public function get followMouse() : Boolean
		{
			return this._followMouse.value;
		}
		public function set followMouse(value:Boolean) : void
		{
			this._followMouse.value = value;
		}

		// Public Methods

		public function show() : void
		{
			this.visibility = Visibility.VISIBLE;
		}

		public function hide() : void
		{
			this.visibility = Visibility.COLLAPSED;
		}

		public override function measure(availableSize:Size = null) : void
		{
			super.measure(new Size(Infinity, Infinity));
		}

		public override function layout(layoutBounds:Rectangle = null) : void
		{
			super.layout(new Rectangle(0, 0, this.measuredWidth, this.measuredHeight));
		}

		// Protected Methods

		protected override function layoutOverride(layoutSize:Size) : Size
		{
			this._layoutWidth = Math.round(layoutSize.width);
			this._layoutHeight = Math.round(layoutSize.height);

			return super.layoutOverride(layoutSize);
		}

		protected override function renderOverride(renderMatrix:Matrix) : Matrix
		{
			var backgroundBrush:IBrush = this._backgroundBrush.value;
			var targetBounds:Rectangle = this._targetBounds.value;
			var placement:String = this._placement.value;
			var showPointer:Boolean = this._showPointer.value;
			var followMouse:Boolean = this._followMouse.value;

			var layoutWidth:Number = this._layoutWidth;
			var layoutHeight:Number = this._layoutHeight;
			var pointerLength:Number = showPointer ? this._pointerLength : 0;
			var pointerThickness:Number = showPointer ? this._pointerThickness / 2 : 0;

			var stageWidth:Number;
			var stageHeight:Number;
			var stage:Stage = this._stage;
			if (stage)
			{
				stageWidth = stage.stageWidth;
				stageHeight = stage.stageHeight;
			}
			else
			{
				stageWidth = 0;
				stageHeight = 0;
			}

			var targetLeft:Number = targetBounds.x;
			var targetRight:Number = targetLeft + targetBounds.width;
			var targetTop:Number = targetBounds.y;
			var targetBottom:Number = targetTop + targetBounds.height;

			var margin:Margin = this.margin;
			var marginLeft:Number = Math.max(margin.left, 0);
			var marginRight:Number = Math.max(margin.right, 0);
			var marginTop:Number = Math.max(margin.top, 0);
			var marginBottom:Number = Math.max(margin.bottom, 0);
			var marginX:Number = marginLeft + marginRight;
			var marginY:Number = marginTop + marginBottom;
			var marginScaleX:Number = (marginX > 0) ? NumberUtil.minMax((stageWidth - layoutWidth) / marginX, 0, 1) : 0;
			var marginScaleY:Number = (marginY > 0) ? NumberUtil.minMax((stageHeight - layoutHeight) / marginY, 0, 1) : 0;

			var alignmentX:Number = this.alignmentX;
			if (alignmentX != alignmentX)
				alignmentX = 0.5;
			else if (alignmentX < 0)
				alignmentX = 0;
			else if (alignmentX > 1)
				alignmentX = 1;

			var alignmentY:Number = this.alignmentY;
			if (alignmentY != alignmentY)
				alignmentY = 0.5;
			else if (alignmentY < 0)
				alignmentY = 0;
			else if (alignmentY > 1)
				alignmentY = 1;

			// determine placement for TOP_BOTTOM or LEFT_RIGHT mode

			switch (placement)
			{
				case Tooltip.TOP_BOTTOM:
					if (((targetTop + targetBottom) / 2) > (stageHeight / 2))
						placement = Tooltip.TOP;
					else
						placement = Tooltip.BOTTOM;
					break;
				case Tooltip.LEFT_RIGHT:
					if (((targetLeft + targetRight) / 2) > (stageWidth / 2))
						placement = Tooltip.LEFT;
					else
						placement = Tooltip.RIGHT;
					break;
			}

			// compute targetPosition (in global coordinates) and pointerPosition (in local coordinates)

			var targetPosition:Point;
			var pointerPosition:Point;

			switch (placement)
			{
				case Tooltip.TOP:
					if (followMouse)
					{
						targetRight = targetLeft;
						targetBottom = targetTop;
					}
					marginLeft *= marginScaleX;
					marginRight *= marginScaleX;
					targetPosition = new Point(targetLeft * (1 - alignmentX) + targetRight * alignmentX, targetTop);
					targetPosition.x = NumberUtil.maxMin(targetPosition.x, stageWidth, 0);
					targetPosition.y = NumberUtil.minMax(targetPosition.y, layoutHeight + marginTop + pointerLength, targetBottom);
					targetPosition.y = NumberUtil.minMax(targetPosition.y, layoutHeight + pointerLength, stageHeight);
					pointerPosition = new Point(layoutWidth * alignmentX, layoutHeight + pointerLength);
					pointerPosition.x = NumberUtil.minMax(pointerPosition.x, layoutWidth - Math.max(stageWidth - targetPosition.x - marginRight, 0), Math.max(targetPosition.x - marginLeft, 0));
					break;
				case Tooltip.BOTTOM:
					if (followMouse)
					{
						targetRight = targetLeft;
						targetTop = targetBottom;
					}
					marginLeft *= marginScaleX;
					marginRight *= marginScaleX;
					targetPosition = new Point(targetLeft * (1 - alignmentX) + targetRight * alignmentX, targetBottom);
					targetPosition.x = NumberUtil.maxMin(targetPosition.x, stageWidth, 0);
					targetPosition.y = NumberUtil.maxMin(targetPosition.y, stageHeight - layoutHeight - marginBottom - pointerLength, targetTop);
					targetPosition.y = NumberUtil.maxMin(targetPosition.y, stageHeight - layoutHeight - pointerLength, 0);
					pointerPosition = new Point(layoutWidth * alignmentX, -pointerLength);
					pointerPosition.x = NumberUtil.minMax(pointerPosition.x, layoutWidth - Math.max(stageWidth - targetPosition.x - marginRight, 0), Math.max(targetPosition.x - marginLeft, 0));
					break;
				case Tooltip.LEFT:
					if (followMouse)
					{
						targetRight = targetLeft;
						targetBottom = targetTop;
					}
					marginTop *= marginScaleY;
					marginBottom *= marginScaleY;
					targetPosition = new Point(targetLeft, targetTop * (1 - alignmentY) + targetBottom * alignmentY);
					targetPosition.x = NumberUtil.minMax(targetPosition.x, layoutWidth + marginLeft + pointerLength, targetRight);
					targetPosition.x = NumberUtil.minMax(targetPosition.x, layoutWidth + pointerLength, stageWidth);
					targetPosition.y = NumberUtil.maxMin(targetPosition.y, stageHeight, 0);
					pointerPosition = new Point(layoutWidth + pointerLength, layoutHeight * alignmentY);
					pointerPosition.y = NumberUtil.minMax(pointerPosition.y, layoutHeight - Math.max(stageHeight - targetPosition.y - marginBottom, 0), Math.max(targetPosition.y - marginTop, 0));
					break;
				default:
					if (followMouse)
					{
						targetLeft = targetRight;
						targetBottom = targetTop;
					}
					marginTop *= marginScaleY;
					marginBottom *= marginScaleY;
					targetPosition = new Point(targetRight, targetTop * (1 - alignmentY) + targetBottom * alignmentY);
					targetPosition.x = NumberUtil.maxMin(targetPosition.x, stageWidth - layoutWidth - marginRight - pointerLength, targetLeft);
					targetPosition.x = NumberUtil.maxMin(targetPosition.x, stageWidth - layoutWidth - pointerLength, 0);
					targetPosition.y = NumberUtil.maxMin(targetPosition.y, stageHeight, 0);
					pointerPosition = new Point(-pointerLength, layoutHeight * alignmentY);
					pointerPosition.y = NumberUtil.minMax(pointerPosition.y, layoutHeight - Math.max(stageHeight - targetPosition.y - marginBottom, 0), Math.max(targetPosition.y - marginTop, 0));
					break;
			}

			// snap positions to pixels

			targetPosition = PointUtil.round(targetPosition);
			pointerPosition = PointUtil.round(pointerPosition);

			// convert positions to parent coordinates to determine offset for renderMatrix

			var parent:DisplayObject = this.parent;
			if (parent)
			{
				var targetPositionParent:Point = parent.globalToLocal(targetPosition);
				var pointerPositionParent:Point = parent.globalToLocal(this.localToGlobal(pointerPosition));
				renderMatrix.translate(targetPositionParent.x - pointerPositionParent.x, targetPositionParent.y - pointerPositionParent.y);
			}

			// render

			var graphics:Graphics = this.graphics;
			graphics.clear();

			if (backgroundBrush)
			{
				var p1:Point = new Point(0, 0);
				var p2:Point = new Point(layoutWidth, 0);
				var p3:Point = new Point(layoutWidth, layoutHeight);
				var p4:Point = new Point(0, layoutHeight);

				backgroundBrush.beginBrush(graphics, null, [ p1, p2, p3, p4 ]);

				switch (placement)
				{
					case Tooltip.TOP:
						backgroundBrush.moveTo(p1.x, p1.y);
						backgroundBrush.lineTo(p2.x, p2.y);
						backgroundBrush.lineTo(p3.x, p3.y);
						if (showPointer)
						{
							backgroundBrush.lineTo(NumberUtil.minMax(pointerPosition.x + pointerThickness, p4.x + pointerThickness, p3.x), p3.y);
							backgroundBrush.lineTo(pointerPosition.x, pointerPosition.y);
							backgroundBrush.lineTo(NumberUtil.maxMin(pointerPosition.x - pointerThickness, p3.x - pointerThickness, p4.x), p3.y);
						}
						backgroundBrush.lineTo(p4.x, p4.y);
						backgroundBrush.lineTo(p1.x, p1.y);
						break;
					case Tooltip.BOTTOM:
						backgroundBrush.moveTo(p1.x, p1.y);
						if (showPointer)
						{
							backgroundBrush.lineTo(NumberUtil.maxMin(pointerPosition.x - pointerThickness, p2.x - pointerThickness, p1.x), p1.y);
							backgroundBrush.lineTo(pointerPosition.x, pointerPosition.y);
							backgroundBrush.lineTo(NumberUtil.minMax(pointerPosition.x + pointerThickness, p1.x + pointerThickness, p2.x), p1.y);
						}
						backgroundBrush.lineTo(p2.x, p2.y);
						backgroundBrush.lineTo(p3.x, p3.y);
						backgroundBrush.lineTo(p4.x, p4.y);
						backgroundBrush.lineTo(p1.x, p1.y);
						break;
					case Tooltip.LEFT:
						backgroundBrush.moveTo(p1.x, p1.y);
						backgroundBrush.lineTo(p2.x, p2.y);
						if (showPointer)
						{
							backgroundBrush.lineTo(p2.x, NumberUtil.maxMin(pointerPosition.y - pointerThickness, p3.y - pointerThickness, p2.y));
							backgroundBrush.lineTo(pointerPosition.x, pointerPosition.y);
							backgroundBrush.lineTo(p2.x, NumberUtil.minMax(pointerPosition.y + pointerThickness, p2.y + pointerThickness, p3.y));
						}
						backgroundBrush.lineTo(p3.x, p3.y);
						backgroundBrush.lineTo(p4.x, p4.y);
						backgroundBrush.lineTo(p1.x, p1.y);
						break;
					default:
						backgroundBrush.moveTo(p1.x, p1.y);
						backgroundBrush.lineTo(p2.x, p2.y);
						backgroundBrush.lineTo(p3.x, p3.y);
						backgroundBrush.lineTo(p4.x, p4.y);
						if (showPointer)
						{
							backgroundBrush.lineTo(p4.x, NumberUtil.minMax(pointerPosition.y + pointerThickness, p1.y + pointerThickness, p4.y));
							backgroundBrush.lineTo(pointerPosition.x, pointerPosition.y);
							backgroundBrush.lineTo(p4.x, NumberUtil.maxMin(pointerPosition.y - pointerThickness, p4.y - pointerThickness, p1.y));
						}
						backgroundBrush.lineTo(p1.x, p1.y);
						break;
				}

				backgroundBrush.endBrush();
			}

			return renderMatrix;
		}

		// Private Methods

		private function _self_addedToStage(e:Event) : void
		{
			var stage:Stage = this.stage;
			if (!stage)
				return;

			this._stage = stage;

			stage.addEventListener(MouseEvent.MOUSE_MOVE, this._stage_mouseMove, false, int.MAX_VALUE);
		}

		private function _self_removedFromStage(e:Event) : void
		{
			var stage:Stage = this._stage;
			if (!stage)
				return;

			this._stage = null;

			stage.removeEventListener(MouseEvent.MOUSE_MOVE, this._stage_mouseMove);
		}

		private function _stage_mouseMove(e:MouseEvent) : void
		{
			var mouseBounds:Rectangle = this._mouseBounds;
			mouseBounds.x = e.stageX;
			mouseBounds.y = e.stageY;

			if (this._followMouse.value)
				this._targetBounds.value = mouseBounds.clone();
		}

		private function _followMouse_changed(e:PropertyChangedEvent) : void
		{
			if (e.newValue)
				this._targetBounds.value = this._mouseBounds.clone();
			else
				this.invalidate(LayoutSprite.RENDER);
		}

	}

}
