package com.splunk.data
{

	import com.jasongatt.core.ChangedEvent;
	import com.splunk.data.converters.IValueConverter;
	import flash.events.EventDispatcher;
	import flash.utils.Dictionary;

	[Event(name="changed", type="com.jasongatt.core.ChangedEvent")]

	public class DataMap extends EventDispatcher implements IDataMap
	{

		// Private Properties

		private var _keys:Dictionary;
		private var _fields:Object;

		// Constructor

		public function DataMap()
		{
			this._keys = new Dictionary();
			this._fields = new Object();
		}

		// Public Methods

		public function addKey(key:*) : void
		{
			if (key == null)
				throw new TypeError("Parameter key must be non-null.");

			var keys:Dictionary = this._keys;
			if (keys[key])
				throw new ArgumentError("The supplied key is already contained in this map.");

			keys[key] = new KeyInfo();

			this.dispatchEvent(new DataMapChangedEvent(ChangedEvent.CHANGED, false, false, this, DataMapChangedEvent.ADD, key));
		}

		public function addField(fieldName:String, defaultValue:* = null, valueConverter:IValueConverter = null) : void
		{
			if (fieldName == null)
				throw new TypeError("Parameter fieldName must be non-null.");

			var fields:Object = this._fields;
			if (fields[fieldName])
				throw new ArgumentError("The supplied fieldName is already contained in this map.");

			fields[fieldName] = new FieldInfo(defaultValue, valueConverter);

			this.dispatchEvent(new DataMapChangedEvent(ChangedEvent.CHANGED, false, false, this, DataMapChangedEvent.ADD, null, fieldName));
		}

		public function removeKey(key:*) : void
		{
			if (key == null)
				throw new TypeError("Parameter key must be non-null.");

			var keys:Dictionary = this._keys;
			if (!keys[key])
				throw new ArgumentError("The supplied key must be contained in this map.");

			delete keys[key];

			this.dispatchEvent(new DataMapChangedEvent(ChangedEvent.CHANGED, false, false, this, DataMapChangedEvent.REMOVE, key));
		}

		public function removeField(fieldName:String) : void
		{
			if (fieldName == null)
				throw new TypeError("Parameter fieldName must be non-null.");

			var fields:Object = this._fields;
			var fieldInfo:FieldInfo = fields[fieldName];
			if (!fieldInfo)
				throw new ArgumentError("The supplied fieldName must be contained in this map.");

			for each (var keyInfo:KeyInfo in this._keys)
				delete keyInfo.values[fieldInfo];

			delete fields[fieldName];

			this.dispatchEvent(new DataMapChangedEvent(ChangedEvent.CHANGED, false, false, this, DataMapChangedEvent.REMOVE, null, fieldName));
		}

		public function containsKey(key:*) : Boolean
		{
			if (key == null)
				throw new TypeError("Parameter key must be non-null.");

			return (this._keys[key] != null);
		}

		public function containsField(fieldName:String) : Boolean
		{
			if (fieldName == null)
				throw new TypeError("Parameter fieldName must be non-null.");

			return (this._fields[fieldName] != null);
		}

		public function getKeys() : Array
		{
			var keys:Array = new Array();
			for (var key:* in this._keys)
				keys.push(key);
			return keys;
		}

		public function getFields() : Array
		{
			var fields:Array = new Array();
			for (var fieldName:String in this._fields)
				fields.push(fieldName);
			return fields;
		}

		public function getDefaultValue(fieldName:String) : *
		{
			if (fieldName == null)
				throw new TypeError("Parameter fieldName must be non-null.");

			var fieldInfo:FieldInfo = this._fields[fieldName];
			if (!fieldInfo)
				throw new ArgumentError("The supplied fieldName must be contained in this map.");

			if (!fieldInfo.hasConvertedDefaultValue)
			{
				fieldInfo.convertedDefaultValue = fieldInfo.valueConverter ? fieldInfo.valueConverter.convertFrom(fieldInfo.defaultValue) : fieldInfo.defaultValue;
				fieldInfo.hasConvertedDefaultValue = true;
			}
			return fieldInfo.convertedDefaultValue;
		}

		public function getValueConverter(fieldName:String) : IValueConverter
		{
			if (fieldName == null)
				throw new TypeError("Parameter fieldName must be non-null.");

			var fieldInfo:FieldInfo = this._fields[fieldName];
			if (!fieldInfo)
				throw new ArgumentError("The supplied fieldName must be contained in this map.");

			return fieldInfo.valueConverter;
		}

		public function getValue(key:*, fieldName:String) : *
		{
			if (key == null)
				throw new TypeError("Parameter key must be non-null.");
			if (fieldName == null)
				throw new TypeError("Parameter fieldName must be non-null.");

			var keyInfo:KeyInfo = this._keys[key];
			if (!keyInfo)
				throw new ArgumentError("The supplied key must be contained in this map.");

			var fieldInfo:FieldInfo = this._fields[fieldName];
			if (!fieldInfo)
				throw new ArgumentError("The supplied fieldName must be contained in this map.");

			var valueInfo:ValueInfo = keyInfo.values[fieldInfo];
			if (!valueInfo)
			{
				if (!fieldInfo.hasConvertedDefaultValue)
				{
					fieldInfo.convertedDefaultValue = fieldInfo.valueConverter ? fieldInfo.valueConverter.convertFrom(fieldInfo.defaultValue) : fieldInfo.defaultValue;
					fieldInfo.hasConvertedDefaultValue = true;
				}
				return fieldInfo.convertedDefaultValue;
			}

			if (!valueInfo.hasConvertedValue || (valueInfo.valueConverter != fieldInfo.valueConverter))
			{
				valueInfo.valueConverter = fieldInfo.valueConverter;
				valueInfo.convertedValue = valueInfo.valueConverter ? valueInfo.valueConverter.convertFrom(valueInfo.value) : valueInfo.value;
				valueInfo.hasConvertedValue = true;
			}
			return valueInfo.convertedValue;
		}

		public function setDefaultValue(fieldName:String, defaultValue:*) : void
		{
			if (fieldName == null)
				throw new TypeError("Parameter fieldName must be non-null.");

			var fieldInfo:FieldInfo = this._fields[fieldName];
			if (!fieldInfo)
				throw new ArgumentError("The supplied fieldName must be contained in this map.");

			if (defaultValue === fieldInfo.defaultValue)
				return;

			fieldInfo.defaultValue = defaultValue;
			fieldInfo.convertedDefaultValue = null;
			fieldInfo.hasConvertedDefaultValue = false;

			this.dispatchEvent(new DataMapChangedEvent(ChangedEvent.CHANGED, false, false, this, DataMapChangedEvent.VALUE, null, fieldName));
		}

		public function setValueConverter(fieldName:String, valueConverter:IValueConverter) : void
		{
			if (fieldName == null)
				throw new TypeError("Parameter fieldName must be non-null.");

			var fieldInfo:FieldInfo = this._fields[fieldName];
			if (!fieldInfo)
				throw new ArgumentError("The supplied fieldName must be contained in this map.");

			if (valueConverter == fieldInfo.valueConverter)
				return;

			fieldInfo.valueConverter = valueConverter;
			fieldInfo.convertedDefaultValue = null;
			fieldInfo.hasConvertedDefaultValue = false;

			this.dispatchEvent(new DataMapChangedEvent(ChangedEvent.CHANGED, false, false, this, DataMapChangedEvent.VALUE, null, fieldName));
		}

		public function setValue(key:*, fieldName:String, value:*) : void
		{
			if (key == null)
				throw new TypeError("Parameter key must be non-null.");
			if (fieldName == null)
				throw new TypeError("Parameter fieldName must be non-null.");

			var keyInfo:KeyInfo = this._keys[key];
			if (!keyInfo)
				throw new ArgumentError("The supplied key must be contained in this map.");

			var fieldInfo:FieldInfo = this._fields[fieldName];
			if (!fieldInfo)
				throw new ArgumentError("The supplied fieldName must be contained in this map.");

			var valueInfo:ValueInfo = keyInfo.values[fieldInfo];
			if (!valueInfo)
			{
				keyInfo.values[fieldInfo] = new ValueInfo(value);

				if (fieldInfo.defaultValue === value)
					return;
			}
			else
			{
				if (valueInfo.value === value)
					return;

				valueInfo.value = value;
				valueInfo.valueConverter = null;
				valueInfo.convertedValue = null;
				valueInfo.hasConvertedValue = false;
			}

			this.dispatchEvent(new DataMapChangedEvent(ChangedEvent.CHANGED, false, false, this, DataMapChangedEvent.VALUE, key, fieldName));
		}

		public function clearValue(key:*, fieldName:String) : void
		{
			if (key == null)
				throw new TypeError("Parameter key must be non-null.");
			if (fieldName == null)
				throw new TypeError("Parameter fieldName must be non-null.");

			var keyInfo:KeyInfo = this._keys[key];
			if (!keyInfo)
				throw new ArgumentError("The supplied key must be contained in this map.");

			var fieldInfo:FieldInfo = this._fields[fieldName];
			if (!fieldInfo)
				throw new ArgumentError("The supplied fieldName must be contained in this map.");

			var valueInfo:ValueInfo = keyInfo.values[fieldInfo];
			if (!valueInfo)
				return;

			delete keyInfo.values[fieldInfo];

			if (valueInfo.value === fieldInfo.defaultValue)
				return;

			this.dispatchEvent(new DataMapChangedEvent(ChangedEvent.CHANGED, false, false, this, DataMapChangedEvent.VALUE, key, fieldName));
		}

	}

}

import com.splunk.data.converters.IValueConverter;
import flash.utils.Dictionary;

class KeyInfo
{

	// Public Properties

	public var values:Dictionary;

	// Constructor

	public function KeyInfo()
	{
		this.values = new Dictionary();
	}

}

class FieldInfo
{

	// Public Properties

	public var defaultValue:*;
	public var valueConverter:IValueConverter;
	public var convertedDefaultValue:*;
	public var hasConvertedDefaultValue:Boolean = false;

	// Constructor

	public function FieldInfo(defaultValue:*, valueConverter:IValueConverter)
	{
		this.defaultValue = defaultValue;
		this.valueConverter = valueConverter;
	}

}

class ValueInfo
{

	// Public Properties

	public var value:*;
	public var valueConverter:IValueConverter;
	public var convertedValue:*;
	public var hasConvertedValue:Boolean = false;

	// Constructor

	public function ValueInfo(value:*)
	{
		this.value = value;
	}

}
