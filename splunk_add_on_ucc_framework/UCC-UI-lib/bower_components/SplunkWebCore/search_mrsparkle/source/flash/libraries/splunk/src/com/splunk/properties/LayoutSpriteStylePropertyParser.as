package com.splunk.properties
{

	import com.splunk.utils.Style;

	public class LayoutSpriteStylePropertyParser extends SpriteStylePropertyParser
	{

		// Private Static Properties

		private static var _instance:LayoutSpriteStylePropertyParser;

		// Public Static Methods

		public static function getInstance() : LayoutSpriteStylePropertyParser
		{
			var instance:LayoutSpriteStylePropertyParser = LayoutSpriteStylePropertyParser._instance;
			if (!instance)
				instance = LayoutSpriteStylePropertyParser._instance = new LayoutSpriteStylePropertyParser();
			return instance;
		}

		// Protected Properties

		protected var pointPropertyParser:PointPropertyParser;
		protected var matrixPropertyParser:MatrixPropertyParser;
		protected var marginPropertyParser:MarginPropertyParser;

		// Constructor

		public function LayoutSpriteStylePropertyParser()
		{
			this.pointPropertyParser = PointPropertyParser.getInstance();
			this.matrixPropertyParser = MatrixPropertyParser.getInstance();
			this.marginPropertyParser = MarginPropertyParser.getInstance();
		}

		// Public Methods

		public override function registerProperties(propertyManager:PropertyManager, value:*) : void
		{
			super.registerProperties(propertyManager, value);

			if (value is Style)
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
			}
		}

	}

}
