package com.splunk.particles.properties
{

	import com.splunk.particles.renderers.LabelRenderer;
	import com.splunk.particles.renderers.SimpleRenderer;
	import com.splunk.particles.renderers.SwatchRenderer;
	import com.splunk.properties.BrushPalettePropertyParser;
	import com.splunk.properties.BrushPropertyParser;
	import com.splunk.properties.ColorPalettePropertyParser;
	import com.splunk.properties.LayoutSpritePropertyParser;
	import com.splunk.properties.ParseUtils;
	import com.splunk.properties.PropertyManager;
	import com.splunk.properties.ShapePalettePropertyParser;
	import com.splunk.properties.ShapePropertyParser;
	import com.splunk.properties.SpriteStylePropertyParser;
	import com.splunk.properties.TextBlockStylePropertyParser;

	public class RendererPropertyParser extends LayoutSpritePropertyParser
	{

		// Private Static Properties

		private static var _instance:RendererPropertyParser;

		// Public Static Methods

		public static function getInstance() : RendererPropertyParser
		{
			var instance:RendererPropertyParser = RendererPropertyParser._instance;
			if (!instance)
				instance = RendererPropertyParser._instance = new RendererPropertyParser();
			return instance;
		}

		// Protected Properties

		protected var brushPropertyParser:BrushPropertyParser;
		protected var shapePropertyParser:ShapePropertyParser;
		protected var colorPalettePropertyParser:ColorPalettePropertyParser;
		protected var brushPalettePropertyParser:BrushPalettePropertyParser;
		protected var shapePalettePropertyParser:ShapePalettePropertyParser;
		protected var spriteStylePropertyParser:SpriteStylePropertyParser;
		protected var textBlockStylePropertyParser:TextBlockStylePropertyParser;

		// Constructor

		public function RendererPropertyParser()
		{
			this.brushPropertyParser = BrushPropertyParser.getInstance();
			this.shapePropertyParser = ShapePropertyParser.getInstance();
			this.colorPalettePropertyParser = ColorPalettePropertyParser.getInstance();
			this.brushPalettePropertyParser = BrushPalettePropertyParser.getInstance();
			this.shapePalettePropertyParser = ShapePalettePropertyParser.getInstance();
			this.spriteStylePropertyParser = SpriteStylePropertyParser.getInstance();
			this.textBlockStylePropertyParser = TextBlockStylePropertyParser.getInstance();
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			switch (ParseUtils.trimWhiteSpace(str))
			{
				case "label":
					return new LabelRenderer();
				case "simple":
					return new SimpleRenderer();
				case "swatch":
					return new SwatchRenderer();
				default:
					return null;
			}
		}

		public override function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			if (value is LabelRenderer)
				return "label";
			if (value is SimpleRenderer)
				return "simple";
			if (value is SwatchRenderer)
				return "swatch";
			return null;
		}

		public override function registerProperties(propertyManager:PropertyManager, value:*) : void
		{
			super.registerProperties(propertyManager, value);

			if (value is LabelRenderer)
			{
				propertyManager.registerProperty("fieldName", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("labelColorPalette", this.colorPalettePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("labelStyle", this.textBlockStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("defaultLabelColor", this.numberPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is SimpleRenderer)
			{
				propertyManager.registerProperty("fieldName", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("particleColorPalette", this.colorPalettePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("particleSize", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("defaultParticleColor", this.numberPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is SwatchRenderer)
			{
				propertyManager.registerProperty("fieldName", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("swatchBrushPalette", this.brushPalettePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("swatchShapePalette", this.shapePalettePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("swatchStyle", this.spriteStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("swatchWidth", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("swatchHeight", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("defaultSwatchBrush", this.brushPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("defaultSwatchShape", this.shapePropertyParser, this.getProperty, this.setProperty);
			}
		}

	}

}
