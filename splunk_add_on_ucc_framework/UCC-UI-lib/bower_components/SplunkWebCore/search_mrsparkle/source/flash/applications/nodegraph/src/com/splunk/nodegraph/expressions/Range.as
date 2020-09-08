package com.splunk.nodegraph.expressions
{
	
	public class Range extends AbstractExpression
	{
		
		// Constructor
		
		public function Range(valueExp:AbstractExpression = null, minExp:AbstractExpression = null, maxExp:AbstractExpression = null)
		{
			super(3, 3);
			
			this.safeAddChildren(valueExp, minExp, maxExp);
		}
		
		// Protected Methods
		
		protected override function evalChildren(children:Array, o:Object) : *
		{
			var child1:AbstractExpression = children[0];
			var child2:AbstractExpression = children[1];
			var child3:AbstractExpression = children[2];
			
			var value1:Number = Number(child1.eval(o));
			var value2:Number = Number(child2.eval(o));
			var value3:Number = Number(child3.eval(o));
			
			return ((value2 <= value1) && (value1 <= value3));
		}
		
		protected override function toStringChildren(children:Array) : String
		{
			var child1:AbstractExpression = children[0];
			var child2:AbstractExpression = children[1];
			var child3:AbstractExpression = children[2];
			
			return "(" + child2.toString() + " <= " + child1.toString() + " <=" + child3.toString() + ")";
		}
		
	}
	
}
