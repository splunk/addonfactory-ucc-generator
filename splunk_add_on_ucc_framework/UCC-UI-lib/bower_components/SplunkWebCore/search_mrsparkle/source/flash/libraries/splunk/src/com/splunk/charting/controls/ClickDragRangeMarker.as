package com.splunk.charting.controls
{

	import com.jasongatt.core.ChangedEvent;
	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.core.PropertyChangedEvent;
	import com.jasongatt.graphics.brushes.IBrush;
	import com.jasongatt.graphics.brushes.SolidFillBrush;
	import com.jasongatt.graphics.brushes.SolidStrokeBrush;
	import com.jasongatt.graphics.shapes.RectangleShape;
	import com.jasongatt.layout.LayoutSprite;
	import com.jasongatt.layout.Margin;
	import com.jasongatt.layout.Size;
	import com.jasongatt.motion.PropertyTween;
	import com.jasongatt.motion.TweenRunner;
	import com.jasongatt.motion.easers.CubicEaser;
	import com.jasongatt.motion.easers.EaseDirection;
	import com.jasongatt.utils.NumberUtil;
	import com.splunk.charting.axes.IAxis;
	import com.splunk.controls.Label;
	import com.splunk.utils.Style;
	import flash.display.Graphics;
	import flash.display.Shape;
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.events.KeyboardEvent;
	import flash.events.MouseEvent;
	import flash.geom.Point;
	import flash.geom.Rectangle;
	import flash.text.TextFormat;
	import flash.ui.Keyboard;

	[Event(name="dragStart", type="flash.events.Event")]
	[Event(name="dragComplete", type="flash.events.Event")]

	public class ClickDragRangeMarker extends LayoutSprite
	{

		// Public Static Constants

		public static const DRAG_START:String = "dragStart";
		public static const DRAG_COMPLETE:String = "dragComplete";

		// Private Properties

		private var _minimumFillBrush:ObservableProperty;
		private var _minimumLineBrush:ObservableProperty;
		private var _minimumValueStyle:ObservableProperty;
		private var _maximumFillBrush:ObservableProperty;
		private var _maximumLineBrush:ObservableProperty;
		private var _maximumValueStyle:ObservableProperty;
		private var _rangeFillBrush:ObservableProperty;
		private var _rangeValueStyle:ObservableProperty;
		private var _backgroundBrush:ObservableProperty;
		private var _backgroundStyle:ObservableProperty;
		private var _axis:ObservableProperty;
		private var _minimum:ObservableProperty;
		private var _maximum:ObservableProperty;
		private var _minimumSnap:ObservableProperty;
		private var _maximumSnap:ObservableProperty;
		private var _minimumFormat:ObservableProperty;
		private var _maximumFormat:ObservableProperty;
		private var _rangeFormat:ObservableProperty;
		private var _labelOpacity:ObservableProperty;

		private var _actualMinimum:*;
		private var _actualMaximum:*;

		private var _cachedMinimumPosition:Number;
		private var _cachedMaximumPosition:Number;

		private var _lastMousePosition:Point = new Point(-1, -1);
		private var _areLabelsVisible:Boolean = false;
		private var _dragMode:String = null;
		private var _pressMouseX:Number = 0;
		private var _pressMinimum:Number = 0;
		private var _pressMaximum:Number = 1;
		private var _layoutWidth:Number = 0;
		private var _layoutHeight:Number = 0;

		private var _minimumField:Label;
		private var _maximumField:Label;
		private var _rangeField:Label;
		private var _fills:Shape;
		private var _lines:Shape;
		private var _foreground:Sprite;
		private var _background:Shape;

		// Constructor

		public function ClickDragRangeMarker()
		{
			var fillBrush:SolidFillBrush = new SolidFillBrush(0xD1D1D1, 1);
			var lineBrush:SolidStrokeBrush = new SolidStrokeBrush(1, 0x000000, 0.4);
			var backgroundBrush:SolidFillBrush = new SolidFillBrush(0xEAEAEA, 0.66);

			this._minimumFillBrush = new ObservableProperty(this, "minimumFillBrush", IBrush, fillBrush, this.invalidates(LayoutSprite.LAYOUT));
			this._minimumLineBrush = new ObservableProperty(this, "minimumLineBrush", IBrush, lineBrush, this.invalidates(LayoutSprite.LAYOUT));
			this._minimumValueStyle = new ObservableProperty(this, "minimumValueStyle", Style, null, this.invalidates(LayoutSprite.MEASURE));
			this._maximumFillBrush = new ObservableProperty(this, "maximumFillBrush", IBrush, fillBrush, this.invalidates(LayoutSprite.LAYOUT));
			this._maximumLineBrush = new ObservableProperty(this, "maximumLineBrush", IBrush, lineBrush, this.invalidates(LayoutSprite.LAYOUT));
			this._maximumValueStyle = new ObservableProperty(this, "maximumValueStyle", Style, null, this.invalidates(LayoutSprite.MEASURE));
			this._rangeFillBrush = new ObservableProperty(this, "rangeFillBrush", IBrush, fillBrush, this.invalidates(LayoutSprite.LAYOUT));
			this._rangeValueStyle = new ObservableProperty(this, "rangeValueStyle", Style, null, this.invalidates(LayoutSprite.MEASURE));
			this._backgroundBrush = new ObservableProperty(this, "backgroundBrush", IBrush, backgroundBrush, this.invalidates(LayoutSprite.LAYOUT));
			this._backgroundStyle = new ObservableProperty(this, "backgroundStyle", Style, null, this.invalidates(LayoutSprite.MEASURE));
			this._axis = new ObservableProperty(this, "axis", IAxis, null, this._update);
			this._minimum = new ObservableProperty(this, "minimum", Object, null, this._update);
			this._maximum = new ObservableProperty(this, "maximum", Object, null, this._update);
			this._minimumSnap = new ObservableProperty(this, "minimumSnap", Function, null, this._update);
			this._maximumSnap = new ObservableProperty(this, "maximumSnap", Function, null, this._update);
			this._minimumFormat = new ObservableProperty(this, "minimumFormat", Function, null, this.invalidates(LayoutSprite.MEASURE));
			this._maximumFormat = new ObservableProperty(this, "maximumFormat", Function, null, this.invalidates(LayoutSprite.MEASURE));
			this._rangeFormat = new ObservableProperty(this, "rangeFormat", Function, null, this.invalidates(LayoutSprite.MEASURE));
			this._labelOpacity = new ObservableProperty(this, "labelOpacity", Number, 0, this._redrawLabelOpacity);

			this._minimumField = new Label();
			this._minimumField.defaultTextFormat = new TextFormat("_sans", 12, 0xFFFFFF);
			this._minimumField.margin = new Margin(5, 5, 0, 0);
			this._minimumField.alignmentY = 0.5;

			this._maximumField = new Label();
			this._maximumField.defaultTextFormat = new TextFormat("_sans", 12, 0xFFFFFF);
			this._maximumField.margin = new Margin(5, 5, 0, 0);
			this._maximumField.alignmentY = 0.5;

			this._rangeField = new Label();
			this._rangeField.clip = true;
			this._rangeField.alignmentY = 0.5;

			this._fills = new Shape();

			this._lines = new Shape();

			this._foreground = new Sprite();
			this._foreground.addChild(this._lines);
			this._foreground.addChild(this._fills);
			this._foreground.addChild(this._rangeField);
			this._foreground.addChild(this._maximumField);
			this._foreground.addChild(this._minimumField);

			this._background = new Shape();

			this.mouseEnabled = false;
			this.mouseChildren = false;
			this.snap = true;

			this.addChild(this._background);
			this.addChild(this._foreground);

			this.addEventListener(Event.ADDED_TO_STAGE, this._self_addedToStage, false, int.MAX_VALUE);
			this.addEventListener(Event.REMOVED_FROM_STAGE, this._self_removedFromStage, false, int.MAX_VALUE);
		}

		// Public Getters/Setters

		public function get minimumFillBrush() : IBrush
		{
			return this._minimumFillBrush.value;
		}
		public function set minimumFillBrush(value:IBrush) : void
		{
			this._minimumFillBrush.value = value;
		}

		public function get minimumLineBrush() : IBrush
		{
			return this._minimumLineBrush.value;
		}
		public function set minimumLineBrush(value:IBrush) : void
		{
			this._minimumLineBrush.value = value;
		}

		public function get minimumValueStyle() : Style
		{
			return this._minimumValueStyle.value;
		}
		public function set minimumValueStyle(value:Style) : void
		{
			this._minimumValueStyle.value = value;
		}

		public function get maximumFillBrush() : IBrush
		{
			return this._maximumFillBrush.value;
		}
		public function set maximumFillBrush(value:IBrush) : void
		{
			this._maximumFillBrush.value = value;
		}

		public function get maximumLineBrush() : IBrush
		{
			return this._maximumLineBrush.value;
		}
		public function set maximumLineBrush(value:IBrush) : void
		{
			this._maximumLineBrush.value = value;
		}

		public function get maximumValueStyle() : Style
		{
			return this._maximumValueStyle.value;
		}
		public function set maximumValueStyle(value:Style) : void
		{
			this._maximumValueStyle.value = value;
		}

		public function get rangeFillBrush() : IBrush
		{
			return this._rangeFillBrush.value;
		}
		public function set rangeFillBrush(value:IBrush) : void
		{
			this._rangeFillBrush.value = value;
		}

		public function get rangeValueStyle() : Style
		{
			return this._rangeValueStyle.value;
		}
		public function set rangeValueStyle(value:Style) : void
		{
			this._rangeValueStyle.value = value;
		}

		public function get backgroundBrush() : IBrush
		{
			return this._backgroundBrush.value;
		}
		public function set backgroundBrush(value:IBrush) : void
		{
			this._backgroundBrush.value = value;
		}

		public function get backgroundStyle() : Style
		{
			return this._backgroundStyle.value;
		}
		public function set backgroundStyle(value:Style) : void
		{
			this._backgroundStyle.value = value;
		}

		public function get axis() : IAxis
		{
			return this._axis.value;
		}
		public function set axis(value:IAxis) : void
		{
			this._axis.value = value;
		}

		public function get minimum() : *
		{
			return this._minimum.value;
		}
		public function set minimum(value:*) : void
		{
			this._minimum.value = value;
		}

		public function get maximum() : *
		{
			return this._maximum.value;
		}
		public function set maximum(value:*) : void
		{
			this._maximum.value = value;
		}

		public function get minimumSnap() : Function
		{
			return this._minimumSnap.value;
		}
		public function set minimumSnap(value:Function) : void
		{
			if (value != this._minimumSnap.value)
				this._minimumSnap.value = value;
			else if (value != null)
				this._update();
		}

		public function get maximumSnap() : Function
		{
			return this._maximumSnap.value;
		}
		public function set maximumSnap(value:Function) : void
		{
			if (value != this._maximumSnap.value)
				this._maximumSnap.value = value;
			else if (value != null)
				this._update();
		}

		public function get minimumFormat() : Function
		{
			return this._minimumFormat.value;
		}
		public function set minimumFormat(value:Function) : void
		{
			if (value != this._minimumFormat.value)
				this._minimumFormat.value = value;
			else if (value != null)
				this.invalidate(LayoutSprite.MEASURE);
		}

		public function get maximumFormat() : Function
		{
			return this._maximumFormat.value;
		}
		public function set maximumFormat(value:Function) : void
		{
			if (value != this._maximumFormat.value)
				this._maximumFormat.value = value;
			else if (value != null)
				this.invalidate(LayoutSprite.MEASURE);
		}

		public function get rangeFormat() : Function
		{
			return this._rangeFormat.value;
		}
		public function set rangeFormat(value:Function) : void
		{
			if (value != this._rangeFormat.value)
				this._rangeFormat.value = value;
			else if (value != null)
				this.invalidate(LayoutSprite.MEASURE);
		}

		public function get actualMinimum() : *
		{
			return this._actualMinimum;
		}

		public function get actualMaximum() : *
		{
			return this._actualMaximum;
		}

		public function get isDragging() : Boolean
		{
			return (this._dragMode != null);
		}

		public function get labelOpacity() : Number
		{
			return this._labelOpacity.value;
		}
		public function set labelOpacity(value:Number) : void
		{
			this._labelOpacity.value = value;
		}

		// Protected Methods

		protected override function measureOverride(availableSize:Size) : Size
		{
			var minimum:* = this._actualMinimum;
			var maximum:* = this._actualMaximum;
			var minimumPosition:Number = this._cachedMinimumPosition;
			var maximumPosition:Number = this._cachedMaximumPosition;

			var minimumFormat:Function = this._minimumFormat.value;
			if (minimum == null)
				this._minimumField.text = "";
			else if (minimumFormat == null)
				this._minimumField.text = String(minimum);
			else
				this._minimumField.text = minimumFormat(minimum);
			Style.applyStyle(this._minimumField, this._minimumValueStyle.value);

			var maximumFormat:Function = this._maximumFormat.value;
			if (maximum == null)
				this._maximumField.text = "";
			else if (maximumFormat == null)
				this._maximumField.text = String(maximum);
			else
				this._maximumField.text = maximumFormat(maximum);
			Style.applyStyle(this._maximumField, this._maximumValueStyle.value);

			var rangeFormat:Function = this._rangeFormat.value;
			if ((rangeFormat == null) || (minimum == null) || (maximum == null))
				this._rangeField.text = "";
			else
				this._rangeField.text = rangeFormat(minimum, maximum);
			Style.applyStyle(this._rangeField, this._rangeValueStyle.value);

			Style.applyStyle(this._background, this._backgroundStyle.value);

			this._minimumField.measure();
			this._maximumField.measure();
			this._rangeField.measure();

			return new Size();
		}

		protected override function layoutOverride(layoutSize:Size) : Size
		{
			var minimumPosition:Number = this._cachedMinimumPosition;
			var maximumPosition:Number = this._cachedMaximumPosition;
			var minimumField:Label = this._minimumField;
			var maximumField:Label = this._maximumField;
			var rangeField:Label = this._rangeField;

			if (minimumPosition > maximumPosition)
			{
				var temp:*;

				temp = minimumPosition;
				minimumPosition = maximumPosition;
				maximumPosition = temp;

				temp = minimumField;
				minimumField = maximumField;
				maximumField = temp;
			}

			var x1:Number = 0;
			var x2:Number = Math.round(layoutSize.width * minimumPosition);
			var x3:Number = Math.round(layoutSize.width * maximumPosition);
			var x4:Number = Math.round(layoutSize.width);

			var y1:Number = 0;
			var y2:Number = Math.round(layoutSize.height);

			x2 = NumberUtil.minMax(x2, x1, x4);
			x3 = NumberUtil.minMax(x3, x1, x4);

			var graphics:Graphics;

			// layout fields

			var minimumFieldBounds:Rectangle = new Rectangle();
			minimumFieldBounds.width = Math.round(minimumField.measuredWidth);
			minimumFieldBounds.height = 20;
			minimumFieldBounds.x = x2 - minimumFieldBounds.width;
			minimumFieldBounds.y = Math.min(y2 - minimumFieldBounds.height, 0);

			var maximumFieldBounds:Rectangle = new Rectangle();
			maximumFieldBounds.width = Math.round(maximumField.measuredWidth);
			maximumFieldBounds.height = 20;
			maximumFieldBounds.x = x3;
			maximumFieldBounds.y = Math.min(y2 - maximumFieldBounds.height, 0);

			var rangeFieldBounds:Rectangle = new Rectangle();
			rangeFieldBounds.width = Math.min(Math.round(rangeField.measuredWidth), x3 - x2);
			rangeFieldBounds.height = 20;
			rangeFieldBounds.x = x2 + Math.round((x3 - x2 - rangeFieldBounds.width) / 2);
			rangeFieldBounds.y = y2;

			if ((maximumFieldBounds.x + maximumFieldBounds.width) > x4)
				maximumFieldBounds.x = x4 - maximumFieldBounds.width;
			if ((minimumFieldBounds.x + minimumFieldBounds.width) > maximumFieldBounds.x)
				minimumFieldBounds.x = maximumFieldBounds.x - minimumFieldBounds.width;

			if (minimumFieldBounds.x < 0)
				minimumFieldBounds.x = 0;
			if (maximumFieldBounds.x < (minimumFieldBounds.x + minimumFieldBounds.width))
				maximumFieldBounds.x = minimumFieldBounds.x + minimumFieldBounds.width;

			minimumField.layout(minimumFieldBounds);
			maximumField.layout(maximumFieldBounds);
			rangeField.layout(rangeFieldBounds);

			// draw fills

			graphics = this._fills.graphics;
			graphics.clear();

			var rectangleShape:RectangleShape = new RectangleShape();

			var minimumFillBrush:IBrush = this._minimumFillBrush.value;
			if (minimumFillBrush)
				rectangleShape.draw(graphics, minimumFieldBounds.x + 1, minimumFieldBounds.y, minimumFieldBounds.width - 1, minimumFieldBounds.height, minimumFillBrush);

			var maximumFillBrush:IBrush = this._maximumFillBrush.value;
			if (maximumFillBrush)
				rectangleShape.draw(graphics, maximumFieldBounds.x + 1, maximumFieldBounds.y, maximumFieldBounds.width - 1, maximumFieldBounds.height, maximumFillBrush);

			var rangeFillBrush:IBrush = this._rangeFillBrush.value;
			if (rangeFillBrush)
				rectangleShape.draw(graphics, x2 + 1, y2, Math.max(x3 - x2 - 1, 0), 20, rangeFillBrush);

			// draw lines

			graphics = this._lines.graphics;
			graphics.clear();

			var minimumLineBrush:IBrush = this._minimumLineBrush.value;
			if (minimumLineBrush)
			{
				minimumLineBrush.beginBrush(graphics);
				minimumLineBrush.moveTo(x2, minimumFieldBounds.y);
				minimumLineBrush.lineTo(x2, y2 + 20);
				minimumLineBrush.endBrush();
			}

			var maximumLineBrush:IBrush = this._maximumLineBrush.value;
			if (maximumLineBrush)
			{
				maximumLineBrush.beginBrush(graphics);
				maximumLineBrush.moveTo(x3, maximumFieldBounds.y);
				maximumLineBrush.lineTo(x3, y2 + 20);
				maximumLineBrush.endBrush();
			}

			// draw background

			graphics = this._background.graphics;
			graphics.clear();

			var backgroundBrush:IBrush = this._backgroundBrush.value;
			if (backgroundBrush)
			{
				var backgroundBounds:Array = [ new Point(x1, y1), new Point(x4, y1), new Point(x4, y2), new Point(x1, y2) ];
				rectangleShape.draw(graphics, Math.min(x1 + 1, x4), y1, Math.max(x2 - 1, 0), y2, backgroundBrush, null, backgroundBounds);
				rectangleShape.draw(graphics, Math.min(x3 + 1, x4), y1, Math.max(x4 - x3 - 1, 0), y2, backgroundBrush, null, backgroundBounds);
			}

			this._layoutWidth = Math.round(layoutSize.width);
			this._layoutHeight = Math.round(layoutSize.height);

			this._redrawLabelOpacity();

			return layoutSize;
		}

		// Private Methods

		private function _redrawLabelOpacity(e:Event = null) : void
		{
			var opacity:Number = this._labelOpacity.value;
			this._foreground.alpha = opacity;
			this._foreground.visible = (opacity > 0);
		}

		private function _update(e:Event = null) : void
		{
			var actualMinimum:* = this._minimum.value;
			var actualMaximum:* = this._maximum.value;
			var absoluteMinimum:Number;
			var absoluteMaximum:Number;
			var relativeMinimum:Number = 0;
			var relativeMaximum:Number = 1;
			var temp:*;

			var axis:IAxis = this._axis.value;
			if (axis)
			{
				absoluteMinimum = axis.relativeToAbsolute(relativeMinimum);
				absoluteMaximum = axis.relativeToAbsolute(relativeMaximum);

				if (absoluteMinimum > absoluteMaximum)
				{
					temp = relativeMinimum;
					relativeMinimum = relativeMaximum;
					relativeMinimum = temp;
				}

				absoluteMinimum = (actualMinimum != null) ? axis.valueToAbsolute(actualMinimum) : NaN;
				if (absoluteMinimum != absoluteMinimum)
				{
					absoluteMinimum = axis.relativeToAbsolute(relativeMinimum);
					actualMinimum = axis.absoluteToValue(absoluteMinimum);
				}
				else
				{
					relativeMinimum = axis.absoluteToRelative(absoluteMinimum);
				}

				absoluteMaximum = (actualMaximum != null) ? axis.valueToAbsolute(actualMaximum) : NaN;
				if (absoluteMaximum != absoluteMaximum)
				{
					absoluteMaximum = axis.relativeToAbsolute(relativeMaximum);
					actualMaximum = axis.absoluteToValue(absoluteMaximum);
				}
				else
				{
					relativeMaximum = axis.absoluteToRelative(absoluteMaximum);
				}

				if (absoluteMinimum > absoluteMaximum)
				{
					temp = actualMinimum;
					actualMinimum = actualMaximum;
					actualMaximum = temp;

					temp = relativeMinimum;
					relativeMinimum = relativeMaximum;
					relativeMaximum = temp;
				}
			}

			var minimumSnap:Function = this._minimumSnap.value;
			if ((minimumSnap != null) && (actualMinimum != null))
			{
				actualMinimum = minimumSnap(actualMinimum);
				if (axis)
				{
					absoluteMinimum = axis.valueToAbsolute(actualMinimum);
					if (absoluteMinimum == absoluteMinimum)
						relativeMinimum = axis.absoluteToRelative(absoluteMinimum);
				}
			}

			var maximumSnap:Function = this._maximumSnap.value;
			if ((maximumSnap != null) && (actualMaximum != null))
			{
				actualMaximum = maximumSnap(actualMaximum);
				if (axis)
				{
					absoluteMaximum = axis.valueToAbsolute(actualMaximum);
					if (absoluteMaximum == absoluteMaximum)
						relativeMaximum = axis.absoluteToRelative(absoluteMaximum);
				}
			}

			this._cachedMinimumPosition = relativeMinimum;
			this._cachedMaximumPosition = relativeMaximum;

			if (this._actualMinimum != actualMinimum)
			{
				var prevActualMinimum:* = this._actualMinimum;
				this._actualMinimum = actualMinimum;
				this.dispatchEvent(new PropertyChangedEvent(ChangedEvent.CHANGED, false, false, this, "actualMinimum", prevActualMinimum, this._actualMinimum));
			}
			if (this._actualMaximum != actualMaximum)
			{
				var prevActualMaximum:* = this._actualMaximum;
				this._actualMaximum = actualMaximum;
				this.dispatchEvent(new PropertyChangedEvent(ChangedEvent.CHANGED, false, false, this, "actualMaximum", prevActualMaximum, this._actualMaximum));
			}

			this._updateShowLabels();

			this.invalidate(LayoutSprite.MEASURE);
		}

		private function _updateShowLabels(e:MouseEvent = null) : void
		{
			var mousePosition:Point = this._lastMousePosition = e ? new Point(e.stageX, e.stageY) : this._lastMousePosition;
			mousePosition = this.globalToLocal(mousePosition);
			var mouseX:Number = mousePosition.x;
			var mouseY:Number = mousePosition.y;
			if ((this._minimum.value != null) || (this._maximum.value != null) ||
			    ((mouseX >= 0) && (mouseX <= this._layoutWidth) && (mouseY >= 0) && (mouseY <= this._layoutHeight)))
				this._showLabels();
			else
				this._hideLabels();
		}

		private function _showLabels() : void
		{
			if (!this._areLabelsVisible)
			{
				this._areLabelsVisible = true;
				var tween:PropertyTween = new PropertyTween(this, "labelOpacity", null, 1, new CubicEaser(EaseDirection.OUT));
				TweenRunner.start(tween, 0.3);
			}
		}

		private function _hideLabels() : void
		{
			if (this._areLabelsVisible)
			{
				this._areLabelsVisible = false;
				var tween:PropertyTween = new PropertyTween(this, "labelOpacity", null, 0, new CubicEaser(EaseDirection.OUT));
				TweenRunner.start(tween, 0.3);
			}
		}

		private function _beginDrag(mousePosition:Point, dragMode:String) : void
		{
			if (this._dragMode || !dragMode)
				return;

			this._dragMode = dragMode;

			this._pressMouseX = mousePosition.x;
			this._pressMinimum = this._cachedMinimumPosition;
			this._pressMaximum = this._cachedMaximumPosition;

			this._updateDrag(mousePosition);

			this.dispatchEvent(new Event(ClickDragRangeMarker.DRAG_START));
		}

		private function _endDrag() : void
		{
			if (!this._dragMode)
				return;

			var dragMode:String = this._dragMode;
			this._dragMode = null;

			switch (dragMode)
			{
				case "new":
				case "inside":
					// select single bucket
					this._selectOne();
					break;
				case "outside":
					// select all
					this._selectAll();
					break;
				case "select":
					// if nothing or everything is selected, select all
					if ((this._cachedMinimumPosition == this._cachedMaximumPosition) || ((this._cachedMinimumPosition <= 0) && (this._cachedMaximumPosition >= 1)))
						this._selectAll();
					break;
			}

			this.dispatchEvent(new Event(ClickDragRangeMarker.DRAG_COMPLETE));
		}

		private function _updateDrag(mousePosition:Point) : void
		{
			if (!this._dragMode)
				return;

			switch (this._dragMode)
			{
				case "new":
					this._updateDragStart(mousePosition, "select");
					break;
				case "inside":
					this._updateDragStart(mousePosition, "move");
					break;
				case "outside":
					this._updateDragStart(mousePosition, "select");
					break;
				case "select":
					this._updateDragSelect(mousePosition);
					break;
				case "move":
					this._updateDragMove(mousePosition);
					break;
			}
		}

		private function _updateDragStart(mousePosition:Point, nextDragMode:String) : void
		{
			if (Math.abs(mousePosition.x - this._pressMouseX) < 4)
				return;

			this._dragMode = nextDragMode;

			this._updateDrag(mousePosition);
		};

		private function _updateDragSelect(mousePosition:Point) : void
		{
			var axis:IAxis = this._axis.value;
			if (!axis)
				return;

			if (this._layoutWidth <= 0)
				return;

			var pressMouseX:Number = NumberUtil.minMax(this._pressMouseX, 0, this._layoutWidth);
			var mouseX:Number = NumberUtil.minMax(mousePosition.x, 0, this._layoutWidth);

			var minimumPosition:Number = pressMouseX / this._layoutWidth;
			var maximumPosition:Number = mouseX / this._layoutWidth;

			var minimumAbsolute:Number = axis.relativeToAbsolute(minimumPosition);
			var maximumAbsolute:Number = axis.relativeToAbsolute(maximumPosition);
			if (minimumAbsolute > maximumAbsolute)
			{
				var temp:Number = minimumAbsolute;
				minimumAbsolute = maximumAbsolute;
				maximumAbsolute = temp;
			}

			var minimum:* = axis.absoluteToValue(minimumAbsolute);
			var maximum:* = axis.absoluteToValue(maximumAbsolute);

			var minimumSnap:Function = this._minimumSnap.value;
			if ((minimumSnap != null) && (minimum != null))
				minimum = minimumSnap(minimum, true);

			var maximumSnap:Function = this._maximumSnap.value;
			if ((maximumSnap != null) && (maximum != null))
				maximum = maximumSnap(maximum, true);

			this._minimum.value = minimum;
			this._maximum.value = maximum;
		}

		private function _updateDragMove(mousePosition:Point) : void
		{
			var axis:IAxis = this._axis.value;
			if (!axis)
				return;

			if (this._layoutWidth <= 0)
				return;

			var diff:Number = (mousePosition.x - this._pressMouseX) / this._layoutWidth;
			diff = NumberUtil.minMax(diff, -this._pressMinimum, 1 - this._pressMaximum);

			var minimumPosition:Number = this._pressMinimum + diff;
			var maximumPosition:Number = this._pressMaximum + diff;

			var minimumAbsolute:Number = axis.relativeToAbsolute(minimumPosition);
			var maximumAbsolute:Number = axis.relativeToAbsolute(maximumPosition);
			if (minimumAbsolute > maximumAbsolute)
			{
				var temp:Number = minimumAbsolute;
				minimumAbsolute = maximumAbsolute;
				maximumAbsolute = temp;
			}

			this._minimum.value = axis.absoluteToValue(minimumAbsolute);
			this._maximum.value = axis.absoluteToValue(maximumAbsolute);
		}

		private function _selectOne() : void
		{
			var axis:IAxis = this._axis.value;
			if (!axis)
				return;

			if (this._layoutWidth <= 0)
				return;

			var pressMouseX:Number = NumberUtil.minMax(this._pressMouseX, 0, this._layoutWidth);
			var pressPosition:Number = pressMouseX / this._layoutWidth;
			var pressAbsolute:Number = axis.relativeToAbsolute(pressPosition);

			var minimum:* = axis.absoluteToValue(pressAbsolute);
			var maximum:* = minimum;

			var minimumSnap:Function = this._minimumSnap.value;
			if ((minimumSnap != null) && (minimum != null))
				minimum = minimumSnap(minimum, true);

			var maximumSnap:Function = this._maximumSnap.value;
			if ((maximumSnap != null) && (maximum != null))
				maximum = maximumSnap(maximum, true);

			this._minimum.value = minimum;
			this._maximum.value = maximum;
		};

		private function _selectAll() : void
		{
			this._minimum.value = null;
			this._maximum.value = null;
		};

		private function _self_addedToStage(e:Event) : void
		{
			this.stage.addEventListener(MouseEvent.MOUSE_DOWN, this._stage_mouseDown, false, int.MAX_VALUE);
			this.stage.addEventListener(MouseEvent.MOUSE_UP, this._stage_mouseUp2, false, int.MAX_VALUE);
			this.stage.addEventListener(MouseEvent.MOUSE_MOVE, this._stage_mouseMove2, false, int.MAX_VALUE);
			this.stage.addEventListener(Event.MOUSE_LEAVE, this._stage_mouseLeave, false, int.MAX_VALUE);
			this.stage.addEventListener(KeyboardEvent.KEY_DOWN, this._stage_keyDown, false, int.MAX_VALUE);
		}

		private function _self_removedFromStage(e:Event) : void
		{
			this.stage.removeEventListener(MouseEvent.MOUSE_DOWN, this._stage_mouseDown);
			this.stage.removeEventListener(MouseEvent.MOUSE_UP, this._stage_mouseUp);
			this.stage.removeEventListener(MouseEvent.MOUSE_UP, this._stage_mouseUp2);
			this.stage.removeEventListener(MouseEvent.MOUSE_MOVE, this._stage_mouseMove);
			this.stage.removeEventListener(MouseEvent.MOUSE_MOVE, this._stage_mouseMove2);
			this.stage.removeEventListener(Event.MOUSE_LEAVE, this._stage_mouseLeave);
			this.stage.removeEventListener(KeyboardEvent.KEY_DOWN, this._stage_keyDown);
		}

		private function _stage_mouseDown(e:MouseEvent) : void
		{
			if ((this._layoutWidth <= 0) || (this._layoutHeight <= 0))
				return;

			var mousePosition:Point = this.globalToLocal(new Point(e.stageX, e.stageY));
			var mouseX:Number = mousePosition.x / this._layoutWidth;
			var mouseY:Number = mousePosition.y / this._layoutHeight;
			if ((mouseX < 0) || (mouseX > 1) || (mouseY < 0) || (mouseY > 1))
				return;

			this.stage.addEventListener(MouseEvent.MOUSE_UP, this._stage_mouseUp, false, int.MAX_VALUE);
			this.stage.addEventListener(MouseEvent.MOUSE_MOVE, this._stage_mouseMove, false, int.MAX_VALUE);

			if ((this._cachedMinimumPosition <= 0) && (this._cachedMaximumPosition >= 1))
				this._beginDrag(mousePosition, "new");
			else if ((mouseX > this._cachedMinimumPosition) && (mouseX < this._cachedMaximumPosition))
				this._beginDrag(mousePosition, "inside");
			else
				this._beginDrag(mousePosition, "outside");
		}

		private function _stage_mouseUp(e:MouseEvent) : void
		{
			this.stage.removeEventListener(MouseEvent.MOUSE_UP, this._stage_mouseUp);
			this.stage.removeEventListener(MouseEvent.MOUSE_MOVE, this._stage_mouseMove);

			this._endDrag();
		}

		private function _stage_mouseUp2(e:MouseEvent) : void
		{
			this._updateShowLabels(e);
		}

		private function _stage_mouseMove(e:MouseEvent) : void
		{
			var mousePosition:Point = this.globalToLocal(new Point(e.stageX, e.stageY));
			this._updateDrag(mousePosition);
		}

		private function _stage_mouseMove2(e:MouseEvent) : void
		{
			if (!e.buttonDown)
				this._updateShowLabels(e);
		}

		private function _stage_mouseLeave(e:Event) : void
		{
			var e2:MouseEvent = new MouseEvent(Event.MOUSE_LEAVE, false, false, -1, -1);
			this.dispatchEvent(e2);
			this._updateShowLabels(e2);
		}

		private function _stage_keyDown(e:KeyboardEvent) : void
		{
			if (this._dragMode)
				return;

			if (e.keyCode == Keyboard.ESCAPE)
			{
				// clicking outside selection selects all
				if ((this._minimum.value != null) || (this._maximum.value != null))
				{
					this._beginDrag(new Point(0, 0), "outside");
					this._endDrag();
				}
			}
		}

	}

}
