package com.splunk.data
{

	import com.jasongatt.core.IObservable;
	import com.splunk.data.converters.IValueConverter;

	public interface IDataMap extends IObservable
	{

		// Methods

		function addKey(key:*) : void;
		function addField(fieldName:String, defaultValue:* = null, valueConverter:IValueConverter = null) : void;
		function removeKey(key:*) : void;
		function removeField(fieldName:String) : void;
		function containsKey(key:*) : Boolean;
		function containsField(fieldName:String) : Boolean;
		function getKeys() : Array;
		function getFields() : Array;
		function getDefaultValue(fieldName:String) : *;
		function getValueConverter(fieldName:String) : IValueConverter;
		function getValue(key:*, fieldName:String) : *;
		function setDefaultValue(fieldName:String, defaultValue:*) : void;
		function setValueConverter(fieldName:String, valueConverter:IValueConverter) : void;
		function setValue(key:*, fieldName:String, value:*) : void;
		function clearValue(key:*, fieldName:String) : void;

	}

}
