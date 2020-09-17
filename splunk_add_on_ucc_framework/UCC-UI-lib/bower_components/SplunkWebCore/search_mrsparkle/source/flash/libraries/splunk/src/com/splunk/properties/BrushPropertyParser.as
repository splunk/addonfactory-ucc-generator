package com.splunk.properties
{

	import com.jasongatt.graphics.brushes.CameraFillBrush;
	import com.jasongatt.graphics.brushes.DashedStrokeBrush;
	import com.jasongatt.graphics.brushes.GradientFillBrush;
	import com.jasongatt.graphics.brushes.GradientStrokeBrush;
	import com.jasongatt.graphics.brushes.GroupBrush;
	import com.jasongatt.graphics.brushes.ImageFillBrush;
	import com.jasongatt.graphics.brushes.MovieFillBrush;
	import com.jasongatt.graphics.brushes.SolidFillBrush;
	import com.jasongatt.graphics.brushes.SolidStrokeBrush;
	import com.jasongatt.graphics.brushes.VideoFillBrush;
	import com.splunk.brushes.BorderStrokeBrush;

	public class BrushPropertyParser extends AbstractPropertyParser
	{

		// Private Static Properties

		private static var _instance:BrushPropertyParser;

		// Public Static Methods

		public static function getInstance() : BrushPropertyParser
		{
			var instance:BrushPropertyParser = BrushPropertyParser._instance;
			if (!instance)
				instance = BrushPropertyParser._instance = new BrushPropertyParser();
			return instance;
		}

		// Protected Properties

		protected var numberPropertyParser:NumberPropertyParser;
		protected var booleanPropertyParser:BooleanPropertyParser;
		protected var stringPropertyParser:StringPropertyParser;
		protected var numberArrayPropertyParser:ArrayPropertyParser;
		protected var brushArrayPropertyParser:ArrayPropertyParser;
		protected var matrixPropertyParser:MatrixPropertyParser;

		// Constructor

		public function BrushPropertyParser()
		{
			this.numberPropertyParser = NumberPropertyParser.getInstance();
			this.booleanPropertyParser = BooleanPropertyParser.getInstance();
			this.stringPropertyParser = StringPropertyParser.getInstance();
			this.numberArrayPropertyParser = ArrayPropertyParser.getInstance(this.numberPropertyParser);
			this.brushArrayPropertyParser = ArrayPropertyParser.getInstance(this);
			this.matrixPropertyParser = MatrixPropertyParser.getInstance();
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			switch (ParseUtils.trimWhiteSpace(str))
			{
				case "cameraFill":
					return new CameraFillBrush();
				case "dashedStroke":
					return new DashedStrokeBrush();
				case "gradientFill":
					return new GradientFillBrush();
				case "gradientStroke":
					return new GradientStrokeBrush();
				case "group":
					return new GroupBrush();
				case "imageFill":
					return new ImageFillBrush();
				case "movieFill":
					return new MovieFillBrush();
				case "solidFill":
					return new SolidFillBrush();
				case "solidStroke":
					return new SolidStrokeBrush();
				case "videoFill":
					return new VideoFillBrush();
				case "borderStroke":
					return new BorderStrokeBrush();
				default:
					return null;
			}
		}

		public override function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			if (value is CameraFillBrush)
				return "cameraFill";
			if (value is DashedStrokeBrush)
				return "dashedStroke";
			if (value is GradientFillBrush)
				return "gradientFill";
			if (value is GradientStrokeBrush)
				return "gradientStroke";
			if (value is GroupBrush)
				return "group";
			if (value is ImageFillBrush)
				return "imageFill";
			if (value is MovieFillBrush)
				return "movieFill";
			if (value is SolidFillBrush)
				return "solidFill";
			if (value is SolidStrokeBrush)
				return "solidStroke";
			if (value is VideoFillBrush)
				return "videoFill";
			if (value is BorderStrokeBrush)
				return "borderStroke";
			return null;
		}

		public override function registerProperties(propertyManager:PropertyManager, value:*) : void
		{
			if (value is CameraFillBrush)
			{
				propertyManager.registerProperty("cameraIndex", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("repeat", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("smooth", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("stretchMode", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("alignmentX", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("alignmentY", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("tileTransform", this.matrixPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("renderTransform", this.matrixPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("fitToDrawing", this.booleanPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is DashedStrokeBrush)
			{
				propertyManager.registerProperty("dashSize", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("dashSpacing", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("thickness", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("color", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("alpha", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("pixelHinting", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("scaleMode", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("caps", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("joints", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("miterLimit", this.numberPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is GradientFillBrush)
			{
				propertyManager.registerProperty("type", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("colors", this.numberArrayPropertyParser, this.getProperty, this.setProperty);
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
			else if (value is GradientStrokeBrush)
			{
				propertyManager.registerProperty("type", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("colors", this.numberArrayPropertyParser, this.getProperty, this.setProperty);
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
			else if (value is GroupBrush)
			{
				propertyManager.registerProperty("brushes", this.brushArrayPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is ImageFillBrush)
			{
				propertyManager.registerProperty("source", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("repeat", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("smooth", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("stretchMode", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("alignmentX", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("alignmentY", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("tileTransform", this.matrixPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("renderTransform", this.matrixPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("fitToDrawing", this.booleanPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is MovieFillBrush)
			{
				propertyManager.registerProperty("source", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("repeat", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("smooth", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("stretchMode", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("alignmentX", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("alignmentY", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("tileTransform", this.matrixPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("renderTransform", this.matrixPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("fitToDrawing", this.booleanPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is SolidFillBrush)
			{
				propertyManager.registerProperty("color", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("alpha", this.numberPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is SolidStrokeBrush)
			{
				propertyManager.registerProperty("thickness", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("color", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("alpha", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("pixelHinting", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("scaleMode", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("caps", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("joints", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("miterLimit", this.numberPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is VideoFillBrush)
			{
				propertyManager.registerProperty("source", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("repeat", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("smooth", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("stretchMode", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("alignmentX", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("alignmentY", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("tileTransform", this.matrixPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("renderTransform", this.matrixPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("fitToDrawing", this.booleanPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is BorderStrokeBrush)
			{
				propertyManager.registerProperty("thicknesses", this.numberArrayPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("colors", this.numberArrayPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("alphas", this.numberArrayPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("pixelHinting", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("scaleMode", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("caps", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("joints", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("miterLimit", this.numberPropertyParser, this.getProperty, this.setProperty);
			}
		}

	}

}
