package com.splunk.charting.axes
{

	import com.jasongatt.core.ChangedEvent;
	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.utils.IComparator;

	public class CategoryAxis extends AbstractAxis
	{

		// Public Static Constants

		public static const AUTO:Array = null;

		// Private Properties

		private var _categories:ObservableProperty;
		private var _comparator:ObservableProperty;
		private var _containedCategories:Array;
		private var _actualCategories:Array;

		private var _mergedCategories:Array;
		private var _actualCategoriesMap:Object;
		private var _actualCategoriesCount:int;

		// Constructor

		public function CategoryAxis(categories:Array = null, comparator:IComparator = null)
		{
			categories = categories ? categories.concat() : null;

			this._categories = new ObservableProperty(this, "categories", Array, categories, this.updateRange);
			this._comparator = new ObservableProperty(this, "comparator", IComparator, comparator, this.updateRange);

			this.updateRange();
		}

		// Public Getters/Setters

		public function get categories() : Array
		{
			var value:Array = this._categories.value;
			return value ? value.concat() : null;
		}
		public function set categories(value:Array) : void
		{
			this._categories.value = value ? value.concat() : null;
		}

		public function get comparator() : IComparator
		{
			return this._comparator.value;
		}
		public function set comparator(value:IComparator) : void
		{
			this._comparator.value = value;
		}

		public function get containedCategories() : Array
		{
			return this._containedCategories.concat();
		}

		public function get actualCategories() : Array
		{
			return this._actualCategories.concat();
		}

		// Protected Methods

		protected override function setValuesOverride(values:Array) : Array
		{
			var categories:Array = new Array();

			var category:String;
			for each (var value:* in values)
			{
				category = this._castValue(value);
				if (category)
					categories.push(category);
			}

			return (categories.length > 0) ? categories : null;
		}

		protected override function updateValueMapOverride(values:Array) : void
		{
			var categories:Array = new Array();

			var hasCategories:Object = new Object();
			for each (var category:String in values)
			{
				if (!hasCategories[category])
				{
					hasCategories[category] = true;
					categories.push(category);
				}
			}

			this._mergedCategories = categories;
		}

		protected override function updateValueRangeOverride() : void
		{
			var categories:Array = this._categories.value;
			var containedCategories:Array = categories ? categories : this._mergedCategories;
			var actualCategories:Array = containedCategories;
			var comparator:IComparator = this._comparator.value;
			if (comparator)
			{
				actualCategories = actualCategories.concat();
				actualCategories.sort(comparator.compare);
			}

			this.valueRangeMinimum = 0;
			this.valueRangeMaximum = Math.max(0, containedCategories.length - 1);

			this._containedCategories = containedCategories;

			if (!this._areCategoriesEqual(actualCategories, this._actualCategories))
			{
				this._actualCategories = actualCategories;
				var actualCategoriesCount:int = this._actualCategoriesCount = actualCategories.length;
				var actualCategoriesMap:Object = this._actualCategoriesMap = new Object();
				var category:String;
				for (var i:int = 0; i < actualCategoriesCount; i++)
				{
					category = actualCategories[i];
					actualCategoriesMap[category] = i;
				}
				this.dispatchEvent(new ChangedEvent(ChangedEvent.CHANGED, false, false, this, AxisChangeType.VALUE_ABSOLUTE_MAP));
			}
		}

		protected override function valueToAbsoluteOverride(value:*) : Number
		{
			var stringValue:String = this._castValue(value);
			if (!stringValue)
				return NaN;
			var index:* = this._actualCategoriesMap[stringValue];
			if (!(index is Number))
				return NaN;
			return index;
		}

		protected override function absoluteToValueOverride(absolute:Number) : *
		{
			var index:int = Math.round(absolute);
			if ((index < 0) || (index >= this._actualCategoriesCount))
				return null;
			return this._actualCategories[index];
		}

		// Private Methods

		private function _castValue(value:*) : String
		{
			if (value == null)
				return null;
			var str:String = String(value);
			if (str)
				return str;
			return null;
		}

		private function _areCategoriesEqual(categories1:Array, categories2:Array) : Boolean
		{
			if (!categories1 && !categories2)
				return true;
			if (categories1 && !categories2)
				return false;
			if (!categories1 && categories2)
				return false;

			var numCategories:int = categories1.length;
			if (categories2.length != numCategories)
				return false;

			for (var i:int = 0; i < numCategories; i++)
				if (categories1[i] != categories2[i])
					return false;

			return true;
		}

	}

}
