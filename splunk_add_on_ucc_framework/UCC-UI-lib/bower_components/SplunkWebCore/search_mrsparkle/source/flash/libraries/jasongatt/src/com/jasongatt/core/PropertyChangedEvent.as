package com.jasongatt.core
{

	import flash.events.Event;

	public class PropertyChangedEvent extends ChangedEvent
	{

		// Public Static Constants

		public static const PROPERTY:String = "property";

		// Private Properties

		private var _propertyName:String;
		private var _oldValue:*;
		private var _newValue:*;

		// Constructor

		public function PropertyChangedEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, source:Object = null, propertyName:String = null, oldValue:* = null, newValue:* = null)
		{
			super(type, bubbles, cancelable, source, PropertyChangedEvent.PROPERTY);

			this._propertyName = propertyName;
			this._oldValue = oldValue;
			this._newValue = newValue;
		}

		// Public Getters/Setters

		public function get propertyName() : String
		{
			return this._propertyName;
		}

		public function get oldValue() : *
		{
			return this._oldValue;
		}

		public function get newValue() : *
		{
			return this._newValue;
		}

		// Public Methods

		public override function clone() : Event
		{
			return new PropertyChangedEvent(this.type, this.bubbles, this.cancelable, this.source, this.propertyName, this.oldValue, this.newValue);
		}

		public override function toString() : String
		{
			return this.formatToString("PropertyChangedEvent", "type", "bubbles", "cancelable", "eventPhase", "source", "propertyName", "oldValue", "newValue");
		}

	}

}
