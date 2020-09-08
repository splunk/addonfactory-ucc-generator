package com.jasongatt.core
{

	public class ObservableArrayProperty extends ObservableObject
	{

		// Private Properties

		private var _target:IObservable;
		private var _name:String;
		private var _value:Array;
		private var _changedCallback:Function;

		private var _isSetting:Boolean = false;

		// Constructor

		public function ObservableArrayProperty(target:IObservable, name:String, value:Array = null, changedCallback:Function = null)
		{
			if (!target)
				throw new TypeError("Parameter target must be non-null.");
			if (!name)
				throw new TypeError("Parameter name must be non-null.");

			this._target = target;
			this._name = name;
			this._changedCallback = changedCallback;

			if (changedCallback != null)
				this.addEventListener(ChangedEvent.CHANGED, changedCallback, false, int.MAX_VALUE);

			this._setValue(value);
		}

		// Public Getters/Setters

		public function get target() : IObservable
		{
			return this._target;
		}

		public function get name() : String
		{
			return this._name;
		}

		public function get value() : Array
		{
			return this._value;
		}
		public function set value(value:Array) : void
		{
			if (this._isSetting)
				return;

			this._isSetting = true;

			var oldValue:Array = this._value;

			this._setValue(value);

			this._dispatchChangedEvent(oldValue, value);

			this._isSetting = false;
		}

		public function get changedCallback() : Function
		{
			return this._changedCallback;
		}

		// Private Methods

		private function _setValue(values:Array) : void
		{
			var value:*;
			var observableValue:IObservable;

			for each (value in this._value)
			{
				observableValue = value as IObservable;
				if (observableValue)
					observableValue.removeEventListener(ChangedEvent.CHANGED, this._observableValue_changed, false);
			}

			this._value = values;

			for each (value in this._value)
			{
				observableValue = value as IObservable;
				if (observableValue)
					observableValue.addEventListener(ChangedEvent.CHANGED, this._observableValue_changed, false, int.MIN_VALUE, true);
			}
		}

		private function _dispatchChangedEvent(oldValue:* = null, newValue:* = null) : void
		{
			var eventType:String = ChangedEvent.CHANGED;
			if (this.hasEventListener(eventType))
				this.dispatchEvent(new PropertyChangedEvent(eventType, false, false, this, "value", oldValue, newValue));
			if (this._target.hasEventListener(eventType))
				this._target.dispatchEvent(new PropertyChangedEvent(eventType, false, false, this._target, this._name, oldValue, newValue));
		}

		private function _observableValue_changed(e:ChangedEvent) : void
		{
			if (this._isSetting)
				return;

			var eventType:String = e.type;
			if (this.hasEventListener(eventType))
				this.dispatchEvent(e);
			if (this._target.hasEventListener(eventType))
				this._target.dispatchEvent(e);
		}

	}

}
