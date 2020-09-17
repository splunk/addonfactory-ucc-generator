package com.splunk.particles.controls
{

	import com.jasongatt.core.ChangedEvent;
	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.graphics.brushes.IBrush;
	import com.jasongatt.graphics.brushes.SolidFillBrush;
	import com.jasongatt.graphics.shapes.IShape;
	import com.jasongatt.graphics.shapes.RectangleShape;
	import com.jasongatt.layout.LayoutSprite;
	import com.jasongatt.layout.Orientation;
	import com.jasongatt.motion.clocks.ClockEvent;
	import com.jasongatt.motion.clocks.FrameClock;
	import com.jasongatt.motion.clocks.IClock;
	import com.splunk.palettes.brush.IBrushPalette;
	import com.splunk.palettes.shape.IShapePalette;
	import com.splunk.particles.IParticle;
	import com.splunk.utils.Style;

	public class HistogramElementRenderer extends AbstractElementRenderer
	{

		// Private Properties

		private var _columnOrientation:ObservableProperty;
		private var _columnBrushPalette:ObservableProperty;
		private var _columnShapePalette:ObservableProperty;
		private var _columnStyle:ObservableProperty;
		private var _columnSize:ObservableProperty;
		private var _defaultColumnBrush:ObservableProperty;
		private var _defaultColumnShape:ObservableProperty;
		private var _windowTime:ObservableProperty;
		private var _clock:IClock;

		private var _maxParticles:Count;
		private var _defaultClock:FrameClock;
		private var _time:Number = 0;
		private var _isColumnOrientationValid:Boolean = true;
		private var _isColumnBrushValid:Boolean = true;
		private var _isColumnShapeValid:Boolean = true;
		private var _isColumnStyleValid:Boolean = true;
		private var _isColumnSizeValid:Boolean = true;
		private var _isMaxParticlesValid:Boolean = true;

		// Constructor

		public function HistogramElementRenderer()
		{
			this._columnOrientation = new ObservableProperty(this, "columnOrientation", String, Orientation.Y, this._columnOrientation_changed);
			this._columnBrushPalette = new ObservableProperty(this, "columnBrushPalette", IBrushPalette, null, this._columnBrush_changed);
			this._columnShapePalette = new ObservableProperty(this, "columnShapePalette", IShapePalette, null, this._columnShape_changed);
			this._columnStyle = new ObservableProperty(this, "columnStyle", Style, null, this._columnStyle_changed);
			this._columnSize = new ObservableProperty(this, "columnSize", Number, 5, this._columnSize_changed);
			this._defaultColumnBrush = new ObservableProperty(this, "defaultColumnBrush", IBrush, new SolidFillBrush(0x000000, 1), this._columnBrush_changed);
			this._defaultColumnShape = new ObservableProperty(this, "defaultColumnShape", IShape, new RectangleShape(), this._columnShape_changed);
			this._windowTime = new ObservableProperty(this, "windowTime", Number, 30, this.invalidates(AbstractElementRenderer.UPDATE_ELEMENTS));

			this._maxParticles = new Count();

			this._defaultClock = new FrameClock(true);
			this._defaultClock.addEventListener(ClockEvent.TICK, this._clock_tick);
		}

		// Public Getters/Setters

		public function get columnOrientation() : String
		{
			return this._columnOrientation.value;
		}
		public function set columnOrientation(value:String) : void
		{
			switch (value)
			{
				case Orientation.X:
				case Orientation.Y:
					break;
				default:
					value = Orientation.Y;
					break;
			}
			this._columnOrientation.value = value;
		}

		public function get columnBrushPalette() : IBrushPalette
		{
			return this._columnBrushPalette.value;
		}
		public function set columnBrushPalette(value:IBrushPalette) : void
		{
			this._columnBrushPalette.value = value;
		}

		public function get columnShapePalette() : IShapePalette
		{
			return this._columnShapePalette.value;
		}
		public function set columnShapePalette(value:IShapePalette) : void
		{
			this._columnShapePalette.value = value;
		}

		public function get columnStyle() : Style
		{
			return this._columnStyle.value;
		}
		public function set columnStyle(value:Style) : void
		{
			this._columnStyle.value = value;
		}

		public function get columnSize() : Number
		{
			return this._columnSize.value;
		}
		public function set columnSize(value:Number) : void
		{
			this._columnSize.value = value;
		}

		public function get defaultColumnBrush() : IBrush
		{
			return this._defaultColumnBrush.value;
		}
		public function set defaultColumnBrush(value:IBrush) : void
		{
			this._defaultColumnBrush.value = value;
		}

		public function get defaultColumnShape() : IShape
		{
			return this._defaultColumnShape.value;
		}
		public function set defaultColumnShape(value:IShape) : void
		{
			this._defaultColumnShape.value = value;
		}

		public function get windowTime() : Number
		{
			return this._windowTime.value;
		}
		public function set windowTime(value:Number) : void
		{
			this._windowTime.value = value;
		}

		public function get clock() : IClock
		{
			return this._clock;
		}
		public function set clock(value:IClock) : void
		{
			if (this._clock == value)
				return;

			if (this._clock)
			{
				this._clock.removeEventListener(ClockEvent.TICK, this._clock_tick);
			}
			else
			{
				this._defaultClock.removeEventListener(ClockEvent.TICK, this._clock_tick);
				this._defaultClock.stop();
			}

			this._clock = value;

			if (this._clock)
			{
				this._clock.addEventListener(ClockEvent.TICK, this._clock_tick, false, 0, true);
			}
			else
			{
				this._defaultClock.addEventListener(ClockEvent.TICK, this._clock_tick);
				this._defaultClock.start();
			}
		}

		// Protected Methods

		protected override function updateElementsOverride(elements:Array) : void
		{
			var columnElement:ColumnElement;

			var needsMeasure:Boolean = false;
			var needsLayout:Boolean = false;

			var windowTime:Number = Math.max(this._windowTime.value, 0);
			var time:Number = this._time;
			this._time = 0;
			for each (columnElement in elements)
			{
				if (columnElement.update(time, windowTime))
					this._isMaxParticlesValid = false;
			}

			if (!this._isColumnOrientationValid)
			{
				this._isColumnOrientationValid = true;

				var columnOrientation:String = this._columnOrientation.value;
				for each (columnElement in elements)
					columnElement.columnOrientation = columnOrientation;

				needsMeasure = true;
			}

			if (!this._isColumnBrushValid)
			{
				this._isColumnBrushValid = true;

				var columnBrushPalette:IBrushPalette = this._columnBrushPalette.value;
				var defaultColumnBrush:IBrush = this._defaultColumnBrush.value;
				var columnBrush:IBrush;
				for each (columnElement in elements)
				{
					columnBrush = columnBrushPalette ? columnBrushPalette.getBrush(columnElement.fieldValueString, 0, 1) : null;
					if (!columnBrush)
						columnBrush = defaultColumnBrush ? defaultColumnBrush : new SolidFillBrush(0x000000, 1);
					columnElement.columnBrush = columnBrush;
				}

				needsLayout = true;
			}

			if (!this._isColumnShapeValid)
			{
				this._isColumnShapeValid = true;

				var columnShapePalette:IShapePalette = this._columnShapePalette.value;
				var defaultColumnShape:IShape = this._defaultColumnShape.value;
				var columnShape:IShape;
				for each (columnElement in elements)
				{
					columnShape = columnShapePalette ? columnShapePalette.getShape(columnElement.fieldValueString, 0, 1) : null;
					if (!columnShape)
						columnShape = defaultColumnShape ? defaultColumnShape : new RectangleShape();
					columnElement.columnShape = columnShape;
				}

				needsLayout = true;
			}

			if (!this._isColumnStyleValid)
			{
				this._isColumnStyleValid = true;

				var columnStyle:Style = this._columnStyle.value;
				for each (columnElement in elements)
					Style.applyStyle(columnElement, columnStyle);
			}

			if (!this._isColumnSizeValid)
			{
				this._isColumnSizeValid = true;

				var columnSize:Number = Math.max(Math.round(this._columnSize.value), 0);

				for each (columnElement in elements)
					columnElement.columnSize = columnSize;

				needsMeasure = true;
			}

			if (!this._isMaxParticlesValid)
			{
				this._isMaxParticlesValid = true;

				var maxParticles:int = 0;
				for each (columnElement in elements)
					maxParticles = Math.max(maxParticles, columnElement.numParticles);

				if (maxParticles != this._maxParticles.count)
				{
					this._maxParticles.count = maxParticles;
					needsMeasure = true;
				}
			}

			if (needsMeasure)
			{
				for each (columnElement in elements)
					columnElement.invalidate(LayoutSprite.MEASURE);
			}
			else if (needsLayout)
			{
				for each (columnElement in elements)
					columnElement.invalidate(LayoutSprite.LAYOUT);
			}
		}

		protected override function createElementOverride(fieldValue:*) : LayoutSprite
		{
			var fieldValueString:String = String(fieldValue);

			var columnOrientation:String = this._columnOrientation.value;
			var columnBrushPalette:IBrushPalette = this._columnBrushPalette.value;
			var columnShapePalette:IShapePalette = this._columnShapePalette.value;
			var columnStyle:Style = this._columnStyle.value;
			var columnSize:Number = Math.max(Math.round(this._columnSize.value), 0);
			var defaultColumnBrush:IBrush = this._defaultColumnBrush.value;
			var defaultColumnShape:IShape = this._defaultColumnShape.value;

			var columnBrush:IBrush = columnBrushPalette ? columnBrushPalette.getBrush(fieldValueString, 0, 1) : null;
			if (!columnBrush)
				columnBrush = defaultColumnBrush ? defaultColumnBrush : new SolidFillBrush(0x000000, 1);

			var columnShape:IShape = columnShapePalette ? columnShapePalette.getShape(fieldValueString, 0, 1) : null;
			if (!columnShape)
				columnShape = defaultColumnShape ? defaultColumnShape : new RectangleShape();

			var columnElement:ColumnElement = new ColumnElement(fieldValueString, columnOrientation, columnBrush, columnShape, columnSize, this._maxParticles);

			Style.applyStyle(columnElement, columnStyle);

			return columnElement;
		}

		protected override function disposeElementOverride(element:LayoutSprite) : void
		{
			var columnElement:ColumnElement = element as ColumnElement;
			if (!columnElement)
				return;

			if (columnElement.numParticles >= this._maxParticles.count)
			{
				this._isMaxParticlesValid = false;
				this.invalidate(AbstractElementRenderer.UPDATE_ELEMENTS);
			}
		}

		protected override function onParticleCollectedOverride(particle:IParticle, element:LayoutSprite) : void
		{
			var columnElement:ColumnElement = element as ColumnElement;
			if (!columnElement)
				return;

			columnElement.hit();

			if (columnElement.numParticles > this._maxParticles.count)
			{
				this._isMaxParticlesValid = false;
				this.invalidate(AbstractElementRenderer.UPDATE_ELEMENTS);
			}
		}

		// Private Methods

		private function _columnOrientation_changed(e:ChangedEvent) : void
		{
			this._isColumnOrientationValid = false;

			this.invalidate(AbstractElementRenderer.UPDATE_ELEMENTS);
		}

		private function _columnBrush_changed(e:ChangedEvent) : void
		{
			this._isColumnBrushValid = false;

			this.invalidate(AbstractElementRenderer.UPDATE_ELEMENTS);
		}

		private function _columnShape_changed(e:ChangedEvent) : void
		{
			this._isColumnShapeValid = false;

			this.invalidate(AbstractElementRenderer.UPDATE_ELEMENTS);
		}

		private function _columnStyle_changed(e:ChangedEvent) : void
		{
			this._isColumnStyleValid = false;

			this.invalidate(AbstractElementRenderer.UPDATE_ELEMENTS);
		}

		private function _columnSize_changed(e:ChangedEvent) : void
		{
			this._isColumnSizeValid = false;

			this.invalidate(AbstractElementRenderer.UPDATE_ELEMENTS);
		}

		private function _clock_tick(e:ClockEvent) : void
		{
			this._time += e.time;

			this.invalidate(AbstractElementRenderer.UPDATE_ELEMENTS);
		}

	}

}

