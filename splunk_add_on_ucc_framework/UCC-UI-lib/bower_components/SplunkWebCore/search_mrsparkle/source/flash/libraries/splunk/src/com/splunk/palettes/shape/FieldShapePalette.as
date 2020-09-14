package com.splunk.palettes.shape
{

	import com.jasongatt.core.ChangedEvent;
	import com.jasongatt.core.IObservable;
	import com.jasongatt.core.ObservableObject;
	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.graphics.shapes.IShape;
	import flash.events.Event;
	import flash.events.EventDispatcher;

	public class FieldShapePalette extends ObservableObject implements IShapePalette
	{

		// Private Properties

		private var _fieldShapes:ObservableProperty;
		private var _defaultShapePalette:ObservableProperty;

		private var _cachedFieldShapeMap:Object;
		private var _cachedDefaultShapePalette:IShapePalette;

		// Constructor

		public function FieldShapePalette(fieldShapes:Object = null, defaultShapePalette:IShapePalette = null)
		{
			fieldShapes = this._cloneFieldShapes(fieldShapes);

			this._fieldShapes = new ObservableProperty(this, "fieldShapes", Object, fieldShapes, this._updateFieldShapeMap);
			this._defaultShapePalette = new ObservableProperty(this, "defaultShapePalette", IShapePalette, defaultShapePalette);

			this._cachedDefaultShapePalette = defaultShapePalette;

			this._updateFieldShapeMap();
		}

		// Public Getters/Setters

		public function get fieldShapes() : Object
		{
			return this._cloneFieldShapes(this._fieldShapes.value);
		}
		public function set fieldShapes(value:Object) : void
		{
			this._fieldShapes.value = this._cloneFieldShapes(value);
		}

		public function get defaultShapePalette() : IShapePalette
		{
			return this._defaultShapePalette.value;
		}
		public function set defaultShapePalette(value:IShapePalette) : void
		{
			this._defaultShapePalette.value = this._cachedDefaultShapePalette = value;
		}

		// Public Methods

		public function getShape(field:String, index:int, count:int) : IShape
		{
			if (field)
			{
				var shape:IShape = this._cachedFieldShapeMap[field];
				if (shape)
					return shape;
			}

			var defaultShapePalette:IShapePalette = this._cachedDefaultShapePalette;
			if (defaultShapePalette)
				return defaultShapePalette.getShape(field, index, count);

			return null;
		}

		// Private Methods

		private function _cloneFieldShapes(fieldShapes:Object) : Object
		{
			var fieldShapes2:Object = new Object();

			var field:String;
			var shape:IShape;
			for (field in fieldShapes)
			{
				shape = fieldShapes[field] as IShape;
				if (shape)
					fieldShapes2[field] = shape;
			}

			return fieldShapes2;
		}

		private function _updateFieldShapeMap(e:Event = null) : void
		{
			var shape:IShape;
			var observable:IObservable;

			for each (shape in this._cachedFieldShapeMap)
			{
				observable = shape as IObservable;
				if (observable)
					observable.removeEventListener(ChangedEvent.CHANGED, this._shape_changed);
			}

			this._cachedFieldShapeMap = this._fieldShapes.value;

			for each (shape in this._cachedFieldShapeMap)
			{
				observable = shape as IObservable;
				if (observable)
					observable.addEventListener(ChangedEvent.CHANGED, this._shape_changed, false, int.MIN_VALUE, true);
			}
		}

		private function _shape_changed(e:ChangedEvent) : void
		{
			var eventType:String = e.type;
			if (this.hasEventListener(eventType))
				this.dispatchEvent(e);
		}

	}

}
