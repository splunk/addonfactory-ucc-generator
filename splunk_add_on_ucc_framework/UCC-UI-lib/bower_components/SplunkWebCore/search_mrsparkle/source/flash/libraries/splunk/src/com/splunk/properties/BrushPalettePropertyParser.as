package com.splunk.properties
{

	import com.splunk.palettes.brush.FieldBrushPalette;
	import com.splunk.palettes.brush.FieldImageFillBrushPalette;
	import com.splunk.palettes.brush.GradientFillBrushPalette;
	import com.splunk.palettes.brush.GradientStrokeBrushPalette;
	import com.splunk.palettes.brush.GroupBrushPalette;
	import com.splunk.palettes.brush.ImageFillBrushPalette;
	import com.splunk.palettes.brush.ListBrushPalette;
	import com.splunk.palettes.brush.SolidFillBrushPalette;
	import com.splunk.palettes.brush.SolidStrokeBrushPalette;

	public class BrushPalettePropertyParser extends AbstractPropertyParser
	{

		// Private Static Properties

		private static var _instance:BrushPalettePropertyParser;

		// Public Static Methods

		public static function getInstance() : BrushPalettePropertyParser
		{
			var instance:BrushPalettePropertyParser = BrushPalettePropertyParser._instance;
			if (!instance)
				instance = BrushPalettePropertyParser._instance = new BrushPalettePropertyParser();
			return instance;
		}

		// Protected Properties

		protected var numberPropertyParser:NumberPropertyParser;
		protected var booleanPropertyParser:BooleanPropertyParser;
		protected var stringPropertyParser:StringPropertyParser;
		protected var numberArrayPropertyParser:ArrayPropertyParser;
		protected var stringArrayPropertyParser:ArrayPropertyParser;
		protected var stringMapPropertyParser:MapPropertyParser;
		protected var matrixPropertyParser:MatrixPropertyParser;
		protected var brushPropertyParser:BrushPropertyParser;
		protected var brushArrayPropertyParser:ArrayPropertyParser;
		protected var brushMapPropertyParser:MapPropertyParser;
		protected var brushPaletteArrayPropertyParser:ArrayPropertyParser;
		protected var colorPalettePropertyParser:ColorPalettePropertyParser;
		protected var colorPaletteArrayPropertyParser:ArrayPropertyParser;

		// Constructor

		public function BrushPalettePropertyParser()
		{
			this.numberPropertyParser = NumberPropertyParser.getInstance();
			this.booleanPropertyParser = BooleanPropertyParser.getInstance();
			this.stringPropertyParser = StringPropertyParser.getInstance();
			this.numberArrayPropertyParser = ArrayPropertyParser.getInstance(this.numberPropertyParser);
			this.stringArrayPropertyParser = ArrayPropertyParser.getInstance(this.stringPropertyParser);
			this.stringMapPropertyParser = MapPropertyParser.getInstance(this.stringPropertyParser);
			this.matrixPropertyParser = MatrixPropertyParser.getInstance();
			this.brushPropertyParser = BrushPropertyParser.getInstance();
			this.brushArrayPropertyParser = ArrayPropertyParser.getInstance(this.brushPropertyParser);
			this.brushMapPropertyParser = MapPropertyParser.getInstance(this.brushPropertyParser);
			this.brushPaletteArrayPropertyParser = ArrayPropertyParser.getInstance(this);
			this.colorPalettePropertyParser = ColorPalettePropertyParser.getInstance();
			this.colorPaletteArrayPropertyParser = ArrayPropertyParser.getInstance(this.colorPalettePropertyParser);
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			switch (ParseUtils.trimWhiteSpace(str))
			{
				case "field":
					return new FieldBrushPalette();
				case "fieldImageFill":
					return new FieldImageFillBrushPalette();
				case "gradientFill":
					return new GradientFillBrushPalette();
				case "gradientStroke":
					return new GradientStrokeBrushPalette();
				case "group":
					return new GroupBrushPalette();
				case "imageFill":
					return new ImageFillBrushPalette();
				case "list":
					return new ListBrushPalette();
				case "solidFill":
					return new SolidFillBrushPalette();
				case "solidStroke":
					return new SolidStrokeBrushPalette();
				default:
					return null;
			}
		}

		public override function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			if (value is FieldBrushPalette)
				return "field";
			if (value is FieldImageFillBrushPalette)
				return "fieldImageFill";
			if (value is GradientFillBrushPalette)
				return "gradientFill";
			if (value is GradientStrokeBrushPalette)
				return "gradientStroke";
			if (value is GroupBrushPalette)
				return "group";
			if (value is ImageFillBrushPalette)
				return "imageFill";
			if (value is ListBrushPalette)
				return "list";
			if (value is SolidFillBrushPalette)
				return "solidFill";
			if (value is SolidStrokeBrushPalette)
				return "solidStroke";
			return null;
		}

		public override function registerProperties(propertyManager:PropertyManager, value:*) : void
		{
			if (value is FieldBrushPalette)
			{
				propertyManager.registerProperty("fieldBrushes", this.brushMapPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("defaultBrushPalette", this, this.getProperty, this.setProperty);
			}
			else if (value is FieldImageFillBrushPalette)
			{
				propertyManager.registerProperty("fieldSources", this.stringMapPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("sourcePath", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("sourceExtension", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("useFieldAsSource", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("urlEncodeField", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("repeat", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("smooth", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("stretchMode", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("alignmentX", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("alignmentY", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("tileTransform", this.matrixPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("renderTransform", this.matrixPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("fitToDrawing", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("defaultBrushPalette", this, this.getProperty, this.setProperty);
			}
			else if (value is GradientFillBrushPalette)
			{
				propertyManager.registerProperty("type", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("colorPalettes", this.colorPaletteArrayPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("alphas", this.numberArrayPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("ratios", this.numberArrayPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("spreadMethod", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("interpolationMethod", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("focalPointRatio", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("gradientWidth", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("gradientHeight", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("stretchMode", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("alignmentX", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("alignmentY", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("tileTransform", this.matrixPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("renderTransform", this.matrixPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("fitToDrawing", this.booleanPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is GradientStrokeBrushPalette)
			{
				propertyManager.registerProperty("type", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("colorPalettes", this.colorPaletteArrayPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("alphas", this.numberArrayPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("ratios", this.numberArrayPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("spreadMethod", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("interpolationMethod", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("focalPointRatio", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("thickness", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("pixelHinting", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("scaleMode", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("caps", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("joints", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("miterLimit", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("gradientWidth", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("gradientHeight", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("stretchMode", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("alignmentX", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("alignmentY", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("tileTransform", this.matrixPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("renderTransform", this.matrixPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("fitToDrawing", this.booleanPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is GroupBrushPalette)
			{
				propertyManager.registerProperty("brushPalettes", this.brushPaletteArrayPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is ImageFillBrushPalette)
			{
				propertyManager.registerProperty("sources", this.stringArrayPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("sourcePath", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("repeat", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("smooth", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("stretchMode", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("alignmentX", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("alignmentY", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("tileTransform", this.matrixPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("renderTransform", this.matrixPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("fitToDrawing", this.booleanPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is ListBrushPalette)
			{
				propertyManager.registerProperty("brushes", this.brushArrayPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is SolidFillBrushPalette)
			{
				propertyManager.registerProperty("colorPalette", this.colorPalettePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("alpha", this.numberPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is SolidStrokeBrushPalette)
			{
				propertyManager.registerProperty("thickness", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("colorPalette", this.colorPalettePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("alpha", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("pixelHinting", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("scaleMode", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("caps", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("joints", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("miterLimit", this.numberPropertyParser, this.getProperty, this.setProperty);
			}
		}

	}

}
