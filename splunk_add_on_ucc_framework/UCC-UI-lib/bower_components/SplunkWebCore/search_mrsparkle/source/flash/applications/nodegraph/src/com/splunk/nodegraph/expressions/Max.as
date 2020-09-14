package com.splunk.nodegraph.expressions
{
	
	public class Max extends AbstractExpression
	{
		
		// Constructor
		
		public function Max(...rest)
		{
			super(2, -1);
			
			this.addChildren(rest);
		}
		
		// Protected Methods
		
		protected override function evalChildren(children:Array, o:Object) : *
		{
			var maxValue:Number = Number.NEGATIVE_INFINITY;
			var value:Number;
			for each (var child:AbstractExpression in children)
			{
				value = Number(child.eval(o));
				if (value > maxValue)
					maxValue = value;
			}
			return maxValue;
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
			return "Max(" + str + ")";
		}
		
	}
	
}
