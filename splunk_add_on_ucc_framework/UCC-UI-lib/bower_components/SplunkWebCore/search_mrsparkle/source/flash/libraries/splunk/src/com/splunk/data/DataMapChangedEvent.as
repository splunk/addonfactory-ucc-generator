package com.splunk.data
{

	import com.jasongatt.core.ChangedEvent;
	import flash.events.Event;

	public class DataMapChangedEvent extends ChangedEvent
	{

		// Public Static Constants

		public static const ADD:String = "add";
		public static const REMOVE:String = "remove";
		public static const VALUE:String = "value";

		// Private Properties

		private var _key:*;
		private var _fieldName:String;

		// Constructor

		public function DataMapChangedEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, source:Object = null, changeType:String = null, key:* = null, fieldName:String = null)
		{
			super(type, bubbles, cancelable, source, changeType);

			this._key = key;
			this._fieldName = fieldName;
		}

		// Public Getters/Setters

		public function get key() : *
		{
			return this._key;
		}

		public function get fieldName() : String
		{
			return this._fieldName;
		}

		// Public Methods

		public override function clone() : Event
		{
			return new DataMapChangedEvent(this.type, this.bubbles, this.cancelable, this.source, this.changeType, this.key, this.fieldName);
		}

		public override function toString() : String
		{
			return this.formatToString("DataMapChangedEvent", "type", "bubbles", "cancelable", "eventPhase", "source", "changeType", "key", "fieldName");
		}

	}

}
