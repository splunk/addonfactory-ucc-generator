package com.splunk.nodegraph.expressions
{
	
	public /*abstract*/ class AbstractBinaryExpression extends AbstractExpression
	{
		
		// Private Properties
		
		private var _operator:String;
		
		// Constructor
		
		public function AbstractBinaryExpression(operator:String, exp1:AbstractExpression = null, exp2:AbstractExpression = null)
		{
			super(2, 2);
			
			this._operator = operator;
			
			this.safeAddChildren(exp1, exp2);
		}
		
		// Protected Methods
		
		protected override function evalChildren(children:Array, o:Object) : *
		{
			var child1:AbstractExpression = children[0];
			var child2:AbstractExpression = children[1];
			
			return this.applyOperator(child1.eval(o), child2.eval(o));
		}
		
		protected override function toStringChildren(children:Array) : String
		{
			var child1:AbstractExpression = children[0];
			var child2:AbstractExpression = children[1];
			
			return "(" + child1.toString() + " " + this._operator + " " + child2.toString() + ")";
		}
		
		protected /*abstract*/ function applyOperator(value1:*, value2:*) : *
		{
			throw new Error("Must implement abstract method applyOperator().");
		}
		
	}
	
}
