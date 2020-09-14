package com.jasongatt.core
{

	import flash.events.Event;

	public class ChangedEvent extends Event
	{

		// Public Static Constants

		public static const CHANGED:String = "changed";

		// Private Properties

		private var _source:Object;
		private var _changeType:String;

		// Constructor

		public function ChangedEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, source:Object = null, changeType:String = null)
		{
			super(type, bubbles, cancelable);

			this._source = source;
			this._changeType = changeType;
		}

		// Public Getters/Setters

		public function get source() : Object
		{
			return this._source;
		}

		public function get changeType() : String
		{
			return this._changeType;
		}

		// Public Methods

		public override function clone() : Event
		{
			return new ChangedEvent(this.type, this.bubbles, this.cancelable, this.source, this.changeType);
		}

		public override function toString() : String
		{
			return this.formatToString("ChangedEvent", "type", "bubbles", "cancelable", "eventPhase", "source", "changeType");
		}

	}

}
