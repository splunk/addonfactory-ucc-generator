package com.splunk.utils
{

	import com.jasongatt.core.IObservable;
	import com.jasongatt.core.ObservableProperty;
	import flash.events.Event;
	import flash.events.EventDispatcher;
	import flash.utils.Dictionary;
	import flash.utils.flash_proxy;
	import flash.utils.Proxy;

	[Event(name="changed", type="com.jasongatt.core.ChangedEvent")]

	public dynamic class Style extends Proxy implements IObservable
	{

		// Private Static Properties

		private static var _defaultValues:Dictionary = new Dictionary(true);

		// Public Static Methods

		public static function applyStyle(target:Object, style:Style) : void
		{
			var propertyName:String;

			var defaultValues:Object = Style._defaultValues[target];
			if (!defaultValues)
				defaultValues = new Object();

			var newValues:Object = new Object();
			for (propertyName in defaultValues)
				newValues[propertyName] = defaultValues[propertyName];

			if (style)
			{
				var styleProperties:Object = style._properties;
				var newDefaultValues:Object = new Object();
				for (propertyName in styleProperties)
				{
					if (defaultValues.hasOwnProperty(propertyName))
						newDefaultValues[propertyName] = defaultValues[propertyName];
					else if (target.hasOwnProperty(propertyName))
						newDefaultValues[propertyName] = target[propertyName];
					if (target.hasOwnProperty(propertyName))
						newValues[propertyName] = styleProperties[propertyName].value;
				}
				Style._defaultValues[target] = newDefaultValues;
			}
			else
			{
				delete Style._defaultValues[target];
			}

			for (propertyName in newValues)
				target[propertyName] = newValues[propertyName];
		}

		public static function mergeStyles(... styles) : Style
		{
			var mergedProperties:Object;

			var style:Style;
			var styleProperties:Object;
			var propertyName:String;
			for each (style in styles)
			{
				if (style)
				{
					if (!mergedProperties)
						mergedProperties = new Object();
					styleProperties = style._properties;
					for (propertyName in styleProperties)
						mergedProperties[propertyName] = styleProperties[propertyName].value;
				}
			}

			if (!mergedProperties)
				return null;

			style = new Style();
			styleProperties = style._properties;
			for (propertyName in mergedProperties)
				styleProperties[propertyName] = new ObservableProperty(style, propertyName, Object, mergedProperties[propertyName]);

			return style;
		}

		// Private Properties

		private var _dispatcher:EventDispatcher;
		private var _properties:Object;

		// Constructor

		public function Style()
		{
			this._dispatcher = new EventDispatcher(this);
			this._properties = new Object();
		}

		// Public Methods

		public function addEventListener(type:String, listener:Function, useCapture:Boolean = false, priority:int = 0, useWeakReference:Boolean = false) : void
		{
			this._dispatcher.addEventListener(type, listener, useCapture, priority, useWeakReference);
		}

		public function dispatchEvent(event:Event) : Boolean
		{
			return this._dispatcher.dispatchEvent(event);
		}

		public function hasEventListener(type:String) : Boolean
		{
			return this._dispatcher.hasEventListener(type);
		}

		public function removeEventListener(type:String, listener:Function, useCapture:Boolean = false) : void
		{
			return this._dispatcher.removeEventListener(type, listener, useCapture);
		}

		public function willTrigger(type:String) : Boolean
		{
			return this._dispatcher.willTrigger(type);
		}

		public function toString() : String
		{
			return "[object Style]";
		}

		// flash_proxy methods

		flash_proxy override function getProperty(name:*) : *
		{
			name = String(name);
			var property:ObservableProperty = this._properties[name] as ObservableProperty;
			if (property)
				return property.value;
		}

		flash_proxy override function setProperty(name:*, value:*) : void
		{
			name = String(name);
			var property:ObservableProperty = this._properties[name] as ObservableProperty;
			if (!property)
				property = this._properties[name] = new ObservableProperty(this, name, Object);
			property.value = value;
		}

		flash_proxy override function deleteProperty(name:*) : Boolean
		{
			name = String(name);
			var property:ObservableProperty = this._properties[name] as ObservableProperty;
			if (property)
			{
				delete this._properties[name];
				property.value = null;
				return true;
			}
			return false;
		}

		flash_proxy override function hasProperty(name:*) : Boolean
		{
			name = String(name);
			var property:ObservableProperty = this._properties[name] as ObservableProperty;
			if (property)
				return true;
			return false;
		}

		flash_proxy override function callProperty(name:*, ... rest) : *
		{
		}

		flash_proxy override function nextNameIndex(index:int) : int
		{
			return 0;
		}

		flash_proxy override function nextName(index:int) : String
		{
			return null;
		}

		flash_proxy override function nextValue(index:int) : *
		{
			return null;
		}

	}

}
