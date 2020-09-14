package com.jasongatt.core
{

	public class ObservableProperty extends ObservableObject
	{

		// Private Properties

		private var _target:IObservable;
		private var _name:String;
		private var _type:Class;
		private var _value:*;
		private var _changedCallback:Function;

		private var _observableValue:IObservable;
		private var _isSetting:Boolean = false;

		// Constructor

		public function ObservableProperty(target:IObservable, name:String, type:Class, value:* = null, changedCallback:Function = null)
		{
			if (!target)
				throw new TypeError("Parameter target must be non-null.");
			if (!name)
				throw new TypeError("Parameter name must be non-null.");
			if (!type)
				throw new TypeError("Parameter type must be non-null.");
			if ((value != null) && !(value is type))
				throw new TypeError("Parameter value must be of the accepted type.");

			this._target = target;
			this._name = name;
			this._type = type;
			this._value = value;
			this._changedCallback = changedCallback;

			if (changedCallback != null)
				this.addEventListener(ChangedEvent.CHANGED, changedCallback, false, int.MAX_VALUE);

			var observableValue:IObservable = this._observableValue = value as IObservable;
			if (observableValue)
				observableValue.addEventListener(ChangedEvent.CHANGED, this._observableValue_changed, false, int.MIN_VALUE, true);
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

		public function get type() : Class
		{
			return this._type;
		}

		public function get value() : *
		{
			return this._value;
		}
		public function set value(value:*) : void
		{
			if ((value != null) && !(value is this._type))
				throw new TypeError("Parameter value must be of the accepted type.");

			if (this._isSetting)
				return;

			this._isSetting = true;

			var oldValue:* = this._value;
			if (value != oldValue)
			{
				var observableValue:IObservable = this._observableValue;
				if (observableValue)
					observableValue.removeEventListener(ChangedEvent.CHANGED, this._observableValue_changed, false);

				this._value = value;
				observableValue = this._observableValue = value as IObservable;

				if (observableValue)
					observableValue.addEventListener(ChangedEvent.CHANGED, this._observableValue_changed, false, int.MIN_VALUE, true);

				this._dispatchChangedEvent(oldValue, value);
			}

			this._isSetting = false;
		}

		public function get changedCallback() : Function
		{
			return this._changedCallback;
		}

		// Private Methods

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
