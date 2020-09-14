package com.splunk.controls
{

	import com.jasongatt.controls.TextBlock;
	import flash.display.Shape;
	import flash.events.Event;
	import flash.system.System;
	import flash.text.TextField;
	import flash.text.TextFieldAutoSize;
	import flash.text.TextFormat;

	public class MemoryMonitor extends TextBlock
	{

		// Private Properties

		private var _bytes:uint = 0;

		private var _beacon:Shape;

		// Constructor

		public function MemoryMonitor()
		{
			this._beacon = new Shape();
			this._beacon.addEventListener(Event.ENTER_FRAME, this._beacon_enterFrame);

			this.defaultTextFormat = new TextFormat("_sans", 12);
			this.selectable = false;
			this.mouseEnabled = false;
		}

		// Public Getters/Setters

		public function get bytes() : uint
		{
			return this._bytes;
		}

		// Private Methods

		private function _beacon_enterFrame(e:Event) : void
		{
			var bytes:uint = System.totalMemory;

			this._bytes = bytes;

			var str:String = String(bytes);
			var i:int = str.length - 3;
			for (i; i > 0; i -= 3)
				str = str.substring(0, i) + "," + str.substring(i);

			this.text = str + " bytes";
		}

	}

}
