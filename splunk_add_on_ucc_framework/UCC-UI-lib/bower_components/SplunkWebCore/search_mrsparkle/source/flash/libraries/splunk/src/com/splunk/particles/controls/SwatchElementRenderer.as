package com.splunk.particles.controls
{

	import com.jasongatt.core.ChangedEvent;
	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.graphics.brushes.IBrush;
	import com.jasongatt.graphics.brushes.SolidFillBrush;
	import com.jasongatt.graphics.shapes.IShape;
	import com.jasongatt.graphics.shapes.RectangleShape;
	import com.jasongatt.layout.LayoutSprite;
	import com.splunk.palettes.brush.IBrushPalette;
	import com.splunk.palettes.shape.IShapePalette;
	import com.splunk.particles.IParticle;
	import com.splunk.utils.Style;

	public class SwatchElementRenderer extends AbstractElementRenderer
	{

		// Private Properties

		private var _swatchBrushPalette:ObservableProperty;
		private var _swatchShapePalette:ObservableProperty;
		private var _swatchStyle:ObservableProperty;
		private var _swatchWidth:ObservableProperty;
		private var _swatchHeight:ObservableProperty;
		private var _defaultSwatchBrush:ObservableProperty;
		private var _defaultSwatchShape:ObservableProperty;

		private var _isSwatchBrushValid:Boolean = true;
		private var _isSwatchShapeValid:Boolean = true;
		private var _isSwatchStyleValid:Boolean = true;
		private var _isSwatchSizeValid:Boolean = true;

		// Constructor

		public function SwatchElementRenderer()
		{
			this._swatchBrushPalette = new ObservableProperty(this, "swatchBrushPalette", IBrushPalette, null, this._swatchBrush_changed);
			this._swatchShapePalette = new ObservableProperty(this, "swatchShapePalette", IShapePalette, null, this._swatchShape_changed);
			this._swatchStyle = new ObservableProperty(this, "swatchStyle", Style, null, this._swatchStyle_changed);
			this._swatchWidth = new ObservableProperty(this, "swatchWidth", Number, 10, this._swatchSize_changed);
			this._swatchHeight = new ObservableProperty(this, "swatchHeight", Number, 10, this._swatchSize_changed);
			this._defaultSwatchBrush = new ObservableProperty(this, "defaultSwatchBrush", IBrush, new SolidFillBrush(0x000000, 1), this._swatchBrush_changed);
			this._defaultSwatchShape = new ObservableProperty(this, "defaultSwatchShape", IShape, new RectangleShape(), this._swatchShape_changed);
		}

		// Public Getters/Setters

		public function get swatchBrushPalette() : IBrushPalette
		{
			return this._swatchBrushPalette.value;
		}
		public function set swatchBrushPalette(value:IBrushPalette) : void
		{
			this._swatchBrushPalette.value = value;
		}

		public function get swatchShapePalette() : IShapePalette
		{
			return this._swatchShapePalette.value;
		}
		public function set swatchShapePalette(value:IShapePalette) : void
		{
			this._swatchShapePalette.value = value;
		}

		public function get swatchStyle() : Style
		{
			return this._swatchStyle.value;
		}
		public function set swatchStyle(value:Style) : void
		{
			this._swatchStyle.value = value;
		}

		public function get swatchWidth() : Number
		{
			return this._swatchWidth.value;
		}
		public function set swatchWidth(value:Number) : void
		{
			this._swatchWidth.value = value;
		}

		public function get swatchHeight() : Number
		{
			return this._swatchHeight.value;
		}
		public function set swatchHeight(value:Number) : void
		{
			this._swatchHeight.value = value;
		}

		public function get defaultSwatchBrush() : IBrush
		{
			return this._defaultSwatchBrush.value;
		}
		public function set defaultSwatchBrush(value:IBrush) : void
		{
			this._defaultSwatchBrush.value = value;
		}

		public function get defaultSwatchShape() : IShape
		{
			return this._defaultSwatchShape.value;
		}
		public function set defaultSwatchShape(value:IShape) : void
		{
			this._defaultSwatchShape.value = value;
		}

		// Protected Methods

		protected override function updateElementsOverride(elements:Array) : void
		{
			var swatchElement:SwatchElement;

			var needsMeasure:Boolean = false;
			var needsLayout:Boolean = false;

			if (!this._isSwatchBrushValid)
			{
				this._isSwatchBrushValid = true;

				var swatchBrushPalette:IBrushPalette = this._swatchBrushPalette.value;
				var defaultSwatchBrush:IBrush = this._defaultSwatchBrush.value;
				var swatchBrush:IBrush;
				for each (swatchElement in elements)
				{
					swatchBrush = swatchBrushPalette ? swatchBrushPalette.getBrush(swatchElement.fieldValueString, 0, 1) : null;
					if (!swatchBrush)
						swatchBrush = defaultSwatchBrush ? defaultSwatchBrush : new SolidFillBrush(0x000000, 1);
					swatchElement.swatchBrush = swatchBrush;
				}

				needsLayout = true;
			}

			if (!this._isSwatchShapeValid)
			{
				this._isSwatchShapeValid = true;

				var swatchShapePalette:IShapePalette = this._swatchShapePalette.value;
				var defaultSwatchShape:IShape = this._defaultSwatchShape.value;
				var swatchShape:IShape;
				for each (swatchElement in elements)
				{
					swatchShape = swatchShapePalette ? swatchShapePalette.getShape(swatchElement.fieldValueString, 0, 1) : null;
					if (!swatchShape)
						swatchShape = defaultSwatchShape ? defaultSwatchShape : new RectangleShape();
					swatchElement.swatchShape = swatchShape;
				}

				needsLayout = true;
			}

			if (!this._isSwatchStyleValid)
			{
				this._isSwatchStyleValid = true;

				var swatchStyle:Style = this._swatchStyle.value;
				for each (swatchElement in elements)
					Style.applyStyle(swatchElement, swatchStyle);
			}

			if (!this._isSwatchSizeValid)
			{
				this._isSwatchSizeValid = true;

				var swatchWidth:Number = Math.max(Math.round(this._swatchWidth.value), 0);
				var swatchHeight:Number = Math.max(Math.round(this._swatchHeight.value), 0);
				for each (swatchElement in elements)
				{
					swatchElement.swatchWidth = swatchWidth;
					swatchElement.swatchHeight = swatchHeight;
				}

				needsMeasure = true;
			}

			if (needsMeasure)
			{
				for each (swatchElement in elements)
					swatchElement.invalidate(LayoutSprite.MEASURE);
			}
			else if (needsLayout)
			{
				for each (swatchElement in elements)
					swatchElement.invalidate(LayoutSprite.LAYOUT);
			}
		}

		protected override function createElementOverride(fieldValue:*) : LayoutSprite
		{
			var fieldValueString:String = String(fieldValue);

			var swatchBrushPalette:IBrushPalette = this._swatchBrushPalette.value;
			var swatchShapePalette:IShapePalette = this._swatchShapePalette.value;
			var swatchStyle:Style = this._swatchStyle.value;
			var swatchWidth:Number = Math.max(Math.round(this._swatchWidth.value), 0);
			var swatchHeight:Number = Math.max(Math.round(this._swatchHeight.value), 0);
			var defaultSwatchBrush:IBrush = this._defaultSwatchBrush.value;
			var defaultSwatchShape:IShape = this._defaultSwatchShape.value;

			var swatchBrush:IBrush = swatchBrushPalette ? swatchBrushPalette.getBrush(fieldValueString, 0, 1) : null;
			if (!swatchBrush)
				swatchBrush = defaultSwatchBrush ? defaultSwatchBrush : new SolidFillBrush(0x000000, 1);

			var swatchShape:IShape = swatchShapePalette ? swatchShapePalette.getShape(fieldValueString, 0, 1) : null;
			if (!swatchShape)
				swatchShape = defaultSwatchShape ? defaultSwatchShape : new RectangleShape();

			var swatchElement:SwatchElement = new SwatchElement(fieldValueString, swatchBrush, swatchShape, swatchWidth, swatchHeight);

			Style.applyStyle(swatchElement, swatchStyle);

			return swatchElement;
		}

		// Private Methods

		private function _swatchBrush_changed(e:ChangedEvent) : void
		{
			this._isSwatchBrushValid = false;

			this.invalidate(AbstractElementRenderer.UPDATE_ELEMENTS);
		}

		private function _swatchShape_changed(e:ChangedEvent) : void
		{
			this._isSwatchShapeValid = false;

			this.invalidate(AbstractElementRenderer.UPDATE_ELEMENTS);
		}

		private function _swatchStyle_changed(e:ChangedEvent) : void
		{
			this._isSwatchStyleValid = false;

			this.invalidate(AbstractElementRenderer.UPDATE_ELEMENTS);
		}

		private function _swatchSize_changed(e:ChangedEvent) : void
		{
			this._isSwatchSizeValid = false;

			this.invalidate(AbstractElementRenderer.UPDATE_ELEMENTS);
		}

	}

}

