package com.splunk.properties
{

	import com.splunk.controls.Tooltip;

	public class TooltipPropertyParser extends LayoutSpritePropertyParser
	{

		// Private Static Properties

		private static var _instance:TooltipPropertyParser;

		// Public Static Methods

		public static function getInstance() : TooltipPropertyParser
		{
			var instance:TooltipPropertyParser = TooltipPropertyParser._instance;
			if (!instance)
				instance = TooltipPropertyParser._instance = new TooltipPropertyParser();
			return instance;
		}

		// Protected Properties

		protected var brushPropertyParser:BrushPropertyParser;

		// Constructor

		public function TooltipPropertyParser()
		{
			this.brushPropertyParser = BrushPropertyParser.getInstance();
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			if (ParseUtils.trimWhiteSpace(str) == "tooltip")
				return new Tooltip();
			return null;
		}

		public override function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			if (value is Tooltip)
				return "tooltip";
			return null;
		}

		public override function registerProperties(propertyManager:PropertyManager, value:*) : void
		{
			super.registerProperties(propertyManager, value);

			if (value is Tooltip)
			{
				propertyManager.registerProperty("padding", this.marginPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("backgroundBrush", this.brushPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("targetBounds", this.rectanglePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("placement", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("showPointer", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("followMouse", this.booleanPropertyParser, this.getProperty, this.setProperty);
			}
		}

	}

}
