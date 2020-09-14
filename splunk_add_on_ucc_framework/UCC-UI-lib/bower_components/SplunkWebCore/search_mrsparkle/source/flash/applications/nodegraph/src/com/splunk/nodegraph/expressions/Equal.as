package com.splunk.nodegraph.expressions
{
	
	public class Equal extends AbstractBinaryExpression
	{
		
		// Constructor
		
		public function Equal(exp1:AbstractExpression = null, exp2:AbstractExpression = null)
		{
			super("==", exp1, exp2);
		}
		
		// Protected Methods
		
		protected override function applyOperator(value1:*, value2:*) : *
		{
			return value1 == value2;
		}
		
	}
	
}
