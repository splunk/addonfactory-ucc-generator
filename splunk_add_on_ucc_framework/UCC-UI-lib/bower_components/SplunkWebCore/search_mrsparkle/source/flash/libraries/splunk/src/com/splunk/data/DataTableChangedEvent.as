package com.splunk.data
{

	import com.jasongatt.core.ChangedEvent;
	import flash.events.Event;

	public class DataTableChangedEvent extends ChangedEvent
	{

		// Public Static Constants

		public static const ADD:String = "add";
		public static const REMOVE:String = "remove";
		public static const VALUE:String = "value";
		public static const NAME:String = "name";

		// Private Properties

		private var _rowIndex:int;
		private var _columnIndex:int;

		// Constructor

		public function DataTableChangedEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, source:Object = null, changeType:String = null, rowIndex:int = -1, columnIndex:int = -1)
		{
			super(type, bubbles, cancelable, source, changeType);

			this._rowIndex = rowIndex;
			this._columnIndex = columnIndex;
		}

		// Public Getters/Setters

		public function get rowIndex() : int
		{
			return this._rowIndex;
		}

		public function get columnIndex() : int
		{
			return this._columnIndex;
		}

		// Public Methods

		public override function clone() : Event
		{
			return new DataTableChangedEvent(this.type, this.bubbles, this.cancelable, this.source, this.changeType, this.rowIndex, this.columnIndex);
		}

		public override function toString() : String
		{
			return this.formatToString("DataTableChangedEvent", "type", "bubbles", "cancelable", "eventPhase", "source", "changeType", "rowIndex", "columnIndex");
		}

	}

}
