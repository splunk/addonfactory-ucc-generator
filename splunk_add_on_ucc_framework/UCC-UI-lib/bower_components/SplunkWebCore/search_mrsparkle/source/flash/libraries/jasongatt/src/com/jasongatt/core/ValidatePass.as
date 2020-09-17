package com.jasongatt.core
{

	import com.jasongatt.utils.ISort;

	public class ValidatePass
	{

		// Private Properties

		private var _targetType:Class;
		private var _methodName:String;
		private var _priority:Number;
		private var _targetSort:ISort;

		// Constructor

		public function ValidatePass(targetType:Class, methodName:String, priority:Number, targetSort:ISort = null)
		{
			if (!targetType)
				throw new TypeError("Parameter targetType must be non-null.");
			if (!methodName)
				throw new TypeError("Parameter methodName must be non-null.");

			this._targetType = targetType;
			this._methodName = methodName;
			this._priority = priority;
			this._targetSort = targetSort;
		}

		// Public Getters/Setters

		public function get targetType() : Class
		{
			return this._targetType;
		}

		public function get methodName() : String
		{
			return this._methodName;
		}

		public function get priority() : Number
		{
			return this._priority;
		}

		public function get targetSort() : ISort
		{
			return this._targetSort;
		}

		// Public Methods

		public function toString() : String
		{
			return "[ValidatePass targetType=" + this._targetType + " methodName=\"" + this._methodName + "\" priority=" + this._priority + " targetSort=" + this._targetSort + "]";
		}

	}

}
