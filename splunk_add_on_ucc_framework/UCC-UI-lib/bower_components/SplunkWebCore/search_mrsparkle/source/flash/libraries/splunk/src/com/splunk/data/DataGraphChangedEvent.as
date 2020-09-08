package com.splunk.data
{

	import com.jasongatt.core.ChangedEvent;
	import flash.events.Event;

	public class DataGraphChangedEvent extends ChangedEvent
	{

		// Public Static Constants

		public static const ADD:String = "add";
		public static const REMOVE:String = "remove";

		// Private Properties

		private var _node:*;
		private var _edge:*;

		// Constructor

		public function DataGraphChangedEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, source:Object = null, changeType:String = null, node:* = null, edge:* = null)
		{
			super(type, bubbles, cancelable, source, changeType);

			this._node = node;
			this._edge = edge;
		}

		// Public Getters/Setters

		public function get node() : *
		{
			return this._node;
		}

		public function get edge() : *
		{
			return this._edge;
		}

		// Public Methods

		public override function clone() : Event
		{
			return new DataGraphChangedEvent(this.type, this.bubbles, this.cancelable, this.source, this.changeType, this.node, this.edge);
		}

		public override function toString() : String
		{
			return this.formatToString("DataGraphChangedEvent", "type", "bubbles", "cancelable", "eventPhase", "source", "changeType", "node", "edge");
		}

	}

}