import com.jasongatt.graphics.brushes.IBrush;
import com.jasongatt.graphics.shapes.IShape;
import com.jasongatt.layout.LayoutSprite;
import com.jasongatt.layout.Size;
import flash.display.Graphics;

class SwatchElement extends LayoutSprite
{

	// Public Properties

	public var fieldValueString:String;
	public var swatchBrush:IBrush;
	public var swatchShape:IShape;
	public var swatchWidth:Number;
	public var swatchHeight:Number;

	// Constructor

	public function SwatchElement(fieldValueString:String, swatchBrush:IBrush, swatchShape:IShape, swatchWidth:Number, swatchHeight:Number)
	{
		this.fieldValueString = fieldValueString;
		this.swatchBrush = swatchBrush;
		this.swatchShape = swatchShape;
		this.swatchWidth = swatchWidth;
		this.swatchHeight = swatchHeight;

		this.snap = true;
	}

	// Protected Methods

	protected override function measureOverride(availableSize:Size) : Size
	{
		return new Size(this.swatchWidth, this.swatchHeight);
	}

	protected override function layoutOverride(layoutSize:Size) : Size
	{
		var graphics:Graphics = this.graphics;
		graphics.clear();

		this.swatchShape.draw(graphics, 0, 0, this.swatchWidth, this.swatchHeight, this.swatchBrush);

		return layoutSize;
	}

}
