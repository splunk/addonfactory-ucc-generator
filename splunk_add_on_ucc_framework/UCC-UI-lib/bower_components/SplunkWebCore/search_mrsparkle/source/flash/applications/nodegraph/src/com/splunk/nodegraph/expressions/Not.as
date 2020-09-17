package com.splunk.nodegraph.expressions
{
	
	public class Not extends AbstractExpression
	{
		
		// Constructor
		
		public function Not(exp:AbstractExpression = null)
		{
			super(1, 1);
			
			this.safeAddChildren(exp);
		}
		
		// Protected Methods
		
		protected override function evalChildren(children:Array, o:Object) : *
		{
			var child:AbstractExpression = children[0];
			
			return !child.eval(o);
		}
		
		protected override function toStringChildren(children:Array) : String
		{
			var child:AbstractExpression = children[0];
			
			return "!" + child.toString();
		}
		
	}
	
}
