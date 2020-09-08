package com.splunk.charting.labels
{

	import com.jasongatt.core.ChangedEvent;
	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.core.PropertyChangedEvent;
	import com.jasongatt.core.ValidatePass;
	import com.jasongatt.graphics.brushes.IBrush;
	import com.jasongatt.graphics.brushes.SolidStrokeBrush;
	import com.jasongatt.layout.LayoutSprite;
	import com.jasongatt.layout.Size;
	import com.jasongatt.utils.NumberUtil;
	import com.splunk.charting.axes.AxisChangeType;
	import com.splunk.charting.axes.AxisEvent;
	import com.splunk.charting.axes.IAxis;
	import com.splunk.charting.layout.IPlacement;
	import com.splunk.charting.layout.Placement;
	import com.splunk.utils.Style;
	import flash.display.CapsStyle;
	import flash.display.Graphics;
	import flash.display.LineScaleMode;
	import flash.display.Shape;
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.geom.Matrix;
	import flash.geom.Rectangle;

	public /*abstract*/ class AbstractAxisLabels extends LayoutSprite implements IPlacement
	{

		// Public Static Constants

		public static const UPDATE_AXIS_EXTENDED_RANGE:ValidatePass = new ValidatePass(AbstractAxisLabels, "updateAxisExtendedRange", 0.131);
		public static const COMPUTE_TICK_ABSOLUTES:ValidatePass = new ValidatePass(AbstractAxisLabels, "computeTickAbsolutes", 0.15);

		// Private Static Methods

		private static function _getDefaultBrush() : IBrush
		{
			return new SolidStrokeBrush(1, 0x000000, 1, true, LineScaleMode.NORMAL, CapsStyle.SQUARE);
		}

		// Private Properties

		private var _placement:ObservableProperty;
		private var _axis:ObservableProperty;
		private var _axisBrush:ObservableProperty;
		private var _axisVisibility:ObservableProperty;
		private var _majorTickBrush:ObservableProperty;
		private var _majorTickSize:ObservableProperty;
		private var _majorTickVisibility:ObservableProperty;
		private var _minorTickBrush:ObservableProperty;
		private var _minorTickSize:ObservableProperty;
		private var _minorTickVisibility:ObservableProperty;
		private var _majorLabelStyle:ObservableProperty;
		private var _majorLabelAlignment:ObservableProperty;
		private var _majorLabelVisibility:ObservableProperty;
		private var _majorLabelFormat:ObservableProperty;
		private var _minorLabelStyle:ObservableProperty;
		private var _minorLabelAlignment:ObservableProperty;
		private var _minorLabelVisibility:ObservableProperty;
		private var _minorLabelFormat:ObservableProperty;
		private var _extendsAxisRange:ObservableProperty;

		private var _majorTickDescriptors:Array;
		private var _minorTickDescriptors:Array;
		private var _majorLabelDescriptors:Array;
		private var _minorLabelDescriptors:Array;
		private var _majorLabelFields:Array;
		private var _minorLabelFields:Array;
		private var _relativeStart:Number;
		private var _relativeEnd:Number;
		private var _pixelStart:Number;
		private var _pixelEnd:Number;
		private var _pixelsOrdered:Boolean;

		private var _majorTickMeasuredSize:Size;
		private var _minorTickMeasuredSize:Size;
		private var _majorLabelMeasuredSize:Size;
		private var _minorLabelMeasuredSize:Size;

		private var _majorTickContainer:Shape;
		private var _minorTickContainer:Shape;
		private var _majorLabelContainer:Sprite;
		private var _minorLabelContainer:Sprite;

		// Constructor

		public function AbstractAxisLabels()
		{
			this._placement = new ObservableProperty(this, "placement", String, Placement.BOTTOM, this.invalidates(LayoutSprite.MEASURE));
			this._axis = new ObservableProperty(this, "axis", IAxis, null, this._axis_changed);
			this._axisBrush = new ObservableProperty(this, "axisBrush", IBrush, AbstractAxisLabels._getDefaultBrush(), this.invalidates(LayoutSprite.MEASURE));
			this._axisVisibility = new ObservableProperty(this, "axisVisibility", String, AxisVisibility.SHOW, this.invalidates(LayoutSprite.MEASURE));
			this._majorTickBrush = new ObservableProperty(this, "majorTickBrush", IBrush, AbstractAxisLabels._getDefaultBrush(), this.invalidates(LayoutSprite.MEASURE));
			this._majorTickSize = new ObservableProperty(this, "majorTickSize", Number, 6, this.invalidates(LayoutSprite.MEASURE));
			this._majorTickVisibility = new ObservableProperty(this, "majorTickVisibility", String, TickVisibility.AUTO, this.invalidates(LayoutSprite.MEASURE));
			this._minorTickBrush = new ObservableProperty(this, "minorTickBrush", IBrush, AbstractAxisLabels._getDefaultBrush(), this.invalidates(LayoutSprite.MEASURE));
			this._minorTickSize = new ObservableProperty(this, "minorTickSize", Number, 3, this.invalidates(LayoutSprite.MEASURE));
			this._minorTickVisibility = new ObservableProperty(this, "minorTickVisibility", String, TickVisibility.AUTO, this.invalidates(LayoutSprite.MEASURE));
			this._majorLabelStyle = new ObservableProperty(this, "majorLabelStyle", Style, null, this.invalidates(LayoutSprite.MEASURE));
			this._majorLabelAlignment = new ObservableProperty(this, "majorLabelAlignment", String, LabelAlignment.AT_TICK, this.invalidates(LayoutSprite.MEASURE));
			this._majorLabelVisibility = new ObservableProperty(this, "majorLabelVisibility", String, LabelVisibility.AUTO, this.invalidates(LayoutSprite.MEASURE));
			this._majorLabelFormat = new ObservableProperty(this, "majorLabelFormat", Function, null, this.invalidates(AbstractAxisLabels.COMPUTE_TICK_ABSOLUTES));
			this._minorLabelStyle = new ObservableProperty(this, "minorLabelStyle", Style, null, this.invalidates(LayoutSprite.MEASURE));
			this._minorLabelAlignment = new ObservableProperty(this, "minorLabelAlignment", String, LabelAlignment.AT_TICK, this.invalidates(LayoutSprite.MEASURE));
			this._minorLabelVisibility = new ObservableProperty(this, "minorLabelVisibility", String, LabelVisibility.HIDE, this.invalidates(LayoutSprite.MEASURE));
			this._minorLabelFormat = new ObservableProperty(this, "minorLabelFormat", Function, null, this.invalidates(AbstractAxisLabels.COMPUTE_TICK_ABSOLUTES));
			this._extendsAxisRange = new ObservableProperty(this, "extendsAxisRange", Boolean, true, this.invalidates(AbstractAxisLabels.UPDATE_AXIS_EXTENDED_RANGE));

			this._majorTickDescriptors = new Array();
			this._minorTickDescriptors = new Array();
			this._majorLabelDescriptors = new Array();
			this._minorLabelDescriptors = new Array();
			this._majorLabelFields = new Array();
			this._minorLabelFields = new Array();

			this._majorTickMeasuredSize = new Size();
			this._minorTickMeasuredSize = new Size();
			this._majorLabelMeasuredSize = new Size();
			this._minorLabelMeasuredSize = new Size();

			this._majorTickContainer = new Shape();
			this._minorTickContainer = new Shape();
			this._majorLabelContainer = new Sprite();
			this._minorLabelContainer = new Sprite();

			this.snap = true;

			this.addChild(this._minorTickContainer);
			this.addChild(this._majorTickContainer);
			this.addChild(this._minorLabelContainer);
			this.addChild(this._majorLabelContainer);
		}

		// Public Getters/Setters

		public function get placement() : String
		{
			return this._placement.value;
		}
		public function set placement(value:String) : void
		{
			switch (value)
			{
				case Placement.LEFT:
				case Placement.RIGHT:
				case Placement.TOP:
				case Placement.BOTTOM:
					break;
				default:
					value = Placement.BOTTOM;
					break;
			}
			this._placement.value = value;
		}

		public function get axis() : IAxis
		{
			return this._axis.value;
		}
		public function set axis(value:IAxis) : void
		{
			this._axis.value = value;
		}

		public function get axisBrush() : IBrush
		{
			return this._axisBrush.value;
		}
		public function set axisBrush(value:IBrush) : void
		{
			this._axisBrush.value = value;
		}

		public function get axisVisibility() : String
		{
			return this._axisVisibility.value;
		}
		public function set axisVisibility(value:String) : void
		{
			switch (value)
			{
				case AxisVisibility.SHOW:
				case AxisVisibility.HIDE:
					break;
				default:
					value = AxisVisibility.SHOW;
					break;
			}
			this._axisVisibility.value = value;
		}

		public function get majorTickBrush() : IBrush
		{
			return this._majorTickBrush.value;
		}
		public function set majorTickBrush(value:IBrush) : void
		{
			this._majorTickBrush.value = value;
		}

		public function get majorTickSize() : Number
		{
			return this._majorTickSize.value;
		}
		public function set majorTickSize(value:Number) : void
		{
			this._majorTickSize.value = value;
		}

		public function get majorTickVisibility() : String
		{
			return this._majorTickVisibility.value;
		}
		public function set majorTickVisibility(value:String) : void
		{
			switch (value)
			{
				case TickVisibility.AUTO:
				case TickVisibility.SHOW:
				case TickVisibility.HIDE:
					break;
				default:
					value = TickVisibility.AUTO;
					break;
			}
			this._majorTickVisibility.value = value;
		}

		public function get minorTickBrush() : IBrush
		{
			return this._minorTickBrush.value;
		}
		public function set minorTickBrush(value:IBrush) : void
		{
			this._minorTickBrush.value = value;
		}

		public function get minorTickSize() : Number
		{
			return this._minorTickSize.value;
		}
		public function set minorTickSize(value:Number) : void
		{
			this._minorTickSize.value = value;
		}

		public function get minorTickVisibility() : String
		{
			return this._minorTickVisibility.value;
		}
		public function set minorTickVisibility(value:String) : void
		{
			switch (value)
			{
				case TickVisibility.AUTO:
				case TickVisibility.SHOW:
				case TickVisibility.HIDE:
					break;
				default:
					value = TickVisibility.AUTO;
					break;
			}
			this._minorTickVisibility.value = value;
		}

		public function get majorLabelStyle() : Style
		{
			return this._majorLabelStyle.value;
		}
		public function set majorLabelStyle(value:Style) : void
		{
			this._majorLabelStyle.value = value;
		}

		public function get majorLabelAlignment() : String
		{
			return this._majorLabelAlignment.value;
		}
		public function set majorLabelAlignment(value:String) : void
		{
			switch (value)
			{
				case LabelAlignment.AT_TICK:
				case LabelAlignment.AFTER_TICK:
				case LabelAlignment.BEFORE_TICK:
					break;
				default:
					value = LabelAlignment.AT_TICK;
					break;
			}
			this._majorLabelAlignment.value = value;
		}

		public function get majorLabelVisibility() : String
		{
			return this._majorLabelVisibility.value;
		}
		public function set majorLabelVisibility(value:String) : void
		{
			switch (value)
			{
				case LabelVisibility.AUTO:
				case LabelVisibility.SHOW:
				case LabelVisibility.HIDE:
					break;
				default:
					value = LabelVisibility.AUTO;
					break;
			}
			this._majorLabelVisibility.value = value;
		}

		public function get majorLabelFormat() : Function
		{
			return this._majorLabelFormat.value;
		}
		public function set majorLabelFormat(value:Function) : void
		{
			if (value != this._majorLabelFormat.value)
				this._majorLabelFormat.value = value;
			else if (value != null)
				this.invalidate(AbstractAxisLabels.COMPUTE_TICK_ABSOLUTES);
		}

		public function get minorLabelStyle() : Style
		{
			return this._minorLabelStyle.value;
		}
		public function set minorLabelStyle(value:Style) : void
		{
			this._minorLabelStyle.value = value;
		}

		public function get minorLabelAlignment() : String
		{
			return this._minorLabelAlignment.value;
		}
		public function set minorLabelAlignment(value:String) : void
		{
			switch (value)
			{
				case LabelAlignment.AT_TICK:
				case LabelAlignment.AFTER_TICK:
				case LabelAlignment.BEFORE_TICK:
					break;
				default:
					value = LabelAlignment.AT_TICK;
					break;
			}
			this._minorLabelAlignment.value = value;
		}

		public function get minorLabelVisibility() : String
		{
			return this._minorLabelVisibility.value;
		}
		public function set minorLabelVisibility(value:String) : void
		{
			switch (value)
			{
				case LabelVisibility.AUTO:
				case LabelVisibility.SHOW:
				case LabelVisibility.HIDE:
					break;
				default:
					value = LabelVisibility.AUTO;
					break;
			}
			this._minorLabelVisibility.value = value;
		}

		public function get minorLabelFormat() : Function
		{
			return this._minorLabelFormat.value;
		}
		public function set minorLabelFormat(value:Function) : void
		{
			if (value != this._minorLabelFormat.value)
				this._minorLabelFormat.value = value;
			else if (value != null)
				this.invalidate(AbstractAxisLabels.COMPUTE_TICK_ABSOLUTES);
		}

		public function get extendsAxisRange() : Boolean
		{
			return this._extendsAxisRange.value;
		}
		public function set extendsAxisRange(value:Boolean) : void
		{
			this._extendsAxisRange.value = value;
		}

		public function get majorPositions() : Array
		{
			var positions:Array = new Array();
			for each (var tickDescriptor:TickDescriptor in this._majorTickDescriptors)
				if (tickDescriptor.tickState == TickDescriptor.MAJOR)
					if ((tickDescriptor.relative >= 0) && (tickDescriptor.relative <= 1))
						positions.push(tickDescriptor.relative);
			return positions;
		}

		public function get minorPositions() : Array
		{
			var positions:Array = new Array();
			for each (var tickDescriptor:TickDescriptor in this._minorTickDescriptors)
				if (tickDescriptor.tickState == TickDescriptor.MINOR)
					if ((tickDescriptor.relative >= 0) && (tickDescriptor.relative <= 1))
						positions.push(tickDescriptor.relative);
			return positions;
		}

		public function get allPositions() : Array
		{
			var positions:Array = new Array();
			for each (var tickDescriptor:TickDescriptor in this._minorTickDescriptors)
				if (tickDescriptor.tickState != TickDescriptor.NONE)
					if ((tickDescriptor.relative >= 0) && (tickDescriptor.relative <= 1))
						positions.push(tickDescriptor.relative);
			return positions;
		}

		// Public Methods

		public function updateAxisExtendedRange() : void
		{
			this.validatePreceding(AbstractAxisLabels.UPDATE_AXIS_EXTENDED_RANGE);

			if (this.isValid(AbstractAxisLabels.UPDATE_AXIS_EXTENDED_RANGE))
				return;

			var absolute1:Number = NaN;
			var absolute2:Number = NaN;

			var axis:IAxis = this._axis.value;
			if (axis && this._extendsAxisRange.value)
			{
				var extendedRange:Array = this.updateAxisExtendedRangeOverride(axis);
				if (extendedRange)
				{
					if (extendedRange.length > 0)
						absolute1 = extendedRange[0];
					if (extendedRange.length > 1)
						absolute2 = extendedRange[1];
				}
			}

			this.setValid(AbstractAxisLabels.UPDATE_AXIS_EXTENDED_RANGE);

			// this must run last to avoid recursion
			if (axis)
				axis.setExtendedRange(this._axis, absolute1, absolute2);
		}

		public function computeTickAbsolutes() : void
		{
			this.validatePreceding(AbstractAxisLabels.COMPUTE_TICK_ABSOLUTES);

			if (this.isValid(AbstractAxisLabels.COMPUTE_TICK_ABSOLUTES))
				return;

			this.invalidate(LayoutSprite.MEASURE);

			var minorTickDescriptors:Array = this._minorTickDescriptors = new Array();
			var majorTickDescriptors:Array = this._majorTickDescriptors = new Array();
			var minorLabelDescriptors:Array = this._minorLabelDescriptors = new Array();
			var majorLabelDescriptors:Array = this._majorLabelDescriptors = new Array();
			this._relativeStart = 0;
			this._relativeEnd = 1;

			var axis:IAxis = this._axis.value;
			if (!axis)
			{
				this.setValid(AbstractAxisLabels.COMPUTE_TICK_ABSOLUTES);
				return;
			}

			var absoluteStart:Number = axis.relativeToAbsolute(0);
			var absoluteEnd:Number = axis.relativeToAbsolute(1);
			if (absoluteStart > absoluteEnd)
			{
				this._relativeStart = 1;
				this._relativeEnd = 0;
			}

			var majorTickAbsolutes:Array = new Array();
			var minorTickAbsolutes:Array = new Array();

			this.computeTickAbsolutesOverride(axis, majorTickAbsolutes, minorTickAbsolutes);

			majorTickAbsolutes.sort(Array.NUMERIC);
			minorTickAbsolutes.sort(Array.NUMERIC);

			var numMajorTickAbsolutes:int = majorTickAbsolutes.length;
			var numMinorTickAbsolutes:int = minorTickAbsolutes.length;

			var majorIndex:int = 0;
			var minorIndex:int = 0;
			var majorAbsolute:Number;
			var minorAbsolute:Number;
			var majorRelative:Number;
			var minorRelative:Number;

			var tickDescriptor:TickDescriptor;
			var tickDescriptors:Array = new Array();
			var numTickDescriptors:int = 0;

			while (true)
			{
				if ((majorIndex < numMajorTickAbsolutes) && (minorIndex < numMinorTickAbsolutes))
				{
					majorAbsolute = majorTickAbsolutes[majorIndex];
					minorAbsolute = minorTickAbsolutes[minorIndex];
					if (majorAbsolute <= minorAbsolute)
					{
						majorRelative = axis.absoluteToRelative(majorAbsolute);
						if ((majorRelative >= 0) && (majorRelative <= 1))
						{
							if ((numTickDescriptors == 0) || (majorAbsolute != tickDescriptors[numTickDescriptors - 1].absolute))
							{
								tickDescriptor = new TickDescriptor(majorAbsolute, majorRelative);
								tickDescriptor.majorLabelDescriptor = new LabelDescriptor(tickDescriptor, this._formatMajorValue(this.absoluteToValue(axis, majorAbsolute)));
								tickDescriptor.minorLabelDescriptor = new LabelDescriptor(tickDescriptor, this._formatMinorValue(this.absoluteToValue(axis, majorAbsolute)));
								tickDescriptors.push(tickDescriptor);
								numTickDescriptors++;
							}
						}
						majorIndex++;
						if (majorAbsolute == minorAbsolute)
							minorIndex++;
					}
					else
					{
						minorRelative = axis.absoluteToRelative(minorAbsolute);
						if ((minorRelative >= 0) && (minorRelative <= 1))
						{
							if ((numTickDescriptors == 0) || (minorAbsolute != tickDescriptors[numTickDescriptors - 1].absolute))
							{
								tickDescriptor = new TickDescriptor(minorAbsolute, minorRelative);
								tickDescriptor.minorLabelDescriptor = new LabelDescriptor(tickDescriptor, this._formatMinorValue(this.absoluteToValue(axis, minorAbsolute)));
								tickDescriptors.push(tickDescriptor);
								numTickDescriptors++;
							}
						}
						minorIndex++;
					}
				}
				else if (majorIndex < numMajorTickAbsolutes)
				{
					majorAbsolute = majorTickAbsolutes[majorIndex];
					majorRelative = axis.absoluteToRelative(majorAbsolute);
					if ((majorRelative >= 0) && (majorRelative <= 1))
					{
						if ((numTickDescriptors == 0) || (majorAbsolute != tickDescriptors[numTickDescriptors - 1].absolute))
						{
							tickDescriptor = new TickDescriptor(majorAbsolute, majorRelative);
							tickDescriptor.majorLabelDescriptor = new LabelDescriptor(tickDescriptor, this._formatMajorValue(this.absoluteToValue(axis, majorAbsolute)));
							tickDescriptor.minorLabelDescriptor = new LabelDescriptor(tickDescriptor, this._formatMinorValue(this.absoluteToValue(axis, majorAbsolute)));
							tickDescriptors.push(tickDescriptor);
							numTickDescriptors++;
						}
					}
					majorIndex++;
				}
				else if (minorIndex < numMinorTickAbsolutes)
				{
					minorAbsolute = minorTickAbsolutes[minorIndex];
					minorRelative = axis.absoluteToRelative(minorAbsolute);
					if ((minorRelative >= 0) && (minorRelative <= 1))
					{
						if ((numTickDescriptors == 0) || (minorAbsolute != tickDescriptors[numTickDescriptors - 1].absolute))
						{
							tickDescriptor = new TickDescriptor(minorAbsolute, minorRelative);
							tickDescriptor.minorLabelDescriptor = new LabelDescriptor(tickDescriptor, this._formatMinorValue(this.absoluteToValue(axis, minorAbsolute)));
							tickDescriptors.push(tickDescriptor);
							numTickDescriptors++;
						}
					}
					minorIndex++;
				}
				else
				{
					break;
				}
			}

			for each (tickDescriptor in tickDescriptors)
			{
				if (tickDescriptor.majorLabelDescriptor)
				{
					majorTickDescriptors.push(tickDescriptor);
					majorLabelDescriptors.push(tickDescriptor.majorLabelDescriptor);
				}
				minorTickDescriptors.push(tickDescriptor);
				minorLabelDescriptors.push(tickDescriptor.minorLabelDescriptor);
			}

			this.setValid(AbstractAxisLabels.COMPUTE_TICK_ABSOLUTES);
		}

		// Protected Methods

		protected override function measureOverride(availableSize:Size) : Size
		{
			if (availableSize.width == Infinity)
				availableSize.width = 200;
			if (availableSize.height == Infinity)
				availableSize.height = 200;

			var size:Size = new Size();

			var placement:String = this._placement.value;
			var majorTickSize:Number = this._majorTickSize.value;
			var majorTickVisibility:String = this._majorTickVisibility.value;
			var minorTickSize:Number = this._minorTickSize.value;
			var minorTickVisibility:String = this._minorTickVisibility.value;
			var majorLabelStyle:Style = this._majorLabelStyle.value;
			var majorLabelAlignment:String = this._majorLabelAlignment.value;
			var majorLabelVisibility:String = this._majorLabelVisibility.value;
			var minorLabelStyle:Style = this._minorLabelStyle.value;
			var minorLabelAlignment:String = this._minorLabelAlignment.value;
			var minorLabelVisibility:String = this._minorLabelVisibility.value;

			var majorLabelDescriptors:Array = this._majorLabelDescriptors;
			var minorLabelDescriptors:Array = this._minorLabelDescriptors;
			var majorTickDescriptors:Array = this._majorTickDescriptors;
			var minorTickDescriptors:Array = this._minorTickDescriptors;
			var majorLabelFields:Array = this._majorLabelFields;
			var minorLabelFields:Array = this._minorLabelFields;

			var majorLabelContainer:Sprite = this._majorLabelContainer;
			var minorLabelContainer:Sprite = this._minorLabelContainer;

			var minorTickMeasuredSize:Size = this._measureTicks(availableSize, placement, minorLabelVisibility, minorTickSize, minorTickVisibility, minorTickDescriptors);
			var majorTickMeasuredSize:Size = this._measureTicks(availableSize, placement, majorLabelVisibility, majorTickSize, majorTickVisibility, majorTickDescriptors);
			var minorLabelMeasuredSize:Size = this._measureLabels(availableSize, placement, minorLabelStyle, minorLabelAlignment, minorLabelVisibility, minorLabelDescriptors, minorLabelFields, minorLabelContainer);
			var majorLabelMeasuredSize:Size = this._measureLabels(availableSize, placement, majorLabelStyle, majorLabelAlignment, majorLabelVisibility, majorLabelDescriptors, majorLabelFields, majorLabelContainer);

			if ((minorLabelAlignment == LabelAlignment.BEFORE_TICK) || (minorLabelAlignment == LabelAlignment.AFTER_TICK))
				size.height = Math.max(minorTickMeasuredSize.height, minorLabelMeasuredSize.height);
			else
				size.height = minorTickMeasuredSize.height + minorLabelMeasuredSize.height;

			if ((majorLabelAlignment == LabelAlignment.BEFORE_TICK) || (majorLabelAlignment == LabelAlignment.AFTER_TICK))
				size.height = Math.max(size.height + majorLabelMeasuredSize.height, majorTickMeasuredSize.height);
			else
				size.height = Math.max(size.height, majorTickMeasuredSize.height) + majorLabelMeasuredSize.height;

			if ((placement == Placement.LEFT) || (placement == Placement.RIGHT))
			{
				size.width = size.height;
				size.height = availableSize.height;
			}
			else
			{
				size.width = availableSize.width;
			}

			this._minorTickMeasuredSize = minorTickMeasuredSize;
			this._majorTickMeasuredSize = majorTickMeasuredSize;
			this._minorLabelMeasuredSize = minorLabelMeasuredSize;
			this._majorLabelMeasuredSize = majorLabelMeasuredSize;

			return size;
		}

		protected override function layoutOverride(layoutSize:Size) : Size
		{
			var placement:String = this._placement.value;
			var axisBrush:IBrush = this._axisBrush.value;
			if (!axisBrush)
				axisBrush = AbstractAxisLabels._getDefaultBrush();
			var axisVisibility:String = this._axisVisibility.value;
			var majorTickBrush:IBrush = this._majorTickBrush.value;
			if (!majorTickBrush)
				majorTickBrush = AbstractAxisLabels._getDefaultBrush();
			var majorTickSize:Number = this._majorTickSize.value;
			var majorTickVisibility:String = this._majorTickVisibility.value;
			var minorTickBrush:IBrush = this._minorTickBrush.value;
			if (!minorTickBrush)
				minorTickBrush = AbstractAxisLabels._getDefaultBrush();
			var minorTickSize:Number = this._minorTickSize.value;
			var minorTickVisibility:String = this._minorTickVisibility.value;
			var majorLabelAlignment:String = this._majorLabelAlignment.value;
			var majorLabelVisibility:String = this._majorLabelVisibility.value;
			var minorLabelAlignment:String = this._minorLabelAlignment.value;
			var minorLabelVisibility:String = this._minorLabelVisibility.value;

			var minorTickDescriptors:Array = this._minorTickDescriptors;
			var majorTickDescriptors:Array = this._majorTickDescriptors;
			var minorLabelDescriptors:Array = this._minorLabelDescriptors;
			var majorLabelDescriptors:Array = this._majorLabelDescriptors;

			var minorTickMeasuredSize:Size = this._minorTickMeasuredSize;
			var majorTickMeasuredSize:Size = this._majorTickMeasuredSize;
			var minorLabelMeasuredSize:Size = this._minorLabelMeasuredSize;
			var majorLabelMeasuredSize:Size = this._majorLabelMeasuredSize;

			var layoutSize2:Size = ((placement == Placement.LEFT) || (placement == Placement.RIGHT)) ? new Size(layoutSize.height, layoutSize.width) : layoutSize.clone();

			var axisLineBounds:Rectangle = new Rectangle(0, 0, layoutSize2.width, 0);
			var minorTickBounds:Rectangle = new Rectangle(0, 0, layoutSize2.width, 0);
			var majorTickBounds:Rectangle = new Rectangle(0, 0, layoutSize2.width, 0);
			var minorLabelBounds:Rectangle = new Rectangle(0, 0, layoutSize2.width, 0);
			var majorLabelBounds:Rectangle = new Rectangle(0, 0, layoutSize2.width, 0);

			var graphics:Graphics;

			// compute minorTickBounds
			minorTickBounds.y = 0;
			minorTickBounds.height = minorTickMeasuredSize.height;

			// compute majorTickBounds
			majorTickBounds.y = 0;
			majorTickBounds.height = majorTickMeasuredSize.height;

			// compute minorLabelBounds
			if ((minorLabelAlignment == LabelAlignment.BEFORE_TICK) || (minorLabelAlignment == LabelAlignment.AFTER_TICK))
			{
				minorLabelBounds.y = 0;
				minorLabelBounds.height = Math.max(minorLabelMeasuredSize.height, minorTickBounds.height);
			}
			else
			{
				minorLabelBounds.y = minorTickBounds.height;
				minorLabelBounds.height = minorLabelMeasuredSize.height;
			}

			// compute majorLabelBounds
			if ((majorLabelAlignment == LabelAlignment.BEFORE_TICK) || (majorLabelAlignment == LabelAlignment.AFTER_TICK))
			{
				majorLabelBounds.y = minorLabelBounds.y + minorLabelBounds.height;
				majorLabelBounds.height = Math.max(majorLabelMeasuredSize.height, majorTickMeasuredSize.height - majorLabelBounds.y);
			}
			else
			{
				majorLabelBounds.y = Math.max(majorTickMeasuredSize.height, minorLabelBounds.y + minorLabelBounds.height);
				majorLabelBounds.height = majorLabelMeasuredSize.height;
			}

			var labelDescriptor:LabelDescriptor;
			var tickDescriptor:TickDescriptor;
			var pixel:Number;
			var bounds:Rectangle;

			// prepare tickDescriptors
			for each (tickDescriptor in minorTickDescriptors)
			{
				tickDescriptor.labelState = TickDescriptor.NONE;
				tickDescriptor.tickState = TickDescriptor.NONE;
			}

			var visibleMajorLabels:Array = this._layoutLabels(majorLabelBounds, majorTickVisibility, majorLabelAlignment, majorLabelVisibility, majorLabelDescriptors);
			var visibleMajorTicks:Array = this._layoutTicks(majorTickBounds, majorTickVisibility, majorLabelVisibility, majorLabelDescriptors);
			var visibleMinorLabels:Array = this._layoutLabels(minorLabelBounds, minorTickVisibility, minorLabelAlignment, minorLabelVisibility, minorLabelDescriptors);
			var visibleMinorTicks:Array = this._layoutTicks(minorTickBounds, minorTickVisibility, minorLabelVisibility, minorLabelDescriptors);

			// adjust for alignment
			if ((placement == Placement.LEFT) || (placement == Placement.TOP))
			{
				for each (labelDescriptor in visibleMajorLabels)
					labelDescriptor.bounds.y = layoutSize2.height - labelDescriptor.bounds.y - labelDescriptor.bounds.height;
				for each (labelDescriptor in visibleMinorLabels)
					labelDescriptor.bounds.y = layoutSize2.height - labelDescriptor.bounds.y - labelDescriptor.bounds.height;
				for each (tickDescriptor in visibleMajorTicks)
					tickDescriptor.bounds.y = layoutSize2.height - tickDescriptor.bounds.y - tickDescriptor.bounds.height;
				for each (tickDescriptor in visibleMinorTicks)
					tickDescriptor.bounds.y = layoutSize2.height - tickDescriptor.bounds.y - tickDescriptor.bounds.height;
				axisLineBounds.y = layoutSize2.height - axisLineBounds.y - axisLineBounds.height;
			}

			// adjust for orientation
			if ((placement == Placement.LEFT) || (placement == Placement.RIGHT))
			{
				for each (labelDescriptor in visibleMajorLabels)
					labelDescriptor.bounds = new Rectangle(labelDescriptor.bounds.y, labelDescriptor.bounds.x, labelDescriptor.bounds.height, labelDescriptor.bounds.width);
				for each (labelDescriptor in visibleMinorLabels)
					labelDescriptor.bounds = new Rectangle(labelDescriptor.bounds.y, labelDescriptor.bounds.x, labelDescriptor.bounds.height, labelDescriptor.bounds.width);
				for each (tickDescriptor in visibleMajorTicks)
					tickDescriptor.bounds = new Rectangle(tickDescriptor.bounds.y, tickDescriptor.bounds.x , tickDescriptor.bounds.height, tickDescriptor.bounds.width);
				for each (tickDescriptor in visibleMinorTicks)
					tickDescriptor.bounds = new Rectangle(tickDescriptor.bounds.y, tickDescriptor.bounds.x, tickDescriptor.bounds.height, tickDescriptor.bounds.width);
				axisLineBounds = new Rectangle(axisLineBounds.y, axisLineBounds.x, axisLineBounds.height, axisLineBounds.width);
			}

			// layout major labels
			for each (labelDescriptor in visibleMajorLabels)
				labelDescriptor.label.layout(labelDescriptor.bounds);

			// layout minor labels
			for each (labelDescriptor in visibleMinorLabels)
				labelDescriptor.label.layout(labelDescriptor.bounds);

			// layout major ticks
			graphics = this._majorTickContainer.graphics;
			graphics.clear();
			for each (tickDescriptor in visibleMajorTicks)
			{
				bounds = tickDescriptor.bounds;
				majorTickBrush.beginBrush(graphics);
				majorTickBrush.moveTo(Math.round(bounds.x), Math.round(bounds.y));
				majorTickBrush.lineTo(Math.round(bounds.x + bounds.width), Math.round(bounds.y + bounds.height));
				majorTickBrush.endBrush();
			}

			// layout minor ticks
			graphics = this._minorTickContainer.graphics;
			graphics.clear();
			for each (tickDescriptor in visibleMinorTicks)
			{
				bounds = tickDescriptor.bounds;
				minorTickBrush.beginBrush(graphics);
				minorTickBrush.moveTo(Math.round(bounds.x), Math.round(bounds.y));
				minorTickBrush.lineTo(Math.round(bounds.x + bounds.width), Math.round(bounds.y + bounds.height));
				minorTickBrush.endBrush();
			}

			// layout axis
			graphics = this.graphics;
			graphics.clear();
			if (axisVisibility != AxisVisibility.HIDE)
			{
				axisBrush.beginBrush(graphics);
				axisBrush.moveTo(Math.round(axisLineBounds.x), Math.round(axisLineBounds.y));
				axisBrush.lineTo(Math.round(axisLineBounds.x + axisLineBounds.width), Math.round(axisLineBounds.y + axisLineBounds.height));
				axisBrush.endBrush();
			}

			return layoutSize;
		}

		protected function updateAxisExtendedRangeOverride(axis:IAxis) : Array
		{
			return null;
		}

		protected function computeTickAbsolutesOverride(axis:IAxis, majorTickAbsolutes:Array, minorTickAbsolutes:Array) : void
		{
		}

		protected function absoluteToValue(axis:IAxis, absolute:Number) : *
		{
			return axis.absoluteToValue(absolute);
		}

		protected function defaultMajorFormat(value:*) : String
		{
			return String(value);
		}

		protected function defaultMinorFormat(value:*) : String
		{
			return String(value);
		}

		// Private Methods

		private function _formatMajorValue(value:*) : String
		{
			var majorLabelFormat:Function = this._majorLabelFormat.value;
			if (majorLabelFormat != null)
				return majorLabelFormat(value);
			return this.defaultMajorFormat(value);
		}

		private function _formatMinorValue(value:*) : String
		{
			var minorLabelFormat:Function = this._minorLabelFormat.value;
			if (minorLabelFormat != null)
				return minorLabelFormat(value);
			return this.defaultMinorFormat(value);
		}

		private function _measureTicks(availableSize:Size, placement:String, labelVisibility:String, tickSize:Number, tickVisibility:String, tickDescriptors:Array) : Size
		{
			var size:Size = new Size();

			var tickDescriptor:TickDescriptor;
			if ((placement == Placement.LEFT) || (placement == Placement.RIGHT))
			{
				if (this._relativeStart < this._relativeEnd)
				{
					this._pixelStart = Math.round(availableSize.height);
					this._pixelEnd = 0;
					this._pixelsOrdered = false;
				}
				else
				{
					this._pixelStart = 0;
					this._pixelEnd = Math.round(availableSize.height);
					this._pixelsOrdered = true;
				}

				for each (tickDescriptor in tickDescriptors)
					tickDescriptor.pixel = Math.round(availableSize.height * (1 - tickDescriptor.relative));
			}
			else
			{
				if (this._relativeStart < this._relativeEnd)
				{
					this._pixelStart = 0;
					this._pixelEnd = Math.round(availableSize.width);
					this._pixelsOrdered = true;
				}
				else
				{
					this._pixelStart = Math.round(availableSize.width);
					this._pixelEnd = 0;
					this._pixelsOrdered = false;
				}

				for each (tickDescriptor in tickDescriptors)
					tickDescriptor.pixel = Math.round(availableSize.width * tickDescriptor.relative);
			}

			if ((tickDescriptors.length == 0) || (tickVisibility == TickVisibility.HIDE) ||
			    ((tickVisibility == TickVisibility.AUTO) && (labelVisibility == LabelVisibility.HIDE)))
				return size;

			size.height = tickSize;

			return size;
		}

		private function _measureLabels(availableSize:Size, placement:String, labelStyle:Style, labelAlignment:String, labelVisibility:String, labelDescriptors:Array, labelFields:Array, labelContainer:Sprite) : Size
		{
			var numLabelDescriptors:int = labelDescriptors.length;
			var numLabelFields:int = labelFields.length;
			var labelDescriptor:LabelDescriptor;
			var labelField:AxisLabel;
			var i:int;

			if (labelVisibility == LabelVisibility.HIDE)
			{
				// remove all label fields
				for (i = numLabelFields - 1; i >= 0; i--)
				{
					labelField = labelFields[i];
					labelFields.splice(i, 1);
					labelContainer.removeChild(labelField);
				}

				// delete all label references
				for (i = 0; i < numLabelDescriptors; i++)
				{
					labelDescriptor = labelDescriptors[i];
					labelDescriptor.label = null;
				}

				return new Size();
			}

			// add new label fields
			for (i = numLabelFields; i < numLabelDescriptors; i++)
			{
				labelField = new AxisLabel();
				labelFields.push(labelField);
				labelContainer.addChild(labelField);
			}

			// remove old label fields
			for (i = numLabelFields - 1; i >= numLabelDescriptors; i--)
			{
				labelField = labelFields[i];
				labelFields.splice(i, 1);
				labelContainer.removeChild(labelField);
			}

			// update all label references
			for (i = 0; i < numLabelDescriptors; i++)
			{
				labelDescriptor = labelDescriptors[i];
				labelDescriptor.label = labelFields[i];
			}

			// alignments
			var alignmentX:Number;
			var alignmentY:Number;
			if ((placement == Placement.LEFT) || (placement == Placement.RIGHT))
			{
				alignmentX = 0;
				alignmentY = 0.5;
			}
			else
			{
				alignmentX = 0.5;
				alignmentY = 0;
			}
			if (labelStyle)
			{
				var ax:Number = NumberUtil.parseNumber(labelStyle.alignmentX);
				if (ax == ax)
					alignmentX = ax;

				var ay:Number = NumberUtil.parseNumber(labelStyle.alignmentY);
				if (ay == ay)
					alignmentY = ay;
			}

			// measure
			switch (labelAlignment)
			{
				case LabelAlignment.BEFORE_TICK:
					return this._measureLabelsBeforeTick(placement, alignmentX, alignmentY, labelStyle, labelDescriptors);
				case LabelAlignment.AFTER_TICK:
					return this._measureLabelsAfterTick(placement, alignmentX, alignmentY, labelStyle, labelDescriptors);
				default:
					return this._measureLabelsAtTick(placement, alignmentX, alignmentY, labelStyle, labelDescriptors);
			}
		}

		private function _measureLabelsBeforeTick(placement:String, alignmentX:Number, alignmentY:Number, labelStyle:Style, labelDescriptors:Array) : Size
		{
			var size:Size = new Size();

			var numLabelDescriptors:int = labelDescriptors.length;
			var labelDescriptor:LabelDescriptor;
			var labelField:AxisLabel;
			var i:int;
			var pixel1:Number;
			var pixel2:Number;
			var pixelDiff:Number;
			var pixelsOrdered:Boolean = this._pixelsOrdered;
			var childSize:Size = new Size(Infinity, Infinity);
			var isHorizontal:Boolean;

			switch (placement)
			{
				case Placement.LEFT:
					alignmentX = 1 - alignmentX;
					alignmentY = pixelsOrdered ? 1 - alignmentY : alignmentY;
					isHorizontal = false;
					break;
				case Placement.RIGHT:
					alignmentX = alignmentX;
					alignmentY = pixelsOrdered ? 1 - alignmentY : alignmentY;
					isHorizontal = false;
					break;
				case Placement.TOP:
					alignmentX = pixelsOrdered ? 1 - alignmentX : alignmentX;
					alignmentY = 1 - alignmentY;
					isHorizontal = true;
					break;
				default:
					alignmentX = pixelsOrdered ? 1 - alignmentX : alignmentX;
					alignmentY = alignmentY;
					isHorizontal = true;
					break;
			}

			for (i = numLabelDescriptors - 1; i >= 0; i--)
			{
				labelDescriptor = labelDescriptors[i];
				pixel1 = labelDescriptor.tickDescriptor.pixel;
				pixel2 = (i > 0) ? labelDescriptors[i - 1].tickDescriptor.pixel : this._pixelStart;
				pixelDiff = pixelsOrdered ? pixel1 - pixel2 : pixel2 - pixel1;
				if (pixelDiff < 0)
					pixelDiff = 0;

				if (isHorizontal)
					childSize.width = pixelDiff;
				else
					childSize.height = pixelDiff;

				labelField = labelDescriptor.label;
				labelField.text = labelDescriptor.text;
				Style.applyStyle(labelField, labelStyle);
				labelField.alignmentX = alignmentX;
				labelField.alignmentY = alignmentY;
				labelField.measure(childSize);

				if (isHorizontal)
				{
					labelDescriptor.measuredWidth = labelField.measuredWidth;
					labelDescriptor.measuredHeight = labelField.measuredHeight;
				}
				else
				{
					labelDescriptor.measuredWidth = labelField.measuredHeight;
					labelDescriptor.measuredHeight = labelField.measuredWidth;
				}

				size.height = Math.max(labelDescriptor.measuredHeight, size.height);
			}

			return size;
		}

		private function _measureLabelsAfterTick(placement:String, alignmentX:Number, alignmentY:Number, labelStyle:Style, labelDescriptors:Array) : Size
		{
			var size:Size = new Size();

			var numLabelDescriptors:int = labelDescriptors.length;
			var labelDescriptor:LabelDescriptor;
			var labelField:AxisLabel;
			var i:int;
			var pixel1:Number;
			var pixel2:Number;
			var pixelDiff:Number;
			var pixelsOrdered:Boolean = this._pixelsOrdered;
			var childSize:Size = new Size(Infinity, Infinity);
			var isHorizontal:Boolean;

			switch (placement)
			{
				case Placement.LEFT:
					alignmentX = 1 - alignmentX;
					alignmentY = pixelsOrdered ? alignmentY : 1 - alignmentY;
					isHorizontal = false;
					break;
				case Placement.RIGHT:
					alignmentX = alignmentX;
					alignmentY = pixelsOrdered ? alignmentY : 1 - alignmentY;
					isHorizontal = false;
					break;
				case Placement.TOP:
					alignmentX = pixelsOrdered ? alignmentX : 1 - alignmentX;
					alignmentY = 1 - alignmentY;
					isHorizontal = true;
					break;
				default:
					alignmentX = pixelsOrdered ? alignmentX : 1 - alignmentX;
					alignmentY = alignmentY;
					isHorizontal = true;
					break;
			}

			for (i = 0; i < numLabelDescriptors; i++)
			{
				labelDescriptor = labelDescriptors[i];
				pixel1 = labelDescriptor.tickDescriptor.pixel;
				pixel2 = ((i + 1) < numLabelDescriptors) ? labelDescriptors[i + 1].tickDescriptor.pixel : this._pixelEnd;
				pixelDiff = pixelsOrdered ? pixel2 - pixel1 : pixel1 - pixel2;
				if (pixelDiff < 0)
					pixelDiff = 0;

				if (isHorizontal)
					childSize.width = pixelDiff;
				else
					childSize.height = pixelDiff;

				labelField = labelDescriptor.label;
				labelField.text = labelDescriptor.text;
				Style.applyStyle(labelField, labelStyle);
				labelField.alignmentX = alignmentX;
				labelField.alignmentY = alignmentY;
				labelField.measure(childSize);

				if (isHorizontal)
				{
					labelDescriptor.measuredWidth = labelField.measuredWidth;
					labelDescriptor.measuredHeight = labelField.measuredHeight;
				}
				else
				{
					labelDescriptor.measuredWidth = labelField.measuredHeight;
					labelDescriptor.measuredHeight = labelField.measuredWidth;
				}

				size.height = Math.max(labelDescriptor.measuredHeight, size.height);
			}

			return size;
		}

		private function _measureLabelsAtTick(placement:String, alignmentX:Number, alignmentY:Number, labelStyle:Style, labelDescriptors:Array) : Size
		{
			var size:Size = new Size();

			var numLabelDescriptors:int = labelDescriptors.length;
			var labelDescriptor:LabelDescriptor;
			var labelField:AxisLabel;
			var i:int;
			var pixel0:Number;
			var pixel1:Number;
			var pixel2:Number;
			var pixelDiff:Number;
			var pixelsOrdered:Boolean = this._pixelsOrdered;
			var childSize:Size = new Size(Infinity, Infinity);
			var isHorizontal:Boolean;

			switch (placement)
			{
				case Placement.LEFT:
					alignmentX = 1 - alignmentX;
					alignmentY = pixelsOrdered ? alignmentY : 1 - alignmentY;
					isHorizontal = false;
					break;
				case Placement.RIGHT:
					alignmentX = alignmentX;
					alignmentY = pixelsOrdered ? alignmentY : 1 - alignmentY;
					isHorizontal = false;
					break;
				case Placement.TOP:
					alignmentX = pixelsOrdered ? alignmentX : 1 - alignmentX;
					alignmentY = 1 - alignmentY;
					isHorizontal = true;
					break;
				default:
					alignmentX = pixelsOrdered ? alignmentX : 1 - alignmentX;
					alignmentY = alignmentY;
					isHorizontal = true;
					break;
			}

			for (i = 0; i < numLabelDescriptors; i++)
			{
				labelDescriptor = labelDescriptors[i];
				pixel0 = (i > 0) ? labelDescriptors[i - 1].tickDescriptor.pixel : Infinity;
				pixel1 = labelDescriptor.tickDescriptor.pixel;
				pixel2 = ((i + 1) < numLabelDescriptors) ? labelDescriptors[i + 1].tickDescriptor.pixel : Infinity;

				if ((pixel0 == Infinity) && (pixel2 == Infinity))
					pixelDiff = Math.max(this._pixelEnd - pixel1, pixel1 - this._pixelStart);
				else if (pixel0 == Infinity)
					pixelDiff = pixel2 - pixel1;
				else if (pixel2 == Infinity)
					pixelDiff = pixel1 - pixel0;
				else
					pixelDiff = Math.min(pixel2 - pixel1, pixel1 - pixel0);

				if (!pixelsOrdered)
					pixelDiff = -pixelDiff;

				if (pixelDiff < 0)
					pixelDiff = 0;

				if (isHorizontal)
					childSize.width = pixelDiff;
				else
					childSize.height = pixelDiff;

				labelField = labelDescriptor.label;
				labelField.text = labelDescriptor.text;
				Style.applyStyle(labelField, labelStyle);
				labelField.alignmentX = alignmentX;
				labelField.alignmentY = alignmentY;
				labelField.measure(childSize);

				if (isHorizontal)
				{
					labelDescriptor.measuredWidth = labelField.measuredWidth;
					labelDescriptor.measuredHeight = labelField.measuredHeight;
				}
				else
				{
					labelDescriptor.measuredWidth = labelField.measuredHeight;
					labelDescriptor.measuredHeight = labelField.measuredWidth;
				}

				size.height = Math.max(labelDescriptor.measuredHeight, size.height);
			}

			return size;
		}

		private function _layoutTicks(layoutBounds:Rectangle, tickVisibility:String, labelVisibility:String, labelDescriptors:Array) : Array
		{
			var visibleTicks:Array = new Array();

			if (tickVisibility == TickVisibility.HIDE)
				return visibleTicks;
			if ((tickVisibility == TickVisibility.AUTO) && (labelVisibility == LabelVisibility.HIDE))
				return visibleTicks;

			var isVisibilityAuto:Boolean = (tickVisibility == TickVisibility.AUTO);
			var numLabelDescriptors:int = labelDescriptors.length;
			var labelDescriptor:LabelDescriptor;
			var tickDescriptor:TickDescriptor;
			var i:int;

			for (i = 0; i < numLabelDescriptors; i++)
			{
				labelDescriptor = labelDescriptors[i];
				tickDescriptor = labelDescriptor.tickDescriptor;
				if (tickDescriptor.tickState == TickDescriptor.NONE)
				{
					if (!isVisibilityAuto || (labelDescriptor.label && labelDescriptor.label.visible))
					{
						tickDescriptor.bounds = new Rectangle(tickDescriptor.pixel, layoutBounds.y, 0, layoutBounds.height);
						tickDescriptor.tickState = (labelDescriptor == tickDescriptor.majorLabelDescriptor) ? TickDescriptor.MAJOR : TickDescriptor.MINOR;
						visibleTicks.push(tickDescriptor);
					}
				}
			}

			return visibleTicks;
		}

		private function _layoutLabels(layoutBounds:Rectangle, tickVisibility:String, labelAlignment:String, labelVisibility:String, labelDescriptors:Array) : Array
		{
			if (labelVisibility == LabelVisibility.HIDE)
				return [];

			switch (labelAlignment)
			{
				case LabelAlignment.BEFORE_TICK:
					return this._layoutLabelsBeforeTick(layoutBounds, tickVisibility, labelAlignment, labelVisibility, labelDescriptors);
				case LabelAlignment.AFTER_TICK:
					return this._layoutLabelsAfterTick(layoutBounds, tickVisibility, labelAlignment, labelVisibility, labelDescriptors);
				default:
					return this._layoutLabelsAtTick(layoutBounds, tickVisibility, labelAlignment, labelVisibility, labelDescriptors);
			}
		}

		private function _layoutLabelsBeforeTick(layoutBounds:Rectangle, tickVisibility:String, labelAlignment:String, labelVisibility:String, labelDescriptors:Array) : Array
		{
			var visibleLabels:Array = new Array();

			var isVisibilityAuto:Boolean = (labelVisibility == LabelVisibility.AUTO);
			var numLabelDescriptors:int = labelDescriptors.length;
			var i:int;
			var j:int;
			var labelDescriptor:LabelDescriptor;
			var pixel1:Number;
			var pixel2:Number;
			var pixelDiff:Number;
			var pixelsOrdered:Boolean = this._pixelsOrdered;
			var childBounds:Rectangle = layoutBounds.clone();

			// compute stepSize for auto visibility
			var stepSize:int = 0;
			if (isVisibilityAuto && ((tickVisibility == TickVisibility.AUTO) || (tickVisibility == TickVisibility.HIDE)))
			{
				var labelWidth:Number;
				for (i = numLabelDescriptors - 1; i >= 0; i--)
				{
					labelDescriptor = labelDescriptors[i];
					labelWidth = labelDescriptor.measuredWidth;
					pixel1 = labelDescriptor.tickDescriptor.pixel;
					for (j = i - 1; j >= 0; j--)
					{
						pixel2 = labelDescriptors[j].tickDescriptor.pixel;
						pixelDiff = pixelsOrdered ? pixel1 - pixel2 : pixel2 - pixel1;
						if (pixelDiff < 0)
							pixelDiff = 0;

						if (pixelDiff >= labelWidth)
							break;
					}

					stepSize = Math.max(stepSize, i - j);
				}

				if (stepSize == 0)
					stepSize = numLabelDescriptors;
			}
			else
			{
				stepSize = 1;
			}

			// compute layout bounds for visible labels
			var count:int;
			var isMinor:Boolean;
			var labelDescriptor2:LabelDescriptor;
			i = numLabelDescriptors - 1;
			while (i >= 0)
			{
				labelDescriptor = labelDescriptors[i];
				isMinor = (labelDescriptor == labelDescriptor.tickDescriptor.minorLabelDescriptor);
				count = 0;

				for (j = i - 1; j >= 0; j--)
				{
					labelDescriptor2 = labelDescriptors[j];

					count++;
					if (count == stepSize)
						break;

					if (isMinor && (labelDescriptor2.tickDescriptor.tickState == TickDescriptor.MAJOR))
						break;

					labelDescriptor2.label.visible = false;
				}

				if ((count == stepSize) || (j < 0))
				{
					pixel1 = labelDescriptor.tickDescriptor.pixel;
					pixel2 = (j >= 0) ? labelDescriptor2.tickDescriptor.pixel : this._pixelStart;
					pixelDiff = pixelsOrdered ? pixel1 - pixel2 : pixel2 - pixel1;
					if (pixelDiff < 0)
						pixelDiff = 0;

					childBounds.x = pixelsOrdered ? pixel2 : pixel1;
					childBounds.width = pixelDiff;

					if (!isVisibilityAuto || (labelDescriptor.measuredWidth <= childBounds.width))
					{
						labelDescriptor.label.visible = true;
						labelDescriptor.bounds = childBounds.clone();
						labelDescriptor.tickDescriptor.labelState = (labelDescriptor == labelDescriptor.tickDescriptor.majorLabelDescriptor) ? TickDescriptor.MAJOR : TickDescriptor.MINOR;
						visibleLabels.push(labelDescriptor);
					}
					else
					{
						labelDescriptor.label.visible = false;
					}
				}
				else
				{
					labelDescriptor.label.visible = false;
				}

				i = j;
			}

			return visibleLabels;
		}

		private function _layoutLabelsAfterTick(layoutBounds:Rectangle, tickVisibility:String, labelAlignment:String, labelVisibility:String, labelDescriptors:Array) : Array
		{
			var visibleLabels:Array = new Array();

			var isVisibilityAuto:Boolean = (labelVisibility == LabelVisibility.AUTO);
			var numLabelDescriptors:int = labelDescriptors.length;
			var i:int;
			var j:int;
			var labelDescriptor:LabelDescriptor;
			var pixel1:Number;
			var pixel2:Number;
			var pixelDiff:Number;
			var pixelsOrdered:Boolean = this._pixelsOrdered;
			var childBounds:Rectangle = layoutBounds.clone();

			// compute stepSize for auto visibility
			var stepSize:int = 0;
			if (isVisibilityAuto && ((tickVisibility == TickVisibility.AUTO) || (tickVisibility == TickVisibility.HIDE)))
			{
				var labelWidth:Number;
				for (i = 0; i < numLabelDescriptors; i++)
				{
					labelDescriptor = labelDescriptors[i];
					labelWidth = labelDescriptor.measuredWidth;
					pixel1 = labelDescriptor.tickDescriptor.pixel;
					for (j = i + 1; j < numLabelDescriptors; j++)
					{
						pixel2 = labelDescriptors[j].tickDescriptor.pixel;
						pixelDiff = pixelsOrdered ? pixel2 - pixel1 : pixel1 - pixel2;
						if (pixelDiff < 0)
							pixelDiff = 0;

						if (pixelDiff >= labelWidth)
							break;
					}

					stepSize = Math.max(stepSize, j - i);
				}

				if (stepSize == 0)
					stepSize = numLabelDescriptors;
			}
			else
			{
				stepSize = 1;
			}

			// compute layout bounds for visible labels
			var count:int;
			var isMinor:Boolean;
			var labelDescriptor2:LabelDescriptor;
			i = 0;
			while (i < numLabelDescriptors)
			{
				labelDescriptor = labelDescriptors[i];
				isMinor = (labelDescriptor == labelDescriptor.tickDescriptor.minorLabelDescriptor);
				count = 0;

				for (j = i + 1; j < numLabelDescriptors; j++)
				{
					labelDescriptor2 = labelDescriptors[j];

					count++;
					if (count == stepSize)
						break;

					if (isMinor && (labelDescriptor2.tickDescriptor.tickState == TickDescriptor.MAJOR))
						break;

					labelDescriptor2.label.visible = false;
				}

				if ((count == stepSize) || (j == numLabelDescriptors))
				{
					pixel1 = labelDescriptor.tickDescriptor.pixel;
					pixel2 = (j < numLabelDescriptors) ? labelDescriptor2.tickDescriptor.pixel : this._pixelEnd;
					pixelDiff = pixelsOrdered ? pixel2 - pixel1 : pixel1 - pixel2;
					if (pixelDiff < 0)
						pixelDiff = 0;

					childBounds.x = pixelsOrdered ? pixel1 : pixel2;
					childBounds.width = pixelDiff;

					if (!isVisibilityAuto || (labelDescriptor.measuredWidth <= childBounds.width))
					{
						labelDescriptor.label.visible = true;
						labelDescriptor.bounds = childBounds.clone();
						labelDescriptor.tickDescriptor.labelState = (labelDescriptor == labelDescriptor.tickDescriptor.majorLabelDescriptor) ? TickDescriptor.MAJOR : TickDescriptor.MINOR;
						visibleLabels.push(labelDescriptor);
					}
					else
					{
						labelDescriptor.label.visible = false;
					}
				}
				else
				{
					labelDescriptor.label.visible = false;
				}

				i = j;
			}

			return visibleLabels;
		}

		private function _layoutLabelsAtTick(layoutBounds:Rectangle, tickVisibility:String, labelAlignment:String, labelVisibility:String, labelDescriptors:Array) : Array
		{
			var visibleLabels:Array = new Array();

			var isVisibilityAuto:Boolean = (labelVisibility == LabelVisibility.AUTO);
			var numLabelDescriptors:int = labelDescriptors.length;
			var i:int;
			var j:int;
			var labelDescriptor:LabelDescriptor;
			var labelDescriptor2:LabelDescriptor;
			var pixel1:Number;
			var pixel2:Number;
			var pixelDiff:Number;
			var pixelsOrdered:Boolean = this._pixelsOrdered;
			var childBounds:Rectangle = layoutBounds.clone();

			// compute stepSize for auto visibility
			var stepSize:int = 0;
			if (isVisibilityAuto)
			{
				var labelWidth:Number;
				for (i = 0; i < numLabelDescriptors; i++)
				{
					labelDescriptor = labelDescriptors[i];
					labelWidth = labelDescriptor.measuredWidth;
					pixel1 = labelDescriptor.tickDescriptor.pixel;
					for (j = i + 1; j < numLabelDescriptors; j++)
					{
						labelDescriptor2 = labelDescriptors[j];
						pixel2 = labelDescriptor2.tickDescriptor.pixel;
						pixelDiff = pixelsOrdered ? pixel2 - pixel1 : pixel1 - pixel2;
						if (pixelDiff < 0)
							pixelDiff = 0;

						if ((pixelDiff >= labelWidth) && (pixelDiff >= labelDescriptor2.measuredWidth))
							break;
					}

					stepSize = Math.max(stepSize, j - i);
				}

				if (stepSize == 0)
					stepSize = numLabelDescriptors;
			}
			else
			{
				stepSize = 1;
			}

			// compute layout bounds for visible labels
			var count:int;
			var isMinor:Boolean;
			i = 0;
			childBounds.width = 0;
			while (i < numLabelDescriptors)
			{
				labelDescriptor = labelDescriptors[i];
				isMinor = (labelDescriptor == labelDescriptor.tickDescriptor.minorLabelDescriptor);
				count = 0;

				for (j = i + 1; j < numLabelDescriptors; j++)
				{
					labelDescriptor2 = labelDescriptors[j];

					count++;
					if (count == stepSize)
						break;

					if (isMinor && (labelDescriptor2.tickDescriptor.tickState == TickDescriptor.MAJOR))
						break;

					labelDescriptor2.label.visible = false;
				}

				if ((!isMinor || (labelDescriptor.tickDescriptor.tickState != TickDescriptor.MAJOR)) && ((count == stepSize) || (j == numLabelDescriptors)))
				{
					pixel1 = labelDescriptor.tickDescriptor.pixel;

					childBounds.x = pixel1;

					labelDescriptor.label.visible = true;
					labelDescriptor.bounds = childBounds.clone();
					labelDescriptor.tickDescriptor.labelState = (labelDescriptor == labelDescriptor.tickDescriptor.majorLabelDescriptor) ? TickDescriptor.MAJOR : TickDescriptor.MINOR;
					visibleLabels.push(labelDescriptor);
				}
				else
				{
					labelDescriptor.label.visible = false;
				}

				i = j;
			}

			return visibleLabels;
		}

		private function _axis_changed(e:ChangedEvent) : void
		{
			switch (e.changeType)
			{
				case AxisChangeType.VALUE_ABSOLUTE_MAP:
					this.invalidate(AbstractAxisLabels.UPDATE_AXIS_EXTENDED_RANGE);
					this.invalidate(AbstractAxisLabels.COMPUTE_TICK_ABSOLUTES);
					break;
				case AxisChangeType.ABSOLUTE_RELATIVE_MAP:
					this.invalidate(AbstractAxisLabels.COMPUTE_TICK_ABSOLUTES);
					break;
				case AxisChangeType.CONTAINED_RANGE:
					this.invalidate(AbstractAxisLabels.UPDATE_AXIS_EXTENDED_RANGE);
					break;
				case PropertyChangedEvent.PROPERTY:
					var propertyChangedEvent:PropertyChangedEvent = e as PropertyChangedEvent;
					if (propertyChangedEvent && (propertyChangedEvent.source == this._axis))
					{
						var oldAxis:IAxis = propertyChangedEvent.oldValue as IAxis;
						var newAxis:IAxis = propertyChangedEvent.newValue as IAxis;

						if (oldAxis)
						{
							oldAxis.removeEventListener(AxisEvent.SET_EXTENDED_RANGE, this.validates(AbstractAxisLabels.UPDATE_AXIS_EXTENDED_RANGE));
							oldAxis.unregister(this._axis);
						}

						if (newAxis)
						{
							newAxis.register(this._axis);
							newAxis.addEventListener(AxisEvent.SET_EXTENDED_RANGE, this.validates(AbstractAxisLabels.UPDATE_AXIS_EXTENDED_RANGE));
							this.invalidate(AbstractAxisLabels.UPDATE_AXIS_EXTENDED_RANGE);
						}

						this.invalidate(AbstractAxisLabels.COMPUTE_TICK_ABSOLUTES);
					}
					break;
			}
		}

	}

}

import com.splunk.charting.labels.AxisLabel;
import flash.geom.Rectangle;

class TickDescriptor
{

	public static const NONE:uint = 0;
	public static const MINOR:uint = 1;
	public static const MAJOR:uint = 2;
	public static const BOTH:uint = 4;

	public var absolute:Number;
	public var relative:Number;
	public var pixel:Number;
	public var majorLabelDescriptor:LabelDescriptor;
	public var minorLabelDescriptor:LabelDescriptor;
	public var labelState:uint;
	public var tickState:uint;
	public var bounds:Rectangle;

	public function TickDescriptor(absolute:Number, relative:Number)
	{
		this.absolute = absolute;
		this.relative = relative;
	}

}

class LabelDescriptor
{

	public var tickDescriptor:TickDescriptor;
	public var text:String;
	public var label:AxisLabel;
	public var measuredWidth:Number;
	public var measuredHeight:Number;
	public var bounds:Rectangle;

	public function LabelDescriptor(tickDescriptor:TickDescriptor, text:String)
	{
		this.tickDescriptor = tickDescriptor;
		this.text = text;
	}

}
