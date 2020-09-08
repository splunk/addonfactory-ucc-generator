package com.splunk.nodegraph.expressions
{
	
	public class Conditional extends AbstractExpression
	{
		
		// Constructor
		
		public function Conditional(conditionExp:AbstractExpression = null, thenExp:AbstractExpression = null, elseExp:AbstractExpression = null)
		{
			super(3, 3);
			
			this.safeAddChildren(conditionExp, thenExp, elseExp);
		}
		
		// Protected Methods
		
		protected override function evalChildren(children:Array, o:Object) : *
		{
			var child1:AbstractExpression = children[0];
			var child2:AbstractExpression = children[1];
			var child3:AbstractExpression = children[2];
			
			return child1.eval(o) ? child2.eval(o) : child3.eval(o);
		}
		
		protected override function toStringChildren(children:Array) : String
		{
			var child1:AbstractExpression = children[0];
			var child2:AbstractExpression = children[1];
			var child3:AbstractExpression = children[2];
			
			return "(" + child1.toString() + " ? " + child2.toString() + " : " + child3.toString() + ")";
		}
		
	}
	
}
