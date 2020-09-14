package com.splunk.palettes.brush
{

	import com.jasongatt.core.ChangedEvent;
	import com.jasongatt.core.IObservable;
	import com.jasongatt.core.ObservableObject;
	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.graphics.brushes.IBrush;
	import flash.events.Event;
	import flash.events.EventDispatcher;

	public class FieldBrushPalette extends ObservableObject implements IBrushPalette
	{

		// Private Properties

		private var _fieldBrushes:ObservableProperty;
		private var _defaultBrushPalette:ObservableProperty;

		private var _cachedFieldBrushMap:Object;
		private var _cachedDefaultBrushPalette:IBrushPalette;

		// Constructor

		public function FieldBrushPalette(fieldBrushes:Object = null, defaultBrushPalette:IBrushPalette = null)
		{
			fieldBrushes = this._cloneFieldBrushes(fieldBrushes);

			this._fieldBrushes = new ObservableProperty(this, "fieldBrushes", Object, fieldBrushes, this._updateFieldBrushMap);
			this._defaultBrushPalette = new ObservableProperty(this, "defaultBrushPalette", IBrushPalette, defaultBrushPalette);

			this._cachedDefaultBrushPalette = defaultBrushPalette;

			this._updateFieldBrushMap();
		}

		// Public Getters/Setters

		public function get fieldBrushes() : Object
		{
			return this._cloneFieldBrushes(this._fieldBrushes.value);
		}
		public function set fieldBrushes(value:Object) : void
		{
			this._fieldBrushes.value = this._cloneFieldBrushes(value);
		}

		public function get defaultBrushPalette() : IBrushPalette
		{
			return this._defaultBrushPalette.value;
		}
		public function set defaultBrushPalette(value:IBrushPalette) : void
		{
			this._defaultBrushPalette.value = this._cachedDefaultBrushPalette = value;
		}

		// Public Methods

		public function getBrush(field:String, index:int, count:int) : IBrush
		{
			if (field)
			{
				var brush:IBrush = this._cachedFieldBrushMap[field];
				if (brush)
					return brush;
			}

			var defaultBrushPalette:IBrushPalette = this._cachedDefaultBrushPalette;
			if (defaultBrushPalette)
				return defaultBrushPalette.getBrush(field, index, count);

			return null;
		}

		// Private Methods

		private function _cloneFieldBrushes(fieldBrushes:Object) : Object
		{
			var fieldBrushes2:Object = new Object();

			var field:String;
			var brush:IBrush;
			for (field in fieldBrushes)
			{
				brush = fieldBrushes[field] as IBrush;
				if (brush)
					fieldBrushes2[field] = brush;
			}

			return fieldBrushes2;
		}

		private function _updateFieldBrushMap(e:Event = null) : void
		{
			var brush:IBrush;
			var observable:IObservable;

			for each (brush in this._cachedFieldBrushMap)
			{
				observable = brush as IObservable;
				if (observable)
					observable.removeEventListener(ChangedEvent.CHANGED, this._brush_changed);
			}

			this._cachedFieldBrushMap = this._fieldBrushes.value;

			for each (brush in this._cachedFieldBrushMap)
			{
				observable = brush as IObservable;
				if (observable)
					observable.addEventListener(ChangedEvent.CHANGED, this._brush_changed, false, int.MIN_VALUE, true);
			}
		}

		private function _brush_changed(e:ChangedEvent) : void
		{
			var eventType:String = e.type;
			if (this.hasEventListener(eventType))
				this.dispatchEvent(e);
		}

	}

}
