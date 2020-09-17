package com.splunk.charting.controls
{

	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.graphics.brushes.IBrush;
	import com.jasongatt.graphics.brushes.SolidFillBrush;
	import com.jasongatt.graphics.brushes.SolidStrokeBrush;
	import com.jasongatt.graphics.shapes.RectangleShape;
	import com.jasongatt.layout.LayoutSprite;
	import com.jasongatt.layout.Margin;
	import com.jasongatt.layout.Size;
	import com.jasongatt.utils.NumberUtil;
	import com.splunk.charting.axes.IAxis;
	import com.splunk.controls.Label;
	import com.splunk.utils.Style;
	import flash.display.Shape;
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.geom.Rectangle;
	import flash.text.TextFormat;

	public class CursorMarker extends LayoutSprite
	{

		// Private Properties

		private var _fillBrush:ObservableProperty;
		private var _lineBrush:ObservableProperty;
		private var _valueStyle:ObservableProperty;
		private var _backgroundBrush:ObservableProperty;
		private var _backgroundStyle:ObservableProperty;
		private var _axis:ObservableProperty;
		private var _value:ObservableProperty;
		private var _valueSnap:ObservableProperty;
		private var _valueFormat:ObservableProperty;
		private var _labelOpacity:ObservableProperty;

		private var _cachedRelativeValue:Number;

		private var _valueField:Label;
		private var _fill:Shape;
		private var _line:Shape;
		private var _foreground:Sprite;
		private var _background:Shape;

		// Constructor

		public function CursorMarker()
		{
			var fillBrush:SolidFillBrush = new SolidFillBrush(0xD1D1D1, 1);
			var lineBrush:SolidStrokeBrush = new SolidStrokeBrush(1, 0x000000, 0.4);
			var backgroundBrush:SolidFillBrush = new SolidFillBrush(0xEAEAEA, 0.66);

			this._fillBrush = new ObservableProperty(this, "fillBrush", IBrush, fillBrush, this.invalidates(LayoutSprite.LAYOUT));
			this._lineBrush = new ObservableProperty(this, "lineBrush", IBrush, lineBrush, this.invalidates(LayoutSprite.LAYOUT));
			this._valueStyle = new ObservableProperty(this, "valueStyle", Style, null, this.invalidates(LayoutSprite.MEASURE));
			this._backgroundBrush = new ObservableProperty(this, "backgroundBrush", IBrush, backgroundBrush, this.invalidates(LayoutSprite.LAYOUT));
			this._backgroundStyle = new ObservableProperty(this, "backgroundStyle", Style, null, this.invalidates(LayoutSprite.MEASURE));
			this._axis = new ObservableProperty(this, "axis", IAxis, null, this.invalidates(LayoutSprite.MEASURE));
			this._value = new ObservableProperty(this, "value", Object, null, this.invalidates(LayoutSprite.MEASURE));
			this._valueSnap = new ObservableProperty(this, "valueSnap", Function, null, this.invalidates(LayoutSprite.MEASURE));
			this._valueFormat = new ObservableProperty(this, "valueFormat", Function, null, this.invalidates(LayoutSprite.MEASURE));
			this._labelOpacity = new ObservableProperty(this, "labelOpacity", Number, 0, this._redrawLabelOpacity);

			this._valueField = new Label();
			this._valueField.defaultTextFormat = new TextFormat("_sans", 12, 0xFFFFFF);
			this._valueField.margin = new Margin(5, 5, 0, 0);
			this._valueField.alignmentY = 0.5;

			this._fill = new Shape();

			this._line = new Shape();

			this._foreground = new Sprite();
			this._foreground.addChild(this._fill);
			this._foreground.addChild(this._valueField);

			this._background = new Shape();

			this.mouseEnabled = false;
			this.mouseChildren = false;
			this.snap = true;

			this.addChild(this._background);
			this.addChild(this._line);
			this.addChild(this._foreground);
		}

		// Public Getters/Setters

		public function get fillBrush() : IBrush
		{
			return this._fillBrush.value;
		}
		public function set fillBrush(value:IBrush) : void
		{
			this._fillBrush.value = value;
		}

		public function get lineBrush() : IBrush
		{
			return this._lineBrush.value;
		}
		public function set lineBrush(value:IBrush) : void
		{
			this._lineBrush.value = value;
		}

		public function get valueStyle() : Style
		{
			return this._valueStyle.value;
		}
		public function set valueStyle(value:Style) : void
		{
			this._valueStyle.value = value;
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

		public function get value() : *
		{
			return this._value.value;
		}
		public function set value(value:*) : void
		{
			this._value.value = value;
		}

		public function get valueSnap() : Function
		{
			return this._valueSnap.value;
		}
		public function set valueSnap(value:Function) : void
		{
			if (value != this._valueSnap.value)
				this._valueSnap.value = value;
			else if (value != null)
				this.invalidate(LayoutSprite.MEASURE);
		}

		public function get valueFormat() : Function
		{
			return this._valueFormat.value;
		}
		public function set valueFormat(value:Function) : void
		{
			if (value != this._valueFormat.value)
				this._valueFormat.value = value;
			else if (value != null)
				this.invalidate(LayoutSprite.MEASURE);
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
			var value:* = this._value.value;
			var displayValue:* = value;
			var relativeValue:Number = 0;
			var valueField:Label = this._valueField;

			var axis:IAxis = this._axis.value;
			if (axis)
			{
				var valueSnap:Function = this._valueSnap.value;
				if ((valueSnap != null) && (value != null))
					displayValue = valueSnap(value);

				if (value != null)
					relativeValue = axis.absoluteToRelative(axis.valueToAbsolute(value));
			}

			this._cachedRelativeValue = relativeValue;

			// format label

			var valueFormat:Function = this._valueFormat.value;
			if (displayValue == null)
				valueField.text = "";
			else if (valueFormat == null)
				valueField.text = String(displayValue);
			else
				valueField.text = valueFormat(displayValue);
			Style.applyStyle(valueField, this._valueStyle.value);
			valueField.visible = ((relativeValue > 0) && (relativeValue <= 1));

			Style.applyStyle(this._background, this._backgroundStyle.value);

			valueField.measure();

			return new Size();
		}

		protected override function layoutOverride(layoutSize:Size) : Size
		{
			var relativeValue:Number = this._cachedRelativeValue;
			var valueField:Label = this._valueField;

			// compute placements

			var x1:Number = 0;
			var x2:Number = Math.round(layoutSize.width * NumberUtil.minMax(relativeValue, 0, 1));

			var y1:Number = 0;
			var y2:Number = Math.round(layoutSize.height);

			// layout label

			var valueFieldBounds:Rectangle = new Rectangle();
			valueFieldBounds.width = Math.round(valueField.measuredWidth);
			valueFieldBounds.height = 20;
			valueFieldBounds.x = Math.max(x2 - valueFieldBounds.width, 0);
			valueFieldBounds.y = Math.min(y2 - valueFieldBounds.height, 0);

			valueField.layout(valueFieldBounds);

			// draw background

			var rectangleShape:RectangleShape = new RectangleShape();

			this._background.graphics.clear();

			var backgroundBrush:IBrush = this._backgroundBrush.value;
			if (backgroundBrush)
				rectangleShape.draw(this._background.graphics, x1, y1, x2 - x1, y2 - y1, backgroundBrush);

			// draw line and fill

			this._line.graphics.clear();
			this._fill.graphics.clear();

			if ((relativeValue > 0) && (relativeValue <= 1))
			{
				var lineBrush:IBrush = this._lineBrush.value;
				if (lineBrush)
				{
					lineBrush.beginBrush(this._line.graphics);
					lineBrush.moveTo(x2, y1);
					lineBrush.lineTo(x2, y2);
					lineBrush.endBrush();
				}

				var fillBrush:IBrush = this._fillBrush.value;
				if (fillBrush)
					rectangleShape.draw(this._fill.graphics, valueFieldBounds.x + 1, valueFieldBounds.y, valueFieldBounds.width - 1, valueFieldBounds.height, fillBrush);
			}

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

	}

}
