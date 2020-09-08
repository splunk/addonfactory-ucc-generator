package com.splunk.particles.renderers
{

import com.jasongatt.graphics.brushes.*;

	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.graphics.brushes.IBrush;
	import com.jasongatt.graphics.brushes.SolidFillBrush;
	import com.jasongatt.graphics.shapes.IShape;
	import com.jasongatt.graphics.shapes.RectangleShape;
	import com.splunk.palettes.brush.IBrushPalette;
	import com.splunk.palettes.shape.IShapePalette;
	import com.splunk.particles.IParticle;
	import com.splunk.particles.IParticle2D;
	import com.splunk.utils.Style;
	import flash.display.Graphics;
	import flash.display.Shape;
	import flash.geom.Point;
	import flash.utils.Dictionary;

	public class SwatchRenderer extends AbstractRenderer
	{

		// Private Properties

		private var _fieldName:ObservableProperty;
		private var _swatchBrushPalette:ObservableProperty;
		private var _swatchShapePalette:ObservableProperty;
		private var _swatchStyle:ObservableProperty;
		private var _swatchWidth:ObservableProperty;
		private var _swatchHeight:ObservableProperty;
		private var _defaultSwatchBrush:ObservableProperty;
		private var _defaultSwatchShape:ObservableProperty;

		private var _swatches:Dictionary;

		// Constructor

		public function SwatchRenderer()
		{
			this._fieldName = new ObservableProperty(this, "fieldName", String, null, this.invalidates(AbstractRenderer.RENDER_PARTICLES));
			this._swatchBrushPalette = new ObservableProperty(this, "swatchBrushPalette", IBrushPalette, null, this.invalidates(AbstractRenderer.RENDER_PARTICLES));
			this._swatchShapePalette = new ObservableProperty(this, "swatchShapePalette", IShapePalette, null, this.invalidates(AbstractRenderer.RENDER_PARTICLES));
			this._swatchStyle = new ObservableProperty(this, "swatchStyle", Style, null, this.invalidates(AbstractRenderer.RENDER_PARTICLES));
			this._swatchWidth = new ObservableProperty(this, "swatchWidth", Number, 10, this.invalidates(AbstractRenderer.RENDER_PARTICLES));
			this._swatchHeight = new ObservableProperty(this, "swatchHeight", Number, 10, this.invalidates(AbstractRenderer.RENDER_PARTICLES));
			this._defaultSwatchBrush = new ObservableProperty(this, "defaultSwatchBrush", IBrush, new SolidFillBrush(0x000000, 1), this.invalidates(AbstractRenderer.RENDER_PARTICLES));
			this._defaultSwatchShape = new ObservableProperty(this, "defaultSwatchShape", IShape, new RectangleShape(), this.invalidates(AbstractRenderer.RENDER_PARTICLES));

			this._swatches = new Dictionary();
		}

		// Public Getters/Setters

		public function get fieldName() : String
		{
			return this._fieldName.value;
		}
		public function set fieldName(value:String) : void
		{
			this._fieldName.value = value;
		}

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

		protected override function processParticlesOverride(particles:Array) : void
		{
			var oldSwatches:Dictionary = this._swatches;
			var newSwatches:Dictionary = this._swatches = new Dictionary();
			var swatch:Shape;

			var particle:IParticle;
			var particle2D:IParticle2D;

			for each (particle in particles)
			{
				particle2D = particle as IParticle2D;
				if (particle2D)
				{
					swatch = oldSwatches[particle2D];
					if (swatch)
					{
						delete oldSwatches[particle2D];
					}
					else
					{
						swatch = new Shape();
						this.addChild(swatch);
					}

					newSwatches[particle2D] = swatch;
				}
			}

			for each (swatch in oldSwatches)
				this.removeChild(swatch);
		}

		protected override function renderParticlesOverride(particles:Array, layoutWidth:Number, layoutHeight:Number) : void
		{
			var fieldName:String = this._fieldName.value;
			var swatchBrushPalette:IBrushPalette = this._swatchBrushPalette.value;
			var swatchShapePalette:IShapePalette = this._swatchShapePalette.value;
			var swatchStyle:Style = this._swatchStyle.value;
			var swatchWidth:Number = Math.max(Math.round(this._swatchWidth.value), 0);
			var swatchHeight:Number = Math.max(Math.round(this._swatchHeight.value), 0);
			var defaultSwatchBrush:IBrush = this._defaultSwatchBrush.value;
			var defaultSwatchShape:IShape = this._defaultSwatchShape.value;

			var particle:IParticle;
			var particle2D:IParticle2D;
			var position:Point;
			var metadata:Dictionary;
			var alpha:Number;
			var scale:Number;
			var data:Object;
			var fieldValue:*;
			var fieldValueString:String;
			var fieldBrushes:Object = new Object();
			var fieldShapes:Object = new Object();

			var swatches:Dictionary = this._swatches;
			var swatch:Shape;
			var swatchGraphics:Graphics;
			var swatchBrush:IBrush;
			var swatchShape:IShape;

			var swatchStyleHasAlpha:Boolean = (swatchStyle && (swatchStyle.alpha is Number));
			var swatchStyleHasScaleX:Boolean = (swatchStyle && (swatchStyle.scaleX is Number));
			var swatchStyleHasScaleY:Boolean = (swatchStyle && (swatchStyle.scaleY is Number));

			if (!defaultSwatchBrush)
				defaultSwatchBrush = new SolidFillBrush(0x000000, 1);

			if (!defaultSwatchShape)
				defaultSwatchShape = new RectangleShape();

			for each (particle in particles)
			{
				particle2D = particle as IParticle2D;
				if (particle2D)
				{
					position = particle2D.position;
					metadata = particle2D.metadata;
					alpha = (metadata.alpha is Number) ? metadata.alpha : 1;
					scale = (metadata.scale is Number) ? metadata.scale : 1;
					data = metadata.data;
					fieldValue = (data && fieldName) ? data[fieldName] : null;
					fieldValueString = (fieldValue != null) ? String(fieldValue) : null;

					swatch = swatches[particle2D];
					if (swatch)
					{
						swatchGraphics = swatch.graphics;
						swatchGraphics.clear();

						swatchBrush = fieldValueString ? fieldBrushes[fieldValueString] : defaultSwatchBrush;
						if (!swatchBrush)
						{
							swatchBrush = swatchBrushPalette ? swatchBrushPalette.getBrush(fieldValueString, 0, 1) : null;
							if (!swatchBrush)
								swatchBrush = defaultSwatchBrush;
							fieldBrushes[fieldValueString] = swatchBrush;
						}

						swatchShape = fieldValueString ? fieldShapes[fieldValueString] : defaultSwatchShape;
						if (!swatchShape)
						{
							swatchShape = swatchShapePalette ? swatchShapePalette.getShape(fieldValueString, 0, 1) : null;
							if (!swatchShape)
								swatchShape = defaultSwatchShape;
							fieldShapes[fieldValueString] = swatchShape;
						}

						swatchShape.draw(swatchGraphics, 0, 0, swatchWidth, swatchHeight, swatchBrush);

						Style.applyStyle(swatch, swatchStyle);

						if (!swatchStyleHasAlpha)
							swatch.alpha = alpha;
						if (!swatchStyleHasScaleX)
							swatch.scaleX = scale;
						if (!swatchStyleHasScaleY)
							swatch.scaleY = scale;

						swatch.x = Math.round(position.x - (swatchWidth * swatch.scaleX) / 2);
						swatch.y = Math.round(position.y - (swatchHeight * swatch.scaleY) / 2);
					}
				}
			}
		}

	}

}
