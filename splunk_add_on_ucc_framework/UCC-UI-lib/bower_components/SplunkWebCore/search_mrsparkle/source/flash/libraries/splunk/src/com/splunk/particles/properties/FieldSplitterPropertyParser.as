package com.splunk.particles.properties
{

	import com.splunk.particles.controls.FieldSplitter;
	import com.splunk.properties.ArrayPropertyParser;
	import com.splunk.properties.BrushPropertyParser;
	import com.splunk.properties.ComparatorPropertyParser;
	import com.splunk.properties.EaserPropertyParser;
	import com.splunk.properties.LayoutSpritePropertyParser;
	import com.splunk.properties.ParseUtils;
	import com.splunk.properties.PropertyManager;
	import com.splunk.properties.TextBlockStylePropertyParser;

	public class FieldSplitterPropertyParser extends LayoutSpritePropertyParser
	{

		// Private Static Properties

		private static var _instance:FieldSplitterPropertyParser;

		// Public Static Methods

		public static function getInstance() : FieldSplitterPropertyParser
		{
			var instance:FieldSplitterPropertyParser = FieldSplitterPropertyParser._instance;
			if (!instance)
				instance = FieldSplitterPropertyParser._instance = new FieldSplitterPropertyParser();
			return instance;
		}

		// Protected Properties

		protected var distribution2DPropertyParser:Distribution2DPropertyParser;
		protected var comparatorPropertyParser:ComparatorPropertyParser;
		protected var easerPropertyParser:EaserPropertyParser;
		protected var layoutPolicyPropertyParser:ExtendedLayoutPolicyPropertyParser;
		protected var rendererPropertyParser:RendererPropertyParser;
		protected var elementRendererPropertyParser:ElementRendererPropertyParser;
		protected var emitterArrayPropertyParser:ArrayPropertyParser;
		protected var textBlockStylePropertyParser:TextBlockStylePropertyParser;
		protected var brushPropertyParser:BrushPropertyParser;

		// Constructor

		public function FieldSplitterPropertyParser()
		{
			this.distribution2DPropertyParser = Distribution2DPropertyParser.getInstance();
			this.comparatorPropertyParser = ComparatorPropertyParser.getInstance();
			this.easerPropertyParser = EaserPropertyParser.getInstance();
			this.layoutPolicyPropertyParser = ExtendedLayoutPolicyPropertyParser.getInstance();
			this.rendererPropertyParser = RendererPropertyParser.getInstance();
			this.elementRendererPropertyParser = ElementRendererPropertyParser.getInstance();
			this.emitterArrayPropertyParser = ArrayPropertyParser.getInstance(EmitterPropertyParser.getInstance());
			this.textBlockStylePropertyParser = TextBlockStylePropertyParser.getInstance();
			this.brushPropertyParser = BrushPropertyParser.getInstance();
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			if (ParseUtils.trimWhiteSpace(str) == "fieldSplitter")
				return new FieldSplitter();
			return null;
		}

		public override function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			if (value is FieldSplitter)
				return "fieldSplitter";
			return null;
		}

		public override function registerProperties(propertyManager:PropertyManager, value:*) : void
		{
			super.registerProperties(propertyManager, value);

			if (value is FieldSplitter)
			{
				propertyManager.registerProperty("fieldName", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("fieldNameStyle", this.textBlockStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("fieldSort", this.comparatorPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("fieldRenderer", this.elementRendererPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("lineBrush", this.brushPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("collectDuration", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("collectEaser", this.easerPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("emitVelocity", this.distribution2DPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("emitRenderer", this.rendererPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("layoutPolicy", this.layoutPolicyPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("convergeRatio", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("sources", this.emitterArrayPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("priority", this.numberPropertyParser, this.getProperty, this.setProperty);
			}
		}

	}

}
