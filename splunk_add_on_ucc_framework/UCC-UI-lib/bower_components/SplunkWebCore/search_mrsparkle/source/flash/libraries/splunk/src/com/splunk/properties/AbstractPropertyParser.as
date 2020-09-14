package com.splunk.properties
{

	public /*abstract*/ class AbstractPropertyParser implements IPropertyParser
	{

		// Constructor

		public function AbstractPropertyParser()
		{
		}

		// Public Methods

		public function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			return null;
		}

		public function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			return null;
		}

		public function registerProperties(propertyManager:PropertyManager, value:*) : void
		{
		}

		// Protected Methods

		protected function getProperty(target:*, propertyName:String) : *
		{
			return target[propertyName];
		}

		protected function setProperty(target:*, propertyName:String, value:*) : void
		{
			target[propertyName] = value;
		}

	}

}
