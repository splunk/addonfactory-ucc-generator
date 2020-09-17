package com.splunk.properties
{

	import com.jasongatt.graphics.shapes.AbstractShape;
	import com.jasongatt.graphics.shapes.DiamondShape;
	import com.jasongatt.graphics.shapes.EllipseShape;
	import com.jasongatt.graphics.shapes.GroupShape;
	import com.jasongatt.graphics.shapes.LineShape;
	import com.jasongatt.graphics.shapes.MaximumSizeShape;
	import com.jasongatt.graphics.shapes.PolygonShape;
	import com.jasongatt.graphics.shapes.RectangleShape;
	import com.jasongatt.graphics.shapes.RoundedRectangleShape;
	import com.jasongatt.graphics.shapes.TransformShape;
	import com.jasongatt.graphics.shapes.TriangleShape;
	import com.jasongatt.graphics.shapes.UniformSizeShape;
	import com.jasongatt.graphics.shapes.WedgeShape;

	public class ShapePropertyParser extends AbstractPropertyParser
	{

		// Private Static Properties

		private static var _instance:ShapePropertyParser;

		// Public Static Methods

		public static function getInstance() : ShapePropertyParser
		{
			var instance:ShapePropertyParser = ShapePropertyParser._instance;
			if (!instance)
				instance = ShapePropertyParser._instance = new ShapePropertyParser();
			return instance;
		}

		// Protected Properties

		protected var numberPropertyParser:NumberPropertyParser;
		protected var booleanPropertyParser:BooleanPropertyParser;
		protected var pointPropertyParser:PointPropertyParser;
		protected var brushPropertyParser:BrushPropertyParser;
		protected var pointArrayPropertyParser:ArrayPropertyParser;
		protected var brushArrayPropertyParser:ArrayPropertyParser;
		protected var shapeArrayPropertyParser:ArrayPropertyParser;

		// Constructor

		public function ShapePropertyParser()
		{
			this.numberPropertyParser = NumberPropertyParser.getInstance();
			this.booleanPropertyParser = BooleanPropertyParser.getInstance();
			this.pointPropertyParser = PointPropertyParser.getInstance();
			this.brushPropertyParser = BrushPropertyParser.getInstance();
			this.pointArrayPropertyParser = ArrayPropertyParser.getInstance(this.pointPropertyParser);
			this.brushArrayPropertyParser = ArrayPropertyParser.getInstance(this.brushPropertyParser);
			this.shapeArrayPropertyParser = ArrayPropertyParser.getInstance(this);
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			switch (ParseUtils.trimWhiteSpace(str))
			{
				case "diamond":
					return new DiamondShape();
				case "ellipse":
					return new EllipseShape();
				case "group":
					return new GroupShape();
				case "line":
					return new LineShape();
				case "maximumSize":
					return new MaximumSizeShape();
				case "polygon":
					return new PolygonShape();
				case "rectangle":
					return new RectangleShape();
				case "roundedRectangle":
					return new RoundedRectangleShape();
				case "transform":
					return new TransformShape();
				case "triangle":
					return new TriangleShape();
				case "uniformSize":
					return new UniformSizeShape();
				case "wedge":
					return new WedgeShape();
				default:
					return null;
			}
		}

		public override function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			if (value is DiamondShape)
				return "diamond";
			if (value is EllipseShape)
				return "ellipse";
			if (value is GroupShape)
				return "group";
			if (value is LineShape)
				return "line";
			if (value is MaximumSizeShape)
				return "maximumSize";
			if (value is PolygonShape)
				return "polygon";
			if (value is RectangleShape)
				return "rectangle";
			if (value is RoundedRectangleShape)
				return "roundedRectangle";
			if (value is TransformShape)
				return "transform";
			if (value is TriangleShape)
				return "triangle";
			if (value is UniformSizeShape)
				return "uniformSize";
			if (value is WedgeShape)
				return "wedge";
			return null;
		}

		public override function registerProperties(propertyManager:PropertyManager, value:*) : void
		{
			if (value is AbstractShape)
			{
				propertyManager.registerProperty("snap", this.booleanPropertyParser, this.getProperty, this.setProperty);
			}

			if (value is DiamondShape)
			{
				// no properties
			}
			else if (value is EllipseShape)
			{
				// no properties
			}
			else if (value is GroupShape)
			{
				propertyManager.registerProperty("shapes", this.shapeArrayPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("brushes", this.brushArrayPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is LineShape)
			{
				propertyManager.registerProperty("p1", this.pointPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("p2", this.pointPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is MaximumSizeShape)
			{
				propertyManager.registerProperty("shape", this, this.getProperty, this.setProperty);
				propertyManager.registerProperty("maximumWidth", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("maximumHeight", this.numberPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is PolygonShape)
			{
				propertyManager.registerProperty("vertices", this.pointArrayPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is RectangleShape)
			{
				// no properties
			}
			else if (value is RoundedRectangleShape)
			{
				propertyManager.registerProperty("cornerRadius", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("cornerRadiusTL", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("cornerRadiusTR", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("cornerRadiusBR", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("cornerRadiusBL", this.numberPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is TransformShape)
			{
				propertyManager.registerProperty("shape", this, this.getProperty, this.setProperty);
				propertyManager.registerProperty("offsetX", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("offsetY", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("scaleX", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("scaleY", this.numberPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is TriangleShape)
			{
				propertyManager.registerProperty("p1", this.pointPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("p2", this.pointPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("p3", this.pointPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is UniformSizeShape)
			{
				propertyManager.registerProperty("shape", this, this.getProperty, this.setProperty);
			}
			else if (value is WedgeShape)
			{
				propertyManager.registerProperty("startAngle", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("arcAngle", this.numberPropertyParser, this.getProperty, this.setProperty);
			}
		}

	}

}
