package com.splunk.properties
{

	import flash.filters.BevelFilter;
	import flash.filters.BlurFilter;
	import flash.filters.ColorMatrixFilter;
	import flash.filters.ConvolutionFilter;
	import flash.filters.DropShadowFilter;
	import flash.filters.GlowFilter;
	import flash.filters.GradientBevelFilter;
	import flash.filters.GradientGlowFilter;

	public class FilterPropertyParser extends AbstractPropertyParser
	{

		// Private Static Properties

		private static var _instance:FilterPropertyParser;

		// Public Static Methods

		public static function getInstance() : FilterPropertyParser
		{
			var instance:FilterPropertyParser = FilterPropertyParser._instance;
			if (!instance)
				instance = FilterPropertyParser._instance = new FilterPropertyParser();
			return instance;
		}

		// Protected Properties

		protected var numberPropertyParser:NumberPropertyParser;
		protected var booleanPropertyParser:BooleanPropertyParser;
		protected var stringPropertyParser:StringPropertyParser;
		protected var numberArrayPropertyParser:ArrayPropertyParser;
		protected var propertyParsers:Object;

		// Constructor

		public function FilterPropertyParser()
		{
			this.numberPropertyParser = NumberPropertyParser.getInstance();
			this.booleanPropertyParser = BooleanPropertyParser.getInstance();
			this.stringPropertyParser = StringPropertyParser.getInstance();
			this.numberArrayPropertyParser = ArrayPropertyParser.getInstance(this.numberPropertyParser);

			this.propertyParsers = new Object();

			var bevelPropertyParsers:Object = this.propertyParsers.bevel = new Object();
			bevelPropertyParsers.distance = this.numberPropertyParser;
			bevelPropertyParsers.angle = this.numberPropertyParser;
			bevelPropertyParsers.highlightColor = this.numberPropertyParser;
			bevelPropertyParsers.highlightAlpha = this.numberPropertyParser;
			bevelPropertyParsers.shadowColor = this.numberPropertyParser;
			bevelPropertyParsers.shadowAlpha = this.numberPropertyParser;
			bevelPropertyParsers.blurX = this.numberPropertyParser;
			bevelPropertyParsers.blurY = this.numberPropertyParser;
			bevelPropertyParsers.strength = this.numberPropertyParser;
			bevelPropertyParsers.quality = this.numberPropertyParser;
			bevelPropertyParsers.type = this.stringPropertyParser;
			bevelPropertyParsers.knockout = this.booleanPropertyParser;

			var blurPropertyParsers:Object = this.propertyParsers.blur = new Object();
			blurPropertyParsers.blurX = this.numberPropertyParser;
			blurPropertyParsers.blurY = this.numberPropertyParser;
			blurPropertyParsers.quality = this.numberPropertyParser;

			var colorMatrixPropertyParsers:Object = this.propertyParsers.colorMatrix = new Object();
			colorMatrixPropertyParsers.matrix = this.numberArrayPropertyParser;

			var convolutionPropertyParsers:Object = this.propertyParsers.convolution = new Object();
			convolutionPropertyParsers.matrixX = this.numberPropertyParser;
			convolutionPropertyParsers.matrixY = this.numberPropertyParser;
			convolutionPropertyParsers.matrix = this.numberArrayPropertyParser;
			convolutionPropertyParsers.divisor = this.numberPropertyParser;
			convolutionPropertyParsers.bias = this.numberPropertyParser;
			convolutionPropertyParsers.preserveAlpha = this.booleanPropertyParser;
			convolutionPropertyParsers.clamp = this.booleanPropertyParser;
			convolutionPropertyParsers.color = this.numberPropertyParser;
			convolutionPropertyParsers.alpha = this.numberPropertyParser;

			var dropShadowPropertyParsers:Object = this.propertyParsers.dropShadow = new Object();
			dropShadowPropertyParsers.distance = this.numberPropertyParser;
			dropShadowPropertyParsers.angle = this.numberPropertyParser;
			dropShadowPropertyParsers.color = this.numberPropertyParser;
			dropShadowPropertyParsers.alpha = this.numberPropertyParser;
			dropShadowPropertyParsers.blurX = this.numberPropertyParser;
			dropShadowPropertyParsers.blurY = this.numberPropertyParser;
			dropShadowPropertyParsers.strength = this.numberPropertyParser;
			dropShadowPropertyParsers.quality = this.numberPropertyParser;
			dropShadowPropertyParsers.inner = this.booleanPropertyParser;
			dropShadowPropertyParsers.knockout = this.booleanPropertyParser;
			dropShadowPropertyParsers.hideObject = this.booleanPropertyParser;

			var glowPropertyParsers:Object = this.propertyParsers.glow = new Object();
			glowPropertyParsers.color = this.numberPropertyParser;
			glowPropertyParsers.alpha = this.numberPropertyParser;
			glowPropertyParsers.blurX = this.numberPropertyParser;
			glowPropertyParsers.blurY = this.numberPropertyParser;
			glowPropertyParsers.strength = this.numberPropertyParser;
			glowPropertyParsers.quality = this.numberPropertyParser;
			glowPropertyParsers.inner = this.booleanPropertyParser;
			glowPropertyParsers.knockout = this.booleanPropertyParser;

			var gradientBevelPropertyParsers:Object = this.propertyParsers.gradientBevel = new Object();
			gradientBevelPropertyParsers.distance = this.numberPropertyParser;
			gradientBevelPropertyParsers.angle = this.numberPropertyParser;
			gradientBevelPropertyParsers.colors = this.numberArrayPropertyParser;
			gradientBevelPropertyParsers.alphas = this.numberArrayPropertyParser;
			gradientBevelPropertyParsers.ratios = this.numberArrayPropertyParser;
			gradientBevelPropertyParsers.blurX = this.numberPropertyParser;
			gradientBevelPropertyParsers.blurY = this.numberPropertyParser;
			gradientBevelPropertyParsers.strength = this.numberPropertyParser;
			gradientBevelPropertyParsers.quality = this.numberPropertyParser;
			gradientBevelPropertyParsers.type = this.stringPropertyParser;
			gradientBevelPropertyParsers.knockout = this.booleanPropertyParser;

			var gradientGlowPropertyParsers:Object = this.propertyParsers.gradientGlow = new Object();
			gradientGlowPropertyParsers.distance = this.numberPropertyParser;
			gradientGlowPropertyParsers.angle = this.numberPropertyParser;
			gradientGlowPropertyParsers.colors = this.numberArrayPropertyParser;
			gradientGlowPropertyParsers.alphas = this.numberArrayPropertyParser;
			gradientGlowPropertyParsers.ratios = this.numberArrayPropertyParser;
			gradientGlowPropertyParsers.blurX = this.numberPropertyParser;
			gradientGlowPropertyParsers.blurY = this.numberPropertyParser;
			gradientGlowPropertyParsers.strength = this.numberPropertyParser;
			gradientGlowPropertyParsers.quality = this.numberPropertyParser;
			gradientGlowPropertyParsers.type = this.stringPropertyParser;
			gradientGlowPropertyParsers.knockout = this.booleanPropertyParser;
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			if (!str)
				return null;

			var filterType:String;
			var filterProperties:Object;

			var bracketIndex:int = str.indexOf("{");
			if (bracketIndex < 0)
			{
				filterType = ParseUtils.trimWhiteSpace(str);
			}
			else
			{
				filterType = ParseUtils.trimWhiteSpace(str.substring(0, bracketIndex));
				filterProperties = ParseUtils.prepareObject(str.substring(bracketIndex));
			}

			var filter:*;
			switch (filterType)
			{
				case "bevel":
					filter = new BevelFilter();
					break;
				case "blur":
					filter = new BlurFilter();
					break;
				case "colorMatrix":
					filter = new ColorMatrixFilter();
					break;
				case "convolution":
					filter = new ConvolutionFilter();
					break;
				case "dropShadow":
					filter = new DropShadowFilter();
					break;
				case "glow":
					filter = new GlowFilter();
					break;
				case "gradientBevel":
					filter = new GradientBevelFilter();
					break;
				case "gradientGlow":
					filter = new GradientGlowFilter();
					break;
				default:
					return null;
			}

			var propertyParsers:Object = this.propertyParsers[filterType];
			if (propertyParsers)
			{
				var propertyParser:IPropertyParser;
				var filterProperty:String;
				for (filterProperty in filterProperties)
				{
					propertyParser = propertyParsers[filterProperty];
					if (propertyParser)
						filter[filterProperty] = propertyManager.parseValue(filterProperties[filterProperty], propertyParser);
				}
			}

			return filter;
		}

		public override function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			var filterType:String;
			if (value is BevelFilter)
				filterType = "bevel";
			else if (value is BlurFilter)
				filterType = "blur";
			else if (value is ColorMatrixFilter)
				filterType = "colorMatrix";
			else if (value is ConvolutionFilter)
				filterType = "convolution";
			else if (value is DropShadowFilter)
				filterType = "dropShadow";
			else if (value is GlowFilter)
				filterType = "glow";
			else if (value is GradientBevelFilter)
				filterType = "gradientBevel";
			else if (value is GradientGlowFilter)
				filterType = "gradientGlow";
			else
				return null;

			var str:String = "";

			var propertyParsers:Object = this.propertyParsers[filterType];
			var propertyParser:IPropertyParser;
			var propertyName:String;
			var propertyValue:*;
			for (propertyName in propertyParsers)
			{
				propertyParser = propertyParsers[propertyName];
				propertyValue = value[propertyName];
				if (str)
					str += ",";
				str += ParseUtils.escapeString(propertyName) + ":";
				if (propertyParser is StringPropertyParser)
					str += ParseUtils.escapeString(propertyParser.valueToString(propertyManager, propertyValue));
				else
					str += propertyParser.valueToString(propertyManager, propertyValue);
			}

			return filterType + "{" + str + "}";
		}

		public override function registerProperties(propertyManager:PropertyManager, value:*) : void
		{
			if (value is BevelFilter)
			{
				propertyManager.registerProperty("distance", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("angle", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("highlightColor", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("highlightAlpha", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("shadowColor", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("shadowAlpha", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("blurX", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("blurY", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("strength", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("quality", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("type", this.stringPropertyParser, this.getProperty);
				propertyManager.registerProperty("knockout", this.booleanPropertyParser, this.getProperty);
			}
			else if (value is BlurFilter)
			{
				propertyManager.registerProperty("blurX", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("blurY", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("quality", this.numberPropertyParser, this.getProperty);
			}
			else if (value is ColorMatrixFilter)
			{
				propertyManager.registerProperty("matrix", this.numberArrayPropertyParser, this.getProperty);
			}
			else if (value is ConvolutionFilter)
			{
				propertyManager.registerProperty("matrixX", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("matrixY", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("matrix", this.numberArrayPropertyParser, this.getProperty);
				propertyManager.registerProperty("divisor", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("bias", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("preserveAlpha", this.booleanPropertyParser, this.getProperty);
				propertyManager.registerProperty("clamp", this.booleanPropertyParser, this.getProperty);
				propertyManager.registerProperty("color", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("alpha", this.numberPropertyParser, this.getProperty);
			}
			else if (value is DropShadowFilter)
			{
				propertyManager.registerProperty("distance", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("angle", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("color", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("alpha", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("blurX", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("blurY", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("strength", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("quality", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("inner", this.booleanPropertyParser, this.getProperty);
				propertyManager.registerProperty("knockout", this.booleanPropertyParser, this.getProperty);
				propertyManager.registerProperty("hideObject", this.booleanPropertyParser, this.getProperty);
			}
			else if (value is GlowFilter)
			{
				propertyManager.registerProperty("color", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("alpha", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("blurX", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("blurY", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("strength", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("quality", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("inner", this.booleanPropertyParser, this.getProperty);
				propertyManager.registerProperty("knockout", this.booleanPropertyParser, this.getProperty);
			}
			else if (value is GradientBevelFilter)
			{
				propertyManager.registerProperty("distance", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("angle", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("colors", this.numberArrayPropertyParser, this.getProperty);
				propertyManager.registerProperty("alphas", this.numberArrayPropertyParser, this.getProperty);
				propertyManager.registerProperty("ratios", this.numberArrayPropertyParser, this.getProperty);
				propertyManager.registerProperty("blurX", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("blurY", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("strength", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("quality", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("type", this.stringPropertyParser, this.getProperty);
				propertyManager.registerProperty("knockout", this.booleanPropertyParser, this.getProperty);
			}
			else if (value is GradientGlowFilter)
			{
				propertyManager.registerProperty("distance", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("angle", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("colors", this.numberArrayPropertyParser, this.getProperty);
				propertyManager.registerProperty("alphas", this.numberArrayPropertyParser, this.getProperty);
				propertyManager.registerProperty("ratios", this.numberArrayPropertyParser, this.getProperty);
				propertyManager.registerProperty("blurX", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("blurY", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("strength", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("quality", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("type", this.stringPropertyParser, this.getProperty);
				propertyManager.registerProperty("knockout", this.booleanPropertyParser, this.getProperty);
			}
		}

	}

}
