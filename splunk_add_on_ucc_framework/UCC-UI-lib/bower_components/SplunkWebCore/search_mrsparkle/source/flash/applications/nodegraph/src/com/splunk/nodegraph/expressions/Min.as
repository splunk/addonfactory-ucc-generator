package com.splunk.nodegraph.expressions
{
	
	public class Min extends AbstractExpression
	{
		
		// Constructor
		
		public function Min(...rest)
		{
			super(2, -1);
			
			this.addChildren(rest);
		}
		
		// Protected Methods
		
		protected override function evalChildren(children:Array, o:Object) : *
		{
			var minValue:Number = Number.POSITIVE_INFINITY;
			var value:Number;
			for each (var child:AbstractExpression in children)
			{
				value = Number(child.eval(o));
				if (value < minValue)
					minValue = value;
			}
			return minValue;
		}
		
		protected override function toStringChildren(children:Array) : String
		{
			var str:String = "";
			for each (var child:AbstractExpression in children)
			{
				if (str == "")
					str += child.toString();
				else
					str += ", " + child.toString();
			}
			return "Min(" + str + ")";
		}
		
	}
	
}
