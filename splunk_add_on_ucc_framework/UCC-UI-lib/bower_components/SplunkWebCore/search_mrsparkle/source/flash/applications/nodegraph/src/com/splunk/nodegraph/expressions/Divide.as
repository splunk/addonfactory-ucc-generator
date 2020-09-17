package com.splunk.nodegraph.expressions
{
	
	public class Divide extends AbstractBinaryExpression
	{
		
		// Constructor
		
		public function Divide(exp1:AbstractExpression = null, exp2:AbstractExpression = null)
		{
			super("/", exp1, exp2);
		}
		
		// Protected Methods
		
		protected override function applyOperator(value1:*, value2:*) : *
		{
			return Number(value1) / Number(value2);
		}
		
	}
	
}
