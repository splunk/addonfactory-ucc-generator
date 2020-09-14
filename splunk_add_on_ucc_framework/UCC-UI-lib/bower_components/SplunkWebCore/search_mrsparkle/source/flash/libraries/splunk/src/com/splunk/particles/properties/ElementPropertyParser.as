package com.splunk.particles.properties
{

	import com.splunk.particles.controls.EventsEmitterControl;
	import com.splunk.particles.controls.FieldSplitter;
	import com.splunk.properties.ArrayPropertyParser;
	import com.splunk.properties.BrushPropertyParser;
	import com.splunk.properties.ComparatorPropertyParser;
	import com.splunk.properties.EaserPropertyParser;
	import com.splunk.properties.LayoutSpritePropertyParser;
	import com.splunk.properties.ParseUtils;
	import com.splunk.properties.PropertyManager;
	import com.splunk.properties.TextBlockStylePropertyParser;

	public class ElementPropertyParser extends LayoutSpritePropertyParser
	{

		// Private Static Properties

		private static var _instance:ElementPropertyParser;

		// Public Static Methods

		public static function getInstance() : ElementPropertyParser
		{
			var instance:ElementPropertyParser = ElementPropertyParser._instance;
			if (!instance)
				instance = ElementPropertyParser._instance = new ElementPropertyParser();
			return instance;
		}

		// Protected Properties

		protected var distribution2DPropertyParser:Distribution2DPropertyParser;
		protected var comparatorPropertyParser:ComparatorPropertyParser;
		protected var easerPropertyParser:EaserPropertyParser;
		protected var layoutPolicyPropertyParser:ExtendedLayoutPolicyPropertyParser;
		protected var rendererPropertyParser:RendererPropertyParser;
		protected var elementRendererPropertyParser:ElementRendererPropertyParser;
		protected var elementArrayPropertyParser:ArrayPropertyParser;
		protected var textBlockStylePropertyParser:TextBlockStylePropertyParser;
		protected var brushPropertyParser:BrushPropertyParser;

		// Constructor

		public function ElementPropertyParser()
		{
			this.distribution2DPropertyParser = Distribution2DPropertyParser.getInstance();
			this.comparatorPropertyParser = ComparatorPropertyParser.getInstance();
			this.easerPropertyParser = EaserPropertyParser.getInstance();
			this.layoutPolicyPropertyParser = ExtendedLayoutPolicyPropertyParser.getInstance();
			this.rendererPropertyParser = RendererPropertyParser.getInstance();
			this.elementRendererPropertyParser = ElementRendererPropertyParser.getInstance();
			this.elementArrayPropertyParser = ArrayPropertyParser.getInstance(this);
			this.textBlockStylePropertyParser = TextBlockStylePropertyParser.getInstance();
			this.brushPropertyParser = BrushPropertyParser.getInstance();
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			switch (ParseUtils.trimWhiteSpace(str))
			{
				case "eventsEmitter":
					return new EventsEmitterControl();
				case "fieldSplitter":
					return new FieldSplitter();
				default:
					return null;
			}
		}

		public override function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			if (value is EventsEmitterControl)
				return "eventsEmitter";
			if (value is FieldSplitter)
				return "fieldSplitter";
			return null;
		}

		public override function registerProperties(propertyManager:PropertyManager, value:*) : void
		{
			super.registerProperties(propertyManager, value);

			if (value is EventsEmitterControl)
			{
				propertyManager.registerProperty("brush", this.brushPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("hostPath", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("basePath", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("sessionKey", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("jobID", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("count", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("bufferSize", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("bufferTime", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("dropThreshold", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("emitVelocity", this.distribution2DPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is FieldSplitter)
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
				propertyManager.registerProperty("sources", this.elementArrayPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("priority", this.numberPropertyParser, this.getProperty, this.setProperty);
			}
		}

	}

}
