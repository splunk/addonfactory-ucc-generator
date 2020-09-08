package com.splunk.nodegraph.expressions
{
	
	public class Or extends AbstractExpression
	{
		
		// Constructor
		
		public function Or(...rest)
		{
			super(2, -1);
			
			this.addChildren(rest);
		}
		
		// Protected Methods
		
		protected override function evalChildren(children:Array, o:Object) : *
		{
			for each (var child:AbstractExpression in children)
			{
				if (child.eval(o))
					return true;
			}
			return false;
		}
		
		protected override function toStringChildren(children:Array) : String
		{
			var str:String = "";
			for each (var child:AbstractExpression in children)
			{
				if (str == "")
					str += child.toString();
				else
					str += " || " + child.toString();
			}
			return "(" + str + ")";
		}
		
	}
	
}
