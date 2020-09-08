package com.splunk.nodegraph.expressions
{
	
	public class Variable extends AbstractExpression
	{
		
		// Private Properties
		
		private var _name:String;
		
		// Constructor
		
		public function Variable(name:String = "")
		{
			super(0, 0);
			
			this._name = name;
		}
		
		// Public Getters/Setters
		
		public function get name() : String
		{
			return this._name;
		}
		public function set name(value:String) : void
		{
			this._name = value;
		}
		
		// Protected Methods
		
		protected override function evalChildren(children:Array, o:Object) : *
		{
			return o[this._name];
		}
		
		protected override function toStringChildren(children:Array) : String
		{
			return this._name;
		}
		
	}
	
}
