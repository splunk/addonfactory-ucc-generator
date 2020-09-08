package com.splunk.properties
{

	import com.splunk.palettes.shape.FieldShapePalette;
	import com.splunk.palettes.shape.GroupShapePalette;
	import com.splunk.palettes.shape.ListShapePalette;

	public class ShapePalettePropertyParser extends AbstractPropertyParser
	{

		// Private Static Properties

		private static var _instance:ShapePalettePropertyParser;

		// Public Static Methods

		public static function getInstance() : ShapePalettePropertyParser
		{
			var instance:ShapePalettePropertyParser = ShapePalettePropertyParser._instance;
			if (!instance)
				instance = ShapePalettePropertyParser._instance = new ShapePalettePropertyParser();
			return instance;
		}

		// Protected Properties

		protected var stringPropertyParser:StringPropertyParser;
		protected var shapePropertyParser:ShapePropertyParser;
		protected var shapeArrayPropertyParser:ArrayPropertyParser;
		protected var shapeMapPropertyParser:MapPropertyParser;
		protected var shapePaletteArrayPropertyParser:ArrayPropertyParser;

		// Constructor

		public function ShapePalettePropertyParser()
		{
			this.stringPropertyParser = StringPropertyParser.getInstance();
			this.shapePropertyParser = ShapePropertyParser.getInstance();
			this.shapeArrayPropertyParser = ArrayPropertyParser.getInstance(this.shapePropertyParser);
			this.shapeMapPropertyParser = MapPropertyParser.getInstance(this.shapePropertyParser);
			this.shapePaletteArrayPropertyParser = ArrayPropertyParser.getInstance(this);
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			switch (ParseUtils.trimWhiteSpace(str))
			{
				case "field":
					return new FieldShapePalette();
				case "group":
					return new GroupShapePalette();
				case "list":
					return new ListShapePalette();
				default:
					return null;
			}
		}

		public override function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			if (value is FieldShapePalette)
				return "field";
			if (value is GroupShapePalette)
				return "group";
			if (value is ListShapePalette)
				return "list";
			return null;
		}

		public override function registerProperties(propertyManager:PropertyManager, value:*) : void
		{
			if (value is FieldShapePalette)
			{
				propertyManager.registerProperty("fieldShapes", this.shapeMapPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("defaultShapePalette", this, this.getProperty, this.setProperty);
			}
			else if (value is GroupShapePalette)
			{
				propertyManager.registerProperty("shapePalettes", this.shapePaletteArrayPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is ListShapePalette)
			{
				propertyManager.registerProperty("shapes", this.shapeArrayPropertyParser, this.getProperty, this.setProperty);
			}
		}

	}

}
