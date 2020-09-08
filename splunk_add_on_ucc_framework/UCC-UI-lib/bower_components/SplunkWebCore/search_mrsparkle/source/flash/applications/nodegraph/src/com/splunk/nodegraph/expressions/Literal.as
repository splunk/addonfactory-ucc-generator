package com.splunk.nodegraph.expressions
{
	
	public class Literal extends AbstractExpression
	{
		
		// Private Properties
		
		private var _value:*;
		
		// Constructor
		
		public function Literal(value:* = null)
		{
			super(0, 0);
			
			this._value = value;
		}
		
		// Public Getters/Setters
		
		public function get value() : *
		{
			return this._value;
		}
		public function set value(value:*) : void
		{
			this._value = value;
		}
		
		// Protected Methods
		
		protected override function evalChildren(children:Array, o:Object) : *
		{
			return this._value;
		}
		
		protected override function toStringChildren(children:Array) : String
		{
			if (this._value is String)
				return "\"" + this._value + "\"";
			else
				return String(this._value);
		}
		
	}
	
}