import com.jasongatt.graphics.brushes.IBrush;
import com.jasongatt.graphics.shapes.IShape;
import com.jasongatt.layout.LayoutSprite;
import com.jasongatt.layout.Orientation;
import com.jasongatt.layout.Size;
import com.jasongatt.utils.LinkedList;
import flash.display.Graphics;

class ColumnElement extends LayoutSprite
{

	// Public Properties

	public var fieldValueString:String;
	public var columnOrientation:String;
	public var columnBrush:IBrush;
	public var columnShape:IShape;
	public var columnSize:Number;
	public var numParticles:int = 0;

	// Private Properties

	private var _columnSize2:Number = 0;
	private var _maxParticles:Count;
	private var _bucket:Count;
	private var _buckets:LinkedList;
	private var _bucketTime:Number = 0;
	private var _maxBucketTime:Number = 0.5;

	// Constructor

	public function ColumnElement(fieldValueString:String, columnOrientation:String, columnBrush:IBrush, columnShape:IShape, columnSize:Number, maxParticles:Count)
	{
		this.fieldValueString = fieldValueString;
		this.columnOrientation = columnOrientation;
		this.columnBrush = columnBrush;
		this.columnShape = columnShape;
		this.columnSize = columnSize;

		this._maxParticles = maxParticles;

		this._bucket = new Count();
		this._buckets = new LinkedList();
		this._buckets.addLast(this._bucket);

		this.snap = true;
	}

