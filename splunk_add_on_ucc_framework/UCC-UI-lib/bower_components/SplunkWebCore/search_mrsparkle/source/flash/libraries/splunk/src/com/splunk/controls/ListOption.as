package com.splunk.controls
{

	import com.jasongatt.core.ObservableObject;
	import com.jasongatt.core.ObservableProperty;

	public class ListOption extends ObservableObject
	{

		// Private Properties

		private var _value:ObservableProperty;
		private var _label:ObservableProperty;

		// Constructor

		public function ListOption(value:* = null, label:String = null)
		{
			this._value = new ObservableProperty(this, "value", Object, value);
			this._label = new ObservableProperty(this, "label", String, label);
		}

		// Public Getters/Setters

		public function get value() : *
		{
			return this._value.value;
		}
		public function set value(value:*) : void
		{
			this._value.value = value;
		}

		public function get label() : String
		{
			return this._label.value;
		}
		public function set label(value:String) : void
		{
			this._label.value = value;
		}

	}

}
