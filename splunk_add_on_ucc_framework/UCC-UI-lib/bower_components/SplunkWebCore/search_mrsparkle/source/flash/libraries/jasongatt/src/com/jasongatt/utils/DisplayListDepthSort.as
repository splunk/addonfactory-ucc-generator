package com.jasongatt.utils
{

	import flash.display.DisplayObject;
	import flash.display.Stage;
	import flash.utils.Dictionary;

	public class DisplayListDepthSort implements ISort
	{

		// Private Properties

		private var _descending:Boolean;

		private var _direction:int;
		private var _depths:Dictionary;

		// Constructor

		public function DisplayListDepthSort(descending:Boolean = false)
		{
			this._descending = descending;
			this._direction = descending ? -1 : 1;
		}

		// Public Getters/Setters

		public function get descending() : Boolean
		{
			return this._descending;
		}

		// Public Methods

		public function sort(list:Array) : void
		{
			this._depths = new Dictionary();

			list.sort(this._sortOnDepth);

			this._depths = null;
		}

		// Private Methods

		private function _sortOnDepth(obj1:Object, obj2:Object) : Number
		{
			var depth1:int = this._getDepth(obj1);
			var depth2:int = this._getDepth(obj2);
			if (depth1 < depth2)
				return -this._direction;
			if (depth1 > depth2)
				return this._direction;
			return 0;
		}

		private function _getDepth(obj:Object) : int
		{
			var displayObject:DisplayObject = obj as DisplayObject;
			if (!displayObject)
				return 0;

			var depth:int = this._depths[displayObject];
			if (depth == 0)
			{
				var parent:DisplayObject = displayObject.parent;
				if ((parent == null) || (parent is Stage))
					depth = 1;
				else
					depth = this._getDepth(parent) + 1;
				this._depths[displayObject] = depth;
			}
			return depth;
		}

	}

}
