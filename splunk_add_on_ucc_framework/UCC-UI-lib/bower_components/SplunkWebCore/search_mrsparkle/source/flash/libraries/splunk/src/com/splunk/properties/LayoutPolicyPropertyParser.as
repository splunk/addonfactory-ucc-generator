package com.splunk.properties
{

	import com.jasongatt.layout.DistributedLayoutPolicy;
	import com.jasongatt.layout.DistributedStackLayoutPolicy;
	import com.jasongatt.layout.GroupLayoutPolicy;
	import com.jasongatt.layout.StackLayoutPolicy;

	public class LayoutPolicyPropertyParser extends AbstractPropertyParser
	{

		// Private Static Properties

		private static var _instance:LayoutPolicyPropertyParser;

		// Public Static Methods

		public static function getInstance() : LayoutPolicyPropertyParser
		{
			var instance:LayoutPolicyPropertyParser = LayoutPolicyPropertyParser._instance;
			if (!instance)
				instance = LayoutPolicyPropertyParser._instance = new LayoutPolicyPropertyParser();
			return instance;
		}

		// Protected Properties

		protected var stringPropertyParser:StringPropertyParser;
		protected var marginPropertyParser:MarginPropertyParser;

		// Constructor

		public function LayoutPolicyPropertyParser()
		{
			this.stringPropertyParser = StringPropertyParser.getInstance();
			this.marginPropertyParser = MarginPropertyParser.getInstance();
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			switch (ParseUtils.trimWhiteSpace(str))
			{
				case "distributed":
					return new DistributedLayoutPolicy();
				case "distributedStack":
					return new DistributedStackLayoutPolicy();
				case "group":
					return new GroupLayoutPolicy();
				case "stack":
					return new StackLayoutPolicy();
				default:
					return null;
			}
		}

		public override function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			if (value is DistributedLayoutPolicy)
				return "distributed";
			if (value is DistributedStackLayoutPolicy)
				return "distributedStack";
			if (value is GroupLayoutPolicy)
				return "group";
			if (value is StackLayoutPolicy)
				return "stack";
			return null;
		}

		public override function registerProperties(propertyManager:PropertyManager, value:*) : void
		{
			if (value is DistributedLayoutPolicy)
			{
				propertyManager.registerProperty("orientation", this.stringPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is DistributedStackLayoutPolicy)
			{
				propertyManager.registerProperty("orientation", this.stringPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is GroupLayoutPolicy)
			{
				propertyManager.registerProperty("padding", this.marginPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is StackLayoutPolicy)
			{
				propertyManager.registerProperty("orientation", this.stringPropertyParser, this.getProperty, this.setProperty);
			}
		}

	}

}
