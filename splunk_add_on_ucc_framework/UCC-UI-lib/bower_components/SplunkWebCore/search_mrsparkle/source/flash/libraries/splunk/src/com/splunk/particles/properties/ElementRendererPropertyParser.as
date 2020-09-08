package com.splunk.particles.properties
{

	import com.splunk.particles.controls.GroupElementRenderer;
	import com.splunk.particles.controls.HistogramElementRenderer;
	import com.splunk.particles.controls.LabelElementRenderer;
	import com.splunk.particles.controls.SwatchElementRenderer;
	import com.splunk.properties.AbstractPropertyParser;
	import com.splunk.properties.ArrayPropertyParser;
	import com.splunk.properties.BrushPalettePropertyParser;
	import com.splunk.properties.BrushPropertyParser;
	import com.splunk.properties.ColorPalettePropertyParser;
	import com.splunk.properties.LayoutSpriteStylePropertyParser;
	import com.splunk.properties.NumberPropertyParser;
	import com.splunk.properties.ParseUtils;
	import com.splunk.properties.PropertyManager;
	import com.splunk.properties.ShapePalettePropertyParser;
	import com.splunk.properties.ShapePropertyParser;
	import com.splunk.properties.StringPropertyParser;
	import com.splunk.properties.TextBlockStylePropertyParser;

	public class ElementRendererPropertyParser extends AbstractPropertyParser
	{

		// Private Static Properties

		private static var _instance:ElementRendererPropertyParser;

		// Public Static Methods

		public static function getInstance() : ElementRendererPropertyParser
		{
			var instance:ElementRendererPropertyParser = ElementRendererPropertyParser._instance;
			if (!instance)
				instance = ElementRendererPropertyParser._instance = new ElementRendererPropertyParser();
			return instance;
		}

		// Protected Properties

		protected var numberPropertyParser:NumberPropertyParser;
		protected var stringPropertyParser:StringPropertyParser;
		protected var layoutSpriteStylePropertyParser:LayoutSpriteStylePropertyParser;
		protected var textBlockStylePropertyParser:TextBlockStylePropertyParser;
		protected var brushPropertyParser:BrushPropertyParser;
		protected var shapePropertyParser:ShapePropertyParser;
		protected var colorPalettePropertyParser:ColorPalettePropertyParser;
		protected var brushPalettePropertyParser:BrushPalettePropertyParser;
		protected var shapePalettePropertyParser:ShapePalettePropertyParser;
		protected var layoutPolicyPropertyParser:ExtendedLayoutPolicyPropertyParser;
		protected var elementRendererArrayPropertyParser:ArrayPropertyParser;

		// Constructor

		public function ElementRendererPropertyParser()
		{
			this.numberPropertyParser = NumberPropertyParser.getInstance();
			this.stringPropertyParser = StringPropertyParser.getInstance();
			this.layoutSpriteStylePropertyParser = LayoutSpriteStylePropertyParser.getInstance();
			this.textBlockStylePropertyParser = TextBlockStylePropertyParser.getInstance();
			this.brushPropertyParser = BrushPropertyParser.getInstance();
			this.shapePropertyParser = ShapePropertyParser.getInstance();
			this.colorPalettePropertyParser = ColorPalettePropertyParser.getInstance();
			this.brushPalettePropertyParser = BrushPalettePropertyParser.getInstance();
			this.shapePalettePropertyParser = ShapePalettePropertyParser.getInstance();
			this.layoutPolicyPropertyParser = ExtendedLayoutPolicyPropertyParser.getInstance();
			this.elementRendererArrayPropertyParser = ArrayPropertyParser.getInstance(this);
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			switch (ParseUtils.trimWhiteSpace(str))
			{
				case "group":
					return new GroupElementRenderer();
				case "histogram":
					return new HistogramElementRenderer();
				case "label":
					return new LabelElementRenderer();
				case "swatch":
					return new SwatchElementRenderer();
				default:
					return null;
			}
		}

		public override function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			if (value is GroupElementRenderer)
				return "group";
			if (value is HistogramElementRenderer)
				return "histogram";
			if (value is LabelElementRenderer)
				return "label";
			if (value is SwatchElementRenderer)
				return "swatch";
			return null;
		}

		public override function registerProperties(propertyManager:PropertyManager, value:*) : void
		{
			super.registerProperties(propertyManager, value);

			if (value is GroupElementRenderer)
			{
				propertyManager.registerProperty("elementRenderers", this.elementRendererArrayPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("layoutPolicy", this.layoutPolicyPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("layoutStyle", this.layoutSpriteStylePropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is HistogramElementRenderer)
			{
				propertyManager.registerProperty("columnOrientation", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("columnBrushPalette", this.brushPalettePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("columnShapePalette", this.shapePalettePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("columnStyle", this.layoutSpriteStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("columnSize", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("defaultColumnBrush", this.brushPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("defaultColumnShape", this.shapePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("windowTime", this.numberPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is LabelElementRenderer)
			{
				propertyManager.registerProperty("labelColorPalette", this.colorPalettePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("labelStyle", this.textBlockStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("defaultLabelColor", this.numberPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is SwatchElementRenderer)
			{
				propertyManager.registerProperty("swatchBrushPalette", this.brushPalettePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("swatchShapePalette", this.shapePalettePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("swatchStyle", this.layoutSpriteStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("swatchWidth", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("swatchHeight", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("defaultSwatchBrush", this.brushPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("defaultSwatchShape", this.shapePropertyParser, this.getProperty, this.setProperty);
			}
		}

	}

}
