package com.splunk.charting.controls
{

	import com.jasongatt.controls.OverflowMode;
	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.core.ValidatePass;
	import com.jasongatt.layout.Alignment;
	import com.jasongatt.layout.LayoutSprite;
	import com.jasongatt.layout.Size;
	import com.jasongatt.layout.Visibility;
	import com.splunk.charting.charts.AbstractChart;
	import com.splunk.charting.charts.DataSprite;
	import com.splunk.charting.charts.SeriesSwatch;
	import com.splunk.charting.charts.SeriesSwatchSprite;
	import com.splunk.controls.Label;
	import com.splunk.utils.Style;
	import flash.display.DisplayObject;
	import flash.geom.Rectangle;
	import flash.text.TextFormat;

	public class DataSpriteTip extends LayoutSprite
	{

		// Private Properties

		private var _dataSprite:ObservableProperty;
		private var _swatchStyle:ObservableProperty;
		private var _fieldStyle:ObservableProperty;
		private var _valueStyle:ObservableProperty;
		private var _valueFormat:ObservableProperty;

		private var _swatchSprite:SeriesSwatchSprite;
		private var _fieldSprites:Array;
		private var _valueSprites:Array;
		private var _fieldsWidth:Number = 0;
		private var _valuesWidth:Number = 0;

		// Constructor

		public function DataSpriteTip()
		{
			this._dataSprite = new ObservableProperty(this, "dataSprite", DataSprite, null, this.invalidates(LayoutSprite.MEASURE));
			this._swatchStyle = new ObservableProperty(this, "swatchStyle", Style, null, this.invalidates(LayoutSprite.MEASURE));
			this._fieldStyle = new ObservableProperty(this, "fieldStyle", Style, null, this.invalidates(LayoutSprite.MEASURE));
			this._valueStyle = new ObservableProperty(this, "valueStyle", Style, null, this.invalidates(LayoutSprite.MEASURE));
			this._valueFormat = new ObservableProperty(this, "valueFormat", Function, null, this.invalidates(LayoutSprite.MEASURE));

			this._swatchSprite = new SeriesSwatchSprite();
			this._fieldSprites = new Array();
			this._valueSprites = new Array();

			this.mouseEnabled = false;
			this.mouseChildren = false;

			this.addChild(this._swatchSprite);
		}

		// Public Getters/Setters

		public function get dataSprite() : DataSprite
		{
			return this._dataSprite.value;
		}
		public function set dataSprite(value:DataSprite) : void
		{
			this._dataSprite.value = value;
		}

		public function get swatchStyle() : Style
		{
			return this._swatchStyle.value;
		}
		public function set swatchStyle(value:Style) : void
		{
			this._swatchStyle.value = value;
		}

		public function get fieldStyle() : Style
		{
			return this._fieldStyle.value;
		}
		public function set fieldStyle(value:Style) : void
		{
			this._fieldStyle.value = value;
		}

		public function get valueStyle() : Style
		{
			return this._valueStyle.value;
		}
		public function set valueStyle(value:Style) : void
		{
			this._valueStyle.value = value;
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

		// Protected Methods

		protected override function measureOverride(availableSize:Size) : Size
		{
			var swatchSprite:SeriesSwatchSprite = this._swatchSprite;
			var fieldSprites:Array = this._fieldSprites;
			var valueSprites:Array = this._valueSprites;
			var swatch:SeriesSwatch;
			var fieldSprite:Label;
			var valueSprite:Label;

			var swatchStyle:Style = this._swatchStyle.value;

			var numItems:int = 0;
			var i:int;

			var dataSprite:DataSprite = this._dataSprite.value;
			if (dataSprite)
			{
				var chart:AbstractChart = dataSprite.chart;
				var seriesName:String = dataSprite.seriesName;
				if (chart && seriesName)
					swatch = chart.getSeriesSwatch(seriesName);

				var data:Object = dataSprite.data;
				var fields:Array = dataSprite.fields;
				if (data && fields)
				{
					var fieldStyle:Style = this._fieldStyle.value;
					var valueStyle:Style = this._valueStyle.value;
					var valueFormat:Function = this._valueFormat.value;
					var numSprites:int = fieldSprites.length;

					numItems = fields.length;
					var field:String;
					var value:*;

					for (i = 0; i < numItems; i++)
					{
						field = fields[i];
						value = data[field];

						if (i < numSprites)
						{
							fieldSprite = fieldSprites[i];
							valueSprite = valueSprites[i];
						}
						else
						{
							fieldSprite = new Label();
							fieldSprite.overflowMode = OverflowMode.ELLIPSIS_MIDDLE;
							fieldSprite.defaultTextFormat = new TextFormat("_sans", 12, 0xCCCCCC);
							fieldSprite.alignmentX = Alignment.LEFT;
							fieldSprite.alignmentY = Alignment.CENTER;
							fieldSprites.push(fieldSprite);
							this.addChild(fieldSprite);

							valueSprite = new Label();
							valueSprite.overflowMode = OverflowMode.ELLIPSIS_MIDDLE;
							valueSprite.defaultTextFormat = new TextFormat("_sans", 12, 0xFFFFFF);
							valueSprite.alignmentX = Alignment.LEFT;
							valueSprite.alignmentY = Alignment.CENTER;
							valueSprites.push(valueSprite);
							this.addChild(valueSprite);
						}

						fieldSprite.text = field ? field : "";
						Style.applyStyle(fieldSprite, fieldStyle);

						if (value == null)
							valueSprite.text = "(null)";
						else if (valueFormat == null)
							valueSprite.text = String(value);
						else
							valueSprite.text = valueFormat(dataSprite, field, value);
						Style.applyStyle(valueSprite, valueStyle);
					}
				}
			}

			for (i = fieldSprites.length - 1; i >= numItems; i--)
			{
				fieldSprite = fieldSprites.pop();
				this.removeChild(fieldSprite);

				valueSprite = valueSprites.pop();
				this.removeChild(valueSprite);
			}

			var childSize:Size = new Size(availableSize.width / 3, Infinity);

			Style.applyStyle(swatchSprite, swatchStyle);
			swatchSprite.swatch = swatch;
			swatchSprite.visibility = swatch ? Visibility.VISIBLE : Visibility.COLLAPSED;
			swatchSprite.measure(childSize);
			var swatchWidth:Number = swatchSprite.measuredWidth;
			var swatchHeight:Number = swatchSprite.measuredHeight;

			var fieldsWidth:Number = 0;
			childSize.width = Math.max(availableSize.width - swatchWidth, 0) / 2;
			for (i = 0; i < numItems; i++)
			{
				fieldSprite = fieldSprites[i];
				fieldSprite.measure(childSize);
				fieldsWidth = Math.max(fieldSprite.measuredWidth, fieldsWidth);
			}

			var valuesWidth:Number = 0;
			childSize.width = Math.max(availableSize.width - swatchWidth - fieldsWidth, 0);
			for (i = 0; i < numItems; i++)
			{
				valueSprite = valueSprites[i];
				valueSprite.measure(childSize);
				valuesWidth = Math.max(valueSprite.measuredWidth, valuesWidth);
			}

			var itemsHeight:Number = 0;
			for (i = 0; i < numItems; i++)
			{
				fieldSprite = fieldSprites[i];
				valueSprite = valueSprites[i];
				itemsHeight += Math.max(fieldSprite.measuredHeight, valueSprite.measuredHeight);
			}

			this._fieldsWidth = fieldsWidth;
			this._valuesWidth = valuesWidth;

			var measuredSize:Size = new Size();
			measuredSize.width = swatchWidth + fieldsWidth + valuesWidth;
			measuredSize.height = Math.max(swatchHeight, itemsHeight);

			return measuredSize;
		}

		protected override function layoutOverride(layoutSize:Size) : Size
		{
			var swatchSprite:SeriesSwatchSprite = this._swatchSprite;
			var fieldSprites:Array = this._fieldSprites;
			var valueSprites:Array = this._valueSprites;
			var fieldSprite:Label;
			var valueSprite:Label;
			var numItems:int = fieldSprites.length;
			var i:int;

			var swatchWidth:Number = swatchSprite.measuredWidth;
			var fieldsWidth:Number = this._fieldsWidth;
			var valuesWidth:Number = this._valuesWidth;

			var childBounds:Rectangle = new Rectangle();

			childBounds.width = swatchWidth;
			childBounds.height = layoutSize.height;
			swatchSprite.layout(childBounds);

			for (i = 0; i < numItems; i++)
			{
				fieldSprite = fieldSprites[i];
				valueSprite = valueSprites[i];

				childBounds.height = Math.max(fieldSprite.measuredHeight, valueSprite.measuredHeight);

				childBounds.x = swatchWidth;
				childBounds.width = fieldsWidth;
				fieldSprite.layout(childBounds);

				childBounds.x += fieldsWidth;
				childBounds.width = valuesWidth;
				valueSprite.layout(childBounds);

				childBounds.y += childBounds.height;
			}

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
			this.invalidate(LayoutSprite.LAYOUT);
		}

		protected override function onChildInvalidated(child:DisplayObject, pass:ValidatePass) : void
		{
			switch (pass)
			{
				case LayoutSprite.MEASURE:
					this.invalidate(LayoutSprite.MEASURE);
					break;
			}
		}

	}

}
