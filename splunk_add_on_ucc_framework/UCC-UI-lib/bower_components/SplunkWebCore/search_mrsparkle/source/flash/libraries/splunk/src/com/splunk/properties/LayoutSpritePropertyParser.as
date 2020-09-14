package com.splunk.properties
{

	import com.jasongatt.layout.LayoutSprite;

	public class LayoutSpritePropertyParser extends SpritePropertyParser
	{

		// Private Static Properties

		private static var _instance:LayoutSpritePropertyParser;

		// Public Static Methods

		public static function getInstance() : LayoutSpritePropertyParser
		{
			var instance:LayoutSpritePropertyParser = LayoutSpritePropertyParser._instance;
			if (!instance)
				instance = LayoutSpritePropertyParser._instance = new LayoutSpritePropertyParser();
			return instance;
		}

		// Protected Properties

		protected var pointPropertyParser:PointPropertyParser;
		protected var rectanglePropertyParser:RectanglePropertyParser;
		protected var matrixPropertyParser:MatrixPropertyParser;
		protected var marginPropertyParser:MarginPropertyParser;

		// Constructor

		public function LayoutSpritePropertyParser()
		{
			this.pointPropertyParser = PointPropertyParser.getInstance();
			this.rectanglePropertyParser = RectanglePropertyParser.getInstance();
			this.matrixPropertyParser = MatrixPropertyParser.getInstance();
			this.marginPropertyParser = MarginPropertyParser.getInstance();
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			if (ParseUtils.trimWhiteSpace(str) == "layoutSprite")
				return new LayoutSprite();
			return null;
		}

		public override function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			if (value is LayoutSprite)
				return "layoutSprite";
			return null;
		}

		public override function registerProperties(propertyManager:PropertyManager, value:*) : void
		{
			super.registerProperties(propertyManager, value);

			if (value is LayoutSprite)
			{
				propertyManager.registerProperty("visibility", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("clip", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("snap", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("minimumWidth", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("minimumHeight", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("maximumWidth", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("maximumHeight", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("margin", this.marginPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("alignmentX", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("alignmentY", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("layoutTransform", this.matrixPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("renderTransform", this.matrixPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("renderTransformOrigin", this.pointPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("renderTransformOriginMode", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("measuredWidth", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("measuredHeight", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("layoutBounds", this.rectanglePropertyParser, this.getProperty);
				propertyManager.registerProperty("actualBounds", this.rectanglePropertyParser, this.getProperty);
				propertyManager.registerProperty("renderBounds", this.rectanglePropertyParser, this.getProperty);
			}
		}

	}

}