	// Public Methods

	public function hit() : void
	{
		this._bucket.count++;
		this.numParticles++;
		this.invalidate(LayoutSprite.MEASURE);
	}

	public function update(time:Number, windowTime:Number) : Boolean
	{
		var numParticles:int = this.numParticles;

		var maxBucketTime:Number = this._maxBucketTime;
		var bucketTime:Number = this._bucketTime + time;
		var buckets:LinkedList = this._buckets;
		var bucket:Count;

		while (bucketTime > maxBucketTime)
		{
			bucketTime -= maxBucketTime;
			bucket = new Count();
			buckets.addLast(bucket);
		}
		this._bucketTime = bucketTime;
		if (bucket)
			this._bucket = bucket;

		var numBuckets:int = Math.round(windowTime / maxBucketTime);
		if (numBuckets < 1)
			numBuckets = 1;
		for (var i:int = buckets.length; i > numBuckets; i--)
		{
			bucket = buckets.removeFirst();
			numParticles -= bucket.count;
		}

		if (numParticles != this.numParticles)
		{
			this.numParticles = numParticles;
			this.invalidate(LayoutSprite.MEASURE);
			return true;
		}

		return false;
	}

	// Protected Methods

	protected override function measureOverride(availableSize:Size) : Size
	{
		var columnSize:Number = this.columnSize;
		var columnSize2:Number;
		var scale:Number;
		var measureSize:Size;

		if (this.columnOrientation == Orientation.X)
		{
			scale = availableSize.width / (columnSize * this._maxParticles.count);
			if ((scale > 1) || (scale != scale))
				scale = 1;

			columnSize2 = (this.numParticles > 0) ? Math.max(Math.round(columnSize * this.numParticles * scale), 1) : 0;

			measureSize = new Size(columnSize2, columnSize);
		}
		else
		{
			scale = availableSize.height / (columnSize * this._maxParticles.count);
			if ((scale > 1) || (scale != scale))
				scale = 1;

			columnSize2 = (this.numParticles > 0) ? Math.max(Math.round(columnSize * this.numParticles * scale), 1) : 0;

			measureSize = new Size(columnSize, columnSize2);
		}

		this._columnSize2 = columnSize2;

		return measureSize;
	}

	protected override function layoutOverride(layoutSize:Size) : Size
	{
		var graphics:Graphics = this.graphics;
		graphics.clear();

		if (this.columnOrientation == Orientation.X)
			this.columnShape.draw(graphics, 0, 0, this._columnSize2, this.columnSize, this.columnBrush);
		else
			this.columnShape.draw(graphics, 0, 0, this.columnSize, this._columnSize2, this.columnBrush);

		return layoutSize;
	}

}

class Count
{

	// Public Properties

	public var count:int = 0;

	// Constructor

	public function Count()
	{
	}

}
