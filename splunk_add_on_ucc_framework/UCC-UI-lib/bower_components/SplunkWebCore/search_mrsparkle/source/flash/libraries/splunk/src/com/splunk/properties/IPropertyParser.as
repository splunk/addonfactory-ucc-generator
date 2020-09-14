package com.splunk.properties
{

	public interface IPropertyParser
	{

		// Methods

		function stringToValue(propertyManager:PropertyManager, str:String) : *;
		function valueToString(propertyManager:PropertyManager, value:*) : String;
		function registerProperties(propertyManager:PropertyManager, value:*) : void;

	}

}
